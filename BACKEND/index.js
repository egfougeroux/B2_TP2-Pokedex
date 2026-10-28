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


function findAllPokemon(request, response) {
  // 1. Lire le texte brut du fichier JSON
  let data = fs.readFileSync(POKEDEX_SRC);

  // 2. Transformer ce texte brut en un véritable objet/tableau JavaScript
  let pokedex = JSON.parse(data);

  // 3. Envoyer la réponse à l'utilisateur
  response.send(pokedex);
}

router.get('/pokemons', findAllPokemon);


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