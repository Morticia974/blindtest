/* game.js — le moteur de jeu.

   Il n'y a pas de maître du jeu : la partie s'enchaîne toute seule. Parmi les
   joueurs connectés, le plus ancien fait office de « chef d'orchestre » — c'est
   son navigateur qui prépare les extraits et fait avancer les manches. S'il
   ferme son onglet, le suivant reprend automatiquement le relais.

   Tout le monde se cale sur l'heure du serveur, donc tout le monde entend
   exactement le même passage au même moment, même en arrivant en retard. */

var Jeu = (function () {
  'use strict';

  var LETTRES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1 : ambigus à l'oral
  var AVANCE = 3;             // nombre d'extraits préparés d'avance
  var BATTEMENT = 15000;      // ms entre deux signes de vie
  var ESSAIS_PAR_PASSE = 4;   // morceaux tentés d'affilée avant de rendre la main
  var PAUSE_APRES_ECHEC = 6000; // ms avant de retenter quand le catalogue ne répond pas

  function codeAleatoire() {
    var s = '';
    for (var i = 0; i < 4; i++) s += LETTRES[Math.floor(Math.random() * LETTRES.length)];
    return s;
  }

  function identifiant() {
    try {
      var id = localStorage.getItem('bt.moi');
      if (id) return id;
      id = 'j' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('bt.moi', id);
      return id;
    } catch (e) {
      return 'j' + Math.random().toString(36).slice(2, 10);
    }
  }

  /* Points gagnés : la base, réduite au fur et à mesure que le temps passe. */
  function points(base, ecoule, dureeMs, partVitesse) {
    var r = Math.max(0, Math.min(1, ecoule / dureeMs));
    return Math.max(1, Math.round(base * (1 - partVitesse * r)));
  }

  /* ------------------------------------------------------------------
     Brouillage des réponses.

     Les fiches des morceaux transitent par Firebase, et chacun reçoit les
     suivantes en avance pour que le son parte sans attendre. Publiées en
     clair, il suffisait d'ouvrir la console du navigateur pour lire le titre
     et l'artiste pendant qu'on écoutait l'extrait.

     Ce n'est pas un coffre-fort : le site est entièrement public, donc la clé
     est forcément dans la page et quelqu'un qui sait lire du JavaScript finira
     par la retrouver. Ça ferme simplement la porte grande ouverte — on ne
     triche plus d'un coup d'œil.
     ------------------------------------------------------------------ */
  var POIVRE = 'ok-balance-le-son-papa';
  // Ce qui donne la réponse. Le reste (l'extrait, les étiquettes) reste lisible.
  var A_CACHER = ['titre', 'artiste', 'pochette', 'variantesTitre', 'variantesArtiste'];

  function graine(cle) {
    var h = 2166136261;
    for (var i = 0; i < cle.length; i++) {
      h = (h ^ cle.charCodeAt(i)) >>> 0;
      // h * 16777619, sans déborder des 32 bits
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h || 1;
  }

  function flux(h) {
    h ^= h << 13; h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;  h >>>= 0;
    return h || 1;
  }

  /* Texte UTF-8 <-> octets. encodeURIComponent/unescape est le vieux tour de
     passe-passe, mais c'est celui qui marche partout, vieux téléphones compris. */
  function brouiller(texte, cle) {
    var octets = unescape(encodeURIComponent(texte));
    var h = graine(cle), sortie = '';
    for (var i = 0; i < octets.length; i++) {
      h = flux(h);
      sortie += String.fromCharCode(octets.charCodeAt(i) ^ (h & 255));
    }
    return btoa(sortie);
  }

  function debrouiller(code64, cle) {
    var octets = atob(code64);
    var h = graine(cle), sortie = '';
    for (var i = 0; i < octets.length; i++) {
      h = flux(h);
      sortie += String.fromCharCode(octets.charCodeAt(i) ^ (h & 255));
    }
    return decodeURIComponent(escape(sortie));
  }

  /* ------------------------------------------------------------------
     Une session = un joueur dans un salon.
     ------------------------------------------------------------------ */
  function session(net, options) {
    var code = options.code;
    var moi = identifiant();
    var racine = 'salons/' + code;

    var etat = {
      code: code, moi: moi, connecte: false,
      meta: null, joueurs: {}, tour: null, pistes: {},
      jeSuisChef: false, erreur: null, souci: null
    };

    /* Une clé par morceau : deux titres identiques dans deux salons ne
       donnent pas le même brouillage, et on ne peut pas recopier d'un tour
       sur l'autre. */
    function cleDe(i) { return POIVRE + ':' + code + ':' + i; }

    function emballer(resolue, i) {
      var visible = {}, secret = {};
      Object.keys(resolue).forEach(function (k) {
        if (A_CACHER.indexOf(k) === -1) visible[k] = resolue[k];
        else secret[k] = resolue[k];
      });
      visible.x = brouiller(JSON.stringify(secret), cleDe(i));
      return visible;
    }

    function deballer(publiee, i) {
      if (!publiee || !publiee.x) return publiee;   // ancien format, ou déjà ouvert
      var p = {};
      Object.keys(publiee).forEach(function (k) { if (k !== 'x') p[k] = publiee[k]; });
      try {
        var secret = JSON.parse(debrouiller(publiee.x, cleDe(i)));
        Object.keys(secret).forEach(function (k) { p[k] = secret[k]; });
      } catch (e) {
        return publiee;
      }
      return p;
    }

    var ecouteurs = {};
    var desabonnements = [];
    var minuteurs = [];
    var motsTrouves = { titre: false, artiste: false };
    var dernierIndexVu = -1;
    var preparationEnCours = false;
    var attenteReprise = 0;     // avant cette heure, on ne resollicite pas le catalogue
    var reserve = [];   // morceaux de secours si un extrait est introuvable
    var curseurReserve = 0;

    /* ---------- petit émetteur d'événements ---------- */
    function sur(nom, cb) {
      (ecouteurs[nom] = ecouteurs[nom] || []).push(cb);
      return function () {
        var l = ecouteurs[nom], i = l.indexOf(cb);
        if (i >= 0) l.splice(i, 1);
      };
    }
    function emettre(nom, donnee) {
      (ecouteurs[nom] || []).forEach(function (cb) {
        try { cb(donnee); } catch (e) { console.error(e); }
      });
    }
    function rafraichir() { emettre('etat', etat); }

    /* ---------- qui est vraiment là ---------- */
    function joueursConnectes() {
      var maintenant = net.maintenant();
      return Object.keys(etat.joueurs)
        .map(function (id) { return Object.assign({ id: id }, etat.joueurs[id]); })
        .filter(function (j) { return maintenant - (j.vuA || 0) < BATTEMENT * 3; });
    }

    function calculerChef() {
      var vivants = joueursConnectes().sort(function (a, b) {
        return (a.rejointA || 0) - (b.rejointA || 0) || (a.id < b.id ? -1 : 1);
      });
      return vivants.length ? vivants[0].id : null;
    }

    /* ---------- préparation des extraits (chef seulement) ---------- */

    function preparerSuite() {
      if (!etat.jeSuisChef || !etat.meta || etat.meta.statut !== 'jeu') return;
      if (preparationEnCours) return;
      if (net.maintenant() < attenteReprise) return;   // on laisse le catalogue souffler

      var total = etat.meta.nbTitres;
      var depuis = etat.tour ? etat.tour.index : 0;
      var cible = -1;
      for (var i = depuis; i < Math.min(total, depuis + AVANCE); i++) {
        if (!etat.pistes[i]) { cible = i; break; }
      }
      if (cible === -1) return;

      preparationEnCours = true;
      resoudreEmplacement(cible).then(function (rempli) {
        preparationEnCours = false;

        if (rempli) {
          etat.souci = null;
          preparerSuite();   // un emplacement de vraiment rempli : on enchaîne
          return;
        }

        /* Rien n'a pu être résolu — catalogue injoignable, ou réserve épuisée.
           On NE se rappelle surtout pas tout de suite : c'est ce qui figeait la
           page. On repart du début de la réserve et on laisse le battement du
           chef retenter dans quelques secondes. */
        if (curseurReserve >= reserve.length) curseurReserve = 0;
        attenteReprise = net.maintenant() + PAUSE_APRES_ECHEC;
        etat.souci = 'catalogue lent, on réessaie…';
        rafraichir();
      });
    }

    /* Ce morceau a-t-il déjà été placé dans cette partie ? On compare l'extrait
       lui-même : deux entrées de playlist différentes peuvent tomber sur le même
       enregistrement chez Apple. */
    function dejaPassee(resolue) {
      return Object.keys(etat.pistes).some(function (k) {
        var p = etat.pistes[k];
        return p && p.apercu === resolue.apercu;
      });
    }

    /* Remplit l'emplacement i en piochant dans la réserve. On ne tente qu'un
       nombre limité de morceaux d'affilée : sinon un catalogue injoignable
       consomme toute la réserve en quelques secondes.
       Renvoie true si l'emplacement a bien été rempli. */
    function resoudreEmplacement(i, restants) {
      if (restants === undefined) restants = ESSAIS_PAR_PASSE;
      if (restants <= 0 || curseurReserve >= reserve.length) return Promise.resolve(false);

      var piste = reserve[curseurReserve++];
      return Itunes.resoudre(piste).then(function (resolue) {
        // Introuvable, ou déjà passé dans cette partie : on prend le suivant.
        // Le second cas compte : quand la réserve est épuisée on la reparcourt
        // depuis le début, et sans ce garde-fou un titre pourrait tomber deux fois.
        if (!resolue || !resolue.apercu || dejaPassee(resolue)) {
          return resoudreEmplacement(i, restants - 1);
        }
        etat.pistes[i] = resolue;
        return net.ecrire(racine + '/pistes/' + i, emballer(resolue, i))
                  .then(function () { return true; });
      }).catch(function () { return false; });
    }

    /* ---------- boucle du chef : fait avancer les manches ---------- */

    function battementChef() {
      if (!etat.jeSuisChef || !etat.meta) return;

      if (etat.meta.statut === 'jeu') preparerSuite();
      if (!etat.tour || etat.meta.statut !== 'jeu') return;

      var maintenant = net.maintenant();
      var t = etat.tour;
      var reglages = etat.meta;

      if (t.phase === 'attente') {
        // On attend que l'extrait de ce tour soit prêt, puis on lance l'écoute.
        if (etat.pistes[t.index]) {
          net.maj(racine + '/tour', { phase: 'ecoute', debutA: net.horodatage() });
        }
        return;
      }

      if (t.phase === 'ecoute' && t.debutA) {
        var finEcoute = t.debutA + reglages.dureeExtrait * 1000;
        var vivants = joueursConnectes();
        var tousOntTrouve = vivants.length > 0 && vivants.every(function (j) {
          var f = (t.trouve || {})[j.id];
          return f && f.titre && f.artiste;
        });
        if (maintenant >= finEcoute || tousOntTrouve) {
          net.maj(racine + '/tour', { phase: 'reveal', revealA: net.horodatage() });
        }
        return;
      }

      if (t.phase === 'reveal' && t.revealA) {
        if (maintenant >= t.revealA + reglages.dureeReponse * 1000) {
          var suivant = t.index + 1;
          if (suivant >= reglages.nbTitres) {
            net.maj(racine + '/meta', { statut: 'fini', finiA: net.horodatage() });
            net.maj(racine + '/tour', { phase: 'fini' });
          } else {
            net.ecrire(racine + '/tour', {
              index: suivant,
              phase: etat.pistes[suivant] ? 'ecoute' : 'attente',
              debutA: etat.pistes[suivant] ? net.horodatage() : null,
              trouve: null
            });
          }
        }
      }
    }

    /* ---------- actions du joueur ---------- */

    /* Le fil des propositions ratées : tout le salon voit ce que les autres
       ont tapé à côté. Il vit sous `tour`, qui est réécrit en entier à chaque
       morceau, donc il se vide tout seul et ne laisse aucun historique. */
    function publierAuFil(texte) {
      var mot = String(texte || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      if (!mot) return;
      var envoi = {};
      envoi[String(net.maintenant()) + '-' + moi] = { qui: moi, mot: mot, a: net.maintenant() };
      Promise.resolve(net.maj(racine + '/tour/chat', envoi))
        .catch(function () {});
    }

    /* Soumet une proposition. Renvoie ce qui vient d'être trouvé. */
    function proposer(texte) {
      var vide = { titre: false, artiste: false, deja: false };
      if (!etat.tour || etat.tour.phase !== 'ecoute') return vide;
      var piste = etat.pistes[etat.tour.index];
      if (!piste) return vide;

      // Manche « solo » : une seule réponse compte. `solo` dit laquelle —
      // 'titre' pour le Club Dorothée (le dessin animé), 'artiste' pour les
      // animes (le nom de l'anime). L'autre champ n'est ni demandé ni compté.
      var solo = piste.solo || null;

      var res = Match.evaluer(texte, piste);

      /* Rien de juste : la proposition part dans le fil commun. Ce test vient
         AVANT celui du joueur qui a déjà tout trouvé, pour qu'une bonne réponse
         retapée une deuxième fois ne s'affiche jamais et ne vende la mèche.

         `contientReponse` est la ceinture de sécurité : si la bonne réponse est
         écrite quelque part dans la phrase, on se tait, même quand le jeu n'a
         pas su la compter. Le pire des cas devient « ça n'a pas marché »,
         jamais « tout le monde a vu la réponse ». */
      if (!res.titre && !res.artiste) {
        if (!Match.contientReponse(texte, piste)) publierAuFil(texte);
        return vide;
      }

      if (motsTrouves.titre && motsTrouves.artiste) return { titre: false, artiste: false, deja: true };

      var gagneTitre = res.titre && !motsTrouves.titre && solo !== 'artiste';
      var gagneArtiste = res.artiste && !motsTrouves.artiste && solo !== 'titre';
      if (!gagneTitre && !gagneArtiste) return vide;

      var reglages = etat.meta;
      var ecoule = net.maintenant() - (etat.tour.debutA || net.maintenant());
      var dureeMs = reglages.dureeExtrait * 1000;
      var gain = 0;

      if (gagneTitre) {
        motsTrouves.titre = true;
        gain += points(reglages.pointsTitre, ecoule, dureeMs, reglages.partVitesse);
      }
      if (gagneArtiste) {
        motsTrouves.artiste = true;
        gain += points(reglages.pointsArtiste, ecoule, dureeMs, reglages.partVitesse);
      }

      if (solo) {
        // Une seule réponse, mais elle vaut autant qu'une manche complète :
        // sinon le Grand mélange donnerait moins de points sur ces morceaux.
        motsTrouves.titre = true;
        motsTrouves.artiste = true;
        gain += points(solo === 'titre' ? reglages.pointsArtiste : reglages.pointsTitre,
                       ecoule, dureeMs, reglages.partVitesse)
              + reglages.bonusDouble;
      } else if (motsTrouves.titre && motsTrouves.artiste) {
        gain += reglages.bonusDouble;
      }

      var scoreActuel = (etat.joueurs[moi] && etat.joueurs[moi].score) || 0;
      net.maj(racine + '/joueurs/' + moi, { score: scoreActuel + gain });
      net.maj(racine + '/tour/trouve/' + moi, {
        titre: motsTrouves.titre, artiste: motsTrouves.artiste, a: net.maintenant()
      });

      return { titre: gagneTitre, artiste: gagneArtiste, gain: gain, deja: false };
    }

    function lancerPartie(manche, reglages) {
      var graine = Math.floor(Math.random() * 1e9);
      var nb = reglages.nbTitres;
      reserve = Playlists.tirage(manche, nb + 12, graine); // marge pour les introuvables
      curseurReserve = 0;
      etat.pistes = {};

      return net.ecrire(racine + '/pistes', null).then(function () {
        return net.maj(racine + '/meta', Object.assign({
          statut: 'jeu', manche: manche, graine: graine, lanceA: net.horodatage()
        }, reglages));
      }).then(function () {
        return net.ecrire(racine + '/tour', { index: 0, phase: 'attente', trouve: null });
      });
    }

    function rejouer() {
      var remises = {};
      Object.keys(etat.joueurs).forEach(function (id) { remises[id + '/score'] = 0; });
      return net.maj(racine + '/joueurs', remises).then(function () {
        return net.maj(racine + '/meta', { statut: 'attente' });
      }).then(function () {
        return net.ecrire(racine + '/tour', null);
      });
    }

    function quitter() {
      // Dernier à partir : on éteint la lumière, le salon entier disparaît.
      var dernier = joueursConnectes().length <= 1;
      desabonnements.forEach(function (f) { try { f(); } catch (e) {} });
      minuteurs.forEach(clearInterval);
      net.supprimer(dernier ? racine : racine + '/joueurs/' + moi);
    }

    /* ---------- branchement ---------- */

    function brancher(profil) {
      net.aLaDeconnexion(racine + '/joueurs/' + moi);

      return net.maj(racine + '/joueurs/' + moi, {
        nom: profil.nom, emoji: profil.emoji,
        // La couleur voyage avec le pseudo : tout le salon la voit.
        couleur: profil.couleur || null,
        score: (etat.joueurs[moi] && etat.joueurs[moi].score) || 0,
        rejointA: (etat.joueurs[moi] && etat.joueurs[moi].rejointA) || net.maintenant(),
        vuA: net.maintenant()
      }).then(function () {
        desabonnements.push(net.ecouter(racine + '/meta', function (v) {
          etat.meta = v; recalculer(); rafraichir();
        }));
        desabonnements.push(net.ecouter(racine + '/joueurs', function (v) {
          etat.joueurs = v || {}; recalculer(); rafraichir();
        }));
        desabonnements.push(net.ecouter(racine + '/tour', function (v) {
          var avant = etat.tour;
          etat.tour = v;
          if (v && v.index !== dernierIndexVu) {
            dernierIndexVu = v.index;
            motsTrouves = { titre: false, artiste: false };
            emettre('nouveauTour', v);
          }
          if (v && avant && avant.phase !== v.phase) emettre('phase', v.phase);
          recalculer(); rafraichir();
        }));
        desabonnements.push(net.ecouter(racine + '/pistes', function (v) {
          var recues = v || {}, ouvertes = {};
          Object.keys(recues).forEach(function (k) { ouvertes[k] = deballer(recues[k], k); });
          etat.pistes = ouvertes;
          rafraichir();
        }));

        etat.connecte = true;

        minuteurs.push(setInterval(function () {
          net.maj(racine + '/joueurs/' + moi, { vuA: net.maintenant() });
        }, BATTEMENT));

        minuteurs.push(setInterval(function () {
          recalculer();
          battementChef();
          emettre('tic', etat);
        }, 500));

        rafraichir();
      });
    }

    function recalculer() {
      etat.jeSuisChef = calculerChef() === moi;
    }

    return {
      etat: etat, moi: moi, code: code,
      sur: sur, brancher: brancher, proposer: proposer,
      lancerPartie: lancerPartie, rejouer: rejouer, quitter: quitter,
      motsTrouves: function () { return motsTrouves; },
      joueursConnectes: joueursConnectes
    };
  }

  /* ------------------------------------------------------------------
     Création / arrivée dans un salon
     ------------------------------------------------------------------ */

  function creerSalon(net, profil, reglages) {
    var code = codeAleatoire();
    return net.reserver('salons/' + code + '/meta', Object.assign({
      cree: net.maintenant(), statut: 'attente', manche: 'melange'
    }, reglages)).then(function (ok) {
      if (!ok) return creerSalon(net, profil, reglages); // code déjà pris, on retire
      var s = session(net, { code: code });
      return s.brancher(profil).then(function () { return s; });
    });
  }

  function rejoindreSalon(net, code, profil) {
    code = String(code || '').toUpperCase().trim();
    return net.lire('salons/' + code + '/meta').then(function (meta) {
      if (!meta) throw new Error("Ce salon n'existe pas. Vérifie le code.");
      var s = session(net, { code: code });
      return s.brancher(profil).then(function () { return s; });
    });
  }

  return {
    creerSalon: creerSalon,
    rejoindreSalon: rejoindreSalon,
    codeAleatoire: codeAleatoire,
    identifiant: identifiant,
    points: points
  };
})();
