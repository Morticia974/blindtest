/* match.js — correction automatique des réponses.
   Tolérant aux fautes de frappe, aux accents et aux mentions parasites
   des titres iTunes ("(Radio Edit)", "- 2011 Remaster", "feat. X"...). */

var Match = (function () {
  'use strict';

  // Mentions qu'iTunes colle aux titres et qui ne font pas partie de la réponse.
  var BRUIT = /\b(radio edit|single version|album version|remaster(ed)?|remasterise|version remasterisee|live|en concert|bonus track|deluxe|edition|mono|stereo|explicit|clean|extended|instrumental|karaoke|cover|reprise|bande originale|from ["'«].*?["'»]|original motion picture soundtrack|soundtrack|theme|generique)\b/g;

  var ARTICLES = /^(le|la|les|l|un|une|des|du|de|the|a|an)\s+/;

  function sansAccents(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* Ramène une chaîne à sa forme comparable : minuscules, sans accents,
     sans ponctuation, espaces tassés. */
  function normaliser(s) {
    if (!s) return '';
    var t = sansAccents(String(s).toLowerCase());
    t = t.replace(/&/g, ' et ');
    t = t.replace(/\+/g, ' et ');
    t = t.replace(/\bft\.?\b|\bfeat\.?\b|\bfeaturing\b|\bavec\b/g, ' et ');
    t = t.replace(/[’`´]/g, "'");
    t = t.replace(/[^a-z0-9']+/g, ' ');
    t = t.replace(/'/g, '');
    return t.replace(/\s+/g, ' ').trim();
  }

  /* Retire les parenthèses, crochets et suffixes après tiret qui ne contiennent
     que du bruit éditorial. "One More Time (Radio Edit)" -> "One More Time" */
  function degraisser(titre) {
    if (!titre) return '';
    var t = String(titre);

    t = t.replace(/[\(\[\{]([^\)\]\}]*)[\)\]\}]/g, function (tout, dedans) {
      var n = normaliser(dedans);
      return n && !BRUIT.test(' ' + n + ' ') && !/^et\s/.test(n) ? tout : ' ';
    });
    BRUIT.lastIndex = 0;

    var morceaux = t.split(/\s+-\s+/);
    if (morceaux.length > 1) {
      var gardes = [morceaux[0]];
      for (var i = 1; i < morceaux.length; i++) {
        var n = normaliser(morceaux[i]);
        BRUIT.lastIndex = 0;
        if (n && !BRUIT.test(' ' + n + ' ')) gardes.push(morceaux[i]);
        BRUIT.lastIndex = 0;
      }
      t = gardes.join(' - ');
    }
    return t.replace(/\s+/g, ' ').trim();
  }

  /* Distance de Levenshtein, abandonnée dès qu'elle dépasse `plafond`
     (inutile de calculer la distance exacte entre deux chaînes sans rapport). */
  function distance(a, b, plafond) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > plafond) return plafond + 1;
    var precedente = [], courante = [], i, j;
    for (j = 0; j <= b.length; j++) precedente[j] = j;
    for (i = 1; i <= a.length; i++) {
      courante[0] = i;
      var meilleureLigne = i;
      for (j = 1; j <= b.length; j++) {
        var cout = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        courante[j] = Math.min(courante[j - 1] + 1, precedente[j] + 1, precedente[j - 1] + cout);
        if (courante[j] < meilleureLigne) meilleureLigne = courante[j];
      }
      if (meilleureLigne > plafond) return plafond + 1;
      precedente = courante.slice();
    }
    return precedente[b.length];
  }

  // Plus la bonne réponse est longue, plus on pardonne de fautes de frappe.
  function tolerance(n) {
    if (n <= 3) return 0;
    if (n <= 6) return 1;
    if (n <= 11) return 2;
    if (n <= 18) return 3;
    return 4;
  }

  /* Toutes les formes acceptables d'un titre. */
  function variantesTitre(titre) {
    var out = {};
    var base = normaliser(degraisser(titre));
    var complet = normaliser(titre);
    if (base) out[base] = 1;
    if (complet) out[complet] = 1;
    if (base) {
      var sansArticle = base.replace(ARTICLES, '');
      if (sansArticle && sansArticle.length >= 3) out[sansArticle] = 1;
      // Titre débarrassé de TOUTES ses parenthèses, même porteuses de sens :
      // "(I Can't Get No) Satisfaction" -> "satisfaction"
      var sansParentheses = normaliser(
        String(titre).replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, ' '));
      if (sansParentheses && sansParentheses.length >= 4) out[sansParentheses] = 1;
      // "Les Rois du monde" -> accepte aussi la partie avant les deux-points
      var avantDeuxPoints = normaliser(degraisser(String(titre).split(/\s*:\s*/)[0]));
      if (avantDeuxPoints && avantDeuxPoints.length >= 3) out[avantDeuxPoints] = 1;
    }
    return Object.keys(out);
  }

  /* Toutes les formes acceptables d'un nom d'artiste : le nom complet, mais
     aussi chaque membre d'un duo et le nom sans article ("The Beatles" -> "beatles"). */
  function variantesArtiste(artiste) {
    var out = {};
    var complet = normaliser(artiste);
    if (complet) out[complet] = 1;
    var sansArticle = complet.replace(ARTICLES, '');
    if (sansArticle && sansArticle.length >= 3) out[sansArticle] = 1;

    /* On sépare les artistes multiples — « Jane Birkin & Serge Gainsbourg » —
       mais SURTOUT PAS sur le mot « et » : il fait partie de quantité de titres
       d'œuvres. Sans cette précaution, « La Belle et la Bête » se découpait en
       « la belle » / « la bête », et répondre « La Belle et le Clochard » était
       accepté. Les vrais duos utilisent « & » ou une virgule. */
    String(artiste).split(/\s*(?:&|,|\/|\bfeat\.?\b|\bft\.?\b|\bwith\b|\bx\b)\s*/i)
      .forEach(function (part) {
        var n = normaliser(part);
        if (n && n.length >= 3) {
          out[n] = 1;
          var sa = n.replace(ARTICLES, '');
          if (sa && sa.length >= 3) out[sa] = 1;
          // Nom de famille seul pour chaque membre d'un duo : on dit
          // « Gainsbourg », pas « Serge Gainsbourg ».
          var m = n.split(' ');
          if (m.length === 2 && m[1].length >= 4) out[m[1]] = 1;
        }
      });

    // Nom de famille seul pour les artistes en deux mots ("Michael Jackson" -> "jackson")
    var mots = complet.split(' ');
    if (mots.length === 2 && mots[1].length >= 4) out[mots[1]] = 1;

    return Object.keys(out);
  }

  /* Une proposition est-elle acceptée pour l'une de ces variantes ? */
  function correspond(proposition, variantes) {
    var g = normaliser(proposition);
    if (!g || g.length < 2) return false;
    for (var i = 0; i < variantes.length; i++) {
      var v = variantes[i];
      if (!v) continue;
      if (g === v) return true;
      var tol = tolerance(v.length);
      if (tol > 0 && distance(g, v, tol) <= tol) return true;
      // Réponse partielle mais franche : "bohemian" pour "bohemian rhapsody"
      if (v.length >= 10 && g.length >= Math.ceil(v.length * 0.6) && v.indexOf(g) === 0) return true;
    }
    return false;
  }

  // Petits mots de liaison qu'on laisse tomber entre les deux moitiés d'une
  // réponse groupée : "Cendrillon par Téléphone", "Africa de Toto".
  var LIAISONS = { par: 1, by: 1, de: 1, du: 1, des: 1, d: 1, c: 1, cest: 1, et: 1 };

  /* Cette moitié représente-t-elle l'essentiel de la réponse tapée ? */
  function pese(moitie, tout) {
    return normaliser(moitie).length >= normaliser(tout).length * 0.55;
  }

  /* Le joueur a tout tapé d'un coup : "Danza Kuduro Don Omar", ou l'inverse.
     On essaie chaque découpe possible entre deux mots, dans les deux sens.
     Renvoie ce qui a été reconnu, ou null si aucune découpe ne donne rien. */
  function decouper(proposition, vTitre, vArtiste) {
    var mots = normaliser(proposition).split(' ').filter(Boolean);
    if (mots.length < 2) return null;

    var partiel = null;

    for (var i = 1; i < mots.length; i++) {
      var gauche = mots.slice(0, i).join(' ');

      // La moitié droite commence après la découpe — ou juste après le mot de
      // liaison, s'il y en a un.
      var departs = [i];
      if (LIAISONS[mots[i]] && i + 1 < mots.length) departs.push(i + 1);

      for (var k = 0; k < departs.length; k++) {
        var droite = mots.slice(departs[k]).join(' ');
        if (!droite) continue;

        var gT = correspond(gauche, vTitre), dA = correspond(droite, vArtiste);
        if (gT && dA) return { titre: true, artiste: true };

        var gA = correspond(gauche, vArtiste), dT = correspond(droite, vTitre);
        if (gA && dT) return { titre: true, artiste: true };

        /* Une seule moitié juste : on la garde de côté, mais uniquement si elle
           pèse l'essentiel de ce qui a été tapé. Mieux vaut accorder le titre à
           quelqu'un qui a écorché le nom de l'artiste que tout refuser — en
           revanche deux mots justes sur six ne valident rien. */
        if (!partiel) {
          if ((gT && pese(gauche, proposition)) || (dT && pese(droite, proposition))) {
            partiel = { titre: true, artiste: false };
          } else if ((gA && pese(gauche, proposition)) || (dA && pese(droite, proposition))) {
            partiel = { titre: false, artiste: true };
          }
        }
      }
    }

    return partiel;
  }

  /* Point d'entrée du jeu : que vient de trouver ce joueur ?
     Renvoie {titre: bool, artiste: bool}. */
  function evaluer(proposition, piste) {
    var vTitre = piste.variantesTitre || variantesTitre(piste.titre);
    var vArtiste = piste.variantesArtiste || variantesArtiste(piste.artiste);

    var res = {
      titre: correspond(proposition, vTitre),
      artiste: correspond(proposition, vArtiste)
    };
    if (res.titre || res.artiste) return res;

    return decouper(proposition, vTitre, vArtiste) || res;
  }

  return {
    normaliser: normaliser,
    degraisser: degraisser,
    variantesTitre: variantesTitre,
    variantesArtiste: variantesArtiste,
    correspond: correspond,
    decouper: decouper,
    evaluer: evaluer,
    distance: distance
  };
})();
