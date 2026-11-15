# Passer à l'Échelle : Le Code Mode et l'Outil execute {#lesson-06-code-mode}

Le Code Mode remplace des dizaines d'appels d'outils verbeux par l'émission d'un unique script TypeScript exécuté dans un bac à sable Bun sécurisé.

- L'approche ReAct classique multiplie les allers-retours HTTP et sature la fenêtre de contexte par accumulation de JSON intermédiaires.
- En Code Mode, le modèle écrit un script complet intégrant boucles, conditions et filtres en mémoire vive.
- Les milliers de lignes de données brutes sont filtrées directement dans la sandbox : seul le résultat synthétisé est renvoyé.
- La consommation globale de jetons est réduite de 85% sur les scénarios multi-étapes complexes.

@answer scope="Code Mode · execute · Bun Sandbox · Token Efficiency · In-Memory Filtering"
@meta locale=en style=swiss
@source bun title="Bun JavaScript Runtime Sandbox" url=https://bun.sh/
@source cloudflare title="Code Mode and Sandboxed Agents" url=https://blog.cloudflare.com/code-mode/

## Pourquoi le Code Mode surpasse-t-il le Tool Calling classique ? {#token-comparison}

Le traitement en mémoire vive isole les données intermédiaires volumineuses hors du contexte du modèle.

```mermaid title="Consommation de jetons sur 5 opérations de recherche et transformation (jetons)"
xychart-beta
  x-axis ["1 opération", "3 opérations", "5 opérations"]
  y-axis "Jetons cumulés" 0 --> 35000
  bar "Tool Calling Classique" [2500, 12000, 31000]
  bar "Code Mode (Script Unique)" [2200, 3100, 4300]
```

@workflow id=code-mode-flow title="Cycle d Exécution en Bac à Sable Bun"
| prompt | Question Utilisateur | external |
| llm | Generation du Script TS | backend |
| sandbox | Bac a Sable Bun Local | backend |
| filter | Filtrage en Memoire Vive | database |
| stdout | Synthese Finale Nettoyee | frontend |
| prompt > llm |
| llm > sandbox | script TypeScript unique | emphasis
| sandbox > filter | acces disques et logs
| filter > stdout | extraction compacte
| stdout > prompt | retour final au LLM | dashed

@steps id=code-mode-steps
| step1 | 1. Génération du Programme | Le modèle produit un script TypeScript autonome utilisant des instructions JavaScript courantes. | code-mode-flow | llm |
| step2 | 2. Confinement Sandbox | Le runtime Bun lance le script dans un processus isolé aux privilèges et ressources strictement plafonnés. | code-mode-flow | sandbox |
| step3 | 3. Traitement en RAM | Les tableaux de logs volumineux sont analysés et agrégés sans jamais transiter sur le réseau du LLM. | code-mode-flow | filter |
| step4 | 4. Émission du Résultat | Seules les quelques lignes de conclusion sont imprimées sur la sortie standard puis réinjectées. | code-mode-flow | stdout |

## Quel est le code généré lors d'un appel à l'outil execute ? {#execute-example}

Le modèle charge des modules standard pour chaîner les opérations de bout en bout.

```typescript title="Script TypeScript généré par le LLM pour l'outil execute"
import { readFileSync, writeFileSync } from "fs";

// Filtrage en mémoire vive de 10 000 lignes de logs
const rawLogs = readFileSync("var/log/app.log", "utf8").split("\n");
const criticalErrors = rawLogs.filter((line) => line.includes("[FATAL]"));

console.log(`Analyse terminee : ${criticalErrors.length} erreurs critiques detectees.`);
criticalErrors.slice(0, 3).forEach((err, i) => console.log(`- ${err}`));
```

| Critère d'Arbitrage | Tool Calling Classique (ReAct) | Code Mode (Sandbox Bun / Deno) |
| --- | --- | --- |
| Nombre d'itérations | Un aller-retour complet par action {caution:Lenteur réseau} | Une seule passe de génération pour tout le traitement {good:Rapide} |
| Consommation mémoire | Poids quadratique de l'historique complet {bad:Saturation de contexte} | Données brutes éphémères jetées après exécution {good:-85% tokens} |
| Gestion des exceptions | Découverte d'une erreur au tour suivant | Try/catch local immédiat dans le corps du script |
