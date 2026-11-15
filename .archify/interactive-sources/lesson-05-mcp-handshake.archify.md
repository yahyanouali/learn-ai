# Standardisation des Outils : Le Protocole MCP (JSON-RPC 2.0) {#lesson-05-mcp}

Le Model Context Protocol découple l'agent de ses sources de données via un protocole JSON-RPC 2.0 standardisé sur flux standard (`stdio`) ou HTTP.

- La phase `initialize` négocie les capacités du client (`roots`, `sampling`) et du serveur (`tools`, `resources`).
- La découverte dynamique via `tools/list` permet au client de charger les schémas JSON sans modifier le code de l'agent.
- L'invocation s'effectue via `tools/call`, avec retour immédiat du résultat sous forme de texte ou de ressource binaire.
- La capacité `sampling` permet à un serveur MCP de demander une inférence au LLM sans posséder de clé API propre.

@answer scope="Model Context Protocol · JSON-RPC 2.0 · initialize · tools/call · sampling · roots"
@meta locale=en style=swiss
@source mcp title="Model Context Protocol Specification" url=https://modelcontextprotocol.io/
@source jsonrpc title="JSON-RPC 2.0 Specification" url=https://www.jsonrpc.org/specification

## Comment s'articulent les 4 phases du cycle de vie MCP ? {#mcp-lifecycle}

Le protocole standardise les échanges entre l'application hôte et les serveurs d'outils externes.

@sequence id=mcp-full-handshake title="Handshake JSON-RPC 2.0 et Cycle de Vie MCP"
| actor client | Client OpenCode | backend |
| actor server | Serveur MCP SQLite | external |
| phase | 1. Négociation des Capacités
| client | server | initialize (roots, sampling)
| server | client | initializeResult (tools, resources) | return
| client | server | notifications/initialized
| phase | 2. Découverte Dynamique
| client | server | tools/list
| server | client | listResult (schemas JSON stricts) | return
| phase | 3. Exécution d'Outil
| client | server | tools/call (query, arguments) | emphasis
| server | client | callResult (lignes SQL formatees) | return

@callout id=mcp-capabilities-explained level=note title="Déchiffrage des capacités négociées"
| `roots.listChanged` informe le serveur lorsque l'utilisateur ouvre ou ferme des dossiers dans l'espace de travail. |
| `sampling` autorise le serveur MCP à solliciter le modèle d'inférence du client en toute sécurité. |
| `tools.listChanged` permet au serveur d'ajouter ou de retirer dynamiquement des outils en cours d'exécution. |

## Comment déclarer un serveur MCP dans sa configuration locale ? {#mcp-config}

La configuration s'effectue dans le fichier `opencode.json` ou `mcp.json`.

```json title="Déclaration d'un serveur MCP SQLite local dans opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sqlite": {
      "type": "local",
      "command": ["uvx", "mcp-server-sqlite", "--db-path", "./production.db"]
    }
  }
}
```

| Capacité MCP | Rôle Client | Rôle Serveur |
| --- | --- | --- |
| `tools` | Exécute des actions physiques avec retour de statut. | Déclare des schémas d'outils et traite les appels `tools/call`. |
| `resources` | Lit des fichiers, flux de logs ou schémas de base de données. | Expose des URI personnalisées (`sqlite://tables/users`). |
| `prompts` | Propose des modèles d'invites préconçus à l'utilisateur. | Fournit des gabarits guidés (`prompts/get`). |
