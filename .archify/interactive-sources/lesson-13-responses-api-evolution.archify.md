# L'Évolution du Standard : OpenAI Responses API (/v1/responses) {#lesson-13-responses-api}

La nouvelle API Responses remplace le modèle stateless par une gestion d'état native côté serveur : les tours s'enchaînent simplement via l'identifiant `previous_response_id`.

- Avec `/v1/chat/completions`, le client est contraint de renvoyer l'intégralité de l'historique à chaque requête HTTP.
- Avec `/v1/responses`, le serveur stocke l'historique et les deltas, allégeant massivement les payloads réseau.
- L'API unifie les sorties textuelles, les fichiers générés et l'exécution d'outils hébergés au sein d'un contrat unique.
- Cette évolution préfigure le transfert progressif de la boucle agentique du client local vers l'infrastructure d'inférence.

@answer scope="OpenAI Responses API · /v1/responses · previous_response_id · Server-Side State"
@meta locale=en style=swiss
@source responses title="OpenAI Responses API Reference" url=https://platform.openai.com/docs/api-reference/responses

## Comment s'enchaînent les requêtes avec la Responses API ? {#responses-lifecycle}

Le client ne transmet que la nouvelle consigne en référençant la réponse précédente.

@sequence id=responses-api-flow title="Chaînage d État Côté Serveur avec l API Responses"
| actor client | Application Cliente | frontend |
| actor api | Endpoint POST /v1/responses | backend |
| actor store | Stockage d Etat Serveur | database |
| phase | 1. Premier Tour de Conversation
| client | api | POST /v1/responses (input: "Cree un projet")
| api | store | enregistrement session resp_001
| api | client | 200 OK (id: resp_001, text: "Projet cree") | return
| phase | 2. Deuxième Tour avec Chaînage d'État
| client | api | POST previous_response_id: resp_001 | emphasis
| api | store | recuperation automatique du contexte
| api | client | 200 OK (id: resp_002, reponse enrichie) | return

@callout id=stateful-advantage level=note title="Avantages majeurs de l'approche Responses API"
| Réduction drastique de la bande passante : le client n'envoie plus 50 Ko d'historique à chaque tour. |
| Streaming unifié combinant texte, raisonnement (thinking tokens) et sorties d'outils en un seul flux. |
| Outils managés côté serveur (navigateur web, interpréteur de code) exécutés sans infrastructure locale. |

## Quelles sont les différences structurelles entre Completions et Responses ? {#api-comparison-matrix}

La transition simplifie l'architecture des orchestrateurs d'agents en déchargeant la mémoire de session.

```json title="Exemple de requête avec previous_response_id sur /v1/responses"
{
  "model": "gpt-4o",
  "previous_response_id": "resp_abc123xyz",
  "input": "Ajoute maintenant un test unitaire sur ce module."
}
```

| Critère d'Architecture | Chat Completions (`/v1/chat/completions`) | Responses API (`/v1/responses`) |
| --- | --- | --- |
| Stockage de l'historique | À la charge de l'application cliente {caution:Payloads lourds} | Conservé nativement sur les serveurs d'OpenAI {good:Léger} |
| Gestion des tours | L'historique complet `messages[]` est renvoyé à chaque fois | Un simple pointeur `previous_response_id` suffit {good:Économe} |
| Compatibilité locale | Universel (vLLM, Ollama, LM Studio, Mistral, OpenAI) {good:Portabilité} | Dédié à la plateforme OpenAI moderne |
| Outils intégrés | L'application doit tout exécuter localement sur la machine | Possibilité d'utiliser des outils gérés par le cloud |
