# Architecture des Agents IA & Protocoles d'Inférence : Guide Industriel V2 {#formation-agents-v2}

Un agent IA moderne n'est pas un simple chatbot. C'est un moteur d'état ReAct local qui transforme des jetons textuels en actions système déterministes et sécurisées.

- Le modèle linguistique n'exécute aucun code : il prédit des tokens ChatML `tool_call` que l'application hôte intercepte et exécute.
- Le protocole standardisé MCP découple les outils, ressources et invites externes via des échanges JSON-RPC 2.0 typés.
- L'approche Code Mode remplace des dizaines d'appels d'outils verbeux par un script TypeScript éphémère, réduisant de 85% la consommation de jetons.
- L'industrialisation exige la validation contrainte des schémas, un routage strict du contexte et des tests continus en intégration continue.

@answer scope="OpenCode · Cursor · OpenAI Protocol · Model Context Protocol · Code Mode · Plugins V2 · CI/CD"
@meta locale=en style=swiss
@source opencode title="OpenCode Architecture & Commands Documentation" url=https://opencode.ai/docs/commands/
@source mcp title="Model Context Protocol Specification" url=https://modelcontextprotocol.io/
@source openai title="OpenAI Structured Outputs & Function Calling Reference" url=https://platform.openai.com/docs/guides/function-calling
@source responses title="OpenAI Responses API Documentation" url=https://platform.openai.com/docs/api-reference/responses

## Comment s'organise l'architecture d'un agent de développement ? {#agent-architecture}

L'agent sépare strictement la génération de texte probabiliste et l'accès effectif aux ressources du système hôte.

@architecture id=agent-sys-arch title="Architecture Globale d'un Agent IA de Développement"
| ide | Editeur ou Terminal | frontend |
| runtime | Coeur Agentique OpenCode | backend |
| permissions | Controle d Acces | security |
| llm | Moteur Inférence vLLM | external |
| mcphost | Client MCP Local | backend |
| mcpsrv | Serveur Externe Outils | external |
| sandbox | Bac a Sable TypeScript | backend |
| ide > runtime | prompt utilisateur
| runtime > permissions | filtrage regles | security
| runtime > llm | requete ChatML
| runtime > mcphost | appel d outil | emphasis
| runtime > sandbox | execution script
| mcphost > mcpsrv | requete JSON-RPC

@facts id=arch-facts
| Boucle ReAct | Itération locale observation, réflexion et action |
| Chat Template | Transformation du JSON applicatif en texte brut balisé |
| Isolation | Confinement strict des commandes bash et écritures disque |

| Composant | Rôle dans OpenCode | Rôle dans Cursor |
| --- | --- | --- |
| Interface Utilisateur | Terminal interactif CLI et mode TUI {good:Multiplateforme} | Fenêtre Electron intégrée à VS Code |
| Moteur d'Exécution | Runtime Bun rapide avec TypeScript natif | Moteur Node.js / VS Code Core |
| Gestion des Permissions | Fichier de configuration `opencode.json` | Paramètres d'approbation du terminal |
| Moteur d'Inférence | Fournisseurs multiples locaux et cloud | Passerelle Cursor ou clés API directes |

## Comment le LLM et le GPU traitent-ils la conversation et les outils ? {#llm-inference}

Le modèle de langage ne manipule pas nativement d'objets JSON. Un gabarit de dialogue Jinja2 aplatit l'historique complet en chaîne textuelle brute avant chaque inférence GPU.

```text title="Représentation textuelle brute après aplatissement ChatML"
<|im_start|>system
Tu es un assistant de programmation. Tu as accès à l'outil get_weather.
<|im_end|>
<|im_start|>user
Quel temps fait-il à Lyon ?
<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "get_weather", "arguments": {"city": "Lyon"}}
</tool_call><|im_end|>
```

| Phase d'Inférence | Rôle Matériel | Comportement Clé |
| --- | --- | --- |
| Prefill | Calcul parallèle sur GPU | Traite tout le contexte d'un coup et génère le KV Cache en mémoire VRAM. |
| Decode | Calcul séquentiel sur GPU | Prédit un jeton à la fois en réutilisant le KV Cache pour éviter les recalculs. |
| Loss Masking | Phase d'entraînement | Les gradients ne sont calculés que sur les jetons générés par l'assistant. |

## Comment fonctionne la boucle agentique ReAct et la détection d'outils ? {#react-lifecycle}

Le patron ReAct alterne le raisonnement textuel, l'émission d'un appel d'outil structuré, et l'observation physique du résultat système.

@workflow id=react-cycle title="Cycle d Inférence LLM et Détection d Outil"
| prompt | Question Utilisateur | external |
| flatten | Aplatissement ChatML | backend |
| prefill | Calcul Initial Prefill | backend |
| decode | Décodage Jeton par Jeton | backend |
| detect | Détection tool_call ? | backend |
| parse | Analyse JSON Hôte | backend |
| exec | Exécution Action Système | backend |
| feedback | Réinjection role tool | backend |
| final | Synthèse Textuelle Finale | backend |
| prompt > flatten |
| flatten > prefill | texte brut
| prefill > decode | KV Cache pret
| decode > detect |
| detect > parse | oui | emphasis
| detect > final | non
| parse > exec | arguments JSON
| exec > feedback | sortie physique
| feedback > prefill | KV Cache reutilise | dashed

@steps id=react-steps
| step1 | 1. Aplatissement Chat Template | Le serveur convertit la structure JSON en texte plat délimité par des balises `<\|im_start\|>`. | react-cycle | flatten |
| step2 | 2. Calcul du KV Cache (Prefill) | Le GPU traite tout le contexte existant en parallèle et charge les clés-valeurs d'attention en mémoire vidéo. | react-cycle | prefill |
| step3 | 3. Décodage et Arrêt Déterministe | Le modèle prédit la balise `<tool_call>` avec son contenu JSON puis s'arrête sur `<\|im_end\|>`. | react-cycle | detect |
| step4 | 4. Exécution Hôte Hors-Modèle | L'application cliente analyse le JSON, exécute l'outil sur la machine et réinjecte le résultat avec `role: "tool"`. | react-cycle | exec |

@callout id=react-streaming-details level=note title="Reconstitution du Streaming SSE"
| En mode streaming, les appels d'outils arrivent sous forme de fragments textuels indexés dans `delta.tool_calls`. |
| Le runtime client accumule ces fragments par index numérique dans un tampon avant de tenter l'analyse JSON finale. |
| La boucle s'arrête dès que `finish_reason` vaut `stop` ou que le nombre maximal d'itérations est atteint. |

## Comment le protocole MCP standardise-t-il les outils et ressources ? {#mcp-protocol}

Le Model Context Protocol découple complètement le code de l'agent des connecteurs de données via le standard JSON-RPC 2.0.

@sequence id=mcp-handshake title="Négociation et Appel d Outil MCP via JSON-RPC 2.0"
| actor client | Client OpenCode | backend |
| actor server | Serveur MCP SQLite | external |
| phase | 1. Négociation des Capacités (Handshake)
| client | server | initialize (roots, sampling)
| server | client | initializeResult (tools, resources) | return
| client | server | notifications/initialized
| phase | 2. Découverte et Exécution d Outil
| client | server | tools/list
| server | client | listResult (schemas JSON stricts) | return
| client | server | tools/call (nom, arguments) | emphasis
| server | client | callResult (contenu textuel ou JSON) | return

@callout id=mcp-capabilities-details level=note title="Déchiffrage des capacités MCP déclarées"
| `roots.listChanged` informe le serveur lorsque la liste des dossiers du projet change dans l'éditeur. |
| `sampling` permet à un serveur MCP de déléguer une invite au modèle de l'agent sans stocker de clé API. |
| `tools.listChanged` avertit l'hôte que des outils ont été ajoutés ou supprimés dynamiquement. |

```json title="Configuration d'un serveur MCP dans opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sqlite": {
      "type": "local",
      "command": ["uvx", "mcp-server-sqlite", "--db-path", "./app.db"]
    }
  }
}
```

## Pourquoi et quand basculer vers le Code Mode ? {#code-mode-vs-tools}

L'exécution directe de TypeScript dans un bac à sable résout l'explosion de contexte provoquée par les appels d'outils successifs.

```mermaid title="Consommation de jetons sur 5 opérations chaînées (jetons)"
xychart-beta
  x-axis ["1 opération", "3 opérations", "5 opérations"]
  y-axis "Jetons cumulés" 0 --> 35000
  bar "Outils Traditionnels" [2500, 12000, 31000]
  bar "Code Mode (Script Unique)" [2200, 3100, 4300]
```

| Critère d'arbitrage | Tool Calling Classique (ReAct) | Code Mode (Sandbox Bun / Deno) |
| --- | --- | --- |
| Aller-retours réseau | Un cycle complet par opération {caution:Latence élevée} | Un seul cycle pour l'ensemble du script {good:Immédiat} |
| Poids du contexte | Accumulation de tous les JSON intermédiaires {bad:Saturation rapide} | Données volumineuses filtrées en mémoire vive {good:-85% jetons} |
| Gestion des erreurs | Découverte d'une erreur au tour suivant | Gestion immédiate via des blocs try/catch |
| Isolation sécurité | Validation par outil individuel | Sandbox sécurisée avec mémoire et accès limités |

```typescript title="Exemple de script éphémère exécuté dans l'outil execute"
import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.version = "2.1.0";
writeFileSync("package.json", JSON.stringify(pkg, null, 2));
console.log("Version mise a jour avec succes.");
```

## Comment orchestrer efficacement les couches de contexte ? {#context-orchestration}

Une gestion de contexte optimale évite la surcharge du prompt initial en répartissant les instructions selon leur fréquence d'usage.

| Couche de contexte | Déclenchement | Empreinte mémoire | Rôle principal |
| --- | --- | --- | --- |
| Règles (`AGENTS.md`) | Systématique à chaque tour | Permanente {caution:Pèse sur le prefill} | Contraintes invariantes, styles de code, sécurité |
| Commandes (`/cmd`) | Explicite par le développeur | Ponctuelle {good:Déterministe} | Tâches répétitives (/review, /test, /deploy) |
| Compétences (`SKILL.md`) | Dynamique par l'agent | Chargée sur besoin {good:Économe} | Connaissances métier et outillage spécialisé |
| Sous-agents | Délégation autonome | Contexte isolé {good:Espace vierge} | Exploration lourde, refactorings multi-fichiers |

```markdown title="Structure standard d'une commande slash personnalisée (.opencode/commands/review.md)"
---
description: "Revue de code approfondie de la branche courante"
subagent: false
---

Analyse les modifications actuelles obtenues via !`git diff HEAD~1` :
1. Verifie la conformite avec les standards du projet definis dans @AGENTS.md.
2. Identifie les risques de securite potentiels ou les regressions de performance.
3. Propose des correctifs immediats sous forme de blocs de code.
```

## Comment programmer la boucle agentique avec les Plugins OpenCode V2 ? {#opencode-plugins}

L'architecture OpenCode V2 s'appuie sur le cycle de vie `@opencode/plugin` pour intercepter et gouverner les événements en temps réel.

@sequence id=plugin-hook-lifecycle title="Cycle de Vie d Interception d un Plugin OpenCode V2"
| actor runtime | Coeur OpenCode | backend |
| actor plugin | Plugin Securite V2 | backend |
| actor tool | Outil bash execute | external |
| phase | 1. Interception avant Exécution
| runtime | plugin | execute.before (commande)
| plugin | runtime | mutation directe replaceInPlace | return
| phase | 2. Exécution et Traitement du Résultat
| runtime | tool | lancement processus local | emphasis
| tool | runtime | sortie brute de commande | return
| runtime | plugin | execute.after (event.result enveloppe)
| plugin | runtime | anonymisation des secrets trouves | return

```typescript title="Code source d'un plugin de sécurité DLP V2 (.opencode/plugins/security-v2.ts)"
import type { PluginContext } from "@opencode/plugin";

export default function setup(ctx: PluginContext) {
  // Règle 1 : Mutation sur place via replaceInPlace
  ctx.tool.hook("execute.before", async (event) => {
    if (event.input?.command?.includes(".env")) {
      event.replaceInPlace("echo 'Acces refuse aux fichiers sensibles'");
    }
  });

  // Règle 2 : Traitement de l'enveloppe structurée en V2
  ctx.tool.hook("execute.after", async (event) => {
    if (event.result?.content?.[0]?.text) {
      event.result.content[0].text = event.result.content[0].text.replace(/ghp_[a-zA-Z0-9]+/g, "[CLE_MASQUEE]");
    }
  });

  // Règle 3 : Nettoyage lors de la fermeture du workspace
  return () => {
    console.log("Fermeture et liberation du plugin.");
  };
}
```

## Quels sont les prérequis pour industrialiser un agent en production ? {#production-readiness}

Le passage en production nécessite la validation conjointe des formats structurés, de la gouvernance CI/CD et des nouvelles interfaces serveur.

| Mécanisme | API Completions (`/v1/chat/completions`) | API Responses (`/v1/responses`) |
| --- | --- | --- |
| Gestion de l'état | Stateless (Historique complet renvoyé à chaque tour) | Stateful côté serveur via `previous_response_id` {good:Plus simple} |
| Sorties garanties | `response_format` avec `strict: true` | Schémas stricts intégrés nativement au flux |
| Intégration CI/CD | Idéal avec `curl`, `jq` et mode headless `opencode run` | Gestion d'agents persistants en arrière-plan |

- [ ] Activer les schémas stricts avec `strict: true` et `additionalProperties: false` pour garantir le décodage contraint.
- [ ] Borner le budget de jetons par tour et limiter le nombre d'itérations ReAct à dix maximum.
- [ ] Configurer un pare-feu de permissions pour interdire toute commande système destructrice non sollicitée.
- [ ] Monitorer le taux de succès du cache clé-valeur (KV Cache) et la latence au premier jeton (TTFT).
- [ ] Valider les compétences et sous-agents via des suites d'évaluation automatisées en intégration continue.
- [ ] Adopter l'API Responses d'OpenAI pour bénéficier du stockage d'état géré côté serveur.
