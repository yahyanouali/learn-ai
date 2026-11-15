/**
 * Ultra-fast, zero-dependency, self-contained Syntax Highlighter
 * Uses single-pass / placeholder tokenization so HTML attributes are never corrupted.
 */
(function () {
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightJson(code) {
    var tokenRegex = /(\/\/.*$|"(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/gm;
    var lastIndex = 0;
    var out = '';
    var match;

    while ((match = tokenRegex.exec(code)) !== null) {
      if (match.index > lastIndex) {
        out += escapeHtml(code.slice(lastIndex, match.index));
      }
      var m = match[0];
      if (/^\/\//.test(m)) {
        out += '<span class="token comment">' + escapeHtml(m) + '</span>';
      } else if (/^"/.test(m)) {
        if (/:$/.test(m)) {
          var colonIdx = m.lastIndexOf(':');
          var keyPart = m.slice(0, colonIdx);
          var spaceAndColon = m.slice(colonIdx);
          out += '<span class="token property">' + escapeHtml(keyPart) + '</span><span class="token punctuation">' + escapeHtml(spaceAndColon) + '</span>';
        } else {
          out += '<span class="token string">' + escapeHtml(m) + '</span>';
        }
      } else if (/^(?:true|false)$/.test(m)) {
        out += '<span class="token boolean">' + escapeHtml(m) + '</span>';
      } else if (m === 'null') {
        out += '<span class="token keyword">' + escapeHtml(m) + '</span>';
      } else {
        out += '<span class="token number">' + escapeHtml(m) + '</span>';
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < code.length) {
      out += escapeHtml(code.slice(lastIndex));
    }
    return out;
  }

  function highlightJsTs(code) {
    var tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|from|const|let|var|async|await|function|return|if|else|for|of|in|try|catch|throw|new|typeof|instanceof|void|delete|interface|type|default)\b|\b(?:true|false|null|undefined|Error|Promise|Map|Set|Object|String|Number|Boolean|Date|crypto|process|console|fetch)\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)|\b\d+(?:_\d+)*(?:\.\d+)?\b)/gm;
    var lastIndex = 0;
    var out = '';
    var match;

    while ((match = tokenRegex.exec(code)) !== null) {
      if (match.index > lastIndex) {
        out += escapeHtml(code.slice(lastIndex, match.index));
      }
      var m = match[0];
      var cls = 'number';
      if (/^\/\//.test(m) || /^\/\*/.test(m)) {
        cls = 'comment';
      } else if (/^["'`]/.test(m)) {
        cls = 'string';
      } else if (/^(?:import|export|from|const|let|var|async|await|function|return|if|else|for|of|in|try|catch|throw|new|typeof|instanceof|void|delete|interface|type|default)$/.test(m)) {
        cls = 'keyword';
      } else if (/^(?:true|false|null|undefined|Error|Promise|Map|Set|Object|String|Number|Boolean|Date|crypto|process|console|fetch)$/.test(m)) {
        cls = 'boolean';
      } else if (/^[a-zA-Z_$]/.test(m)) {
        cls = 'property';
      }
      out += '<span class="token ' + cls + '">' + escapeHtml(m) + '</span>';
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < code.length) {
      out += escapeHtml(code.slice(lastIndex));
    }
    return out;
  }

  function highlightBash(code) {
    var lines = code.split('\n');
    return lines.map(function (line) {
      if (/^\s*#/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }

      var tokenRegex = /(https?:\/\/[^\s"'\\]+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$[A-Za-z_0-9{}]+|\b(?:curl|git|jq|echo|cat|apk|find|wc|head|tail|exit|if|then|else|fi|stages|stage|image|script|before_script|rules|only|set|npx|docker|uvx|uv|bun|bunx)\b|(?:\s|^)(--?[a-zA-Z0-9_\-]+))/g;
      var lastIndex = 0;
      var out = '';
      var match;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          out += escapeHtml(line.slice(lastIndex, match.index));
        }
        var m = match[0];
        if (match[1]) {
          // Flag like -H, -d, --retry (preserve leading space if any)
          var flag = match[1];
          var leading = m.slice(0, m.length - flag.length);
          out += escapeHtml(leading) + '<span class="token operator">' + escapeHtml(flag) + '</span>';
        } else if (/^https?:\/\//.test(m)) {
          out += '<span class="token function">' + escapeHtml(m) + '</span>';
        } else if (/^["']/.test(m)) {
          out += '<span class="token string">' + escapeHtml(m) + '</span>';
        } else if (/^\$/.test(m)) {
          out += '<span class="token boolean">' + escapeHtml(m) + '</span>';
        } else {
          out += '<span class="token keyword">' + escapeHtml(m) + '</span>';
        }
        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        out += escapeHtml(line.slice(lastIndex));
      }
      return out;
    }).join('\n');
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
    if (text.startsWith('{') || text.startsWith('[') || text.startsWith('//')) {
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
