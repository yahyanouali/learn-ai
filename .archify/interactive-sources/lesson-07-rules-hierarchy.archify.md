# Gouverner le Comportement : Les Règles et Instructions Statiques {#lesson-07-rules}

Les règles encadrent le comportement invariant du modèle à chaque requête : elles sont résolues selon une hiérarchie stricte et injectées dans le message système.

- OpenCode découvre en priorité `~/.config/opencode/AGENTS.md` puis le fichier `./AGENTS.md` du dépôt.
- Cursor gère les règles via les fichiers `.cursor/rules/*.mdc` enrichis de métadonnées YAML et de motifs globaux.
- Chaque règle statique pèse sur le temps de Prefill et le coût mémoire du KV Cache à chaque tour.
- Les consignes temporaires ou dépendantes d'un contexte spécifique doivent être déléguées à des compétences ou des commandes.

@answer scope="AGENTS.md · .cursorrules · .cursor/rules/ · Context Resolution · Prefill Cost"
@meta locale=en style=swiss
@source opencode title="OpenCode Rules and AGENTS.md Documentation" url=https://opencode.ai/docs/rules/
@source cursor title="Cursor Rules Documentation" url=https://docs.cursor.com/context/rules-for-ai

## Comment le runtime découvre-t-il les fichiers de règles ? {#rules-resolution}

L'agent fusionne les directives globales de la machine avec les consignes locales du projet.

@tree id=rules-tree title="Arbre de Découverte et Résolution des Règles"
| root | Environnement Agentique | - |
| global | Global Utilisateur (~/.config/opencode) | root |
| workspace | Racine du Projet (./AGENTS.md) | root |
| subfolder | Dossiers Contextuels (src/AGENTS.md) | workspace |
| cursorrules | Fichiers Cursor (.cursor/rules/*.mdc) | root |

@facts id=rules-facts
| Emplacement Global | `~/.config/opencode/AGENTS.md` (règles transverses à tous les dépôts) |
| Emplacement Projet | `./AGENTS.md` à la racine (standards de code et commandes autorisées) |
| Précédence | Les règles locales écrasent ou complètent les directives globales |

## Quel est l'impact des règles sur le budget de jetons ? {#prefill-impact}

Les instructions système statiques sont traitées à chaque tour de conversation sans exception.

```markdown title="Exemple standard de fichier AGENTS.md à la racine d'un dépôt"
# Standards de Développement du Projet

- Langage cible : TypeScript 5.x sous runtime Bun.
- Gestion des erreurs : Toujours encapsuler les accès I/O dans des blocs try/catch.
- Sécurité : Ne jamais afficher ni modifier les fichiers contenant des clés privées (.env).
- Tests : Exécuter `bun test` avant de considérer une tâche comme achevée.
```

| Type de Fichier | Outil Cible | Mécanisme de Déclenchement |
| --- | --- | --- |
| `AGENTS.md` | OpenCode | Chargement passif permanent dans le prompt système {good:Standard universel} |
| `.cursor/rules/*.mdc` | Cursor | Activation ciblée par motifs globaux (`globs: ["src/**/*.ts"]`) |
| `.cursorrules` | Cursor (Historique) | Chargement global sur l'ensemble de l'espace de travail |
