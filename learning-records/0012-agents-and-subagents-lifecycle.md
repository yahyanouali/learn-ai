# Cycle de Vie des Agents & Sous-Agents : Création, Dépôt & Délégation

Documentation approfondie de l'architecture des sous-agents dans OpenCode et Antigravity :
1. **Création d'un sous-agent :**
   - Format standard : Markdown avec frontmatter YAML.
   - Propriétés fondamentales : `name`, `description` (critique pour la découverte autonome), `subagent: true`, `tools: [...]` (sandboxing de privilèges, ex: lecture seule).
   - Corps du fichier : System prompt spécialisé et instructions de cadrage.
2. **Dépôt & Découverte (4 scopes) :**
   - Scope Workspace : `.agents/agents/<nom>.md` (partagé en équipe via Git).
   - Scope Global Utilisateur : `~/.gemini/agents/<nom>.md` ou `~/.config/opencode/agents/`.
   - Scope Plugin : `plugins/<nom>/agents/<nom>.md`.
   - Scope Runtime : Création dynamique en mémoire via `define_subagent`.
3. **Invocation :**
   - Explicite : Par le développeur via `@mention` ou commande slash.
   - Automatique / Autonome : Par l'orchestrateur via `invoke_subagent` basé sur la description sémantique du sous-agent.
4. **Environnement d'exécution :** Workspaces (`inherit`, `branch`, `share`), réveil réactif (*reactive wakeup*) sans polling, et isolation totale de la fenêtre de contexte évitant la contamination du fil principal.
