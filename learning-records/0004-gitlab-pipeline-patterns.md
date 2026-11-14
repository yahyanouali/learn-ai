# Modèle d'intégration sécurisée dans GitLab CI/CD

L'injection de diffs Git volumineux ou contenant des caractères spéciaux dans des payloads cURL nécessite un échappement strict via `jq -Rs .`. Les variables secrètes doivent obligatoirement être protégées et masquées dans GitLab.

## Implications
Les scripts de pipeline peuvent être écrits en pure image Docker Alpine minimale (`curl` + `jq` + `git`), réduisant le temps de démarrage à quelques secondes.
