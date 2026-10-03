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
  /* Les nombres écrits en lettres deviennent des chiffres. Les deux côtés
     passent par ici, donc « Il est cinq heures » et « Il est 5 heures »
     finissent pareil.

     « un / une / one » sont volontairement absents : ce sont aussi des
     articles, et « Une belle histoire » n'a rien d'un nombre. */
  var NOMBRES = {
    deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9,
    dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15,
    seize: 16, vingt: 20, trente: 30, quarante: 40, cinquante: 50,
    soixante: 60, cent: 100, mille: 1000,
    two: 2, three: 3, four: 4, five: 5, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, fifty: 50
  };

  function chiffrer(t) {
    t = t.replace(/[a-z]+/g, function (mot) {
      return NOMBRES[mot] !== undefined ? String(NOMBRES[mot]) : mot;
    });
    /* L'heure abrégée vaut l'heure écrite : « 5h » comme « cinq heures ».
       Le « h » doit être un mot à lui seul, donc « 2 hours » n'est pas touché. */
    t = t.replace(/(\d{1,2}) ?h\b/g, '$1 heures');

    /* Le mot qui annonce un numéro ne compte pas. Personne ne dit « Mambo
       numéro cinq » : on dit « Mambo cinq ». Les deux côtés passent par ici,
       donc « Mambo No. 5 » et « Mambo 5 » finissent pareil — et « Mambo
       numéro 5 » aussi.

       Il faut un chiffre derrière, sinon « No Woman No Cry » y perdrait ses
       « no ». */
    return t.replace(/\b(?:no|n|nos|num|numero|numeros|nro|number)\s+(\d)/g, '$1');
  }

  function normaliser(s) {
    if (!s) return '';
    var t = sansAccents(String(s).toLowerCase());
    t = t.replace(/&/g, ' et ');
    t = t.replace(/\+/g, ' et ');
    t = t.replace(/\bft\.?\b|\bfeat\.?\b|\bfeaturing\b|\bavec\b/g, ' et ');
    t = t.replace(/[’`´]/g, "'");
    t = t.replace(/[^a-z0-9']+/g, ' ');
    t = t.replace(/'/g, '');
    return chiffrer(t.replace(/\s+/g, ' ').trim());
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
    if (n <= 4) return 0;
    if (n <= 6) return 1;
    if (n <= 11) return 2;
    if (n <= 18) return 3;
    return 4;
  }

  /* Ce qui s'écrit court et se dit long.

     Personne ne prononce « Mr. Saxobeat » autrement que « mister saxobeat », et
     le micro l'écrit ainsi. Les deux côtés passent par ici — la réponse du
     catalogue comme la proposition du joueur — donc l'abrégé et le prononcé
     finissent par se rencontrer, quel que soit celui qui a été écrit. */
  var ABREGE = [[/mr/g, 'mister'], [/mr/g, 'monsieur'],
                [/dr/g, 'docteur'], [/dr/g, 'doctor'],
                [/st/g, 'saint'], [/ste/g, 'sainte'],
                [/u/g, 'you'], [/n/g, 'and']];

  function formesParlees(base) {
    var out = [];
    for (var i = 0; i < ABREGE.length; i++) {
      var x = base.replace(ABREGE[i][0], ABREGE[i][1]);
      if (x !== base && out.indexOf(x) === -1) out.push(x);
    }
    return out;
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

    /* Le « + » se dit « plus », et la normalisation en fait « et » : « Toi +
       Moi » devenait « toi et moi », quand le micro écrit « toi plus moi ».
       Les deux se disent, on garde les deux. */
    if (/\+/.test(String(titre))) {
      var avecPlus = normaliser(String(titre).replace(/\+/g, ' plus '));
      if (avecPlus) out[avecPlus] = 1;
    }

    Object.keys(out).forEach(function (f) {
      formesParlees(f).forEach(function (x) { out[x] = 1; });
    });
    return Object.keys(out);
  }

  /* Le dernier mot d'un nom, quand on peut raisonnablement le dire tout seul.

     Personne ne dit « Jean-Jacques Goldman » en entier : on dit « Goldman ».
     Ça ne marchait que pour les noms en deux mots, et les trois quarts des
     prénoms composés y passaient — Goldman, Jean-Luc Lahaye, Rita Mitsouko.

     Plus le nom est long, plus on exige du dernier mot : cinq lettres au lieu
     de quatre. « The Black Eyed Peas » ne se réduit pas à « Peas ». */
  var MOTS_LIEN = ('of|the|and|or|et|de|du|des|d|la|le|les|un|une|a|au|aux|en|' +
    'sur|dans|pour|my|your|is|in|on|to|from|with|no').split('|');

  function nomDeFamille(nom) {
    var mots = String(nom).split(' ');
    if (mots.length === 2 && mots[1].length >= 4) return mots[1];
    if (mots.length < 3 || mots[mots.length - 1].length < 5) return '';

    /* À partir de trois mots, il faut vérifier que c'en est un, de nom.

       « Game of Thrones » et « Dead or Alive » ne sont pas des prénoms suivis
       d'un patronyme : ce sont des titres, et « Thrones » n'est pas une réponse
       — elle le serait que les films et les séries accepteraient le raccourci
       qu'ils refusent partout ailleurs. Un petit mot de liaison au milieu
       suffit à le dire. « Ludwig van Beethoven » en réchappe : « van » n'en est
       pas un, et c'est bien « Beethoven » qu'on répond. */
    for (var i = 0; i < mots.length - 1; i++) {
      if (MOTS_LIEN.indexOf(mots[i]) !== -1) return '';
    }
    return mots[mots.length - 1];
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
          var nf = nomDeFamille(n);
          if (nf) out[nf] = 1;
        }
      });

    /* Nom de famille seul ("Michael Jackson" -> "jackson"), sur le nom complet
       comme sur le nom privé de son article : « Les Rita Mitsouko » n'a trois
       mots qu'à cause du « Les », et c'est bien « Mitsouko » qu'on dit. */
    [complet, sansArticle].forEach(function (forme) {
      var nf = nomDeFamille(forme);
      if (nf) out[nf] = 1;
    });

    Object.keys(out).forEach(function (f) {
      formesParlees(f).forEach(function (x) { out[x] = 1; });
    });

    return Object.keys(out);
  }

  /* Une écriture « à l'oreille ».

     Le micro écrit ce qu'il entend, et pas toujours comme le catalogue : il
     rend « téléphone » quand la chanson s'appelle « Le Téléfon », et
     « téléfon » quand le groupe s'appelle Téléphone. Trois corrections
     d'écart — bien trop pour la tolérance aux fautes de frappe, alors que
     c'est le même mot à l'oreille.

     Les deux côtés passent par ici, donc deux orthographes qui se prononcent
     pareil finissent pareilles. Ce n'est pas de la phonétique sérieuse : juste
     les confusions d'écriture les plus courantes en français. On travaille sur
     la forme déjà normalisée — minuscules, sans accents ni ponctuation.

     Les espaces sautent à la fin : le micro hésite souvent sur la découpe des
     mots, et « télé fon » vaut « téléfon ». */
  function phonetique(t) {
    return t.split(' ').map(function (mot) {
      var m = mot;
      m = m.replace(/ph/g, 'f');
      m = m.replace(/ch|sh/g, '#');          // un son à part, sinon « ch » finirait en « k »
      m = m.replace(/qu|q/g, 'k');
      m = m.replace(/gu([eiy])/g, 'g$1');
      m = m.replace(/g([eiy])/g, 'j$1');
      m = m.replace(/c([eiy])/g, 's$1');
      m = m.replace(/[ck]/g, 'k');
      m = m.replace(/h/g, '');
      m = m.replace(/y/g, 'i');
      m = m.replace(/eau|au/g, 'o');
      m = m.replace(/ai|ei/g, 'e');
      m = m.replace(/x/g, 'ks');
      m = m.replace(/([aeiou])s([aeiou])/g, '$1z$2');   // « rose » se dit « roze »
      m = m.replace(/(.)\1+/g, '$1');                   // lettres doublées
      /* Le « e » final qu'on n'entend pas — mais seulement sur un mot un peu
         long. Les accents ont déjà sauté à ce stade, donc rien ne distingue le
         « e » muet de « téléphone » du « é » sonore de « télé » : sur un mot
         court, mieux vaut le garder.

         On mesure le mot d'origine, pas sa version transformée : « phone » a
         bien cinq lettres, même s'il n'en garde que quatre une fois devenu
         « fone ». Sans ça, « télé phone » ne valait pas « téléfon ». */
      if (mot.length > 4) m = m.replace(/e$/, '');

      /* La consonne finale muette, ce grand classique du français.

         « Renault » et « Renaud » se disent pareil et s'écrivent à trois
         lettres d'écart. Le micro, à qui l'on dit le nom du chanteur, écrit
         celui de la voiture : c'est l'orthographe la plus courante, il n'a pas
         tort. Mais à l'oreille c'est la même réponse, et elle était refusée.

         Le « l » s'en va avec elle quand il la précède — « Renault », « Renaud »,
         même mot. Seul, il reste : on l'entend dans « Mistral » et « soleil ».

         Pas sur les mots très courts : « art » et « ar », « but » et « bu »,
         il n'en resterait pas assez pour reconnaître quoi que ce soit.

         Le « p » et le « g » finaux ne sont pas de la liste, bien qu'ils soient
         muets en français : la moitié du catalogue est en anglais, où ils
         s'entendent. « Creep » devenait « Creed », et « Song » aurait fini en
         « son ». Mesuré sur tout le catalogue : avec eux, trois réponses d'un
         morceau en validaient un autre ; sans eux, deux — et ces deux-là sont
         de vrais homophones (« Rednex » / « Redneck »). */
      if (mot.length > 3) m = m.replace(/l?[tdszx]$/, '');

      return m;
    }).join('');
  }

  /* Une proposition est-elle acceptée pour l'une de ces variantes ?

     `options.voix` : la réponse vient du micro et non du clavier. On s'autorise
     alors un écart de plus sur le son des mots — voir plus bas. */
  function correspond(proposition, variantes, options) {
    var voix = !!(options && options.voix);
    var g = normaliser(proposition);
    if (!g || g.length < 2) return false;

    /* On essaie aussi la proposition privée de son article de tête.

       Les articles étaient retirés de la bonne réponse, jamais de ce que tape
       le joueur : la seule forme acceptée pour « Lambada » était « lambada »,
       et « la Lambada » — comme tout le monde l'appelle — tombait à côté.
       Pire, ça faisait échouer la coupe en deux : « la lambada Kaoma » ne
       valait plus rien du tout et partait dans le fil des bêtises. */
    var formes = [g];
    var court = g.replace(ARTICLES, '');
    if (court && court !== g && court.length >= 2) formes.push(court);
    // « Dr House » tapé, « Docteur House » écrit au catalogue : même réponse.
    formesParlees(g).forEach(function (x) { if (formes.indexOf(x) === -1) formes.push(x); });

    for (var f = 0; f < formes.length; f++) {
      var p = formes[f];
      for (var i = 0; i < variantes.length; i++) {
        var v = variantes[i];
        if (!v) continue;
        if (p === v) return true;
        var tol = tolerance(v.length);
        if (tol > 0 && distance(p, v, tol) <= tol) return true;

        /* La même chose sans les espaces.

           Le micro découpe les mots comme il l'entend : « Sweet Dreams » ou
           « sweetdreams », « Girls Just Want to Have Fun » d'un seul tenant.
           Chaque espace manquant comptait pour une faute de frappe, et un
           titre un peu long en accumulait plus que la tolérance n'en pardonne :
           la réponse était juste, et refusée. Quarante-deux titres du catalogue
           étaient dans ce cas.

           Enlever les espaces des deux côtés ne fait rien perdre : deux
           réponses qui ne diffèrent que par la découpe des mots sont la même
           réponse. */
        var pc = p.replace(/ /g, ''), vc = v.replace(/ /g, '');
        if (pc !== p || vc !== v) {
          if (pc === vc) return true;
          var tolc = tolerance(vc.length);
          if (tolc > 0 && distance(pc, vc, tolc) <= tolc) return true;
        }
        // Réponse partielle mais franche : "bohemian" pour "bohemian rhapsody"
        if (v.length >= 10 && p.length >= Math.ceil(v.length * 0.6) && v.indexOf(p) === 0) return true;
        /* Même son, autre orthographe. Réservé aux réponses d'au moins cinq
           lettres : en dessous, trop de mots différents se prononcent pareil. */
        if (v.length >= 5 && phonetique(p) === phonetique(v)) return true;

        /* À la voix, presque le même son suffit.

           Au clavier, une faute est une faute de doigt : une lettre à côté de
           l'autre. Au micro, ce n'est pas le joueur qui écrit, c'est le
           navigateur — et il écrit ce qu'il croit entendre, dans une langue
           qu'il choisit tout seul. Entre sa transcription et le catalogue, il
           reste souvent un son d'écart là où il n'y a aucune erreur de celui
           qui a répondu.

           Un seul écart, et seulement sur des réponses d'une certaine longueur.
           Mesuré sur tout le catalogue : ça n'ajoute aucune réponse d'un
           morceau qui en validerait un autre. */
        if (voix && v.length >= 7) {
          var pp = phonetique(p), vv = phonetique(v);
          if (pp.length >= 6 && distance(pp, vv, 1) <= 1) return true;
        }
      }
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
  function decouper(proposition, vTitre, vArtiste, options) {
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

        var gT = correspond(gauche, vTitre, options), dA = correspond(droite, vArtiste, options);
        if (gT && dA) return { titre: true, artiste: true };

        var gA = correspond(gauche, vArtiste, options), dT = correspond(droite, vTitre, options);
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

  /* Tous les morceaux d'affilée d'une proposition, du plus long au plus court.
     « amoureux solitaires lio » donne « amoureux solitaires lio », puis
     « amoureux solitaires », puis « solitaires lio », etc. */
  function tranches(proposition) {
    var mots = normaliser(proposition).split(' ').filter(Boolean);
    var out = [];
    for (var taille = mots.length; taille >= 1; taille--) {
      for (var d = 0; d + taille <= mots.length; d++) {
        out.push(mots.slice(d, d + taille).join(' '));
      }
    }
    return out;
  }

  /* La réponse se cache-t-elle quelque part dans ce qui a été tapé ?

     Sert uniquement à savoir s'il faut se taire : une proposition qui contient
     la bonne réponse ne part pas dans le fil commun, même si le jeu n'a pas su
     la compter. Sinon un joueur qui écrit juste mais que le moteur rate
     afficherait la réponse à toute la table.

     Quatre lettres au minimum : sans ce garde-fou, un artiste nommé « Lio »
     ferait taire toutes les bêtises contenant « lio ». */
  function contientReponse(proposition, piste) {
    var vTitre = piste.variantesTitre || variantesTitre(piste.titre);
    var vArtiste = piste.variantesArtiste || variantesArtiste(piste.artiste);
    var bouts = tranches(proposition);
    for (var i = 0; i < bouts.length; i++) {
      if (bouts[i].length < 4) continue;
      if (correspond(bouts[i], vTitre) || correspond(bouts[i], vArtiste)) return true;
    }
    return false;
  }

  /* Point d'entrée du jeu : que vient de trouver ce joueur ?
     Renvoie {titre: bool, artiste: bool}. */
  function evaluer(proposition, piste, options) {
    var vTitre = piste.variantesTitre || variantesTitre(piste.titre);
    var vArtiste = piste.variantesArtiste || variantesArtiste(piste.artiste);

    var res = {
      titre: correspond(proposition, vTitre, options),
      artiste: correspond(proposition, vArtiste, options)
    };
    if (res.titre && res.artiste) return res;

    /* Une moitié seulement — ou rien du tout : on essaie quand même de couper
       la phrase en deux.

       Ce n'était pas fait tant qu'une moitié suffisait, et ça coûtait des
       points : la tolérance aux fautes de frappe grandit avec la longueur de
       la réponse, si bien que « Amoureux solitaires Lio » ressemblait déjà
       assez à « Amoureux solitaires » pour être pris pour le titre seul. Le
       nom de l'artiste passait alors à la trappe, alors qu'il était écrit. */
    var coupe = decouper(proposition, vTitre, vArtiste, options);
    if (!coupe) return res;
    return {
      titre: res.titre || coupe.titre,
      artiste: res.artiste || coupe.artiste
    };
  }

  return {
    normaliser: normaliser,
    degraisser: degraisser,
    variantesTitre: variantesTitre,
    variantesArtiste: variantesArtiste,
    correspond: correspond,
    decouper: decouper,
    contientReponse: contientReponse,
    evaluer: evaluer,
    distance: distance,
    phonetique: phonetique
  };
})();
