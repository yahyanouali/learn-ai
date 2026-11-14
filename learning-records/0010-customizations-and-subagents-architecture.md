# Architecture des Personnalisations & Sous-Agents (12 Étapes)

Extension du parcours pédagogique pour intégrer l'architecture complète des agents de développement :
1. **Rules (Étape 1) :** Système de règles hiérarchiques (`AGENTS.md`, `rules/`), plafonds par fichier (24 KB) et budget global de tokens (~20k tokens) avec rétrogradation en pointeurs de fichiers pour préserver la fenêtre de travail.
2. **Skills & Progressive Disclosure (Étape 2) :** Séparation entre descriptions légères au démarrage (~25 tokens par skill) et chargement à la demande de `SKILL.md` et de ses scripts (`scripts/`), évitant l'explosion du contexte et réalisant plus de 95% d'économie de tokens.
3. **Plugins & Bundles Packagés (Étape 3) :** Packaging standard d'entreprise via `plugin.json` regroupant Rules, Skills, serveurs MCP (`mcp_config.json`) et Hooks de sécurité (`hooks.json`) avec espaces de noms (namespacing).
4. **Sous-Agents & Délégation Multi-Agents (Étape 9) :** Modèle Orchestrateur / Sous-Agents (`invoke_subagent`), isolation totale de la fenêtre de contexte pour filtrer des milliers de tokens de logs et ne renvoyer qu'un résumé distillé, et gestion des modes d'espaces de travail (`inherit`, `branch`, `share`).
5. **Mise à niveau globale :** 12 étapes chronologiques réordonnées, barre de navigation universelle, aide-mémoire enrichi d'un tableau comparatif à 4 piliers, et intégration du script de coloration syntaxique.
