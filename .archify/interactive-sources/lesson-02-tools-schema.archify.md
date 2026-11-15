# Déclaration des Outils : Du Code TypeScript au JSON Schema {#lesson-02-tools}

L'agent expose ses capacités au modèle via le tableau standard `tools[]` : chaque outil est décrit par un schéma JSON strict spécifiant types, contraintes et descriptions sémantiques.

- La description de l'outil agit comme une consigne directe orientant le choix du modèle.
- La bibliothèque Zod permet de générer automatiquement des schémas JSON Schema compatibles draft 2020-12.
- Le paramètre `tool_choice` force, autorise ou interdit l'invocation d'outils par le modèle.
- L'option `parallel_tool_calls` permet au modèle d'émettre plusieurs appels indépendants en une seule passe.

@answer scope="OpenAI API · tools[] · JSON Schema · Zod · tool_choice · Bun"
@meta locale=en style=swiss
@source openai title="OpenAI Function Calling Guide" url=https://platform.openai.com/docs/guides/function-calling
@source jsonschema title="JSON Schema Specification Draft 2020-12" url=https://json-schema.org/draft/2020-12/release-notes

## Comment le runtime compile-t-il la définition d'un outil ? {#schema-compilation}

Le runtime transforme une signature de fonction typée en contrat d'interface pour le modèle de langage.

@workflow id=tool-spec-flow title="De la Signature TypeScript au Schéma JSON Validé"
| ts | Fonction TypeScript | backend |
| zod | Schéma Zod | backend |
| schema | Schéma JSON Strict | backend |
| payload | Paramètre tools | external |
| model | Modèle LLM | external |
| ts > zod | typage
| zod > schema | export | emphasis
| schema > payload | injection
| payload > model | contrat

@steps id=tool-steps
| step1 | 1. Implémentation Locale | La fonction est codée en TypeScript avec ses types natifs et sa logique métier. | tool-spec-flow | ts |
| step2 | 2. Schématisation Zod | Les paramètres d'entrée sont encapsulés dans un objet Zod précisant les formats requis. | tool-spec-flow | zod |
| step3 | 3. Export JSON Schema | Le runtime sérialise l'objet Zod au standard JSON Schema avec `additionalProperties: false`. | tool-spec-flow | schema |
| step4 | 4. Exposition au Modèle | Le payload HTTP est envoyé au LLM pour qu'il identifie quand utiliser cet outil. | tool-spec-flow | payload |

## Comment configurer le choix d'outil dans la requête HTTP ? {#tool-choice-matrix}

Le client contrôle précisément la marge de manœuvre du modèle grâce au paramètre `tool_choice`.

```json title="Exemple de déclaration d'outil dans le payload POST /v1/chat/completions"
{
  "type": "function",
  "function": {
    "name": "read_file",
    "description": "Lit le contenu complet d'un fichier texte sur le disque.",
    "parameters": {
      "type": "object",
      "properties": {
        "path": { "type": "string", "description": "Chemin absolu ou relatif du fichier" }
      },
      "required": ["path"],
      "additionalProperties": false
    }
  }
}
```

| Valeur de `tool_choice` | Comportement du Modèle | Cas d'Usage Idéal |
| --- | --- | --- |
| `"auto"` | Le modèle décide librement entre répondre en texte ou appeler un outil. | Mode de fonctionnement standard d'un agent ReAct {good:Recommandé} |
| `"required"` | Le modèle est contraint d'émettre au moins un `tool_call`. | Pipelines stricts d'extraction ou d'action obligatoire |
| `"none"` | Aucun outil ne peut être invoqué, le modèle génère du texte pur. | Clôture de synthèse ou désactivation temporaire |
| `{"type": "function", ...}` | Force l'appel d'un outil particulier désigné par son nom. | Première étape déterministe d'un plan d'exécution |
