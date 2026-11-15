# Savoir-Faire Métier & Commandes Slash : Progressive Disclosure {#lesson-08-skills}

Le motif de Progressive Disclosure préserve la fenêtre de contexte. L'agent ne charge que les métadonnées légères des compétences, puis lit le fichier `SKILL.md` complet uniquement à la demande.

- Les compétences sont déclarées dans un dossier avec un fichier `SKILL.md` doté d'un en-tête YAML.
- Au démarrage, seules les lignes de résumé (~100 jetons) sont incluses dans le prompt système de l'agent.
- Les commandes personnalisées permettent à l'utilisateur de déclencher des flux répétitifs via `/nom_commande`.
- Les variables dynamiques OpenCode (`$ARGUMENTS`, `!shell`, `@fichier`) injectent du contexte frais avant l'appel.

@answer scope="Agent Skills · SKILL.md · Progressive Disclosure · Slash Commands · Dynamic Variables"
@meta locale=en style=swiss
@source opencode title="OpenCode Commands & Skills Documentation" url=https://opencode.ai/docs/commands/
@source agentskills title="Standard Agent Skills Specification" url=https://agentskills.io/

## Comment fonctionne le chargement à la demande d'une compétence ? {#disclosure-flow}

L'agent découvre dynamiquement les consignes approfondies sans encombrer le contexte initial.

@workflow id=progressive-disclosure title="Mécanique du Progressive Disclosure pour les Skills"
| boot | Demarrage de Session | external |
| catalog | Chargement Noms et Resumes | backend |
| prompt | Question de l Utilisateur | frontend |
| match | Correspondance Semantique ? | backend |
| fetch | Lecture Dynamique de SKILL.md | backend |
| exec | Resolution avec Guide Complet | backend |
| boot > catalog | prompt systeme leger
| catalog > prompt | session prete
| prompt > match | analyse de l intention
| match > fetch | oui besoin metier | emphasis
| match > exec | non reponse directe
| fetch > exec | contexte enrichi a la demande

@steps id=skills-steps
| step1 | 1. Enregistrement Léger | Au lancement, seules les balises de nom et de description sont lues pour économiser le contexte. | progressive-disclosure | catalog |
| step2 | 2. Détection du Besoin | Le modèle repère un mot-clé ou un objectif nécessitant un outillage ou un format spécifique. | progressive-disclosure | match |
| step3 | 3. Lecture du Fichier Complet | L'agent appelle son outil de lecture pour charger l'intégralité du document `SKILL.md`. | progressive-disclosure | fetch |
| step4 | 4. Application Déterministe | L'agent exécute les scripts ou suit les directives spécialisées avec une précision maximale. | progressive-disclosure | exec |

## Comment structurer une commande personnalisée dans OpenCode ? {#slash-commands}

Les commandes se déposent dans `.opencode/commands/*.md` et acceptent des filtres dynamiques.

```markdown title="Exemple de commande personnalisée (.opencode/commands/audit.md)"
---
description: "Audit de conformité et détection de secrets"
subagent: false
---

Analyse les modifications récentes issues de la commande !`git diff HEAD~1` :
1. Vérifie le respect des directives d'architecture documentées dans @AGENTS.md.
2. Détecte les variables sensibles ou les clés API accidentellement introduites.
3. Rédige un rapport synthétique classé par niveau de criticité.
```

| Placeholder Dynamique | Moment d'Évaluation | Effet Produit |
| --- | --- | --- |
| `$ARGUMENTS` ou `$1` | À la saisie utilisateur | Injecte les paramètres tapés après la commande (`/audit src/core`) {good:Interactif} |
| `!commande_shell` | Avant l'envoi au LLM | Exécute la commande bash locale et remplace par sa sortie brute {good:Temps réel} |
| `@nom_de_fichier` | Résolution client | Lit le fichier indiqué et insère son contenu complet entre balises |
