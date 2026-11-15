# OpenAI Modern APIs Resources

## Knowledge

- [OpenAI API Reference: Chat Completions](https://platform.openai.com/docs/api-reference/chat)
  Documentation officielle de `/v1/chat/completions`. Use for: anatomie des messages (`system`, `user`, `assistant`, `tool`), gestion du streaming Server-Sent Events (SSE) et `tools`.
- [OpenAI API Reference: Responses API](https://platform.openai.com/docs/api-reference/responses)
  Documentation officielle de la nouvelle API unifiée `/v1/responses`. Use for: syntaxe simplifiée, outils intégrés nativement (search, code interpreter) et sessions stateful.
- [OpenAI Guide: Function Calling & Tools](https://platform.openai.com/docs/guides/function-calling)
  Guide complet sur l'appel d'outils. Use for: schéma JSON des fonctions et boucle d'agent.
- [OpenAI Guide: Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
  Guide sur `response_format: { type: "json_schema" }`. Use for: garantir des réponses JSON valides sans hallucination de format dans les pipelines CI/CD.
- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io)
  Spécification officielle du standard MCP (Anthropic/open-source). Use for: protocole JSON-RPC 2.0, cycle de vie du handshake (`initialize`, `tools/list`), et transport stdio/SSE.
- [AGENTS.md Open Standard](https://github.com/agents-md/agents.md)
  Spécification et bonnes pratiques pour les fichiers d'instructions système à la racine des dépôts. Use for: structuration des consignes pour agents de code.
- [OpenCode Official Documentation: Custom Commands](https://opencode.ai/docs/commands/)
  Documentation officielle des commandes slash personnalisées dans OpenCode (`.opencode/commands/*.md`, `~/.config/opencode/commands/*.md` et clé `"commands"` dans `opencode.jsonc`). Use for: placeholders `$ARGUMENTS`, `$1`, injection shell `` !`command` ``, `@filename`, `agent`, `model` et `subagent: true`.

## Wisdom (Communities)

- [OpenAI Developer Community Forum](https://community.openai.com)
  Forum officiel des développeurs OpenAI. Use for: cas limites, changements d'API, astuces de rate-limiting et dépannage réseau.
- [r/LocalLLaMA & r/OpenAI](https://reddit.com/r/OpenAI)
  Discussions techniques de praticiens. Use for: retours d'expérience sur l'interopérabilité des formats OpenAI avec d'autres modèles (vLLM, Ollama, DeepSeek).
