# Inférence GPU, ChatML & Mécanique du KV Cache {#lesson-01-inference}

Le modèle linguistique ne manipule aucun objet JSON applicatif : un gabarit de dialogue Jinja2 aplatit l'historique complet en chaîne textuelle brute avant le calcul GPU.

- Le serveur transforme le tableau de messages JSON en texte plat délimité par des balises `<|im_start|>`.
- La phase de Prefill traite l'intégralité du prompt en parallèle et initialise le KV Cache en mémoire VRAM.
- La phase de Décodage prédit chaque jeton séquentiellement en réutilisant le KV Cache pour éviter les recalculs.
- À l'entraînement, le masquage des pertes (Loss Masking) concentre l'apprentissage uniquement sur les réponses de l'assistant.

@answer scope="OpenAI API · vLLM · Prefill · KV Cache · ChatML · GPU Inference"
@meta locale=en style=swiss
@source openai title="OpenAI Chat Completions Reference" url=https://platform.openai.com/docs/api-reference/chat
@source vllm title="vLLM PagedAttention Documentation" url=https://docs.vllm.ai/

## Comment le serveur et le GPU exécutent-ils la requête ? {#gpu-lifecycle}

Le GPU optimise la mémoire vidéo en dissociant la lecture massive du prompt et la génération mot à mot.

@workflow id=gpu-inference-flow title="Cycle Matériel d Inférence GPU et KV Cache"
| req | Requete JSON Applicative | external |
| template | Aplatissement Jinja2 ChatML | backend |
| prefill | Calcul Parallele Prefill | backend |
| cache | Stockage KV Cache VRAM | database |
| decode | Decodage Jeton par Jeton | backend |
| stop | Detection token im_end | backend |
| resp | Reponse Formatee Client | frontend |
| req > template | messages JSON
| template > prefill | texte brut balise
| prefill > cache | matrices Q K V | emphasis
| cache > decode | attention projetee
| decode > stop | jeton predit
| stop > decode | boucle decode | dashed
| stop > resp | fin de generation

@steps id=gpu-steps
| step1 | 1. Aplatissement Chat Template | Le serveur transforme le tableau JSON en une chaîne continue balisée par `<\|im_start\|>`. | gpu-inference-flow | template |
| step2 | 2. Calcul du Prefill GPU | Les tenseurs de l'historique sont calculés en parallèle sur tous les cœurs CUDA. | gpu-inference-flow | prefill |
| step3 | 3. Remplissage du KV Cache | Les clés et valeurs d'attention sont figées en mémoire vidéo haute vitesse pour les tours suivants. | gpu-inference-flow | cache |
| step4 | 4. Décodage Itératif | Chaque nouveau mot est échantillonné puis réinjecté jusqu'au token de terminaison `<\|im_end\|>`. | gpu-inference-flow | decode |

## Quelle est la structure exacte du texte envoyé au GPU ? {#chatml-structure}

Le modèle ne voit que du texte continu découpé en identifiants numériques de jetons (Token IDs).

```text title="Chaîne textuelle brute injectée dans le réseau de neurones"
<|im_start|>system
Tu es un assistant de programmation rigoureux.
<|im_end|>
<|im_start|>user
Explique le role du KV Cache en une phrase.
<|im_end|>
<|im_start|>assistant
Le KV Cache evite de recalculer l attention sur les mots passes.
<|im_end|>
```

| Paramètre d'Inférence | Effet sur le Décodage GPU | Recommandation Production |
| --- | --- | --- |
| `temperature: 0` | Sélectionne systématiquement le jeton de probabilité maximale (Argmax). | Idéal pour le code et les schémas stricts {good:Déterministe} |
| `temperature: 0.7` | Échantillonne parmi les candidats plausibles via la distribution Softmax. | Recommandé pour la rédaction créative |
| `max_tokens` | Coupe brutalement la génération si le budget est atteint. | Indispensable pour éviter les boucles infinies {caution:Risque JSON tronqué} |
