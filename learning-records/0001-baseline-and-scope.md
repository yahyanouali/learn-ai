# Cadrage initial : Cibles REST/cURL et finalité Agents/GitLab CI

L'utilisateur a une légère expérience avec CrewAI et souhaite comprendre le fonctionnement profond des agents (ex. OpenCode) et créer des intégrations dans GitLab CI/CD sans passer par des SDKs opaques. L'apprentissage se concentre exclusivement sur les deux protocoles vivants d'OpenAI (`/v1/chat/completions` et `/v1/responses`) via des requêtes HTTP brutes (cURL/REST).

## Evidence
Échanges initiaux confirmant la volonté de manipuler directement cURL, de rejeter les APIs obsolètes, et de maîtriser la boucle interne des agents de code.

## Implications
Les leçons devront systématiquement fournir les payloads JSON bruts et les commandes cURL testables avec `bash` et `jq`. Elles décomposeront le cycle perception-action-observation des agents avant toute automatisation complexe.
