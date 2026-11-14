# Protocole MCP Approfondi : Handshake `initialize` et Multi-Serveurs (Jira & GitLab)

Détail du fonctionnement protocolaire de MCP :
1. Le protocole sous-jacent est JSON-RPC 2.0 via `stdio` (pipes de sous-processus locaux).
2. La méthode `initialize` négocie impérativement les versions du protocole (`protocolVersion`), les capacités mutuelles (`capabilities`: `tools`, `resources`, `sampling`) et les identités (`clientInfo`, `serverInfo`).
3. La notification `notifications/initialized` clôt le handshake (sans `id` car sans accusé de réception).
4. Démonstration multi-serveurs avec un serveur MCP Jira et un serveur MCP GitLab instanciés en parallèle par OpenCode, avec découverte via `tools/list` et agrégation transparente dans le tableau `tools[]` de l'API OpenAI.
