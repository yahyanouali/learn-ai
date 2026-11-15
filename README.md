# ⚡ Architecture des Agents IA : Protocoles OpenAI, OpenCode & Cursor

👉 **[Accéder à la Formation Interactive (GitHub Pages)](https://yahyanouali.github.io/learn-ai/)**

Formation technique complète en **4 Actes et 13 Étapes** conçue selon une approche **« Un Problème ➔ Une Solution »**, illustrée par des requêtes HTTP/cURL brutes, des diagrammes d'architecture Mermaid.js et une comparaison systématique entre **OpenCode** et **Cursor**.

---

## 📚 Plan de la Formation

* **[Aide-Mémoire Général (Synthèse & Matrices Comparatives)](https://yahyanouali.github.io/learn-ai/reference/openai-api-cheat-sheet.html)**

### Acte I — Fondations Protocolaires & Boucle Agentique
1. **[Étape 1 : L'Inférence Stateless (`/v1/chat/completions`), Rôles, ChatML, SFT (Loss Masking) & GPU (Prefill / KV Cache / Decode)](https://yahyanouali.github.io/learn-ai/lessons/0001-fondations-llm-chat-completions.html)**
2. **[Étape 2 : Donner des Mains au Modèle — Déclaration des Outils (`tools[]` & JSON Schema)](https://yahyanouali.github.io/learn-ai/lessons/0002-declaration-des-outils-tools.html)**
3. **[Étape 3 : L'Intention d'Action — `finish_reason: "tool_calls"`, Traduction `<tool_call>` / `<tool_response>` & Streaming SSE](https://yahyanouali.github.io/learn-ai/lessons/0003-reception-et-detection-tool-calls.html)**
4. **[Étape 4 : La Boucle Agentique (ReAct), Permissions (`allow`/`ask`/`deny`) & Rôle `tool`](https://yahyanouali.github.io/learn-ai/lessons/0004-boucle-agentique-et-role-tool.html)**

### Acte II — Extensibilité des Outils à Grande Échelle
5. **[Étape 5 : Le Protocole MCP (Model Context Protocol) & Handshake JSON-RPC 2.0](https://yahyanouali.github.io/learn-ai/lessons/0005-mcp-protocole-et-handshake.html)**
6. **[Étape 6 : Le Code Mode (`@opencode/codemode`) & le Méta-Outil `execute` (Situation A vs Situation B)](https://yahyanouali.github.io/learn-ai/lessons/0006-code-mode-et-outil-execute.html)**

### Acte III — Ingénierie du Contexte & Programmation du Runtime (OpenCode vs Cursor)
7. **[Étape 7 : Gouverner l'Agent — Rules (`AGENTS.md`, `instructions[]` vs `.cursor/rules/*.mdc`)](https://yahyanouali.github.io/learn-ai/lessons/0007-rules-instructions-et-agents-md.html)**
8. **[Étape 8 : Savoir-Faire & Workflows à la Demande — Les Skills (`SKILL.md`, Progressive Disclosure) & Commandes Slash (`.opencode/commands/*.md` & `.cursor/commands/*.md`)](https://yahyanouali.github.io/learn-ai/lessons/0008-skills-et-progressive-disclosure.html)**
9. **[Étape 9 : Orchestration Multi-Agents — Agents Primaires (`Build`/`Plan`) & Sous-Agents (`mode: subagent`)](https://yahyanouali.github.io/learn-ai/lessons/0009-agents-et-sous-agents-delegation.html)**
10. **[Étape 10 : Programmation Déterministe — Plugins JS/TS (`@opencode/plugin` V2 & `@opencode-ai/plugin` V1) & Hooks](https://yahyanouali.github.io/learn-ai/lessons/0010-plugins-js-ts-et-hooks-cycle-de-vie.html)**

### Acte IV — Industrialisation Headless & Nouveaux Standards
11. **[Étape 11 : Garantir le Contrat de Sortie — Structured Outputs (`json_schema` & `strict: true`)](https://yahyanouali.github.io/learn-ai/lessons/0011-sorties-structurees-json-schema.html)**
12. **[Étape 12 : L'Agent Headless en Production — Pipeline GitLab CI/CD (`cURL`, `jq` & `opencode run`)](https://yahyanouali.github.io/learn-ai/lessons/0012-pipeline-gitlab-ci-cd-curl.html)**
13. **[Étape 13 : L'Évolution du Standard — OpenAI Responses API (`/v1/responses`) & Matrice Finale](https://yahyanouali.github.io/learn-ai/lessons/0013-responses-api-et-matrice-de-choix.html)**
