/* verif.js — le banc d'essai des pages de vérification.

   Ces pages ne sont pas le jeu : elles servent à passer le catalogue en revue,
   morceau par morceau, sans dépendre du hasard d'une partie. Pour chaque
   morceau on peut écouter l'extrait, entendre la réponse telle que le site la
   dit, et lui répondre à la voix ou au clavier pour voir ce qui est accepté.

   Tout ce qui juge une réponse vient d'ailleurs : `match.js` est celui du jeu,
   chargé tel quel, et les règles de langue sont recopiées de `app.js` au
   moment où ces pages sont fabriquées. Ce qui est vérifié ici est donc bien ce
   qui tourne en partie. */

(function () {
  'use strict';

  /* ============================================================
     Recopié de app.js — ne pas modifier ici, mais là-bas.
     ============================================================ */

  /* « et » n'est pas dans la liste : la normalisation le fabrique à partir de
     « & » et de « feat. », et il faisait passer « Daft Punk feat. Pharrell
     Williams » pour du français. */
  var MOTS_FR = ('la il ils elles ne se ce tout tous toute toutes quand sous entre ' +
    'depuis car donc puis aussi trop chaque autre autres quelque quelques personne ' +
    'le les un une des du de au aux dans sur pour avec sans mon ma mes ton ta tes ' +
    'sa ses notre votre leur je tu elle nous vous qui que quoi est sont etait suis ont pas plus ' +
    'rien tres mais comme encore toujours jamais etre avoir fait vais bien deja apres avant chez ' +
    'vers meme cette ces cet toi moi lui oui non faut veux veut peux peut sais sait aime coeur ' +
    'amour vie nuit jour temps monde ciel soleil chanson danse petit petite grand grande belle ' +
    'beau ete pere mere enfant femme homme roi reine rue ville pays').split(' ');
  var MOTS_EN = ('the of in to for with and you your my we they is are was be do dont cant this ' +
    'that love heart night girl boy baby never always all like get got want know time way life ' +
    'man world she he her his from out about into gonna wanna feel make take come go back down ' +
    'up just only now here there why how what who when where its im ive youre wont aint').split(' ');

  function indices(brut) {
    var t = Match.normaliser(brut);
    var fr = 0, en = 0;
    t.split(' ').forEach(function (m) {
      if (MOTS_FR.indexOf(m) !== -1) fr++;
      if (MOTS_EN.indexOf(m) !== -1) en++;
    });
    if (/[àâéèêëîïôùûüÿçœæ]/i.test(brut)) fr += 3;
    if (/(eau\b|oux\b|ais\b|ez\b|aient\b)/.test(t)) fr += 1;
    if (/(th|wh|oo|ee|ck|sh|ing$|ight|w)/.test(t)) en += 1;
    return { fr: fr, en: en };
  }

  var LANGUES = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', pt: 'pt-BR', de: 'de-DE', it: 'it-IT', ja: 'ja-JP' };

  function codeLangue(x) {
    if (!x) return '';
    var k = String(x).toLowerCase();
    return LANGUES[k] || (k.indexOf('-') !== -1 ? x : '');
  }

  function langueDe(texte, defaut, appui) {
    var n = indices(String(texte || ''));
    if (n.en > n.fr) return 'en-US';
    if (n.fr > n.en) return 'fr-FR';
    if (appui) {
      var m = indices(String(appui));
      if (m.fr > m.en) return 'fr-FR';
      if (m.en - m.fr >= 2) return 'en-US';
    }
    return defaut === 'en' ? 'en-US' : 'fr-FR';
  }

  function partiesDeRevelation(p) {
    var solo = p.solo || null;
    var oeuvre = !/artiste/i.test(p.labelA || 'Artiste');
    var debut = { t: "C'était", l: 'fr-FR' };
    var d = p.langue || 'fr';
    function lgT() { return codeLangue(p.lgT) || langueDe(p.titre, d, p.artiste); }
    function lgA() { return codeLangue(p.lgA) || langueDe(p.artiste, d, p.titre); }
    var dT = p.ditT || p.titre;
    var dA = p.ditA || p.artiste;

    if (solo === 'artiste') return [debut, { t: dA, l: lgA() }];
    if (solo === 'titre') return [debut, { t: dT, l: lgT() }];
    if (oeuvre) {
      if (Match.normaliser(dT) === Match.normaliser(dA)) return [debut, { t: dA, l: lgA() }];
      return [debut, { t: dA, l: lgA() },
              { t: 'Musique :', l: 'fr-FR' }, { t: dT, l: lgT() }];
    }
    return [debut, { t: dT, l: lgT() },
            { t: 'de', l: 'fr-FR' }, { t: dA, l: lgA() }];
  }

  function voixPour(langue) {
    var dispo = window.speechSynthesis.getVoices() || [];
    var court = String(langue).slice(0, 2).toLowerCase();
    for (var i = 0; i < dispo.length; i++) {
      if (dispo[i].lang && dispo[i].lang.slice(0, 2).toLowerCase() === court) return dispo[i];
    }
    return null;
  }

  /* Les réponses acceptées, exactement comme `habiller` les construit dans
     itunes.js : celles de la playlist, celles d'Apple, et les variantes
     écrites à la main. */
  function variantesDe(p) {
    var vT = Match.variantesTitre(p.t).concat(Match.variantesTitre(p.at || ''));
    var vA = Match.variantesArtiste(p.a);
    if (!p.strict && p.aa) {
      if (Match.correspond(p.aa, vA)) vA = vA.concat(Match.variantesArtiste(p.aa));
      else { var entier = Match.normaliser(p.aa); if (entier) vA.push(entier); }
    }
    (p.altT || []).forEach(function (x) { vT = vT.concat(Match.variantesTitre(x)); });
    (p.altA || []).forEach(function (x) { vA = vA.concat(Match.variantesArtiste(x)); });
    return { titre: p.t, artiste: p.a, variantesTitre: vT, variantesArtiste: vA };
  }

  /* « Réponse, c'est Muse » : l'amorce ne fait pas partie de la réponse. */
  function sansAmorce(texte) {
    return String(texte).replace(/^\s*(?:c(?:'|’)?\s*est|ca\s+doit\s+etre|ça\s+doit\s+être)\s+/i, '').trim();
  }

  /* ============================================================
     Le banc d'essai
     ============================================================ */

  function dire(parties) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    parties.forEach(function (p) {
      if (!String(p.t || '').trim()) return;
      var u = new SpeechSynthesisUtterance(String(p.t));
      u.lang = p.l || 'fr-FR';
      var v = voixPour(u.lang);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    });
  }

  function classeReco() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  /* Ce que le jeu compte comme trouvé pour cette catégorie. */
  function verdictDe(p, res) {
    if (p.sol === 'artiste') return res.artiste ? [p.lab || 'la réponse'] : [];
    if (p.sol === 'titre') return res.titre ? ['le titre'] : [];
    var out = [];
    if (res.titre) out.push('le titre');
    if (res.artiste) out.push("l'artiste");
    return out;
  }

  function essayer(p, texte, aLaVoix, ou) {
    var piste = variantesDe(p);
    var essais = [String(texte).trim()];
    var court = sansAmorce(texte);
    if (court && court !== essais[0]) essais.push(court);

    var res = { titre: false, artiste: false };
    essais.forEach(function (x) {
      var r = Match.evaluer(x, piste, { voix: !!aLaVoix });
      res.titre = res.titre || r.titre;
      res.artiste = res.artiste || r.artiste;
    });

    var trouve = verdictDe(p, res);
    ou.className = 'verdict ' + (trouve.length ? 'bon' : 'rate');
    ou.textContent = (aLaVoix ? 'Entendu « ' + texte + ' » : ' : '« ' + texte + ' » : ') +
      (trouve.length ? '✅ ' + trouve.join(' et ') : '❌ refusé');
  }

  function brancher(carte, p) {
    var verdict = carte.querySelector('.verdict');

    var bDire = carte.querySelector('.b-dire');
    if (bDire) {
      bDire.addEventListener('click', function () {
        dire(partiesDeRevelation({
          titre: p.t, artiste: p.a, solo: p.sol, labelA: p.lab, langue: p.langue,
          lgT: p.lgT, lgA: p.lgA, ditT: p.ditT, ditA: p.ditA
        }));
      });
    }

    var champ = carte.querySelector('.b-texte');
    if (champ) {
      champ.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Enter' || !champ.value.trim()) return;
        ev.preventDefault();
        essayer(p, champ.value.trim(), false, verdict);
        champ.value = '';
      });
    }

    var bMicro = carte.querySelector('.b-micro');
    if (!bMicro) return;
    var Classe = classeReco();
    if (!Classe) { bMicro.disabled = true; bMicro.textContent = '🎙️ micro indisponible'; return; }

    bMicro.addEventListener('click', function () {
      if (window.__reco) { try { window.__reco.abort(); } catch (e) {} window.__reco = null; }
      var r = new Classe();
      window.__reco = r;
      r.lang = 'fr-FR';
      r.continuous = false;
      r.interimResults = false;
      r.maxAlternatives = 5;
      bMicro.classList.add('ecoute');
      bMicro.textContent = '🎙️ j\'écoute…';
      verdict.className = 'verdict';
      verdict.textContent = '';

      r.onresult = function (ev) {
        var resultat = ev.results[ev.results.length - 1];
        var dits = [];
        for (var i = 0; i < resultat.length; i++) {
          var x = String(resultat[i].transcript || '').trim();
          if (x && dits.indexOf(x) === -1) dits.push(x);
        }
        if (!dits.length) return;

        /* Comme en partie : toutes les transcriptions d'une même phrase sont
           essayées, et la première qui tombe juste gagne. */
        var piste = variantesDe(p);
        for (var k = 0; k < dits.length; k++) {
          var rr = Match.evaluer(sansAmorce(dits[k]), piste, { voix: true });
          if (rr.titre || rr.artiste) { essayer(p, dits[k], true, verdict); return; }
        }
        essayer(p, dits[0], true, verdict);
      };
      r.onerror = function (ev) {
        verdict.className = 'verdict rate';
        verdict.textContent = 'micro : ' + ev.error;
      };
      r.onend = function () {
        bMicro.classList.remove('ecoute');
        bMicro.textContent = '🎙️ Répondre à la voix';
        if (window.__reco === r) window.__reco = null;
      };
      try { r.start(); } catch (e) {}
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    var cartes = document.querySelectorAll('.piste');
    for (var i = 0; i < cartes.length; i++) {
      var p = (window.PISTES || [])[Number(cartes[i].getAttribute('data-i'))];
      if (p) brancher(cartes[i], p);
    }
    /* Les voix arrivent parfois après la page : sans ça, la première réponse
       dite sort avec la voix par défaut du navigateur. */
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  });
})();
