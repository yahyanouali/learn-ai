/**
 * Ultra-fast, zero-dependency, self-contained Syntax Highlighter
 * Specially tuned for TypeScript/JavaScript (@opencode-ai/plugin), cURL, Bash, JSON, and YAML
 */
(function () {
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightJson(code) {
    return code.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'property';
            var keyPart = match.slice(0, -1);
            return '<span class="token property">' + escapeHtml(keyPart) + '</span><span class="token punctuation">:</span>';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'keyword';
        }
        return '<span class="token ' + cls + '">' + escapeHtml(match) + '</span>';
      }
    );
  }

  function highlightJsTs(code) {
    var lines = code.split('\n');
    return lines.map(function (line) {
      // Single-line comments
      if (/^\s*\/\//.test(line) || /^\s*\/?\*/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }

      // Tokenize strings and comments first using placeholders to avoid inner replacements
      var placeholders = [];
      var safeLine = line.replace(/(\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, function (match) {
        var isComment = /^\/\//.test(match);
        var cls = isComment ? 'comment' : 'string';
        var id = '___TOKEN_' + placeholders.length + '___';
        placeholders.push('<span class="token ' + cls + '">' + escapeHtml(match) + '</span>');
        return id;
      });

      var res = escapeHtml(safeLine);

      // JS/TS Keywords
      res = res.replace(
        /\b(import|export|from|const|let|var|async|await|function|return|if|else|for|of|in|try|catch|throw|new|typeof|instanceof|void|delete|interface|type|default)\b/g,
        '<span class="token keyword">$1</span>'
      );

      // Booleans & primitives
      res = res.replace(
        /\b(true|false|null|undefined|Error|Promise|Map|Set|Object|String|Number|Boolean|Date|crypto|process|console|fetch)\b/g,
        '<span class="token boolean">$1</span>'
      );

      // Object properties & method calls
      res = res.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=:)/g,
        '<span class="token property">$1</span>'
      );

      // Numbers
      res = res.replace(
        /\b(\d+(?:_\d+)*(?:\.\d+)?)\b/g,
        '<span class="token number">$1</span>'
      );

      // Restore placeholders
      placeholders.forEach(function (html, idx) {
        res = res.replace('___TOKEN_' + idx + '___', html);
      });

      return res;
    }).join('\n');
  }

  function highlightBash(code) {
    var lines = code.split('\n');
    var highlightedLines = lines.map(function (line) {
      if (/^\s*#/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }

      var res = escapeHtml(line);

      res = res.replace(
        /\b(curl|git|jq|echo|cat|apk|find|wc|head|tail|exit|if|then|else|fi|stages|stage|image|script|before_script|only|set|npx|docker|uvx|uv)\b/g,
        '<span class="token keyword">$1</span>'
      );

      res = res.replace(
        /(^|\s)(--?[a-zA-Z0-9_\-]+)/g,
        '$1<span class="token operator">$2</span>'
      );

      res = res.replace(
        /(\$[A-Za-z_0-9{}]+)/g,
        '<span class="token boolean">$1</span>'
      );

      res = res.replace(
        /(https?:\/\/[^\s"']+)/g,
        '<span class="token function">$1</span>'
      );

      res = res.replace(
        /(&quot;.*?&quot;|&#39;.*?&#39;|'[^']*'|"[^"]*")/g,
        '<span class="token string">$1</span>'
      );

      return res;
    });

    return highlightedLines.join('\n');
  }

  function detectLanguage(code, element) {
    var text = code.trim();
    if (element.classList.contains('language-ts') || element.classList.contains('language-js') || element.classList.contains('language-typescript') || element.classList.contains('language-javascript')) {
      return 'ts';
    }
    if (element.classList.contains('language-json')) {
      return 'json';
    }
    if (element.classList.contains('language-bash')) {
      return 'bash';
    }
    if (text.includes('import ') || text.includes('export const') || text.includes('export default') || text.includes('async (')) {
      return 'ts';
    }
    if (text.startsWith('{') || text.startsWith('[')) {
      return 'json';
    }
    if (text.includes('curl ') || text.includes('git ') || text.includes('jq ')) {
      return 'bash';
    }
    if (text.includes('stages:') || text.includes('stage:')) {
      return 'yaml';
    }
    return 'bash';
  }

  function runHighlighter() {
    var preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach(function (pre) {
      if (pre.classList.contains('mermaid')) return;
      var code = pre.querySelector('code');
      if (!code) return;

      var rawText = code.textContent || code.innerText;
      var lang = detectLanguage(rawText, code);
      pre.setAttribute('data-lang', lang);

      var highlighted = '';
      if (lang === 'json') {
        highlighted = highlightJson(rawText);
      } else if (lang === 'ts') {
        highlighted = highlightJsTs(rawText);
      } else {
        highlighted = highlightBash(rawText);
      }

      code.innerHTML = highlighted;

      // Add a copy button to every pre block
      if (!pre.querySelector('.copy-btn')) {
        var btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copier';
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function () {
          navigator.clipboard.writeText(rawText).then(function () {
            btn.textContent = '✓ Copié !';
            setTimeout(function () {
              btn.textContent = 'Copier';
            }, 2000);
          });
        });
        pre.appendChild(btn);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runHighlighter);
  } else {
    runHighlighter();
  }
})();
