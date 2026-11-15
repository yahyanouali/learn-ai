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

  function getBasePrefix() {
    var link = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    if (link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('../') === 0) return '../';
    }
    return '';
  }

  var SEARCH_INDEX = [
    {
      title: "Aide-Mémoire : Protocoles OpenAI, Architecture OpenCode & Cursor",
      category: "RÉFÉRENCE",
      url: "reference/openai-api-cheat-sheet.html",
      desc: "Synthèse technique complète, matrice d'équivalence OpenCode vs Cursor, tableau des endpoints et comparatif des 4 Actes.",
      keywords: ["aide-mémoire", "cheat sheet", "reference", "matrice", "comparatif", "opencode vs cursor", "tableau", "recapitulatif", "resume", "4 actes"]
    },
    {
      title: "Étape 1 : Fondations LLM & L'Inférence Stateless (/v1/chat/completions)",
      category: "ACTE I • ÉTAPE 1",
      url: "lessons/0001-fondations-llm-chat-completions.html",
      desc: "Requête HTTP stateless, rôles system, user, assistant, developer, ChatML, Chat Template Jinja2, SFT, Loss Masking, Prefill et Decode sur GPU.",
      keywords: ["stateless", "chat completions", "messages", "system", "user", "assistant", "developer", "sous le capot", "chatml", "chat template", "jinja2", "sft", "loss masking", "prefill", "decode", "kv cache", "gpu", "vllm"]
    },
    {
      title: "Sous le Capot du LLM : Du JSON au Texte Plat ChatML & GPU",
      category: "ACTE I • ÉTAPE 1",
      url: "lessons/0001-fondations-llm-chat-completions.html#3-sous-le-capot-du-serveur-et-du-gpu",
      desc: "Comment le LLM comprend les rôles sans parseur JSON grâce aux tokens spéciaux <|im_start|>, au Loss Masking et au KV Cache en VRAM.",
      keywords: ["chatml", "tokens speciaux", "<|im_start|>", "<|im_end|>", "loss masking", "sft", "prefill", "decode", "kv cache", "vram", "jinja2", "aplatissement"]
    },
    {
      title: "Étape 2 : Déclaration des Outils (tools[]) & JSON Schema Strict",
      category: "ACTE I • ÉTAPE 2",
      url: "lessons/0002-declaration-des-outils-tools.html",
      desc: "Catalogue tools[], JSON Schema strict, Zod z.object, Bun, configuration tool_choice (auto/required/none) et parallel_tool_calls.",
      keywords: ["tools", "outils", "json schema", "strict", "zod", "bun", "tool_choice", "parallel_tool_calls", "function calling", "declaration"]
    },
    {
      title: "Génération de JSON Schema avec Zod & Bun",
      category: "ACTE I • ÉTAPE 2",
      url: "lessons/0002-declaration-des-outils-tools.html#zod-et-bun",
      desc: "Pourquoi les agents modernes utilisent Zod en TypeScript (5 lignes) plutôt que d'écrire 25 lignes de JSON Schema verbeux à la main.",
      keywords: ["zod", "bun", "z.object", "schema", "typescript", "runtime", "validation"]
    },
    {
      title: "Étape 3 : Réception & Détection des Tool Calls (finish_reason & SSE)",
      category: "ACTE I • ÉTAPE 3",
      url: "lessons/0003-reception-et-detection-tool-calls.html",
      desc: "Signal finish_reason: tool_calls, streaming Server-Sent Events (SSE), buffer d'accumulation par index, et cycle en 7 étapes du Tool Calling.",
      keywords: ["tool_calls", "finish_reason", "streaming", "sse", "server-sent events", "delta", "chunks", "buffer", "index", "prefix caching", "toolpart", "fast apply"]
    },
    {
      title: "Le Cycle en 7 Étapes du Tool Calling (JSON ↔ <tool_call>)",
      category: "ACTE I • ÉTAPE 3",
      url: "lessons/0003-reception-et-detection-tool-calls.html#3-sous-le-capot-du-serveur-inférence-7-étapes",
      desc: "De la requête JSON initiale à la génération <tool_call> par le GPU, au parsing serveur et au ré-aplatissement <tool_response> avec Prefix Caching.",
      keywords: ["tool_call", "tool_response", "7 etapes", "meteo lyon", "prefix caching", "kv cache", "gpu prefill", "aplatissement"]
    },
    {
      title: "Étape 4 : La Boucle Agentique (ReAct), Rôle tool & Permissions",
      category: "ACTE I • ÉTAPE 4",
      url: "lessons/0004-boucle-agentique-et-role-tool.html",
      desc: "Boucle while ReAct (Reason + Act + Observe), message role: tool avec tool_call_id, et pare-feu de permissions local (allow, ask, deny).",
      keywords: ["react", "boucle agentique", "reason act observe", "role tool", "tool_call_id", "boucle while", "permissions", "opencode.jsonc", "cursor cli.json", "cursorignore", "allow ask deny", "self-healing", "auto-correction"]
    },
    {
      title: "Définition de ReAct (Reason + Act + Observe)",
      category: "ACTE I • ÉTAPE 4",
      url: "lessons/0004-boucle-agentique-et-role-tool.html#1-qu-est-ce-que-react",
      desc: "Le patron d'architecture ReAct (Yao et al. 2022) qui permet à l'agent d'agir dans le monde réel et d'observer le résultat avant de conclure.",
      keywords: ["react", "reason", "act", "observe", "yao", "princeton", "google", "boucle"]
    },
    {
      title: "Étape 5 : Le Protocole MCP & Handshake JSON-RPC 2.0",
      category: "ACTE II • ÉTAPE 5",
      url: "lessons/0005-mcp-protocole-et-handshake.html",
      desc: "Standardisation des outils via JSON-RPC 2.0 (stdio/HTTP), handshake initialize, capabilities roots/sampling/listChanged, et configuration OpenCode vs Cursor.",
      keywords: ["mcp", "model context protocol", "json-rpc 2.0", "initialize", "initialized", "tools/list", "tools/call", "roots", "sampling", "listchanged", "stdio", "stdout vs stderr", "console.error", "docker", "npx", "uvx", "mcpservers", "mcp.json"]
    },
    {
      title: "Étape 6 : Le Code Mode (Méta-Outil execute) & Économie de Contexte (-85%)",
      category: "ACTE II • ÉTAPE 6",
      url: "lessons/0006-code-mode-et-outil-execute.html",
      desc: "Remplacer tout le catalogue tools[] par un méta-outil execute : exécution de code JS dans une sandbox Bun Worker en un seul aller-retour HTTP.",
      keywords: ["code mode", "execute", "meta-outil", "sandbox", "bun worker", "economie de tokens", "contexte", "multi-outils", "@opencode/codemode", "cursor composer"]
    },
    {
      title: "Étape 7 : Rules, Instructions Système & AGENTS.md",
      category: "ACTE III • ÉTAPE 7",
      url: "lessons/0007-rules-instructions-et-agents-md.html",
      desc: "Mémoire permanente d'équipe : conventions dans AGENTS.md, instructions[] dans opencode.jsonc, et règles granulaires .cursor/rules/*.mdc.",
      keywords: ["rules", "agents.md", "instructions", ".cursor/rules", "mdc", "alwaysapply", "globs", "memoire permanente", "system prompt", "standards de code"]
    },
    {
      title: "Étape 8 : Skills Métiers (SKILL.md) & Commandes Slash Personnalisées",
      category: "ACTE III • ÉTAPE 8",
      url: "lessons/0008-skills-et-progressive-disclosure.html",
      desc: "Progressive Disclosure avec SKILL.md (-95% de tokens) et commandes slash (.opencode/commands/*.md, $ARGUMENTS, $1, !`shell`, @fichier).",
      keywords: ["skills", "skill.md", "progressive disclosure", ".agents/skills", "commandes slash", "commands", "/commands", ".opencode/commands", "$arguments", "$1", "!`cmd`", "shell", "@fichier", "subagent: true", "subtask", ".cursor/commands", "matrice de decision"]
    },
    {
      title: "Commandes Slash OpenCode ($ARGUMENTS, !`shell`, @fichier)",
      category: "ACTE III • ÉTAPE 8",
      url: "lessons/0008-skills-et-progressive-disclosure.html#commandes-slash",
      desc: "Créer des commandes personnalisées /review, /history avec interpolation d'arguments et exécution shell locale !`...` avant la requête HTTP.",
      keywords: ["commandes", "slash commands", "opencode commands", "template", "$arguments", "$1", "$2", "!`shell`", "@fichier", "subagent", "subtask"]
    },
    {
      title: "Matrice de Décision : Rules vs Commands vs Skills vs Subagents",
      category: "ACTE III • ÉTAPE 8",
      url: "lessons/0008-skills-et-progressive-disclosure.html#matrice-decision",
      desc: "Tableau comparatif pour savoir exactement quand utiliser une Rule, une Commande Slash, un Skill ou un Sous-Agent.",
      keywords: ["matrice", "rules vs commands vs skills vs subagents", "choix", "comparaison", "quand utiliser", "difference"]
    },
    {
      title: "Étape 9 : Agents Primaires (Build/Plan) & Sous-Agents (Delegation)",
      category: "ACTE III • ÉTAPE 9",
      url: "lessons/0009-agents-et-sous-agents-delegation.html",
      desc: "Spécialisation des agents Build vs Plan, délégation de tâches via l'outil task, mode: subagent dans .opencode/agents/*.md sans pollution de contexte.",
      keywords: ["sous-agents", "subagents", "mode: subagent", "mode: primary", "build", "plan", "delegation", "task", "isolation", "context window", ".opencode/agents", ".cursor/agents", "zero pollution"]
    },
    {
      title: "Étape 10 : Plugins OpenCode (V2 & V1) & Hooks Cursor",
      category: "ACTE III • ÉTAPE 10",
      url: "lessons/0010-plugins-js-ts-et-hooks-cycle-de-vie.html",
      desc: "Programmation déterministe en TypeScript : V2 (@opencode/plugin Plugin.define setup(ctx), ctx.tool.hook, ctx.session.hook), DLP et hooks Cursor.",
      keywords: ["plugins", "hooks", "@opencode/plugin", "v2", "plugin.define", "setup(ctx)", "ctx.tool.hook", "execute.before", "execute.after", "ctx.session.hook", "http.request", "http.response", "ctx.tool.transform", "replaceinplace", "dlp", "masquage secrets", "cleanup", "@opencode-ai/plugin", "v1", ".cursor/hooks.json"]
    },
    {
      title: "Étape 11 : Sorties Structurées (JSON Strict & Constrained Decoding)",
      category: "ACTE IV • ÉTAPE 11",
      url: "lessons/0011-sorties-structurees-json-schema.html",
      desc: "Garantir 100% de conformité JSON avec response_format json_schema strict: true, Constrained Decoding par masquage de logits GPU, et gestion du refus.",
      keywords: ["sorties structurees", "structured outputs", "json_schema", "strict: true", "constrained decoding", "logit masking", "grammaire bnf", "refusal", "zero hallucination"]
    },
    {
      title: "Étape 12 : Industrialisation CI/CD : Audit de PR Automatisé en cURL & Headless",
      category: "ACTE IV • ÉTAPE 12",
      url: "lessons/0012-pipeline-gitlab-ci-cd-curl.html",
      desc: "Pipeline .gitlab-ci.yml exécutant un audit automatique de PR via cURL, jq et opencode run sans framework lourd.",
      keywords: ["gitlab ci", "ci/cd", "pipeline", ".gitlab-ci.yml", "curl", "jq", "opencode run", "headless", "revue de code automatique", "security gate", "merge request"]
    },
    {
      title: "Étape 13 : L'API Responses (/v1/responses) & Matrice de Décision Finale",
      category: "ACTE IV • ÉTAPE 13",
      url: "lessons/0013-responses-api-et-matrice-de-choix.html",
      desc: "Nouvelle API unifiée /v1/responses, état serveur (previous_response_id), store: false RGPD, outils web_search/file_search, et matrice de choix finale.",
      keywords: ["responses api", "/v1/responses", "previous_response_id", "stateful", "store: false", "web_search_preview", "file_search", "comparaison", "matrice de choix"]
    }
  ];

  var searchModalBackdrop = null;
  var searchInput = null;
  var searchResults = null;
  var selectedResultIndex = 0;
  var currentResults = [];

  function normalizeStr(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

  function initSearchModal() {
    if (document.getElementById('search-modal-backdrop')) return;

    searchModalBackdrop = document.createElement('div');
    searchModalBackdrop.id = 'search-modal-backdrop';

    var modal = document.createElement('div');
    modal.id = 'search-modal';

    var wrapper = document.createElement('div');
    wrapper.className = 'search-input-wrapper';

    var icon = document.createElement('span');
    icon.className = 'search-input-icon';
    icon.textContent = '🔍';

    searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Rechercher un concept, une leçon, un mot-clé... (ex: ReAct, MCP, Zod, ChatML)';
    searchInput.autocomplete = 'off';
    searchInput.spellcheck = false;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'search-close-btn';
    closeBtn.textContent = 'ESC';
    closeBtn.title = 'Fermer la recherche (Échap)';
    closeBtn.addEventListener('click', closeSearchModal);

    wrapper.appendChild(icon);
    wrapper.appendChild(searchInput);
    wrapper.appendChild(closeBtn);

    var quickTags = document.createElement('div');
    quickTags.className = 'search-quick-tags';
    quickTags.innerHTML = '<span class="tags-label">💡 Suggestions :</span>';
    var tags = ['ReAct', 'MCP', 'Zod', 'ChatML', 'Loss Masking', 'Commandes', 'Plugins V2', 'Code Mode', 'GitLab CI', 'Responses API'];
    tags.forEach(function (tagText) {
      var tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'search-quick-tag';
      tag.textContent = tagText;
      tag.addEventListener('click', function () {
        searchInput.value = tagText;
        performSearch(tagText);
        searchInput.focus();
      });
      quickTags.appendChild(tag);
    });

    searchResults = document.createElement('div');
    searchResults.id = 'search-results';

    var footer = document.createElement('div');
    footer.className = 'search-footer';
    footer.innerHTML = '<div class="search-footer-shortcuts">' +
      '<span><kbd>↑</kbd> <kbd>↓</kbd> Naviguer</span>' +
      '<span><kbd>↵</kbd> Ouvrir</span>' +
      '<span><kbd>ESC</kbd> Fermer</span>' +
      '</div>' +
      '<span>⚡ Recherche locale instantanée</span>';

    modal.appendChild(wrapper);
    modal.appendChild(quickTags);
    modal.appendChild(searchResults);
    modal.appendChild(footer);
    searchModalBackdrop.appendChild(modal);
    document.body.appendChild(searchModalBackdrop);

    searchModalBackdrop.addEventListener('click', function (e) {
      if (e.target === searchModalBackdrop) {
        closeSearchModal();
      }
    });

    searchInput.addEventListener('input', function () {
      performSearch(searchInput.value);
    });

    performSearch('');
  }

  function openSearchModal() {
    initSearchModal();
    searchModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }, 50);
  }

  function closeSearchModal() {
    if (searchModalBackdrop) {
      searchModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function toggleSearchModal() {
    if (searchModalBackdrop && searchModalBackdrop.classList.contains('open')) {
      closeSearchModal();
    } else {
      openSearchModal();
    }
  }

  function performSearch(query) {
    if (!searchResults) return;
    var rawQ = query.trim();
    var cleanQ = normalizeStr(rawQ);

    if (!cleanQ) {
      currentResults = SEARCH_INDEX.slice(0, 8);
      renderResults(currentResults, '');
      return;
    }

    var words = cleanQ.split(/\s+/).filter(Boolean);
    var scored = [];

    SEARCH_INDEX.forEach(function (item) {
      var normTitle = normalizeStr(item.title);
      var normDesc = normalizeStr(item.desc);
      var normKeywords = item.keywords.map(normalizeStr).join(' ');
      var combined = normTitle + ' ' + normDesc + ' ' + normKeywords;

      var allMatch = words.every(function (w) {
        return combined.indexOf(w) !== -1;
      });

      if (!allMatch) return;

      var score = 0;
      if (normTitle.indexOf(cleanQ) !== -1) score += 100;
      if (normKeywords.indexOf(cleanQ) !== -1) score += 60;
      if (normDesc.indexOf(cleanQ) !== -1) score += 30;

      words.forEach(function (w) {
        if (normTitle.indexOf(w) !== -1) score += 20;
        if (normKeywords.indexOf(w) !== -1) score += 15;
        if (normDesc.indexOf(w) !== -1) score += 5;
      });

      scored.push({ item: item, score: score });
    });

    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    currentResults = scored.slice(0, 10).map(function (s) { return s.item; });
    renderResults(currentResults, rawQ);
  }

  function renderResults(items, query) {
    searchResults.innerHTML = '';
    selectedResultIndex = 0;

    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'search-empty-state';
      empty.innerHTML = '<strong>Aucun résultat trouvé pour « ' + escapeHtml(query) + ' »</strong>' +
        '<p>Essayez avec un mot-clé plus court comme <em>ReAct</em>, <em>MCP</em>, <em>Zod</em>, <em>ChatML</em> ou <em>Plugins</em>.</p>';
      searchResults.appendChild(empty);
      return;
    }

    var basePrefix = getBasePrefix();

    items.forEach(function (item, idx) {
      var link = document.createElement('a');
      link.className = 'search-result-item' + (idx === 0 ? ' selected' : '');
      link.href = basePrefix + item.url;

      var header = document.createElement('div');
      header.className = 'search-result-header';

      var title = document.createElement('span');
      title.className = 'search-result-title';
      title.textContent = item.title;

      var badge = document.createElement('span');
      badge.className = 'search-result-badge';
      badge.textContent = item.category;

      header.appendChild(title);
      header.appendChild(badge);

      var desc = document.createElement('div');
      desc.className = 'search-result-desc';
      desc.textContent = item.desc;

      link.appendChild(header);
      link.appendChild(desc);

      link.addEventListener('mouseenter', function () {
        selectResult(idx);
      });

      link.addEventListener('click', function () {
        closeSearchModal();
      });

      searchResults.appendChild(link);
    });
  }

  function selectResult(index) {
    var items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;
    if (index < 0) index = 0;
    if (index >= items.length) index = items.length - 1;

    items.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('selected');
      }
    });
    selectedResultIndex = index;
  }

  function selectNextResult(delta) {
    var items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;
    var nextIdx = (selectedResultIndex + delta + items.length) % items.length;
    selectResult(nextIdx);
  }

  function openSelectedResult() {
    var items = searchResults.querySelectorAll('.search-result-item');
    if (items.length && items[selectedResultIndex]) {
      items[selectedResultIndex].click();
    }
  }

  function initNavControls() {
    var nav = document.querySelector('.global-nav');
    if (!nav || nav.querySelector('.nav-controls')) return;

    var controls = document.createElement('div');
    controls.className = 'nav-controls';

    var searchBtn = document.createElement('button');
    searchBtn.id = 'search-toggle-btn';
    searchBtn.type = 'button';
    searchBtn.className = 'nav-control-btn search-btn';
    var isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    var kbdText = isMac ? '⌘K' : 'Ctrl K';
    searchBtn.innerHTML = '🔍 <span class="search-btn-text">Rechercher</span><kbd class="nav-kbd">' + kbdText + '</kbd>';
    searchBtn.setAttribute('title', 'Rechercher un concept, une leçon, un outil (' + kbdText + ')');
    searchBtn.addEventListener('click', toggleSearchModal);

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

    controls.appendChild(searchBtn);
    controls.appendChild(presBtn);
    controls.appendChild(themeBtn);
    nav.appendChild(controls);

    var activeItem = nav.querySelector('.nav-item.active');
    if (activeItem && activeItem.scrollIntoView) {
      try {
        activeItem.scrollIntoView({ block: 'nearest', inline: 'center' });
      } catch (e) {}
    }

    applyTheme(document.documentElement.getAttribute('data-theme') || getInitialTheme());
    applyPres(document.documentElement.getAttribute('data-pres') === 'true');
  }

  function navigateAdjacentPage(direction) {
    var links = document.querySelectorAll('.nav-links:first-of-type a');
    if (links.length === 2) {
      window.location.href = direction < 0 ? links[0].href : links[1].href;
      return;
    }
    var navItems = Array.from(document.querySelectorAll('.global-nav .nav-item'));
    var activeIdx = navItems.findIndex(function (el) { return el.classList.contains('active'); });
    if (activeIdx !== -1) {
      var targetIdx = activeIdx + direction;
      if (targetIdx >= 0 && targetIdx < navItems.length) {
        window.location.href = navItems[targetIdx].href;
      }
    }
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      // Global hotkey: Ctrl+K or Cmd+K always triggers search anywhere
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleSearchModal();
        return;
      }

      var modalOpen = searchModalBackdrop && searchModalBackdrop.classList.contains('open');
      if (modalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSearchModal();
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectNextResult(1);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectNextResult(-1);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          openSelectedResult();
          return;
        }
        return;
      }

      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        openSearchModal();
        return;
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 't' || e.key === 'T') {
          var current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
          applyTheme(current === 'dark' ? 'light' : 'dark');
        } else if (e.key === 'p' || e.key === 'P') {
          var isPres = document.documentElement.getAttribute('data-pres') === 'true';
          applyPres(!isPres);
        } else if (e.key === '[') {
          navigateAdjacentPage(-1);
        } else if (e.key === ']') {
          navigateAdjacentPage(1);
        }
      }
      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        navigateAdjacentPage(e.key === 'ArrowLeft' ? -1 : 1);
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

      var tokenRegex = /(https?:\/\/[^\s"'\\]+|"(?:\\.|[^"\\])*"(?:\s*:)?|'(?:\\.|[^'\\])*'|\$[A-Za-z_0-9{}]+|\b(?:curl|git|jq|echo|cat|apk|find|wc|head|tail|exit|if|then|else|fi|set|npx|docker|uvx|uv|bun|bunx|opencode|cursor-agent)\b|\b(?:true|false|null)\b|(?:\s|^)(--?[a-zA-Z0-9_\-]+)|\b\d+(?:\.\d+)?\b)/g;
      var lastIndex = 0;
      var out = '';
      var match;

      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          out += escapeHtml(line.slice(lastIndex, match.index));
        }
        var m = match[0];
        if (match[2]) {
          var flag = match[2];
          var leading = m.slice(0, m.length - flag.length);
          out += escapeHtml(leading) + '<span class="token operator">' + escapeHtml(flag) + '</span>';
        } else if (/^https?:\/\//.test(m)) {
          out += '<span class="token function">' + escapeHtml(m) + '</span>';
        } else if (/^"/.test(m) && /:$/.test(m)) {
          var colonIdx = m.lastIndexOf(':');
          out += '<span class="token property">' + escapeHtml(m.slice(0, colonIdx)) + '</span><span class="token punctuation">' + escapeHtml(m.slice(colonIdx)) + '</span>';
        } else if (/^["']/.test(m)) {
          out += '<span class="token string">' + escapeHtml(m) + '</span>';
        } else if (/^\$/.test(m) || /^(?:true|false)$/.test(m)) {
          out += '<span class="token boolean">' + escapeHtml(m) + '</span>';
        } else if (/^\d/.test(m)) {
          out += '<span class="token number">' + escapeHtml(m) + '</span>';
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

  function highlightMarkdown(code) {
    var lines = code.split('\n');
    var inFrontmatter = false;
    return lines.map(function (line, idx) {
      var trimmed = line.trim();
      var nextLine = idx + 1 < lines.length ? lines[idx + 1] : '';
      if (trimmed === '---' && (inFrontmatter || idx === 0 || /^\s*[a-zA-Z0-9_\-]+\s*:/.test(nextLine))) {
        inFrontmatter = !inFrontmatter;
        return '<span class="token keyword">' + escapeHtml(line) + '</span>';
      }
      if (inFrontmatter) {
        var fmMatch = line.match(/^(\s*[a-zA-Z0-9_\-]+)(\s*:\s*)(.*)$/);
        if (fmMatch) {
          var val = fmMatch[3];
          var valHtml = escapeHtml(val);
          if (/^(?:true|false)$/.test(val.trim())) {
            valHtml = '<span class="token boolean">' + escapeHtml(val) + '</span>';
          } else if (/^\d+(?:\.\d+)?$/.test(val.trim())) {
            valHtml = '<span class="token number">' + escapeHtml(val) + '</span>';
          } else if (/^["'].*["']$/.test(val.trim())) {
            valHtml = '<span class="token string">' + escapeHtml(val) + '</span>';
          } else if (val.trim().length > 0 && val.trim() !== '>-' && val.trim() !== '|') {
            valHtml = '<span class="token string">' + escapeHtml(val) + '</span>';
          }
          return '<span class="token property">' + escapeHtml(fmMatch[1]) + '</span><span class="token punctuation">' + escapeHtml(fmMatch[2]) + '</span>' + valHtml;
        }
        return escapeHtml(line);
      }
      if (/^\s*#\s*(?:Exemple|Invocation|\d+\.)/i.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }
      if (/^\s*#+\s/.test(line)) {
        return '<span class="token function" style="font-weight:700;">' + escapeHtml(line) + '</span>';
      }
      var tokenRegex = /(!`[^`]+`|`[^`]+`|\$ARGUMENTS|\$[1-9]\d*|@[a-zA-Z0-9_.\-\/]+|\*\*[^*]+\*\*|^\s*(?:-\s+|\d+\.\s+))/g;
      var lastIndex = 0;
      var out = '';
      var match;
      while ((match = tokenRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          out += escapeHtml(line.slice(lastIndex, match.index));
        }
        var m = match[0];
        if (/^!`/.test(m)) {
          out += '<span class="token keyword">!</span><span class="token string">' + escapeHtml(m.slice(1)) + '</span>';
        } else if (/^`/.test(m)) {
          out += '<span class="token string">' + escapeHtml(m) + '</span>';
        } else if (/^\$/.test(m)) {
          out += '<span class="token boolean">' + escapeHtml(m) + '</span>';
        } else if (/^@/.test(m)) {
          out += '<span class="token function">' + escapeHtml(m) + '</span>';
        } else if (/^\*\*/.test(m)) {
          out += '<span class="token property">' + escapeHtml(m) + '</span>';
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

  function highlightYaml(code) {
    var lines = code.split('\n');
    return lines.map(function (line) {
      if (/^\s*#/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }
      var keyMatch = line.match(/^(\s*(?:-\s+)?[a-zA-Z0-9_\-]+)(\s*:\s*)(.*)$/);
      if (keyMatch && !/https?:/.test(keyMatch[1])) {
        var prefix = '<span class="token property">' + escapeHtml(keyMatch[1]) + '</span><span class="token punctuation">' + escapeHtml(keyMatch[2]) + '</span>';
        return prefix + highlightBash(keyMatch[3]);
      }
      return highlightBash(line);
    }).join('\n');
  }

  function highlightHttpSse(code) {
    var lines = code.split('\n');
    return lines.map(function (line) {
      if (/^\s*#/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }
      if (/^data:\s*/.test(line)) {
        var payload = line.replace(/^data:\s*/, '');
        if (payload.trim() === '[DONE]') {
          return '<span class="token keyword">data:</span> <span class="token boolean">[DONE]</span>';
        }
        return '<span class="token keyword">data:</span> ' + highlightJson(payload);
      }
      var reqMatch = line.match(/^(POST|GET|PUT|DELETE|PATCH)\s+(\S+)\s+(HTTP\/[0-9.]+)$/);
      if (reqMatch) {
        return '<span class="token keyword">' + escapeHtml(reqMatch[1]) + '</span> <span class="token function">' + escapeHtml(reqMatch[2]) + '</span> <span class="token comment">' + escapeHtml(reqMatch[3]) + '</span>';
      }
      var hdrMatch = line.match(/^([A-Za-z0-9\-]+)(:\s*)(.*)$/);
      if (hdrMatch) {
        return '<span class="token property">' + escapeHtml(hdrMatch[1]) + '</span><span class="token punctuation">' + escapeHtml(hdrMatch[2]) + '</span><span class="token string">' + escapeHtml(hdrMatch[3]) + '</span>';
      }
      return escapeHtml(line);
    }).join('\n');
  }

  function highlightText(code) {
    return code.split('\n').map(function (line) {
      if (/^\s*\.\.\.\s*\[.*\]\s*\.\.\.\s*$/.test(line)) {
        return '<span class="token comment">' + escapeHtml(line) + '</span>';
      }
      var jsonLineMatch = line.match(/^(\s*[\[{].*[\]}])(&lt;\|im_end\|&gt;|<\|im_end\|>)?\s*$/);
      if (jsonLineMatch) {
        var jsonPart = highlightJson(jsonLineMatch[1]);
        var endTag = jsonLineMatch[2] ? '<span class="token keyword">' + escapeHtml(jsonLineMatch[2]) + '</span>' : '';
        return jsonPart + endTag;
      }
      var commentIdx = line.indexOf('#');
      var mainPart = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
      var commentPart = commentIdx !== -1 ? '<span class="token comment">' + escapeHtml(line.slice(commentIdx)) + '</span>' : '';

      var tokenRegex = /(<\|im_start\|>)(system|user|assistant|tool)?|(<\|im_end\|>)|(<\/?(?:tool_call|tool_response)>)|([├└│─]+)|(\b\d+(?:°C|%)?\b)/g;
      var lastIndex = 0;
      var out = '';
      var match;
      while ((match = tokenRegex.exec(mainPart)) !== null) {
        if (match.index > lastIndex) {
          out += escapeHtml(mainPart.slice(lastIndex, match.index));
        }
        if (match[1]) {
          out += '<span class="token keyword">' + escapeHtml(match[1]) + '</span>';
          if (match[2]) {
            out += '<span class="token property">' + escapeHtml(match[2]) + '</span>';
          }
        } else if (match[3]) {
          out += '<span class="token keyword">' + escapeHtml(match[3]) + '</span>';
        } else if (match[4]) {
          out += '<span class="token boolean">' + escapeHtml(match[4]) + '</span>';
        } else if (match[5]) {
          out += '<span class="token punctuation">' + escapeHtml(match[5]) + '</span>';
        } else if (match[6]) {
          out += '<span class="token number">' + escapeHtml(match[6]) + '</span>';
        }
        lastIndex = tokenRegex.lastIndex;
      }
      if (lastIndex < mainPart.length) {
        out += escapeHtml(mainPart.slice(lastIndex));
      }
      return out + commentPart;
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
    if (element.classList.contains('language-bash') || element.classList.contains('language-sh') || element.classList.contains('language-shell')) {
      return 'bash';
    }
    if (element.classList.contains('language-markdown') || element.classList.contains('language-md') || element.classList.contains('language-mdc')) {
      return 'markdown';
    }
    if (element.classList.contains('language-yaml') || element.classList.contains('language-yml')) {
      return 'yaml';
    }
    if (element.classList.contains('language-http') || element.classList.contains('language-sse')) {
      return 'http';
    }
    if (element.classList.contains('language-text') || element.classList.contains('language-tree')) {
      return 'text';
    }
    if (text.startsWith('---') || /^#\s+[A-ZÀ-Ÿ]/.test(text)) {
      return 'markdown';
    }
    if (text.startsWith('stages:') || text.includes('\nstage:')) {
      return 'yaml';
    }
    if (/^(?:POST|GET)\s+https?:\/\//.test(text) || /^# Chunk 1[\s\S]*\ndata:\s*\{/.test(text) || text.startsWith('data: {')) {
      return 'http';
    }
    if (text.includes('├──') || text.includes('└──')) {
      return 'text';
    }
    if (text.includes('import ') || text.includes('export const') || text.includes('export default') || text.includes('async (')) {
      return 'ts';
    }
    if (text.startsWith('{') || text.startsWith('[') || text.startsWith('//')) {
      return 'json';
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
    initSearchModal();
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
      } else if (lang === 'markdown') {
        highlighted = highlightMarkdown(rawText);
      } else if (lang === 'yaml') {
        highlighted = highlightYaml(rawText);
      } else if (lang === 'http') {
        highlighted = highlightHttpSse(rawText);
      } else if (lang === 'text') {
        highlighted = highlightText(rawText);
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
