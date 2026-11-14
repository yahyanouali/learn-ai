# Mission: Construire des Agents et Automatiser des Pipelines avec les APIs OpenAI

## Why
Maîtriser les APIs OpenAI modernes (Chat Completions et Responses API) au niveau protocolaire HTTP pour concevoir des agents autonomes fonctionnels (type OpenCode/assistant de code) et automatiser des tâches d'ingénierie logicielle directement dans des pipelines GitLab CI/CD.

## Success looks like
- Écrire et exécuter des requêtes `curl` complètes pour Chat Completions et Responses API avec streaming, appel d'outils (tool calling) et sorties structurées.
- Implémenter la boucle de contrôle d'un agent autonome (perception -> décision d'outil -> exécution -> observation -> réponse).
- Intégrer un job GitLab CI/CD fonctionnel utilisant `curl` et `jq` pour analyser automatiquement du code ou générer des résumés de Merge Requests.
- Savoir choisir précisément entre `/v1/chat/completions` et `/v1/responses` selon les besoins (interopérabilité multi-fournisseurs vs outils natifs OpenAI).

## Constraints
- Privilégier les formats cURL et HTTP REST plutôt que les SDKs de haut niveau pour comprendre ce qui transite réellement sur le réseau.
- Rester compatible avec les contraintes d'environnements CI/CD (bash, curl, jq, variables d'environnement secrètes).

## Out of scope
- Ancienne API de complétion de texte (`/v1/completions` obsolète).
- Frameworks lourds tiers avant d'avoir parfaitement assimilé le protocole HTTP sous-jacent.
