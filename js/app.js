/* app.js — l'interface et le son.

   Assemble tout : les écrans, le lecteur audio calé sur l'heure du serveur,
   le visualiseur qui réagit vraiment à la musique, et la saisie des réponses. */

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* La palette des joueurs : douze teintes, deux nuances chacune. Les deux
     nuances sont claires ou franches, jamais sombres — le fond du site est
     presque noir, et un bleu marine y serait illisible. C'est pour ça qu'on
     lit « bleu clair » et « bleu franc » plutôt que « clair » et « foncé ». */
  var COULEURS = [
    { id: 'rouge-c',     nom: 'Rouge clair',      v: '#FF8A80' },
    { id: 'rouge-f',     nom: 'Rouge franc',      v: '#F4483C' },
    { id: 'orange-c',    nom: 'Orange clair',     v: '#FFB870' },
    { id: 'orange-f',    nom: 'Orange franc',     v: '#FF7A18' },
    { id: 'ambre-c',     nom: 'Ambre clair',      v: '#FFD98A' },
    { id: 'ambre-f',     nom: 'Ambre franc',      v: '#FFC247' },
    { id: 'citron-c',    nom: 'Citron clair',     v: '#EDFF8A' },
    { id: 'citron-f',    nom: 'Citron franc',     v: '#D4F03A' },
    { id: 'vert-c',      nom: 'Vert clair',       v: '#A8F57F' },
    { id: 'vert-f',      nom: 'Vert franc',       v: '#5FD13A' },
    { id: 'menthe-c',    nom: 'Menthe claire',    v: '#8FF5C8' },
    { id: 'menthe-f',    nom: 'Menthe franche',   v: '#2FD69A' },
    { id: 'turquoise-c', nom: 'Turquoise clair',  v: '#8CE8E8' },
    { id: 'turquoise-f', nom: 'Turquoise franc',  v: '#2FC4C4' },
    { id: 'ciel-c',      nom: 'Ciel clair',       v: '#8FD0FF' },
    { id: 'ciel-f',      nom: 'Ciel franc',       v: '#3BA3F0' },
    { id: 'bleu-c',      nom: 'Bleu clair',       v: '#A6B6FF' },
    { id: 'bleu-f',      nom: 'Bleu franc',       v: '#5C74F5' },
    { id: 'violet-c',    nom: 'Violet clair',     v: '#C9A8FF' },
    { id: 'violet-f',    nom: 'Violet franc',     v: '#9A5CF0' },
    { id: 'magenta-c',   nom: 'Magenta clair',    v: '#F2A0F0' },
    { id: 'magenta-f',   nom: 'Magenta franc',    v: '#DA4FD4' },
    { id: 'rose-c',      nom: 'Rose clair',       v: '#FFA3C4' },
    { id: 'rose-f',      nom: 'Rose franc',       v: '#FF5C93' },

    /* Les sombres. Elles n'étaient pas envisageables tant que le pseudo
       s'écrivait en couleur sur le fond du site : un noir sur un fond noir
       ne se voit pas. Maintenant que le pseudo est une étiquette pleine,
       elles reviennent — demandées par les amis d'Audrey. */
    { id: 'noir',        nom: 'Noir',             v: '#111418' },
    { id: 'anthracite',  nom: 'Anthracite',       v: '#3A4149' },
    { id: 'ardoise',     nom: 'Ardoise',          v: '#4A5B6B' },
    { id: 'bordeaux',    nom: 'Bordeaux',         v: '#7A1B2E' },
    { id: 'rouille',     nom: 'Rouille',          v: '#8C3B16' },
    { id: 'chocolat',    nom: 'Chocolat',         v: '#5A3A24' },
    { id: 'olive',       nom: 'Olive',            v: '#556B1E' },
    { id: 'sapin',       nom: 'Vert sapin',       v: '#1E5236' },
    { id: 'petrole',     nom: 'Bleu pétrole',     v: '#14545C' },
    { id: 'marine',      nom: 'Bleu marine',      v: '#1C3170' },
    { id: 'nuit',        nom: 'Violet nuit',      v: '#3D2270' },
    { id: 'aubergine',   nom: 'Aubergine',        v: '#5C1E52' }
  ];

  function teinte(id) {
    for (var i = 0; i < COULEURS.length; i++) {
      if (COULEURS[i].id === id) return COULEURS[i].v;
    }
    return null;
  }

  /* Quelle encre poser sur cette couleur ? On calcule la luminance perçue
     plutôt que de la noter à la main pour chacune : une teinte ajoutée plus
     tard sera lisible sans qu'on y pense. */
  function encreSur(hex) {
    function canal(c) {
      c = parseInt(c, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    var L = 0.2126 * canal(hex.slice(1, 3))
          + 0.7152 * canal(hex.slice(3, 5))
          + 0.0722 * canal(hex.slice(5, 7));
    return L > 0.35 ? '#06140F' : '#EBFCF3';
  }

  /* Le pseudo s'affiche en étiquette pleine, pas en texte coloré. C'est ce qui
     rend le noir et les autres teintes sombres utilisables : le fond du site
     est presque noir, un pseudo écrit en noir dessus serait invisible. */
  function etiqueter(el, j) {
    el.classList.add('etiquette-joueur');
    var v = teinte(j && j.couleur);
    if (!v) return;             // pas de couleur : étiquette neutre
    el.style.background = v;
    el.style.color = encreSur(v);
  }

  /* Les avatars. Rangés par familles pour que la grille reste lisible : on
     repère « les animaux » d'un coup d'œil au lieu de lire soixante dessins.
     Rien de trop récent dans la liste — un emoji sorti l'an dernier s'affiche
     en carré vide sur un téléphone qui n'a pas suivi. */
  var EMOJIS = [
    // musique
    '🎤','🎧','🎸','🥁','🎹','🎺','🎷','🎻','📻','💿','🔊','🎙️',
    // fête, et les cornes du métal — réclamées nommément par Audrey
    '🤘','🕺','💃','🪩','🎉','🎊','🥳','🍾','🎁',
    // animaux
    '🦊','🐙','🐸','🦩','🦄','🐼','🐨','🦁','🐯','🐺','🦝','🐧',
    '🦉','🦆','🐢','🐳','🦈','🐝','🦋','🐰','🐹','🐷','🐵','🐶',
    // le serpent est pour Audrey : Morticia, et Serpentard
    '🐍',
    // créatures
    '👽','🤖','👻','🎃','💀','🦇','🖤','🐉','🦖','🧙','🧛',
    // nourriture
    '🍕','🌮','🍔','🍟','🍩','🍪','🧁','🍉','🍒','🥑','🍺',
    // symboles
    '⚡','🌈','🔥','⭐','🌙','🍀','💎','🎯','🚀','🛸','⚓','🎲'
  ];

  // Petites piques quand la réponse est fausse — histoire que ça ne soit pas
  // toujours le même « Pas ça… » sec.
  var RATES = ['Pas ça… 😛', 'Raté ! 😝', 'Même pas 😜', 'Essaie encore 🙃',
               'Nope 😛', 'Pas du tout 😋', 'Tu chauffes ? 🤔'];

  /* Une accroche différente à chaque ouverture du site. Ajoute, retire ou
     réécris ce que tu veux ici : une seule est tirée au sort au chargement. */
  var ACCROCHES = [
    "Sors ton téléphone, monte le son, et tape plus vite que les autres. 🎤",
    "Chacun son téléphone, aucun arbitre… donc aucune excuse. 😛",
    "La playlist s'enchaîne toute seule. Toi, tu n'as qu'à reconnaître. Facile, non ? 😏",
    "Celui qui crie le plus fort n'a pas raison. Celui qui tape le plus vite, si. ⚡",
    "Trois notes et ça te revient. Ou alors pas du tout. 🎶",
    "Prépare tes pouces : ici, une seconde d'hésitation coûte des points. ⏱️",
    "Pas de maître du jeu, pas de triche, pas de pitié. 🎧",
    "Le moment où tu connais la chanson mais pas le titre. On connaît. 🙃",
    "Douze titres, trente secondes chacun, et beaucoup de mauvaise foi. 🕺",
    "Attention : peut provoquer des cris, des fautes de frappe et des disputes. 🎉"
  ];

  var net = null;
  var partie = null;          // la session de jeu en cours
  var profil = { nom: '', emoji: '🎤', couleur: null };
  var mancheChoisie = 'melange';
  /* Les catégories cochées dans « Personnaliser ». La manche choisie devient
     alors « perso:rock,disney » : une seule chaîne, donc elle voyage dans
     `meta.manche` comme n'importe quelle autre manche et tout le salon la voit. */
  var persoChoisies = [];
  var historique = [];        // les extraits déjà passés, pour le récap final
  var dernierePisteJouee = null;

  /* ================= écrans ================= */

  var ecranAffiche = null;
  var chefAffiche = null;     // qui avait la main au dernier rendu du salon

  function montrer(nom) {
    if (nom !== 'fin') arreterSacre();
    ['accueil', 'salon', 'jeu', 'fin'].forEach(function (e) {
      $('ecran-' + e).classList.toggle('actif', e === nom);
    });

    /* Remonter en haut de page SEULEMENT quand on change vraiment d'écran.
       montrer('salon') est rejoué à chaque rafraîchissement du salon — arrivée
       d'un joueur, battement de présence, changement de réglage — et sans ce
       garde-fou la page remontait toute seule pendant qu'on réglait la partie
       en bas. */
    if (nom !== ecranAffiche) {
      ecranAffiche = nom;
      window.scrollTo(0, 0);
    }
  }

  function erreurAccueil(message) {
    var b = $('erreur-accueil');
    if (!message) { b.classList.add('invisible'); return; }
    b.textContent = message;
    b.classList.remove('invisible');
  }

  /* ================= profil ================= */

  function chargerProfil() {
    try {
      var brut = localStorage.getItem('bt.profil');
      if (brut) profil = JSON.parse(brut);
    } catch (e) {}
    if (!profil.emoji) profil.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    if (!teinte(profil.couleur)) {
      profil.couleur = COULEURS[Math.floor(Math.random() * COULEURS.length)].id;
    }
    $('champ-pseudo').value = profil.nom || '';
    $('bouton-emoji').textContent = profil.emoji;
    rendrePalette('palette-accueil', {});
    rendreAvatars();
  }

  /* La grille des avatars. Elle reste repliée : soixante dessins ouverts en
     permanence mangeraient tout l'écran d'accueil sur un téléphone. */
  function rendreAvatars() {
    var boite = $('choix-avatars');
    if (!boite) return;
    boite.innerHTML = '';

    EMOJIS.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'avatar' + (e === profil.emoji ? ' choisi' : '');
      b.textContent = e;
      b.setAttribute('aria-pressed', String(e === profil.emoji));
      b.addEventListener('click', function () {
        profil.emoji = e;
        try { localStorage.setItem('bt.profil', JSON.stringify(profil)); } catch (err) {}
        $('bouton-emoji').textContent = e;
        if (partie) {
          net.maj('salons/' + partie.code + '/joueurs/' + partie.moi, { emoji: e });
        }
        rendreAvatars();
        boite.hidden = true;
      });
      boite.appendChild(b);
    });
  }

  /* Dessine une palette de pastilles. `prises` recense les couleurs déjà
     portées par quelqu'un d'autre : elles restent visibles mais inertes, pour
     qu'on comprenne qu'elles existent et qu'elles sont occupées. */
  function rendrePalette(ouId, prises) {
    var boite = $(ouId);
    if (!boite) return;
    boite.innerHTML = '';

    COULEURS.forEach(function (c) {
      var pastille = document.createElement('button');
      pastille.type = 'button';
      pastille.className = 'pastille' + (c.id === profil.couleur ? ' choisie' : '');
      pastille.style.background = c.v;
      pastille.disabled = !!prises[c.id];
      pastille.title = prises[c.id] ? c.nom + ' — déjà prise' : c.nom;
      pastille.setAttribute('aria-label', pastille.title);
      pastille.setAttribute('aria-pressed', String(c.id === profil.couleur));
      pastille.addEventListener('click', function () {
        profil.couleur = c.id;
        try { localStorage.setItem('bt.profil', JSON.stringify(profil)); } catch (e) {}
        if (partie) {
          net.maj('salons/' + partie.code + '/joueurs/' + partie.moi, { couleur: c.id });
        }
        rendrePalette('palette-accueil', {});
        if (partie) rendreSalon();
      });
      boite.appendChild(pastille);
    });
  }

  /* Les couleurs portées par les autres joueurs présents. Un arrivant ne
     bouscule personne : seules comptent celles des joueurs entrés avant lui. */
  function couleursPrises(etat, avantMoi) {
    var prises = {};
    var mien = etat.joueurs[partie.moi] || {};
    partie.joueursConnectes().forEach(function (j) {
      if (j.id === partie.moi || !j.couleur) return;
      if (avantMoi && (j.rejointA || 0) > (mien.rejointA || 0)) return;
      prises[j.couleur] = 1;
    });
    return prises;
  }

  /* À l'arrivée dans un salon, deux personnes peuvent porter la même couleur :
     personne ne savait ce que l'autre avait choisi. Le dernier arrivé glisse
     sur la première teinte encore libre. */
  function ajusterCouleur(etat) {
    var prises = couleursPrises(etat, true);
    if (profil.couleur && !prises[profil.couleur]) return false;
    for (var i = 0; i < COULEURS.length; i++) {
      if (!prises[COULEURS[i].id]) {
        profil.couleur = COULEURS[i].id;
        try { localStorage.setItem('bt.profil', JSON.stringify(profil)); } catch (e) {}
        net.maj('salons/' + partie.code + '/joueurs/' + partie.moi,
                { couleur: profil.couleur });
        return true;
      }
    }
    return false;   // palette pleine : on garde la sienne, tant pis
  }

  function sauverProfil() {
    profil.nom = ($('champ-pseudo').value || '').trim().slice(0, 18) || 'Anonyme';
    try { localStorage.setItem('bt.profil', JSON.stringify(profil)); } catch (e) {}
    return profil;
  }

  /* ================= audio ================= */

  /* Affiche la version en bas de l'accueil. Elle est lue sur l'adresse du
     script, donc elle correspond toujours au fichier réellement chargé : si le
     navigateur ressert une vieille version gardée en cache, ça se voit. */
  (function afficherVersion() {
    var marque = document.querySelector('script[src*="app.js"]');
    var v = marque && (marque.getAttribute('src').match(/v=(\d+)/) || [])[1];
    var coin = $('version');
    if (coin && v) coin.textContent = 'version ' + v;
  })();

  var lecteur = $('lecteur');
  var contexte = null, analyseur = null, source = null, donneesFreq = null;
  var gain = null;
  var audioAmorce = false;

  var volume = 0.8;      // 0 à 1
  var volumeAvantCoupure = 0.8;

  /* Le volume passe par un nœud de gain, pas par lecteur.volume : sur iPhone,
     régler le volume d'un élément audio en JavaScript est purement ignoré. */
  function appliquerVolume() {
    if (gain) gain.gain.value = volume;
    else lecteur.volume = volume;   // repli si le circuit audio n'a pas pu démarrer

    /* Le reglage existe en plusieurs exemplaires - un par ecran qui joue du
       son. On les tient tous a jour, sinon celui de l'ecran de fin afficherait
       un volume different de celui qu'on entend. */
    var icone = volume === 0 ? '🔇'
              : volume < 0.34 ? '🔈'
              : volume < 0.7 ? '🔉' : '🔊';
    var dit = volume === 0 ? 'Remettre le son' : 'Couper le son';

    boutonsSon().forEach(function (b) {
      b.textContent = icone;
      b.setAttribute('aria-label', dit);
      b.setAttribute('title', dit);
    });
    curseursSon().forEach(function (c) { c.value = Math.round(volume * 100); });
  }

  function boutonsSon() {
    return [].slice.call(document.querySelectorAll('.bouton-son'));
  }

  function curseursSon() {
    return [].slice.call(document.querySelectorAll('.reglage-son input[type="range"]'));
  }

  function chargerVolume() {
    try {
      var v = parseFloat(localStorage.getItem('bt.volume'));
      if (!isNaN(v) && v >= 0 && v <= 1) volume = v;
    } catch (e) {}
    if (volume > 0) volumeAvantCoupure = volume;
    appliquerVolume();
  }

  function sauverVolume() {
    try { localStorage.setItem('bt.volume', String(volume)); } catch (e) {}
  }

  /* Les navigateurs n'autorisent le son qu'après un geste de l'utilisateur.
     On en profite au moment du clic « Créer / Rejoindre ». */
  function amorcerAudio() {
    if (audioAmorce) return;
    audioAmorce = true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        contexte = new AC();
        if (contexte.state === 'suspended') contexte.resume();
        source = contexte.createMediaElementSource(lecteur);
        gain = contexte.createGain();
        analyseur = contexte.createAnalyser();
        analyseur.fftSize = 128;
        analyseur.smoothingTimeConstant = 0.76;
        donneesFreq = new Uint8Array(analyseur.frequencyBinCount);
        // son -> volume -> analyse -> haut-parleurs
        source.connect(gain);
        gain.connect(analyseur);
        analyseur.connect(contexte.destination);
        appliquerVolume();
      }
    } catch (e) {
      console.warn('Circuit audio indisponible :', e.message);
      analyseur = null;
      gain = null;
    }
    lecteur.play().catch(function () {});
    lecteur.pause();
  }

  /* ================= extraits téléchargés d'avance ================= */

  /* Le son se coupait par à-coups pendant le morceau : le navigateur
     téléchargeait l'extrait au fur et à mesure qu'il le jouait, et la moindre
     hésitation du réseau s'entendait. On télécharge donc le fichier en entier
     avant de le jouer, et on lit depuis la mémoire.

     Le morceau suivant est préparé pendant la pause, quand rien ne joue : le
     téléchargement ne prend de la bande passante à personne. */
  var extraits = {};        // url d'origine -> url locale
  var enCours = {};         // téléchargements déjà lancés

  function precharger(piste) {
    if (!piste || !piste.apercu) return;
    var url = piste.apercu;
    if (extraits[url] || enCours[url]) return;
    /* Si on est en train de lire ce morceau en direct, le télécharger en même
       temps reviendrait à demander deux fois le même fichier : autant de débit
       en moins pour la lecture, et le son se hache. */
    if (lecteur.src === url) return;
    enCours[url] = true;

    fetch(url, { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.blob() : null; })
      .then(function (blob) {
        if (blob) extraits[url] = URL.createObjectURL(blob);
      })
      .catch(function () { /* on jouera en direct, comme avant */ })
      .then(function () { delete enCours[url]; });
  }

  /* On ne garde pas tout en mémoire indéfiniment : au-delà d'une dizaine
     d'extraits, on libère les plus anciens. */
  function rangerExtraits() {
    /* On compare à ce que le lecteur utilise vraiment. La version précédente
       comparait l'adresse « blob: » à dernierePisteJouee, qui contient
       l'adresse Apple : les deux ne sont jamais égales, donc la garde ne
       protégeait rien et le ménage pouvait libérer l'extrait en cours de
       lecture — le son se coupait net. */
    var urls = Object.keys(extraits);
    while (urls.length > 16) {
      var vieille = urls.shift();
      if (extraits[vieille] !== lecteur.src) {
        try { URL.revokeObjectURL(extraits[vieille]); } catch (e) {}
        delete extraits[vieille];
      }
    }
  }

  /* ================= compteur de coupures ================= */

  /* Enregistre ce que fait réellement le lecteur chez le joueur, et le résume
     sur l'écran de fin. Sert à comprendre un défaut qu'on ne reproduit pas. */
  var bilanAudio = { coupures: 0, enMemoire: 0, enReseau: 0 };

  lecteur.addEventListener('waiting', function () {
    if ($('ecran-jeu').classList.contains('actif')) bilanAudio.coupures++;
  });
  lecteur.addEventListener('stalled', function () {
    if ($('ecran-jeu').classList.contains('actif')) bilanAudio.coupures++;
  });

  function rendreBilanAudio() {
    var el = $('bilan-audio');
    if (!el) return;
    var total = bilanAudio.enMemoire + bilanAudio.enReseau;
    if (!total) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = bilanAudio.coupures === 0
      ? 'Son : aucune coupure sur ' + total + ' morceaux 👍'
      : 'Son : ' + bilanAudio.coupures + ' coupure' + (bilanAudio.coupures > 1 ? 's' : '') +
        ' — ' + bilanAudio.enMemoire + ' morceaux joués depuis la mémoire, ' +
        bilanAudio.enReseau + ' en direct';
  }

  /* Cale la lecture sur l'heure du salon : un retardataire tombe au bon endroit. */
  function jouerExtrait(piste, debutA) {
    if (!piste || !piste.apercu) return;
    var position = Math.max(0, (net.maintenant() - debutA) / 1000);

    lecteur.loop = false;   // le sacre a pu la laisser active
    if (dernierePisteJouee !== piste.apercu) {
      dernierePisteJouee = piste.apercu;
      // Le fichier téléchargé si on l'a, la source d'Apple sinon.
      var local = extraits[piste.apercu];
      if (local) bilanAudio.enMemoire++; else bilanAudio.enReseau++;
      lecteur.src = local || piste.apercu;
      lecteur.load();
      rangerExtraits();
    }
    if (contexte && contexte.state === 'suspended') contexte.resume();

    var lancer = function () {
      try {
        if (isFinite(lecteur.duration) && position < lecteur.duration) {
          if (Math.abs(lecteur.currentTime - position) > 0.8) lecteur.currentTime = position;
        }
      } catch (e) {}
      if (!gain) lecteur.volume = volume;
      lecteur.play().catch(function () {
        info("Touche l'écran pour activer le son 🔊", 'raté');
      });
    };

    if (lecteur.readyState >= 2) lancer();
    else lecteur.addEventListener('loadeddata', lancer, { once: true });
  }

  function arreterExtrait() {
    try { lecteur.pause(); } catch (e) {}
    dernierePisteJouee = null;
  }

  /* ================= le sacre ================= */

  /* Le podium ne se devoile pas en silence : Barry White entre en scene.
     Le morceau tourne en boucle tant qu'on reste sur l'ecran de fin, et chacun
     peut le couper - le choix est retenu d'une partie a l'autre. */
  /* Apple possède vingt-cinq éditions distinctes de ce morceau. Audrey les a
     toutes écoutées le 26/09/2026 et a retenu la « Promo Single Version » de
     la compilation « Gold ». Les niveaux sonores des éditions candidates ont
     été mesurés : elles tiennent toutes entre 14 et 21 % de niveau moyen,
     celle-ci comprise, donc le choix ne coûte rien en puissance.

     Le titre est écrit en entier pour qu'Apple ne renvoie pas une des autres
     éditions, qui portent toutes le même nom une fois les parenthèses ôtées. */
  var SACRE = {
    t: "Let the Music Play (Promo Single Version)",
    a: "Barry White",
    q: "Barry White Let the Music Play Promo Single Version Gold",
    altT: ["Let the Music Play"]
  };
  var sacreEnCours = false;
  var sacrePiste = null;      // le morceau du sacre, une fois trouvé

  /* Plus besoin d'attendre : l'édition retenue est dans le vif dès la première
     seconde. On garde le réglage, il resservira si on change de morceau. */
  var DEPART_SACRE = 0;

  /* Le sacre est passé par un lecteur YouTube pendant un temps : trente
     secondes ne suffisaient pas à atteindre le moment voulu. Les publicités
     gâchaient l'arrivée du podium, et Audrey a trouvé une édition dont
     l'extrait Apple part au bon endroit. Le lecteur vidéo est donc retiré :
     plus d'iframe, plus d'API externe, plus de publicité. */

  /* Cherche le morceau du sacre et le garde sous la main. Appelé dès le début
     de la partie : au moment du podium, il est déjà prêt.

     Le second essai passe par une recherche directe, car resoudre() mémorise
     ses échecs pendant une heure : si Apple nous bride au mauvais moment, Barry
     resterait muet toute l'heure sur ce navigateur — et fonctionnerait très
     bien sur celui du voisin. C'est précisément ce qui est arrivé. */
  function trouverSacre() {
    if (sacrePiste) return Promise.resolve(sacrePiste);
    return Itunes.resoudre(SACRE).then(function (piste) {
      if (piste && piste.apercu) return piste;
      return Itunes.chercher(SACRE.q, 5).then(function (liste) {
        for (var i = 0; i < liste.length; i++) {
          if (liste[i] && liste[i].apercu) return Itunes.habiller(liste[i], SACRE);
        }
        return null;
      });
    }).then(function (piste) {
      if (piste) { sacrePiste = piste; precharger(piste); }
      return piste;
    }).catch(function () { return null; });
  }

  function sacreVoulu() {
    try { return localStorage.getItem('bt.sacre') !== '0'; } catch (e) { return true; }
  }

  function majBoutonSacre() {
    var b = $('bouton-sacre');
    if (b) b.textContent = sacreVoulu()
      ? '🎺 Barry White : oui'
      : '🔇 Barry White : non';
  }

  /* Le lecteur est-il bien en train de tenir le morceau du sacre ? Sert à ne
     relancer que lui, et surtout pas le dernier morceau de la partie. */
  function lecteurSurLeSacre() {
    if (!sacrePiste) return false;
    return lecteur.src === sacrePiste.apercu ||
           lecteur.src === extraits[sacrePiste.apercu];
  }

  function jouerSacre() {
    if (!sacreVoulu()) return;

    if (sacreEnCours) {
      // Déjà lancé : on le relance s'il s'est arrêté, et lui seul.
      if (lecteur.paused && lecteurSurLeSacre()) lecteur.play().catch(function () {});
      return;
    }
    sacreEnCours = true;
    jouerSacreApple();
  }

  function jouerSacreApple() {
    trouverSacre().then(function (piste) {
      /* Apple met un instant à répondre : entre-temps on a pu quitter l'écran
         ou couper le sacre. On vérifie avant de lancer quoi que ce soit. */
      if (!sacreEnCours) return;
      if (!piste || !piste.apercu) {
        // Rien trouvé : on se remet en état de réessayer au prochain passage.
        sacreEnCours = false;
        return;
      }
      dernierePisteJouee = piste.apercu;
      lecteur.src = extraits[piste.apercu] || piste.apercu;
      lecteur.loop = true;
      lecteur.load();

      /* On ne peut pas se placer dans le morceau tant que sa durée est
         inconnue : on attend que le lecteur l'ait lue. */
      var entrerEnScene = function () {
        try {
          if (isFinite(lecteur.duration) && DEPART_SACRE < lecteur.duration - 1) {
            lecteur.currentTime = DEPART_SACRE;
          }
        } catch (e) {}
        if (contexte && contexte.state === 'suspended') contexte.resume();
        if (!gain) lecteur.volume = volume;
        lecteur.play().catch(function () {});
      };
      if (lecteur.readyState >= 1) entrerEnScene();
      else lecteur.addEventListener('loadedmetadata', entrerEnScene, { once: true });
    });
  }

  function arreterSacre() {
    /* Ne toucher au son QUE si Barry jouait vraiment. montrer('jeu') est
       rappelé à chaque rafraîchissement du salon — toutes les 15 secondes au
       rythme des signes de vie — et sans cette garde il coupait l'extrait en
       plein milieu : c'était la cause des petites coupures pendant le morceau. */
    if (!sacreEnCours) return;
    sacreEnCours = false;
    lecteur.loop = false;
    arreterExtrait();
  }

  /* ================= visualiseur ================= */

  var toile = $('toile');
  var ctx = toile.getContext('2d');

  function dessiner() {
    var L = toile.width, H = toile.height;
    var cx = L / 2, cy = H / 2;
    ctx.clearRect(0, 0, L, H);

    var barres = 56;
    var rayonBase = L * 0.27;
    var niveaux = [];

    if (analyseur && !lecteur.paused) {
      analyseur.getByteFrequencyData(donneesFreq);
      for (var i = 0; i < barres; i++) {
        var idx = Math.floor(Math.pow(i / barres, 1.35) * (donneesFreq.length - 1));
        niveaux.push(donneesFreq[idx] / 255);
      }
    } else {
      // Repos : une respiration lente plutôt qu'un cercle mort.
      var t = Date.now() / 620;
      for (var j = 0; j < barres; j++) {
        niveaux.push(0.08 + 0.05 * (1 + Math.sin(t + j * 0.42)));
      }
    }

    var moyenne = niveaux.reduce(function (a, b) { return a + b; }, 0) / barres;

    // halo qui pulse avec le morceau
    var halo = ctx.createRadialGradient(cx, cy, rayonBase * 0.25, cx, cy, rayonBase * (1.25 + moyenne * 0.5));
    halo.addColorStop(0, 'rgba(140,255,74,' + (0.16 + moyenne * 0.32).toFixed(3) + ')');
    halo.addColorStop(1, 'rgba(140,255,74,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, L, H);

    for (var k = 0; k < barres; k++) {
      var angle = (k / barres) * Math.PI * 2 - Math.PI / 2;
      var hauteur = niveaux[k] * L * 0.2 + 4;
      var x1 = cx + Math.cos(angle) * rayonBase;
      var y1 = cy + Math.sin(angle) * rayonBase;
      var x2 = cx + Math.cos(angle) * (rayonBase + hauteur);
      var y2 = cy + Math.sin(angle) * (rayonBase + hauteur);

      var degrade = ctx.createLinearGradient(x1, y1, x2, y2);
      degrade.addColorStop(0, 'rgba(255,194,71,.95)');
      degrade.addColorStop(1, 'rgba(140,255,74,.5)');

      ctx.strokeStyle = degrade;
      ctx.lineWidth = L * 0.014;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /* ================= boucle d'affichage ================= */

  var CIRCONFERENCE = 285.9;

  function boucle() {
    requestAnimationFrame(boucle);
    if (!partie || !$('ecran-jeu').classList.contains('actif')) return;

    var etat = partie.etat;
    var tour = etat.tour;
    if (!etat.meta || !tour) return;

    dessiner();

    var maintenant = net.maintenant();
    var piste = etat.pistes[tour.index];

    if (tour.phase === 'ecoute' && tour.debutA) {
      var duree = etat.meta.dureeExtrait * 1000;
      var restant = Math.max(0, tour.debutA + duree - maintenant);
      var part = restant / duree;
      $('chrono').textContent = Math.ceil(restant / 1000);
      $('sous-chrono').textContent = 'à l\'écoute';
      $('piste-temps').setAttribute('stroke-dashoffset', String(CIRCONFERENCE * (1 - part)));
      $('plateau').classList.toggle('presse', restant < 8000);
    } else if (tour.phase === 'reveal' && tour.revealA) {
      var pause = etat.meta.dureeReponse * 1000;
      var reste = Math.max(0, tour.revealA + pause - maintenant);
      $('chrono').textContent = Math.ceil(reste / 1000);
      $('sous-chrono').textContent = tour.index + 1 >= etat.meta.nbTitres ? 'résultats…' : 'au suivant';
      $('piste-temps').setAttribute('stroke-dashoffset', String(CIRCONFERENCE * (1 - reste / pause)));
      $('plateau').classList.remove('presse');
    } else if (tour.phase === 'attente') {
      $('chrono').textContent = etat.souci ? '⏳' : '···';
      $('sous-chrono').textContent = etat.souci ? etat.souci
                                   : (piste ? 'ça démarre' : 'préparation');
      $('piste-temps').setAttribute('stroke-dashoffset', '0');
    }
  }

  /* ================= rendu du salon ================= */

  /* Le choix de la manche est partagé par tout le salon. S'il était ouvert à
     tous, n'importe qui pouvait le changer à la dernière seconde — c'est
     arrivé pendant une soirée. Il appartient donc à l'hôte, comme le bouton
     de lancement. Hors salon, il n'y a personne à gêner. */
  function jePeuxChoisir() {
    return !partie || !partie.etat || !!partie.etat.jeSuisChef;
  }

  function estPerso(id) { return String(id).indexOf('perso:') === 0; }
  function idPerso() { return 'perso:' + persoChoisies.join(','); }

  function diffuserManche() {
    if (partie) net.maj('salons/' + partie.code + '/meta', { manche: mancheChoisie });
  }

  function rendreManches() {
    var grille = $('grille-manches');
    grille.innerHTML = '';

    var choix = [{
      id: 'melange', emoji: '🎲', nom: 'Grand mélange',
      desc: 'Un peu de tout, toutes époques.'
    }].concat(Playlists.manches).concat([{
      id: 'perso', emoji: '🎛️', nom: 'Personnaliser',
      desc: 'Un mélange, mais seulement des catégories que tu choisis.'
    }]);

    var maMain = jePeuxChoisir();
    grille.classList.toggle('en-lecture', !maMain);

    choix.forEach(function (m) {
      var actif = m.id === 'perso' ? estPerso(mancheChoisie) : m.id === mancheChoisie;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vignette-manche';
      b.disabled = !maMain;
      if (!maMain) b.title = "C'est l'hôte qui choisit la manche.";
      b.setAttribute('aria-pressed', String(actif));
      b.innerHTML = '<span class="emoji">' + m.emoji + '</span>' +
                    '<span class="nom"></span><span class="desc"></span>';
      b.querySelector('.nom').textContent = m.nom;
      b.querySelector('.desc').textContent = m.desc;
      b.addEventListener('click', function () {
        mancheChoisie = m.id === 'perso' ? idPerso() : m.id;
        diffuserManche();
        rendreManches();
        if (partie) rendreSalon();
      });
      grille.appendChild(b);
    });

    rendrePerso();
  }

  /* Le panneau de cases à cocher, visible seulement en mode « Personnaliser ». */
  function rendrePerso() {
    var panneau = $('choix-perso');
    panneau.hidden = !estPerso(mancheChoisie);
    if (panneau.hidden) return;

    var maMain = jePeuxChoisir();
    var boite = $('cases-perso');
    boite.classList.toggle('en-lecture', !maMain);
    boite.innerHTML = '';
    Playlists.manches.forEach(function (m) {
      var coche = persoChoisies.indexOf(m.id) !== -1;
      var etiquette = document.createElement('label');
      etiquette.className = 'case-perso' + (coche ? ' cochee' : '');
      etiquette.innerHTML = '<input type="checkbox"><span></span>';
      var case_ = etiquette.querySelector('input');
      case_.checked = coche;
      case_.disabled = !maMain;
      etiquette.querySelector('span').textContent = m.emoji + ' ' + m.nom;
      /* On ne reconstruit pas la liste à chaque clic : on retouche juste la case
         touchée. Sinon la case disparaissait sous le doigt au moment même où on
         la cochait. */
      case_.addEventListener('change', function () {
        var i = persoChoisies.indexOf(m.id);
        if (this.checked && i === -1) persoChoisies.push(m.id);
        if (!this.checked && i !== -1) persoChoisies.splice(i, 1);
        etiquette.classList.toggle('cochee', this.checked);
        mancheChoisie = idPerso();
        diffuserManche();
        majComptePerso();
        if (partie) rendreSalon();
      });
      boite.appendChild(etiquette);
    });

    majComptePerso();
  }

  /* On annonce le nombre de morceaux réellement jouables : le tirage écarte les
     doublons entre catégories et ne garde qu'un titre par œuvre, donc
     additionner les catégories donnerait un chiffre trop optimiste. */
  function majComptePerso() {
    $('compte-perso').textContent = persoChoisies.length
      ? Playlists.tirage(idPerso(), 99999, 1).length + ' morceaux'
      : 'aucune catégorie cochée';
  }

  function rendreSalon() {
    var etat = partie.etat;
    $('affichage-code').textContent = partie.code;

    var liste = $('liste-joueurs');
    liste.innerHTML = '';
    var chef = null;
    var vivants = partie.joueursConnectes().sort(function (a, b) {
      return (a.rejointA || 0) - (b.rejointA || 0);
    });
    if (vivants.length) chef = vivants[0].id;

    vivants.forEach(function (j) {
      var li = document.createElement('li');
      li.className = 'jeton-joueur' + (j.id === partie.moi ? ' moi' : '');
      li.innerHTML = '<span class="rond"></span><span class="qui"></span>';
      li.querySelector('.rond').textContent = j.emoji || '🎧';
      li.querySelector('.qui').textContent = j.nom || 'Anonyme';
      etiqueter(li.querySelector('.qui'), j);
      if (j.id === chef) {
        var r = document.createElement('span');
        r.className = 'role';
        r.textContent = 'HÔTE';
        li.appendChild(r);
      }
      liste.appendChild(li);
    });

    if (etat.meta && etat.meta.manche && etat.meta.manche !== mancheChoisie) {
      mancheChoisie = etat.meta.manche;
      // L'hôte a changé son choix : on remet notre écran d'aplomb.
      if (estPerso(mancheChoisie)) {
        persoChoisies = mancheChoisie.slice(6).split(',').filter(Boolean);
      }
      rendreManches();
    }

    /* L'hôte est le joueur connecté le plus ancien : si le nôtre s'en va,
       quelqu'un d'autre hérite de la main en cours de salon. Les vignettes
       doivent alors redevenir cliquables — ou le contraire. */
    if (etat.jeSuisChef !== chefAffiche) {
      chefAffiche = etat.jeSuisChef;
      rendreManches();
    }

    ajusterCouleur(etat);
    rendrePalette('palette-salon', couleursPrises(etat, false));

    var note = $('note-chef');
    if (!etat.jeSuisChef) {
      note.innerHTML = "<span><b>C'est l'hôte qui choisit la manche et lance la " +
        "partie.</b> Tu vois son choix en direct — installe-toi, ça va commencer.</span>";
      note.classList.remove('invisible');
      $('bouton-lancer').disabled = true;
      $('bouton-lancer').textContent = 'En attente de l\'hôte…';
    } else if (estPerso(mancheChoisie) && !persoChoisies.length) {
      // Sans une seule catégorie cochée, il n'y aurait rien à jouer du tout.
      note.innerHTML = '<span><b>Coche au moins une catégorie</b> dans ' +
        '« Personnaliser », sinon il n\'y a rien à mettre dans la partie.</span>';
      note.classList.remove('invisible');
      $('bouton-lancer').disabled = true;
      $('bouton-lancer').textContent = 'Aucune catégorie cochée';
    } else {
      note.classList.add('invisible');
      $('bouton-lancer').disabled = false;
      $('bouton-lancer').textContent = 'Lancer la partie';
    }
  }

  /* ================= rendu du jeu ================= */

  /* Rendre la main au champ de réponse tout seul, pour ne pas avoir à cliquer
     dedans à chaque morceau. Sur un ordinateur c'est gratuit ; sur un
     téléphone, faire surgir le clavier sans prévenir cacherait la moitié de
     l'écran, alors on ne le rouvre que si le joueur s'en servait déjà. */
  var pointeurFin = !!(window.matchMedia &&
                       window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var clavierVoulu = false;
  var champEtaitFerme = true;

  function redonnerLaMain() {
    var champ = $('champ-reponse');
    if (!champ || champ.disabled) return;
    if (document.activeElement === champ) return;
    if (!pointeurFin && !clavierVoulu) return;
    try { champ.focus({ preventScroll: true }); } catch (e) { champ.focus(); }
  }

  function rendreJeu() {
    var etat = partie.etat;
    var tour = etat.tour;
    if (!tour || !etat.meta) return;

    var piste = etat.pistes[tour.index];
    var trouves = partie.motsTrouves();

    $('compteur-manche').textContent = 'Titre ' + (tour.index + 1) + ' / ' + etat.meta.nbTitres;
    var m = Playlists.parId(etat.meta.manche);
    $('nom-manche').textContent = m ? m.emoji + ' ' + m.nom
      : (estPerso(etat.meta.manche) ? '🎛️ Sélection maison' : '🎲 Grand mélange');

    /* Dans une manche normale la catégorie est déjà écrite en haut ; dans le
       Grand mélange elle change à chaque morceau, on l'affiche donc ici. */
    var badge = $('badge-categorie');
    if (!m && piste && piste.categorie) {
      badge.textContent = piste.categorie;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
    $('label-titre').textContent = (piste && piste.labelT) || 'Titre';
    $('label-artiste').textContent = (piste && piste.labelA) || 'Artiste';

    var reveal = tour.phase === 'reveal';
    var solo = (piste && piste.solo) || null;

    // Manche à réponse unique : une seule case, sur toute la largeur.
    $('paire-reponses').classList.toggle('solo', !!solo);
    $('case-artiste').hidden = solo === 'titre';
    $('case-titre').hidden = solo === 'artiste';

    // case Titre (ou « Dessin animé », « Jeu »… selon la catégorie)
    var caseT = $('case-titre');
    caseT.className = 'case-reponse' + (trouves.titre ? ' trouve' : (reveal ? ' revele' : ''));
    $('contenu-titre').textContent = (trouves.titre || reveal) && piste
      ? piste.titre : 'à trouver';

    // case Artiste / Film / Anime…
    var caseA = $('case-artiste');
    caseA.className = 'case-reponse' + (trouves.artiste ? ' trouve' : (reveal ? ' revele' : ''));
    $('contenu-artiste').textContent = (trouves.artiste || reveal) && piste
      ? piste.artiste : 'à trouver';

    // En solo, le champ non compté est révélé pour l'anecdote, sans points.
    var credit = $('credit-solo');
    if (solo && reveal && piste) {
      credit.textContent = solo === 'titre'
        ? piste.labelA.toLowerCase() + ' : ' + piste.artiste
        : piste.labelT.toLowerCase() + ' : ' + piste.titre;
      credit.hidden = false;
    } else {
      credit.hidden = true;
    }

    // pochette au moment de la révélation
    var img = $('pochette');
    if (reveal && piste && piste.pochette) {
      if (img.getAttribute('src') !== piste.pochette) img.src = piste.pochette;
      img.classList.remove('invisible');
      $('centre-plateau').classList.add('invisible');
    } else {
      img.classList.add('invisible');
      $('centre-plateau').classList.remove('invisible');
    }

    // le champ se ferme quand tout est trouvé ou pendant la révélation
    var fini = reveal || (trouves.titre && trouves.artiste);
    $('champ-reponse').disabled = fini;
    if (fini) {
      $('champ-reponse').blur();
      champEtaitFerme = true;
    } else if (champEtaitFerme) {
      // Seulement à la réouverture : sinon on reprendrait le curseur au joueur
      // en train de régler le volume au milieu du morceau.
      champEtaitFerme = false;
      redonnerLaMain();
    }

    rendreScores();
    rendreFil();
  }

  /* Le fil des propositions ratées. Il vit sous `tour`, donc il repart de zéro
     à chaque morceau. On n'affiche que les dernières : au-delà, la liste
     pousserait la page vers le bas en pleine écoute. */
  var FIL_VISIBLE = 5;

  function rendreFil() {
    var etat = partie.etat;
    var boite = $('fil-propositions');
    if (!boite) return;

    var chat = (etat.tour && etat.tour.chat) || {};
    var lignes = Object.keys(chat).map(function (k) { return chat[k]; })
      .filter(function (m) { return m && m.mot; })
      .sort(function (a, b) { return (a.a || 0) - (b.a || 0); })
      .slice(-FIL_VISIBLE);

    boite.hidden = !lignes.length;
    boite.innerHTML = '';

    lignes.forEach(function (m) {
      var j = etat.joueurs[m.qui] || {};
      var li = document.createElement('li');
      li.innerHTML = '<span class="qui"></span> <span class="mot"></span>';
      li.querySelector('.qui').textContent = (j.emoji || '🎧') + ' ' + (j.nom || "Quelqu'un");
      etiqueter(li.querySelector('.qui'), j);
      // textContent et pas innerHTML : ce que tape un joueur reste du texte.
      li.querySelector('.mot').textContent = m.mot;
      boite.appendChild(li);
    });
  }

  function rendreScores() {
    var etat = partie.etat;
    var boite = $('tableau-scores');
    var tour = etat.tour || {};
    var trouve = tour.trouve || {};

    var joueurs = Object.keys(etat.joueurs).map(function (id) {
      return Object.assign({ id: id }, etat.joueurs[id]);
    }).sort(function (a, b) { return (b.score || 0) - (a.score || 0); });

    var maintenant = net.maintenant();
    boite.innerHTML = '';

    joueurs.forEach(function (j, i) {
      var absent = maintenant - (j.vuA || 0) > 45000;
      var f = trouve[j.id] || {};
      var marques = (f.titre ? '🎵' : '') + (f.artiste ? '🎤' : '');

      var l = document.createElement('div');
      l.className = 'ligne-score' + (j.id === partie.moi ? ' moi' : '') + (absent ? ' absent' : '');
      l.innerHTML = '<span class="rang"></span><span class="nom"></span>' +
                    '<span style="display:flex;gap:8px;align-items:center">' +
                    '<span class="etat"></span><span class="pts"></span></span>';
      l.querySelector('.rang').textContent = (i + 1);
      l.querySelector('.nom').textContent = (j.emoji || '🎧') + ' ' + (j.nom || 'Anonyme');
      etiqueter(l.querySelector('.nom'), j);
      l.querySelector('.etat').textContent = marques;
      l.querySelector('.pts').textContent = j.score || 0;
      boite.appendChild(l);
    });
  }

  /* « Artiste » -> « l'artiste », « Jeu » -> « le jeu », « Comédie musicale »
     -> « la comédie musicale ». Sert aux messages du genre « tu as trouvé… ». */
  function avecArticle(etiquette) {
    var e = (etiquette || 'Artiste').toLowerCase().split(' ou ')[0];
    if (/^[aeiouyéèêh]/.test(e)) return "l'" + e;
    if (/^(comédie|série|musique|bande)/.test(e)) return 'la ' + e;
    return 'le ' + e;
  }

  function info(texte, genre) {
    var b = $('info-saisie');
    b.textContent = texte || '';
    b.className = 'info-saisie' + (genre ? ' ' + genre : '');
  }

  function envolerPoints(gain) {
    var el = document.createElement('div');
    el.className = 'gain';
    el.textContent = '+' + gain;
    var r = $('champ-reponse').getBoundingClientRect();
    el.style.left = (r.left + r.width / 2) + 'px';
    el.style.top = (r.top - 12) + 'px';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  /* ================= fin de partie ================= */

  function rendreFin() {
    var etat = partie.etat;
    var joueurs = Object.keys(etat.joueurs).map(function (id) {
      return Object.assign({ id: id }, etat.joueurs[id]);
    }).sort(function (a, b) { return (b.score || 0) - (a.score || 0); });

    $('titre-fin').textContent = joueurs.length
      ? (joueurs[0].emoji || '🎧') + ' ' + (joueurs[0].nom || 'Anonyme') + ' remporte la manche'
      : 'Partie terminée';

    // Argent, or, bronze — mais on ne dessine que les marches réellement occupées.
    var marches = [
      { rang: 1, classe: 'argent' },
      { rang: 0, classe: 'or' },
      { rang: 2, classe: 'bronze' }
    ].filter(function (m) { return joueurs[m.rang]; });

    var podium = $('podium');
    podium.innerHTML = '';
    podium.style.gridTemplateColumns = 'repeat(' + marches.length + ', 1fr)';
    podium.style.maxWidth = marches.length === 1 ? '240px'
                          : marches.length === 2 ? '460px' : '';
    podium.style.marginInline = 'auto';

    marches.forEach(function (m) {
      var j = joueurs[m.rang];
      var d = document.createElement('div');
      d.className = 'marche ' + m.classe;
      d.innerHTML = '<div class="tete"></div><div class="qui"></div><div class="socle"></div>';
      d.querySelector('.tete').textContent = j.emoji || '🎧';
      d.querySelector('.qui').textContent = j.nom || 'Anonyme';
      etiqueter(d.querySelector('.qui'), j);
      d.querySelector('.socle').textContent = (j.score || 0) + ' pts';
      podium.appendChild(d);
    });

    var recap = $('recap');
    recap.innerHTML = '';
    historique.forEach(function (p, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="num"></span><span><span class="titre-piste"></span><br>' +
                     '<span class="artiste-piste"></span></span>';
      li.querySelector('.num').textContent = (i + 1);
      li.querySelector('.titre-piste').textContent = p.titre;
      li.querySelector('.artiste-piste').textContent = p.artiste;
      recap.appendChild(li);
    });

    rendreBilanAudio();
    majBoutonSacre();
    jouerSacre();
  }

  /* ================= aiguillage selon l'état ================= */

  function surEtat() {
    var etat = partie.etat;
    if (!etat.meta) return;

    if (etat.meta.statut === 'attente') {
      montrer('salon');
      rendreSalon();
      arreterExtrait();
    } else if (etat.meta.statut === 'jeu') {
      montrer('jeu');
      rendreJeu();
      // Barry sera prêt bien avant le podium.
      if (sacreVoulu()) trouverSacre();
    } else if (etat.meta.statut === 'fini') {
      montrer('fin');
      /* Cette branche est rejouée à chaque rafraîchissement du salon. Couper le
         son sans condition arrêtait Barry White au bout de quelques secondes,
         et jouerSacre() refusait ensuite de le relancer puisqu'il se croyait
         déjà lancé. */
      if (!sacreEnCours) arreterExtrait();
      rendreFin();
    }
  }

  function brancherPartie(s) {
    partie = s;
    historique = [];

    s.sur('etat', surEtat);

    s.sur('nouveauTour', function () {
      info('');
      $('champ-reponse').value = '';
      $('champ-reponse').disabled = false;
      champEtaitFerme = false;
      redonnerLaMain();
      $('pochette').classList.add('invisible');
      arreterExtrait();
    });

    s.sur('tic', function () {
      var etat = partie.etat;
      if (!etat.tour || !etat.meta || etat.meta.statut !== 'jeu') return;
      var piste = etat.pistes[etat.tour.index];

      // Mémorise ce qui est passé, pour le récap de fin.
      if (piste && etat.tour.phase === 'reveal' &&
          historique.indexOf(piste) === -1 &&
          !historique.some(function (p) { return p.apercu === piste.apercu; })) {
        historique.push(piste);
      }

      /* On prépare tout ce que le chef a déjà résolu, pas seulement le morceau
         suivant : le premier de la partie n'avait aucune avance et partait donc
         toujours en direct. */
      precharger(piste);
      for (var k = etat.tour.index + 1; k <= etat.tour.index + 3; k++) {
        precharger(etat.pistes[k]);
      }

      if (etat.tour.phase === 'ecoute' && piste && etat.tour.debutA) {
        /* « ended » : l'extrait dure 30 s et la manche aussi, donc il se termine
           un cheveu avant la révélation. Sans cette garde, on le relançait pour
           une fraction de seconde — un petit hoquet au bout de chaque manche. */
        if ((lecteur.paused && !lecteur.ended) || dernierePisteJouee !== piste.apercu) {
          jouerExtrait(piste, etat.tour.debutA);
        }
      }
      if (etat.tour.phase === 'attente') arreterExtrait();
      rendreScores();
    });

    // Garde le lien partageable dans la barre d'adresse.
    try {
      history.replaceState(null, '', location.pathname + '?salon=' + s.code);
    } catch (e) {}
  }

  /* ================= événements ================= */

  function poserEvenements() {

    $('bouton-emoji').addEventListener('click', function () {
      var boite = $('choix-avatars');
      boite.hidden = !boite.hidden;
      this.setAttribute('aria-expanded', String(!boite.hidden));
      if (!boite.hidden) rendreAvatars();
    });

    curseursSon().forEach(function (c) {
      c.addEventListener('input', function () {
        volume = parseInt(this.value, 10) / 100;
        if (volume > 0) volumeAvantCoupure = volume;
        appliquerVolume();
        sauverVolume();
      });
    });

    boutonsSon().forEach(function (b) {
      b.addEventListener('click', function () {
        volume = volume === 0 ? (volumeAvantCoupure || 0.8) : 0;
        appliquerVolume();
        sauverVolume();
      });
    });

    $('champ-code').addEventListener('input', function () {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    });

    $('bouton-creer').addEventListener('click', function () {
      amorcerAudio();
      erreurAccueil('');
      var p = sauverProfil();
      this.disabled = true;
      this.innerHTML = '<span class="chargement"></span> Ouverture…';
      var self = this;

      Jeu.creerSalon(net, p, reglagesActuels()).then(function (s) {
        noterJoueur(p);
        brancherPartie(s);
      }).catch(function (e) {
        erreurAccueil("Impossible de créer le salon : " + e.message);
      }).then(function () {
        self.disabled = false;
        self.textContent = 'Créer un salon';
      });
    });

    $('bouton-rejoindre').addEventListener('click', function () {
      amorcerAudio();
      erreurAccueil('');
      var code = $('champ-code').value.trim();
      if (code.length !== 4) { erreurAccueil('Le code fait 4 caractères.'); return; }
      var p = sauverProfil();
      this.disabled = true;
      this.innerHTML = '<span class="chargement"></span> Connexion…';
      var self = this;

      Jeu.rejoindreSalon(net, code, p).then(function (s) {
        noterJoueur(p);
        brancherPartie(s);
      }).catch(function (e) {
        erreurAccueil(e.message);
      }).then(function () {
        self.disabled = false;
        self.textContent = 'Rejoindre la partie';
      });
    });

    ['titres', 'duree', 'pause'].forEach(function (nom) {
      var curseur = $('reglage-' + nom);
      curseur.addEventListener('input', function () {
        $('valeur-' + nom).textContent = this.value;
      });
    });

    $('bouton-lancer').addEventListener('click', function () {
      amorcerAudio();
      this.disabled = true;
      this.innerHTML = '<span class="chargement"></span> Préparation des extraits…';
      noterPartie();
      partie.lancerPartie(mancheChoisie, reglagesActuels());
    });

    $('bouton-copier').addEventListener('click', function () {
      var lien = location.origin + location.pathname + '?salon=' + partie.code;
      var self = this;
      var fini = function () {
        self.textContent = 'Lien copié ✓';
        setTimeout(function () { self.textContent = 'Copier le lien'; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(lien).then(fini, fini);
      else { window.prompt('Copie ce lien :', lien); }
    });

    $('bouton-quitter').addEventListener('click', function () {
      if (partie) partie.quitter();
      partie = null;
      arreterExtrait();
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      montrer('accueil');
    });

    $('bouton-accueil').addEventListener('click', function () {
      if (partie) partie.quitter();
      partie = null;
      arreterExtrait();
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      montrer('accueil');
    });

    $('bouton-rejouer').addEventListener('click', function () {
      if (partie) partie.rejouer();
    });

    $('bouton-sacre').addEventListener('click', function () {
      var on = !sacreVoulu();
      try { localStorage.setItem('bt.sacre', on ? '1' : '0'); } catch (e) {}
      majBoutonSacre();
      if (on) jouerSacre(); else arreterSacre();
    });

    $('champ-reponse').addEventListener('focus', function () { clavierVoulu = true; });

    $('formulaire-reponse').addEventListener('submit', function (e) {
      e.preventDefault();
      var champ = $('champ-reponse');
      var texte = champ.value.trim();
      if (!texte || !partie) return;

      var res = partie.proposer(texte);
      champ.value = '';

      if (res.titre || res.artiste) {
        var quoi = [];
        if (res.titre) quoi.push(avecArticle($('label-titre').textContent));
        if (res.artiste) quoi.push(avecArticle($('label-artiste').textContent));
        var fanfare = res.titre && res.artiste ? ' 🎉🎉' : ' 🎉';
        info('Bravo, tu as trouvé ' + quoi.join(' et ') + ' ! +' + res.gain + fanfare, 'bien');
        envolerPoints(res.gain);
        rendreJeu();
      } else if (res.deja) {
        info('Tu as déjà tout trouvé sur ce titre 😎', 'raté');
      } else {
        info(RATES[Math.floor(Math.random() * RATES.length)], 'raté');
        var ligne = this;
        ligne.classList.remove('secoue');
        void ligne.offsetWidth;
        ligne.classList.add('secoue');
      }
    });

    // Sur mobile, un tap n'importe où débloque le son si le navigateur l'a coupé.
    document.addEventListener('click', function () {
      if (contexte && contexte.state === 'suspended') contexte.resume();
    });
  }

  function reglagesActuels() {
    var d = Config.partie;
    return {
      nbTitres: parseInt($('reglage-titres').value, 10) || d.nombreDeTitres,
      dureeExtrait: parseInt($('reglage-duree').value, 10) || d.dureeExtrait,
      dureeReponse: parseInt($('reglage-pause').value, 10) || d.dureeReponse,
      pointsTitre: d.pointsTitre,
      pointsArtiste: d.pointsArtiste,
      bonusDouble: d.bonusDouble,
      partVitesse: d.partVitesse
    };
  }

  /* ================= journal de bord (privé) =================

     Rien de tout ça ne s'affiche sur le site : c'est pour Audrey seule, qui
     le consulte sur `journal.html`. On garde trois choses :

       visites / visiteurs — combien de fois, et par combien de navigateurs
       joueurs/<id>        — un pseudo, sa première venue, sa dernière, son
                             nombre d'entrées en salon
       parties             — combien de parties ont été lancées

     Rangé sous `salons/` parce que c'est le seul endroit que les règles de la
     base autorisent à écrire. Un « salon » nommé `_prive` ne gêne personne :
     les vrais codes font quatre lettres, et rien ne parcourt la liste. */
  var JOURNAL = 'salons/_prive';

  function compterLaVisite(n) {
    if (!n || !n.incrementer) return;

    var nouveauVisiteur = false, nouvelleVisite = false;
    try {
      nouveauVisiteur = !localStorage.getItem('bt.vu');
      if (nouveauVisiteur) localStorage.setItem('bt.vu', '1');
      nouvelleVisite = !sessionStorage.getItem('bt.visite');
      if (nouvelleVisite) sessionStorage.setItem('bt.visite', '1');
    } catch (e) {
      // Navigation privée ou stockage bloqué : on compte la visite, sans plus.
      nouvelleVisite = true;
    }

    if (nouvelleVisite) sansBruit(n.incrementer(JOURNAL + '/visites'));
    if (nouveauVisiteur) sansBruit(n.incrementer(JOURNAL + '/visiteurs'));
  }

  /* Quelqu'un entre dans un salon : on note son pseudo. La même personne qui
     revient met à jour sa ligne au lieu d'en créer une nouvelle. */
  function noterJoueur(profil) {
    if (!net || !net.maj || !profil) return;
    var id = Jeu.identifiant();
    var chemin = JOURNAL + '/joueurs/' + id;

    sansBruit(net.lire(chemin).then(function (avant) {
      var maintenant = Date.now();
      return net.maj(chemin, {
        pseudo: profil.nom || 'Anonyme',
        emoji: profil.emoji || '',
        premiere: (avant && avant.premiere) || maintenant,
        derniere: maintenant,
        fois: ((avant && avant.fois) || 0) + 1
      });
    }));
  }

  function noterPartie() {
    if (!net || !net.incrementer) return;
    sansBruit(net.incrementer(JOURNAL + '/parties'));
  }

  /* Le journal ne doit jamais faire de vagues : s'il échoue, la partie
     continue comme si de rien n'était. */
  function sansBruit(promesse) {
    if (promesse && promesse.catch) promesse.catch(function () {});
  }

  /* ================= démarrage ================= */

  function demarrer() {
    $('accroche').textContent = ACCROCHES[Math.floor(Math.random() * ACCROCHES.length)];
    chargerVolume();
    chargerProfil();
    rendreManches();
    poserEvenements();
    boucle();

    $('reglage-titres').value = Config.partie.nombreDeTitres;
    $('valeur-titres').textContent = Config.partie.nombreDeTitres;
    $('reglage-duree').value = Config.partie.dureeExtrait;
    $('valeur-duree').textContent = Config.partie.dureeExtrait;
    $('reglage-pause').value = Config.partie.dureeReponse;
    $('valeur-pause').textContent = Config.partie.dureeReponse;

    Net.creer().then(function (n) {
      net = n;
      compterLaVisite(n);
      var banniere = $('banniere-mode');

      if (n.nom === 'local') {
        banniere.innerHTML = n.erreurFirebase
          ? '<span><b>Mode local (Firebase n\'a pas répondu).</b> ' + n.erreurFirebase + '</span>'
          : '<span><b>Mode local.</b> Tout marche, mais seuls les onglets de ce navigateur ' +
            'se voient entre eux. Pour jouer à distance, remplis <code>js/config.js</code> ' +
            '(voir le README).</span>';
        banniere.classList.remove('invisible');
      }

      // Lien d'invitation : on pré-remplit le code.
      var params = new URLSearchParams(location.search);
      var code = (params.get('salon') || '').toUpperCase();
      if (code.length === 4) {
        $('champ-code').value = code;
        $('champ-pseudo').focus();
      }
    }).catch(function (e) {
      erreurAccueil('Problème de connexion : ' + e.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
