# Déterminisme JSON pour CI/CD avec Structured Outputs

L'utilisation de `response_format: { type: "json_schema", json_schema: { strict: true } }` garantit une sortie conforme à 100% au schéma sans fioriture textuelle, permettant une consommation directe par `jq` dans un runner CI/CD sans risque d'erreur de parsing.

## Implications
Les pipelines GitLab peuvent automatiser des décisions binaires de blocage/validation de merge sans étape fragile de nettoyage d'expressions régulières.
