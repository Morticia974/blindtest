/* app.js — l'interface et le son.

   Assemble tout : les écrans, le lecteur audio calé sur l'heure du serveur,
   le visualiseur qui réagit vraiment à la musique, et la saisie des réponses. */

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var EMOJIS = ['🎤','🎧','🎸','🥁','🎹','🎺','🕺','💃','🦩','🐙','🦊','🐸','👽','🤖','🍕','🌮','⚡','🌈','🔥','🦄'];

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
  var profil = { nom: '', emoji: '🎤' };
  var mancheChoisie = 'melange';
  var historique = [];        // les extraits déjà passés, pour le récap final
  var dernierePisteJouee = null;

  /* ================= écrans ================= */

  function montrer(nom) {
    ['accueil', 'salon', 'jeu', 'fin'].forEach(function (e) {
      $('ecran-' + e).classList.toggle('actif', e === nom);
    });
    window.scrollTo(0, 0);
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
    $('champ-pseudo').value = profil.nom || '';
    $('bouton-emoji').textContent = profil.emoji;
  }

  function sauverProfil() {
    profil.nom = ($('champ-pseudo').value || '').trim().slice(0, 18) || 'Anonyme';
    try { localStorage.setItem('bt.profil', JSON.stringify(profil)); } catch (e) {}
    return profil;
  }

  /* ================= audio ================= */

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

    var b = $('bouton-muet');
    b.textContent = volume === 0 ? '🔇' : (volume < 0.34 ? '🔈' : (volume < 0.7 ? '🔉' : '🔊'));
    b.setAttribute('aria-label', volume === 0 ? 'Remettre le son' : 'Couper le son');
    b.setAttribute('title', volume === 0 ? 'Remettre le son' : 'Couper le son');
    $('curseur-volume').value = Math.round(volume * 100);
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

  /* Cale la lecture sur l'heure du salon : un retardataire tombe au bon endroit. */
  function jouerExtrait(piste, debutA) {
    if (!piste || !piste.apercu) return;
    var position = Math.max(0, (net.maintenant() - debutA) / 1000);

    if (dernierePisteJouee !== piste.apercu) {
      dernierePisteJouee = piste.apercu;
      lecteur.src = piste.apercu;
      lecteur.load();
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

  function rendreManches() {
    var grille = $('grille-manches');
    grille.innerHTML = '';

    var choix = [{
      id: 'melange', emoji: '🎲', nom: 'Grand mélange',
      desc: 'Un peu de tout, toutes époques.'
    }].concat(Playlists.manches);

    choix.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vignette-manche';
      b.setAttribute('aria-pressed', String(m.id === mancheChoisie));
      b.innerHTML = '<span class="emoji">' + m.emoji + '</span>' +
                    '<span class="nom"></span><span class="desc"></span>';
      b.querySelector('.nom').textContent = m.nom;
      b.querySelector('.desc').textContent = m.desc;
      b.addEventListener('click', function () {
        mancheChoisie = m.id;
        if (partie) net.maj('salons/' + partie.code + '/meta', { manche: m.id });
        rendreManches();
      });
      grille.appendChild(b);
    });
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
      rendreManches();
    }

    var note = $('note-chef');
    if (!etat.jeSuisChef) {
      note.innerHTML = "<span><b>C'est l'hôte qui lance la partie.</b> " +
        "Tu peux quand même regarder la playlist choisie — installe-toi, ça va commencer.</span>";
      note.classList.remove('invisible');
      $('bouton-lancer').disabled = true;
      $('bouton-lancer').textContent = 'En attente de l\'hôte…';
    } else {
      note.classList.add('invisible');
      $('bouton-lancer').disabled = false;
      $('bouton-lancer').textContent = 'Lancer la partie';
    }
  }

  /* ================= rendu du jeu ================= */

  function rendreJeu() {
    var etat = partie.etat;
    var tour = etat.tour;
    if (!tour || !etat.meta) return;

    var piste = etat.pistes[tour.index];
    var trouves = partie.motsTrouves();

    $('compteur-manche').textContent = 'Titre ' + (tour.index + 1) + ' / ' + etat.meta.nbTitres;
    var m = Playlists.parId(etat.meta.manche);
    $('nom-manche').textContent = m ? m.emoji + ' ' + m.nom : '🎲 Grand mélange';
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
    if (fini) $('champ-reponse').blur();

    rendreScores();
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
    } else if (etat.meta.statut === 'fini') {
      montrer('fin');
      arreterExtrait();
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

      if (etat.tour.phase === 'ecoute' && piste && etat.tour.debutA) {
        if (lecteur.paused || dernierePisteJouee !== piste.apercu) {
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
      var i = EMOJIS.indexOf(profil.emoji);
      profil.emoji = EMOJIS[(i + 1) % EMOJIS.length];
      this.textContent = profil.emoji;
    });

    $('curseur-volume').addEventListener('input', function () {
      volume = parseInt(this.value, 10) / 100;
      if (volume > 0) volumeAvantCoupure = volume;
      appliquerVolume();
      sauverVolume();
    });

    $('bouton-muet').addEventListener('click', function () {
      volume = volume === 0 ? (volumeAvantCoupure || 0.8) : 0;
      appliquerVolume();
      sauverVolume();
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
