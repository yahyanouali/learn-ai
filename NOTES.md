# Notes de travail - Apprentissage APIs OpenAI & Architecture Agents

## Préférences utilisateur
- **Langage / Format favori** : cURL et requêtes HTTP REST brutes (pour une compréhension totale sous le capot et l'utilisation dans des pipelines GitLab).
- **Objectif concret** : Comprendre le fonctionnement d'agents de code (comme OpenCode / Cline), créer ses propres chatbots/agents autonomes, et automatiser des tâches via GitLab CI/CD.
- **Architecture Personnalisations, Code Mode & Sous-Agents** :
  - **Rules** : `AGENTS.md`, portées locales/globales, plafonds de 24 KB par fichier et budget de 20k tokens.
  - **Skills** : Structure `SKILL.md` + `scripts/`, principe fondamental de *Progressive Disclosure* (~25 tokens d'indexation initiale vs explosion de contexte).
  - **Plugins** : Bundles packagés via `plugin.json` (Rules + Skills + `mcp_config.json` + `hooks.json`).
  - **Code Mode & Outil Execute** : Option configurable (`codeMode: true/false`), déclaration dans le `system prompt` (catalogue JS `tools.*`), un seul outil OpenAI `execute`, interpréteur JS sandboxé local (`@opencode/codemode`), boucles/filtres locaux, réduction de 90% des tokens et 1 seul aller-retour HTTP.
  - **Sous-Agents (Subagents)** : Création Markdown + frontmatter YAML (`name`, `description`, `subagent: true`, `tools: [...]`), 4 scopes de dépôt (`.agents/agents/`, `~/.gemini/agents/`, `plugins/<nom>/agents/`, `define_subagent`), invocation explicite (`@mention`) vs automatique (`invoke_subagent`), workspaces (`inherit`, `branch`, `share`), réveil réactif sans polling et isolation étanche du contexte.
- **Convention de rôle** : Toujours utiliser `"role": "system"` (standard classique universel) au lieu de `"role": "developer"`.
- **Navigation & Rendu** : Menu global unifié présent en haut de toutes les 13 leçons, coloration syntaxique sans dépendance (`highlighter.js`), diagrammes Mermaid haute lisibilité (`<div class="mermaid">`, `min-width: 950px`, polices 18.5px, fond blanc).
- **Pédagogie & Rythme** : Micro-leçons courtes, chronologiques, ciblées, avec mini-quizz aux options équilibrées.
