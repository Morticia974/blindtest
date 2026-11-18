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
    dureeDepart: 6,         // secondes de décompte avant la musique (0 = pas de décompte)
    pointsTitre: 100,       // points pour le titre trouvé
    pointsArtiste: 100,     // points pour l'artiste trouvé
    bonusDouble: 50,        // bonus si on trouve les deux

    /* La rapidité, en trois positions — celle qui est proposée par défaut,
       puis la table des trois. Elles se règlent aussi sur l'écran du salon.

       Chaque position est une suite de PALIERS. `jusqua` est une fraction de
       l'extrait, pas un nombre de secondes : si l'écoute passe de 30 à 20 s,
       les paliers se resserrent tout seuls. `part` est ce qu'on touche dans
       ce palier — 1 = tout, 0.5 = la moitié. `nom` s'affiche sous le chrono
       pendant l'écoute, pour que chacun sache où il en est.

       Les paliers plutôt qu'une fonte continue : une fonte, personne ne la
       sent ; un palier, ça s'annonce et ça se voit venir.

       Le premier palier est long exprès. Taper « Les Rois du monde » sur un
       téléphone prend dix secondes à qui n'a pas l'habitude, et ces dix
       secondes ne disent rien de ce qu'on connaît : si le premier palier est
       trop court, c'est encore le plus rapide des pouces qui gagne. */
    vitesse: 1,
    vitesses: [
      { nom: "tout le monde pareil",
        aide: "Trouver suffit : tous ceux qui trouvent marquent pareil.",
        paliers: [ { jusqua: 1, part: 1, nom: "plein tarif" } ] },

      // sur 30 s d'écoute : tout jusqu'à 15 s, 70 % jusqu'à 24 s, puis 45 %
      { nom: "un peu de rapidité",
        aide: "Plein tarif pendant la première moitié de l'extrait, le temps de taper. Ensuite deux paliers, annoncés sous le chrono.",
        paliers: [ { jusqua: 0.5, part: 1,    nom: "plein tarif" },
                   { jusqua: 0.8, part: 0.7,  nom: "tarif réduit" },
                   { jusqua: 1,   part: 0.45, nom: "petits points" } ] },

      // sur 30 s d'écoute : tout jusqu'à 10 s, la moitié jusqu'à 20 s, puis 20 %
      { nom: "la course",
        aide: "Tout dans le premier tiers, la moitié dans le deuxième, des miettes dans le dernier.",
        paliers: [ { jusqua: 0.333, part: 1,   nom: "plein tarif" },
                   { jusqua: 0.667, part: 0.5, nom: "demi-tarif" },
                   { jusqua: 1,     part: 0.2, nom: "dernière chance" } ] }
    ]
  }
};
