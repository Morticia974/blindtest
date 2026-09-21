/* config.js — le SEUL fichier que tu as besoin de modifier.

   Tant que ce fichier n'est pas rempli, le jeu tourne en « mode local » :
   tout fonctionne (musique, manches, score), mais seuls les onglets de TON
   navigateur se voient entre eux. Parfait pour essayer, pas pour jouer à
   distance avec tes amis.

   Pour ouvrir le jeu à tes amis, remplace les valeurs ci-dessous par celles
   de ton projet Firebase. La marche à suivre complète est dans README.md,
   section « Mettre le jeu en ligne ». Ça prend une dizaine de minutes et
   c'est gratuit.                                                            */

var Config = {

  firebase: {
    apiKey:            "AIzaSyAXlu4rF15dxgaXragPB8X8sz9U1cGgwbI",
    authDomain:        "blindtest-50bab.firebaseapp.com",
    databaseURL:       "https://blindtest-50bab-default-rtdb.europe-west1.firebasedatabase.app",
    projectId:         "blindtest-50bab",
    storageBucket:     "blindtest-50bab.firebasestorage.app",
    messagingSenderId: "489980361615",
    appId:             "1:489980361615:web:f872c790124f1b65fa29fa"
  },

  /* Réglages par défaut d'une partie. Modifiables aussi depuis l'écran d'accueil. */
  partie: {
    nombreDeTitres: 12,     // morceaux par partie
    dureeExtrait: 30,       // secondes d'écoute par morceau (30 max chez Apple)
    dureeReponse: 8,        // secondes de révélation entre deux morceaux
    pointsTitre: 100,       // points pour le titre trouvé
    pointsArtiste: 100,     // points pour l'artiste trouvé
    bonusDouble: 50,        // bonus si on trouve les deux
    partVitesse: 0.6        // part des points qui dépend de la rapidité (0 = pas de bonus)
  }
};
