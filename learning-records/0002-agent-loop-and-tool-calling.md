# Maîtrise de la boucle de Tool Calling en pur REST/cURL

La boucle d'un agent de code (comme OpenCode) a été décomposée au niveau protocolaire : déclaration JSON Schema dans `tools`, capture du code retour `finish_reason: "tool_calls"`, exécution locale sur la machine, puis corrélation obligatoire via `tool_call_id` dans un message de rôle `tool`.

## Implications
L'agent n'a pas besoin de framework opaque (comme LangChain ou CrewAI) pour être opérationnel : une boucle de quelques lignes en bash ou python suffit à piloter n'importe quel LLM compatible.
