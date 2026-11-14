# Initialisation des Agents : Fichiers AGENTS.md et Handshake MCP

Compréhension du mécanisme de configuration d'un agent de code (comme OpenCode) : injection du fichier `AGENTS.md` dans le prompt `role: "system"` et initialisation des serveurs d'outils via le protocole MCP (Model Context Protocol) en JSON-RPC 2.0 (`initialize`, `notifications/initialized`, `tools/list`).

## Evidence
Mise en place de la leçon prérequis 0000 avec diagramme de séquence complet du handshake et parsing des structures JSON-RPC 2.0 vers le format `tools[]` d'OpenAI.

## Implications
L'agent n'a pas d'outils codés en dur : sa boîte à outils est découverte dynamiquement au runtime par MCP et transmise de manière transparente au LLM dans l'appel API standard.
