/**
 * Ultra-fast, zero-dependency Syntax Highlighter + Theme Switcher & Presentation Mode
 * Uses single-pass tokenization so HTML attributes are never corrupted.
 */
(function () {
  var THEME_KEY = 'learn-ai-theme';
  var PRES_KEY = 'learn-ai-pres';

  function getInitialTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getInitialPres() {
    try {
      return localStorage.getItem(PRES_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️ Mode Clair' : '🌙 Mode Sombre';
      btn.setAttribute('title', theme === 'dark' ? 'Passer au thème clair (T)' : 'Passer au thème sombre (T)');
      btn.setAttribute('aria-label', btn.textContent);
    }
  }

  function applyPres(isPres) {
    document.documentElement.setAttribute('data-pres', isPres ? 'true' : 'false');
    try {
      localStorage.setItem(PRES_KEY, isPres ? 'true' : 'false');
    } catch (e) {}
    var btn = document.getElementById('pres-toggle-btn');
    if (btn) {
      if (isPres) {
        btn.classList.add('active');
        btn.innerHTML = '🖥️ Présentation : ON';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '🖥️ Présentation';
      }
      btn.setAttribute('title', 'Activer/Désactiver le mode projecteur grand écran (P)');
    }
  }

  // Apply immediately before DOMContentLoaded to avoid flash
  applyTheme(getInitialTheme());
  applyPres(getInitialPres());

  function initNavControls() {
    var nav = document.querySelector('.global-nav');
    if (!nav || nav.querySelector('.nav-controls')) return;

    var controls = document.createElement('div');
    controls.className = 'nav-controls';

    var themeBtn = document.createElement('button');
    themeBtn.id = 'theme-toggle-btn';
    themeBtn.type = 'button';
    themeBtn.className = 'nav-control-btn';
    themeBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    var presBtn = document.createElement('button');
    presBtn.id = 'pres-toggle-btn';
    presBtn.type = 'button';
    presBtn.className = 'nav-control-btn';
    presBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-pres') === 'true';
      applyPres(!current);
    });

    controls.appendChild(presBtn);
    controls.appendChild(themeBtn);
    nav.appendChild(controls);

    applyTheme(document.documentElement.getAttribute('data-theme') || getInitialTheme());
    applyPres(document.documentElement.getAttribute('data-pres') === 'true');
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 't' || e.key === 'T') {
          var current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
          applyTheme(current === 'dark' ? 'light' : 'dark');
        } else if (e.key === 'p' || e.key === 'P') {
          var isPres = document.documentElement.getAttribute('data-pres') === 'true';
          applyPres(!isPres);
        }
      }
      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        var links = document.querySelectorAll('.nav-links:first-of-type a');
        if (links.length === 2) {
          e.preventDefault();
          window.location.href = e.key === 'ArrowLeft' ? links[0].href : links[1].href;
        }
      }
    });
  }

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
    var tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|from|const|let|var|async|await|function|return|if|else|for|of|in|try|catch|throw|new|typeof|instanceof|void|delete|interface|type|default|while)\b|\b(?:true|false|null|undefined|Error|Promise|Map|Set|Object|String|Number|Boolean|Date|Request|Response|crypto|process|console|fetch)\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)|\b\d+(?:_\d+)*(?:\.\d+)?\b)/gm;
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
      } else if (/^(?:import|export|from|const|let|var|async|await|function|return|if|else|for|of|in|try|catch|throw|new|typeof|instanceof|void|delete|interface|type|default|while)$/.test(m)) {
        cls = 'keyword';
      } else if (/^(?:true|false|null|undefined|Error|Promise|Map|Set|Object|String|Number|Boolean|Date|Request|Response|crypto|process|console|fetch)$/.test(m)) {
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

      var tokenRegex = /(https?:\/\/[^\s"'\\]+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$[A-Za-z_0-9{}]+|\b(?:curl|git|jq|echo|cat|apk|find|wc|head|tail|exit|if|then|else|fi|stages|stage|image|script|before_script|rules|only|set|npx|docker|uvx|uv|bun|bunx|opencode|cursor-agent)\b|(?:\s|^)(--?[a-zA-Z0-9_\-]+))/g;
      var lastIndex = 0;
      var out = '';
      var match;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          out += escapeHtml(line.slice(lastIndex, match.index));
        }
        var m = match[0];
        if (match[1]) {
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

  function initQuizScoreBar() {
    var quizBoxes = document.querySelectorAll('.quiz-box');
    if (!quizBoxes.length || document.querySelector('.quiz-score-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'quiz-score-bar';

    var statusText = document.createElement('span');
    statusText.id = 'quiz-score-text';
    statusText.textContent = '🎯 Score du Questionnaire : 0 / ' + quizBoxes.length + ' validé(s)';

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'quiz-reset-btn';
    resetBtn.textContent = '↺ Réinitialiser';
    resetBtn.addEventListener('click', function () {
      quizBoxes.forEach(function (box) {
        box.querySelectorAll('input[type="radio"]').forEach(function (inp) {
          inp.checked = false;
        });
        var fb = box.querySelector('.quiz-feedback');
        if (fb) {
          fb.className = 'quiz-feedback';
          fb.style.display = 'none';
          fb.textContent = '';
        }
      });
      updateScore();
    });

    bar.appendChild(statusText);
    bar.appendChild(resetBtn);
    quizBoxes[0].parentNode.insertBefore(bar, quizBoxes[0]);

    function updateScore() {
      var correctCount = document.querySelectorAll('.quiz-feedback.correct').length;
      var answeredCount = document.querySelectorAll('.quiz-feedback.correct, .quiz-feedback.incorrect').length;
      statusText.textContent = '🎯 Score du Questionnaire : ' + correctCount + ' / ' + quizBoxes.length + ' correct(s) (' + answeredCount + ' répondu(s))';
    }

    document.addEventListener('change', function (e) {
      if (e.target && e.target.matches('.quiz-box input[type="radio"]')) {
        setTimeout(updateScore, 10);
      }
    });
  }

  function runHighlighter() {
    initNavControls();
    initKeyboardShortcuts();
    initQuizScoreBar();

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
