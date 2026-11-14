# Intégration des Patterns de Production (Option A)

Finalisation de l'enrichissement direct du parcours en 9 étapes :
1. Alignement narratif parfait du cas d'usage Jira + GitLab sur l'ensemble des leçons.
2. Intégration des indicateurs de progression % dans l'en-tête de chaque étape.
3. Ajout des encadrés "Astuce Pro Production" :
   - Prompt Caching (-50% sur les tokens d'entrée).
   - Sécurité et validation humaine (Human-in-the-Loop pour les mutations).
   - Troncature et protection de la fenêtre de contexte dans `role: "tool"`.
   - Résilience réseau et absorption du Rate Limit HTTP 429 via `--retry 3 --retry-delay 2 --retry-all-errors` dans GitLab CI/CD.
4. Synthèse des 5 Règles d'Or de Production ajoutée dans l'aide-mémoire général.
