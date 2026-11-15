# Sorties Structurées : Constrained Decoding & Logit Masking {#lesson-11-json-strict}

Le Constrained Decoding garantit mathématiquement 100% de conformité au schéma JSON : le moteur d'inférence masque les jetons invalides avant l'échantillonnage Softmax.

- Les schémas JSON stricts imposent `strict: true` et `additionalProperties: false` sur chaque objet.
- Le moteur d'inférence (vLLM, Outlines ou OpenAI) compile le schéma en automate fini ou grammaire non contextuelle.
- À chaque position de décodage, les logits des tokens qui violeraient la syntaxe JSON sont fixés à $-\infty$.
- Le modèle ne peut matériellement générer aucun champ manquant, type erroné ou clé hallucinée.

@answer scope="Structured Outputs · Constrained Decoding · Logit Masking · strict: true · CFG Grammar"
@meta locale=en style=swiss
@source openai title="OpenAI Structured Outputs Guide" url=https://platform.openai.com/docs/guides/structured-outputs
@source outlines title="Outlines Structured Generation Paper" url=https://arxiv.org/abs/2307.09702

## Comment fonctionne le masquage des logits au niveau du GPU ? {#decoding-mechanism}

L'automate syntaxique filtre les candidats lexicaux avant la sélection du token suivant.

@workflow id=constrained-decoding-flow title="Mécanique du Constrained Decoding et Masquage des Logits"
| schema | Schema JSON Strict | external |
| grammar | Compilation en Grammaire CFG | backend |
| gpu | Calcul des Logits Bruts | backend |
| mask | Masquage des Tokens Invalides | security |
| softmax | Echantillonnage Mathematique | backend |
| token | Jeton Conforme Garanti | frontend |
| schema > grammar | regles syntaxiques
| grammar > mask | masque binaire
| gpu > mask | distribution brute | emphasis
| mask > softmax | logits filtres
| softmax > token | jeton valide
| token > grammar | transition d etat | dashed

@steps id=decoding-steps
| step1 | 1. Compilation Grammaticale | Le schéma JSON est traduit en automate d'états finis avant le début de l'inférence. | constrained-decoding-flow | grammar |
| step2 | 2. Calcul des Prédictions | Le réseau de neurones produit les scores bruts (logits) pour l'ensemble du vocabulaire. | constrained-decoding-flow | gpu |
| step3 | 3. Masquage Sélectif (Mask) | L'automate applique $-\infty$ à tous les tokens non autorisés à l'étape courante. | constrained-decoding-flow | mask |
| step4 | 4. Émission Déterministe | La fonction Softmax ne retient que des jetons strictement conformes à la grammaire. | constrained-decoding-flow | softmax |

## Quelle est la configuration cURL requise pour activer le mode strict ? {#curl-strict-example}

Le paramètre `response_format` encapsule la définition stricte du schéma attendu.

```bash title="Appel cURL avec structured outputs activé"
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Extrait l adresse de livraison."}],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "shipping_address",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "city": { "type": "string" },
            "zip_code": { "type": "string" }
          },
          "required": ["city", "zip_code"],
          "additionalProperties": false
        }
      }
    }
  }'
```

| Propriété Requise | Rôle dans le Constrained Decoding | Conséquence en cas d'Omission |
| --- | --- | --- |
| `strict: true` | Active le compilateur d'automate au niveau du serveur d'inférence. | Le modèle retombe en mode probabiliste non garanti {caution:Risque d'erreur} |
| `additionalProperties: false` | Interdit l'ajout de clés non déclarées dans le schéma. | Rejet immédiat de la requête par l'API OpenAI {bad:Erreur 400} |
| `required: [...]` | Rend obligatoire chaque propriété déclarée sans exception. | Les champs optionnels doivent être déclarés en union avec null |
