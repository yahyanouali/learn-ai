# Programmer la Boucle Agentique : Plugins OpenCode V2 & Hooks {#lesson-10-plugins}

L'architecture OpenCode V2 s'appuie sur le standard `@opencode/plugin` pour intercepter les événements de la boucle agentique et implémenter des garde-fous de sécurité en entreprise.

- Règle 1 : Les hooks V2 ignorent les valeurs retournées ; toute modification doit s'opérer par mutation sur place via `replaceInPlace`.
- Règle 2 : Le résultat d'un outil dans `execute.after` possède une enveloppe structurée (`event.result.content[0].text`).
- Règle 3 : Le contexte est isolé par espace de travail au sein de `setup(ctx)`, avec une fonction de nettoyage à la fermeture.
- Cursor propose un mécanisme comparable via le fichier `.cursor/hooks.json` exécutant des scripts Node.js externes.

@answer scope="OpenCode Plugins V2 · @opencode/plugin · replaceInPlace · DLP Firewall · Cursor Hooks"
@meta locale=en style=swiss
@source opencode title="OpenCode Plugin Architecture and SDK Documentation" url=https://opencode.ai/docs/plugins/
@source cursorhooks title="Cursor Hooks Configuration Guide" url=https://docs.cursor.com/context/hooks

## Comment un plugin intercepte-t-il les commandes sensibles ? {#plugin-flow}

Le plugin inspecte et mute les arguments avant tout lancement de processus physique.

@sequence id=plugin-dlp-sequence title="Interception Temps Réel et Masquage DLP avec un Plugin V2"
| actor runtime | Runtime OpenCode | backend |
| actor plugin | Plugin Securite DLP | backend |
| actor os | Systeme d Exploitation | external |
| phase | 1. Interception Préventive (execute.before)
| runtime | plugin | execute.before (commande bash)
| plugin | runtime | mutation replaceInPlace | return
| phase | 2. Exécution Sécurisée
| runtime | os | execution de la commande validee | emphasis
| os | runtime | sortie brute du processus | return
| phase | 3. Assainissement des Données (execute.after)
| runtime | plugin | execute.after (event.result enveloppe)
| plugin | runtime | masquage des secrets detectes | return

@callout id=v2-golden-rules level=note title="Les 3 Règles Fondamentales d'OpenCode V2"
| Règle n°1 : Ne jamais faire `return newCommand`. Seule la méthode `event.replaceInPlace()` modifie le flux. |
| Règle n°2 : Dans `execute.after`, inspecter `event.result?.content?.[0]?.text` pour manipuler la sortie. |
| Règle n°3 : Renvoyer une fonction de nettoyage `return () => cleanup()` pour libérer les ressources allouées. |

## Quel est le code TypeScript d'un pare-feu DLP en V2 ? {#dlp-code-sample}

Le plugin bloque l'accès aux variables d'environnement et masque les jetons GitHub sortants.

```typescript title="Exemple complet de plugin de sécurité V2 (.opencode/plugins/security-v2.ts)"
import type { PluginContext } from "@opencode/plugin";

export default function setup(ctx: PluginContext) {
  // Règle 1 : Interception et blocage avant exécution
  ctx.tool.hook("execute.before", async (event) => {
    if (event.input?.command?.includes(".env")) {
      event.replaceInPlace("echo 'Acces interdit aux fichiers d environnement'");
    }
  });

  // Règle 2 : Masquage des fuites de données après exécution
  ctx.tool.hook("execute.after", async (event) => {
    const text = event.result?.content?.[0]?.text;
    if (text) {
      event.result.content[0].text = text.replace(/ghp_[a-zA-Z0-9]+/g, "[TOKEN_MASQUE]");
    }
  });

  // Règle 3 : Nettoyage lors de la fermeture
  return () => {
    console.log("Liberation du plugin de securite.");
  };
}
```

| Hook OpenCode V2 | Équivalent Cursor (.cursor/hooks.json) | Moment d'Exécution |
| --- | --- | --- |
| `execute.before` | `"preToolUse"` | Avant l'exécution physique de l'outil par le runtime {good:Filtrage préventif} |
| `execute.after` | `"postToolUse"` | Dès la capture des sorties avant renvoi au modèle {good:DLP et anonymisation} |
| `session.compact` | Non disponible directement | Lors du compactage automatique de l'historique de conversation |
