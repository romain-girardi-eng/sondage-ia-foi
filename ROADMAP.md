# Roadmap - Sondage IA & Foi Chrétienne

> Dernière mise à jour : 24 janvier 2026

## Vue d'ensemble

Ce document liste toutes les tâches nécessaires pour transformer ce prototype en application de recherche académique prête pour la production.

---

## Phase 1 : Infrastructure Backend (Critique)

### 1.1 Base de données
- [ ] Choisir une solution (Supabase recommandé - gratuit, PostgreSQL, auth intégrée)
- [ ] Créer le schéma de base de données :
  - Table `responses` : id, created_at, answers (JSONB), metadata
  - Table `sessions` : id, started_at, completed_at, language, user_agent
- [ ] Configurer les Row Level Security (RLS) policies
- [ ] Créer les indexes pour les requêtes fréquentes

### 1.2 API Routes
- [ ] `POST /api/survey/submit` - Soumettre une réponse complète
- [ ] `POST /api/survey/partial` - Sauvegarde automatique en cours de sondage
- [ ] `GET /api/results/aggregated` - Résultats agrégés (publics)
- [ ] `GET /api/results/export` - Export CSV/JSON (admin seulement)
- [ ] `DELETE /api/user/data` - Suppression données (RGPD)

### 1.3 Variables d'environnement
- [ ] Créer `.env.example` avec toutes les variables nécessaires
- [ ] Configurer les variables sur Vercel
- [ ] Documenter la configuration

---

## Phase 2 : Conformité RGPD (Critique)

### 2.1 Consentement
- [ ] Ajouter une case à cocher explicite pour le consentement
- [ ] Stocker la preuve de consentement (timestamp, version CGU)
- [ ] Lien vers politique de confidentialité

### 2.2 Droits des utilisateurs
- [ ] Endpoint de suppression des données (`DELETE /api/user/data`)
- [ ] Endpoint d'export des données (`GET /api/user/export`)
- [ ] Génération d'un identifiant anonyme pour récupérer ses données
- [ ] Page `/mes-donnees` pour exercer ses droits

### 2.3 Documentation légale
- [ ] Rédiger la politique de confidentialité (`/privacy`)
- [ ] Rédiger les mentions légales (`/legal`)
- [ ] Documenter la durée de conservation des données

---

## Phase 3 : Robustesse & Gestion d'erreurs

### 3.1 Error Boundaries
- [ ] Créer un composant `ErrorBoundary` global
- [ ] Ajouter des error boundaries par section (Survey, Results, etc.)
- [ ] Page d'erreur personnalisée (`error.tsx`)
- [ ] Logging des erreurs (Sentry ou similaire)

### 3.2 Validation des données
- [ ] Validation côté serveur avec Zod
- [ ] Sanitization des entrées texte (DOMPurify)
- [ ] Rate limiting sur les endpoints API
- [ ] Protection CSRF

### 3.3 Feedback utilisateur
- [ ] Messages d'erreur traduits (FR/EN)
- [ ] Toast notifications pour les actions
- [ ] États de chargement sur tous les boutons
- [ ] Gestion des erreurs réseau (retry, offline)

---

## Phase 4 : Améliorations UX

### 4.1 Sauvegarde & Reprise
- [ ] Auto-save dans localStorage toutes les 30 secondes
- [ ] Détection de session incomplète au retour
- [ ] Modal "Reprendre où vous en étiez ?"
- [ ] Bouton "Recommencer" pour effacer la progression

### 4.2 Navigation
- [ ] Confirmation avant de quitter (beforeunload)
- [ ] Gestion du bouton retour navigateur
- [ ] Breadcrumb ou indicateur de section actuelle

### 4.3 Accessibilité (WCAG 2.1 AA)
- [ ] Audit complet avec axe-core
- [ ] Test avec lecteur d'écran (VoiceOver, NVDA)
- [ ] Focus management entre les questions
- [ ] Messages d'erreur de validation accessibles
- [ ] Contraste des couleurs vérifié

---

## Phase 5 : Internationalisation complète

### 5.1 Traductions manquantes
- [ ] Auditer tous les textes hardcodés
- [ ] Traduire ResultsDashboard (actuellement mixte FR/EN)
- [ ] Traduire les messages d'erreur
- [ ] Traduire les métadonnées SEO par langue

### 5.2 Améliorations i18n
- [ ] URLs localisées (`/fr/`, `/en/`)
- [ ] Balises hreflang pour le SEO
- [ ] Formatage des nombres selon la locale
- [ ] Détection automatique de la langue du navigateur

---

## Phase 6 : Analytics & Monitoring

### 6.1 Analytics
- [ ] Intégrer Plausible ou Umami (privacy-friendly)
- [ ] Tracker les événements clés :
  - Début du sondage
  - Abandon (et à quelle question)
  - Complétion
  - Temps par question
- [ ] Dashboard de suivi des réponses

### 6.2 Monitoring
- [ ] Intégrer Sentry pour les erreurs
- [ ] Alertes en cas d'erreur critique
- [ ] Monitoring des performances (Web Vitals)

---

## Phase 7 : Dashboard Admin

### 7.1 Authentification admin
- [ ] Page de login admin (`/admin/login`)
- [ ] Protection des routes admin
- [ ] Gestion des sessions

### 7.2 Fonctionnalités admin
- [ ] Vue d'ensemble des réponses
- [ ] Graphiques en temps réel
- [ ] Export CSV/Excel des données
- [ ] Filtres par date, langue, profil
- [ ] Suppression de réponses spam

---

## Phase 8 : Qualité & Tests

### 8.1 Tests unitaires
- [ ] Configurer Vitest ou Jest
- [ ] Tests des fonctions de scoring
- [ ] Tests des utilitaires (utils.ts)
- [ ] Tests des validations Zod

### 8.2 Tests d'intégration
- [ ] Tests des composants clés (QuestionCard, SurveyContainer)
- [ ] Tests du flow complet du sondage
- [ ] Tests des API routes

### 8.3 Tests E2E
- [ ] Configurer Playwright
- [ ] Test du parcours complet utilisateur
- [ ] Tests multi-navigateurs
- [ ] Tests mobile

---

## Phase 9 : Performance

### 9.1 Optimisations
- [ ] Supprimer les imports inutilisés (three.js si non utilisé)
- [ ] Lazy loading des composants lourds (ResultsDashboard)
- [ ] Optimiser les animations pour les appareils bas de gamme
- [ ] Implémenter useMemo pour les calculs de graphiques

### 9.2 Caching
- [ ] Cache des résultats agrégés (ISR ou SWR)
- [ ] Headers de cache appropriés
- [ ] Service Worker pour mode offline (optionnel)

---

## Phase 10 : Améliorations futures (Nice-to-have)

### 10.1 Fonctionnalités avancées
- [ ] Randomisation de l'ordre des questions
- [ ] A/B testing de formulations
- [ ] Génération de rapport PDF personnalisé
- [ ] Envoi d'email de confirmation (optionnel)
- [ ] QR code pour partager le sondage

### 10.2 Intégrations
- [ ] Webhook pour notifications (Slack, Discord)
- [ ] Export vers Google Sheets
- [ ] Intégration Notion pour documentation

---

## Corrections de bugs identifiés

- [ ] Nombre de participants hardcodé "1,543+" → remplacer par vraie valeur BDD
- [ ] `useAnimatedCounter` : ajouter cleanup de requestAnimationFrame
- [ ] Bouton "Précédent" invisible quand désactivé → garder visible avec style disabled
- [ ] Textes FR hardcodés dans ResultsDashboard ("Majoritaire", "réponses")

---

## Estimation des efforts

| Phase | Priorité | Effort estimé | Dépendances |
|-------|----------|---------------|-------------|
| 1. Backend | Critique | 3-4 jours | - |
| 2. RGPD | Critique | 2 jours | Phase 1 |
| 3. Erreurs | Critique | 2 jours | Phase 1 |
| 4. UX | Important | 2 jours | - |
| 5. i18n | Important | 1 jour | - |
| 6. Analytics | Important | 1 jour | Phase 1 |
| 7. Admin | Important | 3-4 jours | Phase 1 |
| 8. Tests | Important | 3-4 jours | - |
| 9. Perfs | Moyen | 1 jour | - |
| 10. Extras | Faible | Variable | Tout |

**Total estimé : 3-4 semaines** pour une version production-ready complète.

---

## Prochaines étapes recommandées

1. **Immédiat** : Implémenter le backend Supabase (Phase 1.1 + 1.2)
2. **Cette semaine** : Ajouter la conformité RGPD de base (Phase 2)
3. **Semaine prochaine** : Error handling + Analytics (Phases 3 + 6)
4. **Sprint suivant** : Dashboard admin (Phase 7)

---

## Ressources utiles

- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RGPD pour les développeurs](https://www.cnil.fr/fr/rgpd-par-ou-commencer)
- [WCAG 2.1 Checklist](https://www.a11yproject.com/checklist/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
