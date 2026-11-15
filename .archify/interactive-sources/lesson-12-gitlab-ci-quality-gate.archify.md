# L'Agent Headless en Production : Pipeline GitLab CI/CD {#lesson-12-gitlab-ci}

L'agent s'exécute sans interface graphique dans les chaînes d'intégration continue : il évalue les commits et bloque les fusions non conformes via un Quality Gate automatisé.

- Le pipeline déclenche un conteneur éphémère à chaque événement de merge request.
- Une requête cURL interroge le modèle avec un schéma strict d'audit retournant une note de conformité.
- L'outil utilitaire `jq` extrait le score numérique et bloque le pipeline avec un code retour 1 si la note est inférieure à 80.
- L'outil OpenCode peut également tourner en mode headless natif via la commande `opencode run "consigne"`.

@answer scope="GitLab CI/CD · Quality Gate · Headless Agent · opencode run · jq Parser"
@meta locale=en style=swiss
@source gitlab title="GitLab CI/CD Pipelines Reference" url=https://docs.gitlab.com/ee/ci/
@source jq title="jq Command-Line JSON Processor" url=https://jqlang.github.io/jq/

## Comment fonctionne le Quality Gate IA dans un pipeline de merge request ? {#ci-flow}

Le conteneur CI audite automatiquement le code avant toute intervention humaine de relecture.

@workflow id=ci-quality-gate-flow title="Pipeline CI/CD d Évaluation Automatisée de Code"
| commit | Push de Code sur Branche | external |
| diff | Extraction du Patch git diff | backend |
| audit | Requete API LLM Mode Strict | backend |
| parse | Extraction Score avec jq | backend |
| gate | Note Superieure a 80 ? | security |
| pass | Pipeline Vert Merge Autorisee | frontend |
| fail | Pipeline Rouge Blocage CI | frontend |
| commit > diff | declencheur webhook
| diff > audit | prompt injecte
| audit > parse | JSON structure
| parse > gate | score numerique
| gate > pass | oui note satisfaisante | emphasis
| gate > fail | non audit insuffisant | dashed

@steps id=ci-steps
| step1 | 1. Déclenchement CI | Le développeur pousse sa branche et déclenche l'exécution du pipeline dans un conteneur Docker. | ci-quality-gate-flow | commit |
| step2 | 2. Calcul du Diff | Le script calcule la différence textuelle entre la branche courante et la branche principale. | ci-quality-gate-flow | diff |
| step3 | 3. Audit Déterministe | L'API OpenAI analyse les modifications avec `strict: true` et produit une note d'architecture. | ci-quality-gate-flow | audit |
| step4 | 4. Arbitrage jq | Le score est extrait et comparé au seuil d'acceptabilité pour autoriser ou bloquer la fusion. | ci-quality-gate-flow | gate |

## Quel est le code YAML du fichier .gitlab-ci.yml de production ? {#ci-code-example}

Le job CI isole les secrets dans des variables d'environnement masquées.

```yaml title="Configuration d'un Quality Gate IA dans .gitlab-ci.yml"
stages:
  - ai-review

ai-quality-gate:
  stage: ai-review
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq git
  script:
    - git diff origin/main...HEAD > changes.patch
    - |
      SCORE=$(curl -s https://api.openai.com/v1/chat/completions \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d @payload.json | jq -r '.choices[0].message.content | fromjson | .score')
    - echo "Score d audit obtenu : $SCORE / 100"
    - if [ "$SCORE" -lt 80 ]; then echo "Echec du Quality Gate"; exit 1; fi
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

| Approche CI/CD | Avantage Majeur | Inconvénient |
| --- | --- | --- |
| Script `cURL` + `jq` | Léger, universel, ne nécessite aucun runtime lourd comme Node.js {good:Rapide et frugal} | Limité à une inférence unitaire sans boucle ReAct |
| Mode `opencode run` | Agentique complet, dispose des outils de recherche et d'édition | Nécessite l'installation du binaire OpenCode et de Bun |
