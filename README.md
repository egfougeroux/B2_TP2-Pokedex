# TP - Serveur API REST Pokédex

**Auteur :** Emma-Gabrielle FOUGEROUX <br>
**Classe :** BTS SIO SLAM2 <br>
**Établissement :** Fénelon - La Rochelle <br>
**Date :** Octobre 2026 <br>
**Module :** Bloc 2 - Solutions logicielles et applicatives

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Arborescence du projet](#2-arborescence-du-projet)
3. [Prérequis et installation](#3-prérequis-et-installation)
4. [Démarrage du serveur](#4-démarrage-du-serveur)
5. [Documentation des endpoints (API)](#5-documentation-des-endpoints-api)
6. [Outils de test](#6-outils-de-test)
7. [Fonctionnalités avancées (v2)](#7-fonctionnalités-avancées-v2)

---

## 1. Présentation du projet

Ce projet consiste en la réalisation d'un serveur backend d'API REST en Node.js avec le framework Express. Il permet de distribuer et d'interroger les données d'un Pokédex (809 Pokémon) au format JSON à destination d'une future interface cliente.

---

## 2. Arborescence du projet

Le projet respecte rigoureusement l'arborescence imposée :

```text
BACKEND/
├── DATA/
│   ├── items.json
│   ├── moves.json
│   ├── pokedex.json
│   └── types.json
├── FILES/
│   ├── images/
│   ├── sprites/
│   └── thumbnails/
├── index.js
└── README.md
```

---

## 3. Prérequis et installation

* **Node.js** (v18 ou supérieure) et **npm** installés
* Dépendance principale : **Express**

Installation des modules nécessaires depuis le dossier `BACKEND` :

```bash
npm install express
```

---

## 4. Démarrage du serveur

Pour lancer le serveur en écoute continue avec rechargement automatique lors des modifications :

```bash
node --watch index.js
```

Le serveur démarre et écoute sur le port local `5001` :  
`http://127.0.0.1:5001`

---

## 5. Documentation des endpoints (API)

Toutes les routes sont obligatoirement préfixées par `/api/v1`.

| Méthode | Route | Paramètres | Description | Codes HTTP |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/pokemons` | Aucun | Renvoie l'intégralité du Pokédex (809 Pokémon) | `200 OK` |
| **GET** | `/api/v1/pokemons/random` | Aucun | Renvoie un Pokémon unique tiré au sort | `200 OK` |
| **GET** | `/api/v1/pokemons/:id` | `id` (entier) | Renvoie un Pokémon selon son identifiant numérique | `200 OK` / `404 Not Found` |
| **GET** | `/api/v1/pokemons/:name` | `name` (chaîne) | Renvoie un Pokémon selon son nom (insensible à la casse) | `200 OK` / `404 Not Found` |

### Route : `/api/v1/pokemons`

* **Objectif :** Renvoie la liste complète des Pokémon présents dans la base de données locale.
* **Algorithme :** Lecture synchrone du fichier `DATA/pokedex.json` avec le module natif `fs`, conversion de la chaîne JSON en objet exploitable avec `JSON.parse()`, et transmission du tableau en réponse (`200 OK`, en-tête `Content-Type: application/json`).

### Réponses aux questions de l'algorithme (/pokemons/random)

* **Quel est l'id minimum possible ?**  
  L'identifiant minimum est `1` (correspondant au premier Pokémon, Bulbizarre).
* **Quelle est la taille du Pokédex ?**  
  Le fichier contient un total de `809` Pokémon.
* **Quel est l'id maximum possible ?**  
  L'identifiant maximum est `809` (correspondant au dernier Pokémon du fichier, Melmetal).

*Note technique :*  
En JavaScript, les tableaux sont indexés de `0` à `n - 1`. Pour tirer un Pokémon au sort sans risque de dépassement d'indice, la formule employée est :  
`Math.floor(Math.random() * pokedex.length)`.

### Route : `/api/v1/pokemons/:id` (Recherche par identifiant)

* **Objectif :** Permet de récupérer la fiche détaillée d'un Pokémon spécifique via son numéro d'identification unique.
* **Paramètre d'URL :** `:id` (entier représentant l'identifiant du Pokémon).

#### Algorithme mis en œuvre
1. Extraction du paramètre `id` passé dans la requête (`request.params.id`) et conversion en entier.
2. Validation de la saisie (vérification que la valeur fournie est bien numérique).
3. Recherche dans le Pokédex à l'indice correspondant (`pokedex[id - 1]`).
4. Gestion de la réponse HTTP selon le résultat :
   * **Succès (`200 OK`) :** Si le Pokémon existe, envoi de l'objet JSON correspondant.
   * **Erreur (`404 Not Found`) :** Si l'identifiant est hors limites ou introuvable, renvoi du message d'erreur `"Erreur, pokemon pas trouvé !"`.

#### Tests de validation réalisés
* Requête `GET /api/v1/pokemons/25` -> Statut `200 OK` (retour des données de Pikachu).
* Requête `GET /api/v1/pokemons/9999` -> Statut `404 Not Found` (gestion des cas hors catalogue).

### Route : `/api/v1/pokemons/:name` (Recherche par nom)

* **Objectif :** Permet de récupérer la fiche d'un Pokémon à partir de son nom textuel usuel.
* **Paramètre d'URL :** `:name` (chaîne de caractères).

#### Algorithme mis en œuvre
1. **Résolution du conflit de routage (`:id` vs `:name`) :**  
   Dans Express, un chemin paramétré comme `:id` capture par défaut n'importe quelle chaîne. Dans le contrôleur `findOneById`, une vérification numérique est effectuée (`isNaN(id)`). Si la valeur n'est pas un nombre, l'appel à la fonction middleware `next()` délègue immédiatement le traitement à la route suivante (`/pokemons/:name`).
2. **Normalisation de la casse :**  
   Conversion du paramètre recherché en minuscules à l'aide de `.toLowerCase()` pour assurer une recherche insensible à la casse (ex. `bulbizarre`, `Bulbizarre` ou `BULBIZARRE`).
3. **Parcours et filtrage du tableau :**  
   Utilisation de la méthode native `.find()` pour vérifier la correspondance du nom sur plusieurs langues disponibles dans la structure JSON (`name.french`, `name.english`, `name.japanese`).
4. **Gestion de la réponse HTTP :**  
   * **Succès (`200 OK`) :** Envoi de l'objet Pokémon trouvé au format JSON.
   * **Erreur (`404 Not Found`) :** Envoi du message d'erreur `"Erreur, pokemon pas trouvé !"` si aucune correspondance n'existe.

#### Tests de validation réalisés
* Requête `GET /api/v1/pokemons/Bulbizarre` -> Statut `200 OK` (nom en français).
* Requête `GET /api/v1/pokemons/pikachu` -> Statut `200 OK` (nom en minuscules).
* Requête `GET /api/v1/pokemons/Inconnu` -> Statut `404 Not Found` (gestion d'un Pokémon inexistant).

---

## 6. Outils de test

Les requêtes ont été testées et validées à l'aide de :
* **Postman** (pour inspecter le corps JSON, les statuts HTTP et les en-têtes `Content-Type`)
* Navigateur Web standard

---

## 7. Fonctionnalités avancées (v2)

### 1. Distribution des ressources statiques (/images)

- **Objectif :** Permettre au futur client web (Frontend) de charger directement les illustrations officielles des Pokémon.
- **Mise en œuvre :** Utilisation du middleware `express.static` appliqué au sous-chemin `/images` du routeur Express :
  `router.use('/images', express.static(IMAGES_SRC));`
- **Exemple d'appel :** `GET /api/v1/images/025.png` renvoie l'image PNG de Pikachu avec l'en-tête `Content-Type: image/png`.

### 2. Gestion des types de Pokémon (/types et /pokemons/type/:type)

- **GET `/api/v1/types` :** Renvoie la liste complète des types disponibles et leurs dénominations multilingues à partir de `DATA/types.json`.
- **GET `/api/v1/pokemons/type/:type` :** Filtre le Pokédex pour retourner l'ensemble des créatures associées au type spécifié en paramètre d'URL (insensible à la casse).
  * Statut `200 OK` avec le tableau filtré en cas de correspondance.
  * Statut `404 Not Found` si aucun Pokémon n'appartient au type demandé.

### 3. Middleware de journalisation (`debugRoute`)

- **Rôle :** Intercepte chaque requête entrante sur le serveur afin de tracer l'activité dans le terminal d'administration.
- **Informations relevées :**
  * L'horodatage précis au format local (`HH:MM:SS`) via l'objet natif `Date`.
  * La méthode HTTP employée (`GET`, `POST`, etc.) via `request.method`.
  * L'URL ciblée par le client via `request.originalUrl`.
- **Principe technique :** Après l'affichage du log, la méthode `next()` transmet le flux au middleware suivant sans bloquer le traitement.

Exemple de sortie console générée :
```text
 Requête reçue : GET sur l'adresse /api/v1/pokemons/random
```

### 4. Middleware de régulation de flux (`limitRequests`)

- **Rôle :** Protège le serveur contre le déni de service (DDoS) ou l'asphyxie par requêtes massives répétées.
- **Paramétrage retenu :** 
  * Plafond autorisé : **10 requêtes par minute**.
  * Fenêtre temporelle : cycle glissant de **60 secondes** (60 000 ms).
- **Algorithme mis en œuvre :**
  * Incrémentation d'un compteur global `requestCount` à chaque appel.
  * Comparaison du compteur avec la constante `MAX_REQUESTS`..
  * Réinitialisation automatique du compteur à 0 toutes les 60 secondes grâce à la fonction asynchrone `setInterval()`.
- **Gestion des statuts HTTP :** 
  * Cas nominal (inférieur ou égal au seuil) : La requête est validée, l'exécution se poursuit vers le contrôleur (`next()`) avec un statut `200 OK`.
  * Dépassement de quota : Blocage immédiat de la requête avec envoi du statut HTTP `429 Too Many Requests` et d'un message d'avertissement.

Exemple de sortie console générée :
```text
Statut HTTP : 429 Too Many Requests
Corps : Erreur 429 : Trop de requêtes ! Veuillez patienter une minute.
```

### 5. Procédure de test et validation

1. Lancement du serveur en mode surveillance :

```text
node --watch index.js
```

1. Émission de 11 requêtes consécutives sur `GET /api/v1/pokemons/random` via Postman ou un navigateur web.
2. Constat : les 10 premières requêtes retournent le statut `200 OK`. La 11ᵉ requête déclenche le statut `429 Too Many Requests`.
