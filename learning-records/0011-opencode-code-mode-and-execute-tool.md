# Intégration du Code Mode d'OpenCode & de l'Outil Execute (13 Étapes)

Documentation et intégration détaillée du paradigme **Code Mode** d'OpenCode :
1. **Limitation du Tool Calling direct :** Les tâches complexes (ex: filtrer 20 tickets Jira et croiser avec GitLab) provoquent 15 à 25 allers-retours réseau HTTP vers OpenAI et accumulent plus de 40k tokens de JSON brut en mémoire.
2. **Le Code Mode d'OpenCode :**
   - Remplacement de 40 outils individuels par un **outil unique : `execute`**.
   - **Catalogue MCP dans le System Prompt :** Les signatures d'outils (ex: `tools.jira.*`, `tools.gitlab.*`) sont injectées directement dans le message `system` sous forme de documentation d'API TypeScript/JavaScript.
   - **Script JavaScript émis par le LLM :** Le modèle écrit un bloc JS asynchrone utilisant l'objet global `tools`, avec boucles `for`, `.filter()`, et `.map()`.
   - **Sandbox locale (`@opencode/codemode`) :** Interpréteur JS local sécurisé qui route les appels d'outils vers les serveurs MCP stdio en temps réel et exécute les calculs en RAM locale sans solliciter OpenAI.
   - **Économie de tokens :** Seul le résultat final distillé est renvoyé dans le rôle `tool`, réduisant la consommation de 80% à 90% et ramenant le nombre de requêtes réseau à 1 seul aller-retour.
3. **Mise à niveau du curriculum :** Création de l'Étape 7 dédiée (`0007-code-mode-et-outil-execute.html`), réindexation propre des 13 étapes et mise à jour de l'aide-mémoire général.
