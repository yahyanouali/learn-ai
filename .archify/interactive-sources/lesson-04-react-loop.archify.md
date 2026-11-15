# La Boucle Agentique ReAct : Rôle tool & Permissions {#lesson-04-react}

Le patron ReAct (Reason + Act + Observe) anime l'agent dans une boucle `while` locale. Le client intercepte l'appel, vérifie les autorisations et réinjecte le résultat avec `role: "tool"`.

- L'observation du résultat physique est transmise au LLM avec `role: "tool"` et le `tool_call_id` associé.
- Le moteur de gouvernance filtre chaque outil selon trois politiques : `allow` (automatique), `ask` (confirmation humaine) ou `deny` (refus immédiat).
- En cas d'erreur d'exécution système, le message d'erreur est renvoyé dans le corps du rôle `tool` pour permettre au modèle de s'auto-corriger.
- Un compteur d'itérations maximales protège le système contre les boucles infinies et la surconsommation de jetons.

@answer scope="ReAct Pattern · role: tool · Permissions Engine · while loop · Error Recovery"
@meta locale=en style=swiss
@source reactpaper title="ReAct: Synergizing Reasoning and Acting in Language Models" url=https://arxiv.org/abs/2210.03629
@source opencode title="OpenCode Permissions Documentation" url=https://opencode.ai/docs/permissions/

## Comment s'enchaîne le cycle Reason-Act-Observe ? {#react-mechanics}

La boucle s'exécute localement sur la machine hôte sans état conservé côté serveur d'inférence.

@workflow id=react-full-cycle title="Boucle Agentique ReAct et Pare-Feu de Permissions"
| prompt | Question Utilisateur | external |
| reason | Raisonnement LLM | backend |
| detect | Appel d Outil ? | backend |
| gate | Approbation Securite | security |
| exec | Execution Systeme | backend |
| observe | Resultat role tool | backend |
| final | Reponse Finale | frontend |
| prompt > reason |
| reason > detect |
| detect > gate | oui | emphasis
| detect > final | non
| gate > exec | autorise
| gate > observe | refuse | dashed
| exec > observe | sortie brute
| observe > reason | iteration while | dashed

@steps id=react-loop-steps
| step1 | 1. Raisonnement (Reason) | Le modèle linguistique analyse le problème et génère une intention d'action structurée. | react-full-cycle | reason |
| step2 | 2. Contrôle de Sécurité (Gate) | L'orchestrateur vérifie si la commande nécessite une confirmation explicite de l'utilisateur. | react-full-cycle | gate |
| step3 | 3. Exécution Physique (Act) | Le script système ou la commande locale est exécuté avec isolation de l'environnement. | react-full-cycle | exec |
| step4 | 4. Observation (Observe) | Le résultat brut ou l'erreur est réinjecté avec `role: "tool"` pour le tour suivant. | react-full-cycle | observe |

## Quel est le format exact du message d'observation ? {#observation-payload}

L'association entre l'appel et le résultat s'effectue via l'identifiant `tool_call_id`.

```json title="Structure du message d'observation renvoyé dans le tableau messages[]"
{
  "role": "tool",
  "tool_call_id": "call_abc123456",
  "content": "{\"status\": \"success\", \"bytes_written\": 1024, \"path\": \"dist/app.js\"}"
}
```

| Politique de Permission | Déclencheur Habituel | Action du Runtime |
| --- | --- | --- |
| `allow` | Lectures de fichiers non sensibles, commandes sans effet de bord. | Exécution immédiate et transparente pour l'utilisateur {good:Fluide} |
| `ask` | Écritures disque, exécution de scripts bash, requêtes réseau sortantes. | Pause de la boucle et demande de confirmation explicite {caution:Point d'arrêt} |
| `deny` | Fichiers interdits (`.env`, `.ssh/`), commandes destructrices (`rm -rf`). | Interception préventive et envoi d'un message d'interdiction au LLM {bad:Blocage} |
