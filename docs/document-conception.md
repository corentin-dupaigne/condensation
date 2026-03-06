# Document de Conception : Plateforme de Référencement de Jeux Vidéo

## 1. Présentation du Projet

* **Nom du projet :** **GamePulse Marketplace**
* **Description :** Développement d'une plateforme complète de référencement de jeux vidéo incluant une marketplace de clés, un système de recommandation et une gestion de catalogue alimentée par des sources externes.

## 2. Architecture et Technologies

### Stack Technique

* **Frontend :** * Framework : **Next.js**
* Gestionnaire de paquets : **Bun**


* **Backend :**
* Langage/Framework : **Java Spring-Boot**
* Communication : **Kafka** (système d'événements/micro-services)
* Documentation : **Swagger (OpenAPI)**


* **Base de données :** * Système : **Postgres**
* Alimentation : Intégration de la base de données **IGDB**


* **DevOps & Infrastructure :**
* Conteneurisation : **Docker**
* Orchestration : **Kubernetes (Cluster K8s)**
* Observabilité : **Grafana** (métriques santé & serveur), **Elasticstack** (gestion des logs)



### Services (Micro-services)

Le backend est découpé en services spécialisés communiquant via Kafka :

* **Notification :** Gestion des alertes (baisses de prix, suivis).
* **Authentication :** Gestion des utilisateurs et de la sécurité.
* **Fetch_api :** Service dédié à la récupération des données externes (IGDB, Steam).
* **Recommendation :** Moteur de suggestion de jeux.

---

## 3. DevOps et CI/CD

* **Pipelines :** Mise en place de workflows pour les environnements de **Preprod** et **Prod**.
* **Tests :** * Tests unitaires et d'intégration.
* Objectif de couverture : **80% et plus**.


* **Déploiement :** Conteneurisation complète des applications pour un déploiement sur cluster Kubernetes.

---

## 4. Fonctionnalités

### Catalogue et Marketplace

* **Référencement :** Catalogue complet de jeux vidéo.
* **Marketplace :** Vente de clés de jeux et système de revente (resell).
* **Cartes cadeaux :** Achat de cartes (Apple, Amazon, etc.).
* **Recherche avancée :** Système multi-critères (filtres et tris complexes).

### Engagement et Social

* **Recommandations :** Système de jeux recommandés et affichage des tendances (*Trending*).
* **Profils :** Intégration possible de l'API Steam (profil et recommandations), badges d'ancienneté.
* **Notifications :** Alertes sur les réductions du panier et suivi des catégories/jeux.

---

## 5. Planning (2 Sprints)

* **Sprint 1 : Fondations et Authentification**
    * **Semaine 1 :** Mise en place de l'infrastructure (Docker, Terraform, Ansible), pipeline CI/CD initial et synchronisation des données IGDB via le service `Fetch_api`.
    * **Semaine 2 :** Développement du service d'authentification Laravel (OAuth2/PKCE), implémentation de l'API de recherche avec filtres complexes et documentation Swagger.

* **Sprint 2 : Transactions et Engagement**
    * **Semaine 3 :** Déploiement du cluster Kubernetes, configuration du broker Kafka, et implémentation du flux d'achat de clés et du système de revente (P2P).
    * **Semaine 4 :** Intégration du panier d'achat, notifications en temps réel (baisses de prix), connexion API Steam et déploiement de l'observabilité (Grafana/Elasticstack).

---

## 6. MVP (Minimum Viable Product)

Le MVP se concentre sur le cycle de vie complet d'un utilisateur souhaitant acquérir un jeu :
* **Catalogue dynamique :** Synchronisation automatique avec IGDB et recherche multicritères.
* **Sécurité :** Création de compte et connexion sécurisée via OAuth2/PKCE.
* **Marketplace :** Achat de clés de jeux avec un système de paiement de base.
* **Infrastructure :** Déploiement conteneurisé et automatisé garantissant la stabilité du service.

---

## 7. User Stories

### En tant qu'utilisateur :
* **[UX.1] Authentification :** Je veux m'inscrire et me connecter en toute sécurité pour protéger mes données et mes achats.
* **[CAT.2] Recherche :** Je veux rechercher des jeux via des filtres multicritères et des options de tri pour trouver rapidement ce qui m'intéresse.
* **[MKT.1] Achat :** Je veux parcourir et acheter des clés de jeux sur la marketplace pour obtenir des prix compétitifs.
* **[MKT.2] Revente P2P :** Je veux pouvoir lister mes propres clés pour la revente et acheter des clés à d'autres utilisateurs.
* **[MKT.3] Cartes Cadeaux :** Je veux pouvoir payer en utilisant des cartes cadeaux Apple ou Amazon pour plus de flexibilité.
* **[MKT.4] Panier & Suivi :** Je veux gérer mon panier et suivre mes commandes en temps réel pour une visibilité totale sur mes achats.
* **[NOT.2] Alertes de prix :** Je veux recevoir des alertes en cas de baisse de prix sur un jeu suivi pour ne rater aucune promotion.
* **[NOT.3] Notifications temps réel :** Je veux voir des notifications en temps réel sur le frontend pour être immédiatement informé des mises à jour.
* **[UX.2] Intégration Steam :** Je veux lier mon compte Steam pour que ma bibliothèque et mon activité informent mes recommandations.
* **[UX.3] Recommandations :** Je veux des recommandations personnalisées et voir les tendances pour découvrir de nouveaux jeux.
* **[UX.4] Gamification :** Je veux gagner des badges basés sur mon activité et mon ancienneté pour me sentir engagé sur la plateforme.

### En tant qu'administrateur / DevOps / Développeur :
* **[CAT.1] Admin - Synchro IGDB :** Je veux que le service `Fetch_api` synchronise automatiquement les données IGDB pour maintenir le catalogue à jour sans intervention manuelle.
* **[INF.1] DevOps - IaC :** Je veux que l'infrastructure soit provisionnée via Terraform et configurée via Ansible pour un déploiement reproductible et automatisé.
* **[INF.2] DevOps - Kubernetes :** Je veux que tous les micro-services soient déployés sur un cluster K8s pour une scalabilité et une gestion centralisée.
* **[INF.3] DevOps - CI/CD :** Je veux des pipelines automatisés pour les environnements de préprod et prod afin de tester et déployer le code de manière cohérente.
* **[INF.4] DevOps - Docker :** Je veux que tous les services soient conteneurisés via Docker pour garantir un fonctionnement identique dans tous les environnements.
* **[INF.5] DevOps - Observabilité :** Je veux une stack complète (Grafana/Elasticstack) pour surveiller la santé du système et investiguer les logs.
* **[NOT.1] Dev - Kafka :** Je veux un broker Kafka pour router les messages entre les micro-services de manière asynchrone et fiable.
* **[CAT.3] Dev - Swagger :** Je veux que tous les points d'entrée backend soient documentés via Swagger/OpenAPI pour faciliter l'intégration sans ambiguïté.

