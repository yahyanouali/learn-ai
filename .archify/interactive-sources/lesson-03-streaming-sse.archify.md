# L'Intention d'Action : finish_reason & Streaming SSE {#lesson-03-streaming}

L'émission d'une action par le modèle est signalée par `finish_reason: "tool_calls"`. En streaming, les arguments JSON transitent sous forme de fragments textuels qu'il faut accumuler par index.

- Le discriminant `finish_reason` informe l'application du motif d'arrêt du modèle (`tool_calls`, `stop`, `length`).
- En mode streaming Server-Sent Events, chaque paquet `data:` transporte un delta contenant un index de fonction.
- Le client assemble les morceaux de chaîne brute dans un tampon dédié jusqu'à la réception du signal de fin.
- L'identifiant unique `id` (`call_...`) doit être préservé intact pour corréler la réponse physique de l'outil.

@answer scope="OpenAI API · finish_reason · Streaming SSE · delta.tool_calls · Buffer Accumulation"
@meta locale=en style=swiss
@source openai title="OpenAI Streaming Documentation" url=https://platform.openai.com/docs/guides/streaming
@source sse title="W3C Server-Sent Events Standard" url=https://html.spec.whatwg.org/multipage/server-sent-events.html

## Comment le streaming SSE transmet-il un appel d'outil ? {#sse-lifecycle}

Le serveur d'inférence envoie des micro-morceaux JSON que le client reconstitue en mémoire.

@sequence id=sse-stream-flow title="Transmission et Reconstitution des Tool Calls en Streaming SSE"
| actor client | Application Cliente | frontend |
| actor buffer | Tampon d Accumulation | backend |
| actor server | Moteur d Inférence LLM | external |
| client | server | POST stream: true
| phase | 1. Paquet Initial avec Métadonnées
| server | client | data: index 0, id call_123, name read_file
| client | buffer | initialiser slot index 0 | emphasis
| phase | 2. Fragments d Arguments Bruts
| server | client | data: arguments {"path":
| client | buffer | append arguments morceau 1
| server | client | data: arguments "src/main.ts"}
| client | buffer | append arguments morceau 2
| phase | 3. Signal de Terminaison
| server | client | data: finish_reason tool_calls | return
| buffer | client | JSON complet parse et valide | return

@callout id=sse-parsing-warning level=warning title="Attention au parsing prématuré"
| Tenter d'exécuter `JSON.parse()` sur un fragment individuel déclenche immédiatement une erreur de syntaxe. |
| Le runtime doit obligatoirement concaténer tous les deltas de l'index 0 jusqu'à la détection de `finish_reason`. |
| En cas d'appels parallèles, chaque outil possède son propre index numérique indépendant dans le tableau. |

## Quels sont les codes d'arrêt du modèle et leur signification ? {#finish-reasons-matrix}

La propriété `finish_reason` dicte le comportement de l'orchestrateur agentique à chaque tour.

| Valeur de `finish_reason` | Signification Technique | Action de l'Agent |
| --- | --- | --- |
| `"tool_calls"` | Le modèle sollicite l'exécution d'une ou plusieurs fonctions. | Intercepter, valider les permissions et exécuter l'outil {good:Activer la boucle} |
| `"stop"` | Le modèle a terminé sa réponse textuelle standard. | Afficher le message à l'utilisateur et attendre sa saisie {good:Terminaison normale} |
| `"length"` | La fenêtre de contexte ou la limite `max_tokens` est atteinte. | Signaler la troncature ou relancer une complétion partielle {caution:Payload incomplet} |
| `"content_filter"` | La requête a enfreint une règle de sécurité du fournisseur. | Interrompre la session et journaliser l'incident de modération {bad:Blocage de sécurité} |
