# Diviser pour Régner : Agents Primaires & Sous-Agents {#lesson-09-subagents}

Le recours aux sous-agents protège la fenêtre de contexte de l'agent principal : chaque sous-agent démarre avec un historique vierge et ne renvoie qu'une synthèse concise à l'agent parent.

- OpenCode sépare les agents primaires (`build` pour l'action, `plan` pour la réflexion) des sous-agents spécialisés.
- Un sous-agent se déclare avec `mode: "subagent"` dans `.opencode/agents/*.json` ou en Markdown.
- L'invocation peut être explicite (`@nom_agent`), automatique via l'outil natif `task`, ou pilotée par une commande.
- L'agent parent délègue les recherches lourdes et évite ainsi la dégradation de l'attention du modèle sur les longs historiques.

@answer scope="OpenCode Agents · mode: subagent · Context Window Isolation · task tool · Delegation"
@meta locale=en style=swiss
@source opencode title="OpenCode Agents and Subagents Documentation" url=https://opencode.ai/docs/agents/

## Comment s'organise l'isolation de mémoire entre agents ? {#subagents-arch}

L'agent parent conserve un contexte épuré pendant que le sous-agent explore des dizaines de fichiers.

@architecture id=subagents-isolation title="Isolation de la Fenêtre de Contexte par Délégation à un Sous-Agent"
| user | Developpeur en Session | frontend |
| parent | Agent Principal Parent | backend |
| tasktool | Outil Natif task | backend |
| subagent | Sous-Agent de Recherche | backend |
| workspace | Fichiers et Outils Disque | external |
| user > parent | requete
| parent > tasktool | delegation
| tasktool > subagent | mission | emphasis
| subagent > workspace | exploration
| workspace > subagent | donnees
| subagent > tasktool | synthese | dashed
| tasktool > parent | resultat | dashed

@facts id=subagent-facts
| Contexte Vierge | Le sous-agent démarre sans l'historique volumineux de la conversation parente |
| Outils Filtrés | Un sous-agent d'analyse peut être restreint à des outils de lecture seule |
| Économie Réseau | Seules les 20 lignes de conclusion finale sont réinjectées dans l'agent parent |

## Comment déclarer un sous-agent personnalisé ? {#subagent-spec}

La définition associe un rôle précis à un ensemble d'outils restreints.

```json title="Déclaration d'un sous-agent dans .opencode/agents/security-reviewer.json"
{
  "$schema": "https://opencode.ai/config.json",
  "name": "security-reviewer",
  "description": "Analyse rigoureuse des vulnérabilités de code et détection de fuites de secrets.",
  "mode": "subagent",
  "tools": {
    "read_file": true,
    "edit_file": false,
    "execute": false
  }
}
```

| Mode d'Invocation | Déclencheur | Cas d'Usage Idéal |
| --- | --- | --- |
| Explicite (`@nom_agent`) | L'utilisateur mentionne directement l'agent dans le prompt. | Audit de sécurité ou revue architecturale ciblée {good:Contrôle total} |
| Automatique (`task`) | L'agent principal juge nécessaire de sous-traiter une étape. | Recherches d'occurrences dans des bases de code massives {good:Autonomie} |
| Commande (`subagent: true`) | Déclenché par une commande slash configurée pour lancer un sous-agent. | Revue de pull request automatisée |
