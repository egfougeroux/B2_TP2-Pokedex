/**
* Serveur Backend Pokedex
*/

const fs = require('fs');
const express = require('express');

const app = express();
const router = express.Router();

// Configuration
const PORT = 5001;
// Définir l'emplacement des fichiers bases de données
const POKEDEX_SRC = "./DATA/pokedex.json";
// Définir l'emplacement des images
const IMAGES_SRC = "./FILES/images";
// Définir l'emplacement des types
const TYPES_SRC = "./DATA/types.json";


// ==========================================
// Contrôleurs (fonctions des routes)
// ==========================================

/**
 * 1. Renvoie l'intégralité du catalogue des Pokémon
 */
function findAllPokemon(request, response) {
  // 1. Lire le texte brut du fichier JSON
  let data = fs.readFileSync(POKEDEX_SRC);

  // 2. Transformer ce texte brut en objet/tableau JavaScript
  let pokedex = JSON.parse(data);

  // 3. Envoyer la réponse au client
  response.send(pokedex);
}

/**
 * 2. Renvoie un Pokémon tiré au sort
 */
function findOneByRandom(request, response) {
  // 1. Lecture et conversion du JSON
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  // 2. Tirage d'un indice au hasard (entre 0 et pokedex.length - 1)
  let random = Math.floor(Math.random() * pokedex.length);

  // 3. Récupération et envoi du Pokémon
  let reply = pokedex[random];
  response.send(reply);
}

/**
 * 3. Renvoie un Pokémon selon son identifiant numérique (:id)
 */
function findOneById(request, response, next) {
  let id = parseInt(request.params.id, 10);

  // Si le paramètre n'est pas numérique, passer la main à la route suivante (:name)
  if (isNaN(id)) {
    return next();
  }

  // 1. Lecture et conversion du JSON
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  // 2. Recherche à l'indice (id - 1)
  if (pokedex[id - 1]) {
    response.send(pokedex[id - 1]);
  } else {
    response.status(404).send("Erreur, pokemon pas trouvé !");
  }
}

/**
 * 4. Renvoie un Pokémon selon son nom (:name)
 */
function findOneByName(request, response) {
  // 1. Lecture du fichier et analyse du JSON
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  // 2. Récupération et mise en minuscules du paramètre de recherche
  let nameQuery = request.params.name.toLowerCase();

  // 3. Recherche multicritère insensible à la casse
  let reply = pokedex.find(pokemon => {
    let nomFrancais = pokemon.name.french ? pokemon.name.french.toLowerCase() : "";
    let nomAnglais = pokemon.name.english ? pokemon.name.english.toLowerCase() : "";
    let nomChinois = pokemon.name.chinese ? pokemon.name.chinese.toLowerCase() : "";
    let nomJaponais = pokemon.name.japanese ? pokemon.name.japanese.toLowerCase() : "";
    
    return nomFrancais === nameQuery || 
           nomAnglais === nameQuery || 
           nomChinois === nameQuery || 
           nomJaponais === nameQuery;
  });

  // 4. Envoi de la réponse ou code 404 si non trouvé
  if (reply) {
    response.send(reply);
  } else {
    response.status(404).send("Erreur, pokemon pas trouvé !");
  }
}

/**
 * Renvoie la liste complète des types de Pokémon
 */
function findAllTypes(request, response) {
  let data = fs.readFileSync(TYPES_SRC);
  let types = JSON.parse(data);
  response.send(types);
}

/**
 * Renvoie tous les Pokémon appartenant à un type spécifique
 */
function findPokemonsByType(request, response) {
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  let targetType = request.params.type.toLowerCase();

  // Filtrage insensible à la casse
  let results = pokedex.filter(pokemon => {
    return pokemon.type.some(t => t.toLowerCase() === targetType);
  });

  if (results.length > 0) {
    response.send(results);
  } else {
    response.status(404).send("Aucun Pokémon trouvé pour ce type !");
  }
}

// ==========================================
// Déclaration des routes
// ==========================================

router.get('/pokemons', findAllPokemon);
router.get('/pokemons/random', findOneByRandom);
router.get('/pokemons/:id', findOneById);
router.get('/types', findAllTypes);
router.get('/pokemons/type/:type', findPokemonsByType);
router.get('/pokemons/:name', findOneByName);

router.use('/images', express.static(IMAGES_SRC));

// Application du préfixe global imposé par le sujet
app.use('/api/v1', router);

// ==========================================
// Lancement du serveur
// ==========================================
app.listen(
  PORT,
  '127.0.0.1',
  () => {
     console.log('Server Pokedex is listening on ' + PORT);
  }
)