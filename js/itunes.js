/* itunes.js — recherche des extraits de 30 secondes sur le catalogue Apple.
   Gratuit, sans compte ni clé. Apple limite le nombre d'appels par minute,
   donc on fait la queue et on garde tout en cache. */

var Itunes = (function () {
  'use strict';

  /* Boutique interrogée par défaut. Un morceau peut en viser une autre avec
     `pays` : le catalogue américain contient des bandes originales de séries
     US qui n'ont jamais été publiées en France. Les fichiers audio d'Apple,
     eux, sont accessibles depuis partout. */
  var PAYS = 'FR';
  /* En changeant ce numéro, on force tous les joueurs à réinterroger Apple :
     les morceaux mémorisés avec l'ancienne logique de choix (qui laissait
     passer des remixes) sont oubliés. */
  var CLE_CACHE = 'bt.cache.itunes.v2';
  var DUREE_CACHE = 1000 * 60 * 60 * 24 * 30; // 30 jours pour un morceau trouvé
  var DUREE_CACHE_VIDE = 1000 * 60 * 60;      // 1 heure seulement pour un échec
  var ENTRE_APPELS = 320;                     // ms entre deux requêtes

  var cache = charger();
  var file = Promise.resolve();

  function charger() {
    try {
      var brut = localStorage.getItem(CLE_CACHE);
      return brut ? JSON.parse(brut) : {};
    } catch (e) { return {}; }
  }

  function sauver() {
    try {
      localStorage.setItem(CLE_CACHE, JSON.stringify(cache));
    } catch (e) {
      // Quota plein : on repart d'un cache vide plutôt que de planter.
      cache = {};
      try { localStorage.removeItem(CLE_CACHE); } catch (e2) {}
    }
  }

  function attendre(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* Toutes les requêtes passent par cette file : une à la fois, espacées,
     pour rester sous la limite d'Apple (~20 appels/minute). */
  function enfiler(travail) {
    var resultat = file.then(function () { return travail(); });
    file = resultat.then(
      function () { return attendre(ENTRE_APPELS); },
      function () { return attendre(ENTRE_APPELS); }
    );
    return resultat;
  }

  function appeler(params) {
    var url = 'https://itunes.apple.com/search?' + new URLSearchParams(params).toString();
    return fetch(url, { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('iTunes ' + r.status);
      return r.json();
    });
  }

  /* Un résultat brut d'Apple -> la forme utilisée par le jeu. */
  function enPiste(r) {
    if (!r || !r.previewUrl) return null;
    return {
      titre: r.trackName,
      artiste: r.artistName,
      album: r.collectionName || '',
      annee: r.releaseDate ? String(r.releaseDate).slice(0, 4) : '',
      apercu: r.previewUrl,
      pochette: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
      lien: r.trackViewUrl || ''
    };
  }

  /* Choisit, parmi les résultats, celui qui colle le mieux au morceau demandé. */
  function meilleur(resultats, piste) {
    var candidats = resultats.filter(function (r) { return r.previewUrl && r.kind === 'song'; });
    if (!candidats.length) {
      candidats = resultats.filter(function (r) { return r.previewUrl; });
    }
    if (!candidats.length) return null;
    if (!piste) return candidats[0];

    var vTitre = Match.variantesTitre(piste.t);
    var vArtiste = piste.a ? Match.variantesArtiste(piste.a) : [];

    /* Dans les catégories strictes, `a` est l'œuvre — « Battlestar Galactica »,
       « Le Roi Lion » — et le nom de celui qui joue n'apparaît nulle part. Le
       moteur n'a alors aucun moyen de distinguer le bon enregistrement des
       vingt reprises qui portent le même nom. `interprete` le lui souffle.

       Il sert UNIQUEMENT à noter les candidats : il n'est jamais ajouté aux
       réponses acceptées, sinon « Bear McCreary » vaudrait « Battlestar
       Galactica » au moment de répondre. */
    var vScore = piste.interprete
      ? vArtiste.concat(Match.variantesArtiste(piste.interprete))
      : vArtiste;

    /* Certains morceaux ne sont connus QUE par une version alternative : le
       karaoke de Coumba Gawlo pour « Pata Pata », par exemple. La playlist le
       signale avec « voulue », et on lève alors les deux pénalités ci-dessous
       - sans quoi le moteur irait chercher l'originale, justement celle qu'on
       ne veut pas. */
    var voulue = !!piste.voulue;

    var note = candidats.map(function (r) {
      var n = 0;
      if (Match.correspond(r.trackName, vTitre)) n += 10;
      else if (Match.normaliser(r.trackName).indexOf(Match.normaliser(piste.t)) !== -1) n += 5;
      if (vScore.length && Match.correspond(r.artistName, vScore)) n += 6;
      /* On compare sur du texte normalisé — sans accents — sinon « Version
         karaoké » passait entre les mailles du filet et « Laisse pas traîner
         ton fils » jouait un karaoké. Apple étiquette aussi en français :
         « Rendu célèbre par NTM » là où l'anglais dit « made popular by ». */
      var etiquette = Match.normaliser((r.artistName || '') + ' ' + (r.collectionName || ''));

      // On écarte les reprises et les karaokés déguisés…
      if (!voulue && /karaoke|tribute|made popular|in the style of|cover version|rendu celebre par|dans le style de|hommage a/
            .test(etiquette)) n -= 20;

      /* …et toutes les versions alternatives : un remix ou une version acoustique
         est méconnaissable en blind test. La pénalité n'exclut pas, elle
         rétrograde : si Apple n'a que ça, le morceau est quand même joué.
         « music box », « orgel » et « lullaby » sont arrivés par la bande :
         Apple regorge de berceuses au carillon, et deux génériques d'animes
         étaient tombés dessus. */
      if (!voulue && /\b(remix|rework|remaster|unplugged|acoustic|acoustique|instrumental|playback|live|en public|en concert|demo|a cappella|acapella|sped up|slowed|edit|mix|reprise|cover|orchestral|piano version|lofi|lo fi|music box|orgel|lullaby|berceuse|8 bit|midi)\b/
            .test(Match.normaliser(r.trackName || '') + ' ' + etiquette)) n -= 12;

      /* À enregistrement égal, on préfère l'album de l'artiste à une
         compilation. Ce n'est pas une question de son — c'est le même — mais
         d'image : la pochette montrée à la révélation doit parler de la
         réponse, et « NRJ Happy Hits 2020 » ne dit rien de Karol G. La
         pénalité est légère exprès : beaucoup de morceaux n'existent que sur
         une compilation, et ceux-là doivent quand même passer. */
      if (/\b(best of|greatest hits|compilation|presente|anthologie|essentiel|collection|hit parade|100 tubes|nrj|fun radio|le top|les plus belles|megamix|party mix|summer hits)\b/
            .test(etiquette)) n -= 4;
      return { r: r, n: n };
    });

    note.sort(function (a, b) { return b.n - a.n; });

    /* Même quand rien ne colle vraiment, on rend le candidat le mieux noté et
       non le premier venu : sinon les pénalités ne servaient à rien dans ce
       cas-là, et un karaoké l'emportait sur un enregistrement honnête. */
    return note[0].r;
  }

  /* Résout un morceau de playlist en extrait jouable.
     Renvoie null si Apple n'a rien de jouable (le jeu passe alors au suivant). */
  function resoudre(piste) {
    var requete = piste.q || ((piste.a ? piste.a + ' ' : '') + piste.t);
    var pays = piste.pays || PAYS;
    // La boutique fait partie de la clé : sans ça, une recherche française et
    // une recherche américaine sur le même texte se marcheraient dessus.
    var cle = pays + '|' + Match.normaliser(requete);
    var enCache = cache[cle];
    var duree = (enCache && enCache.vide) ? DUREE_CACHE_VIDE : DUREE_CACHE;

    if (enCache && Date.now() - enCache.le < duree) {
      return Promise.resolve(enCache.piste ? habiller(enCache.piste, piste) : null);
    }

    return enfiler(function () {
      var params = { term: requete, media: 'music', entity: 'song', limit: 8, country: pays };

      // Apple coupe le robinet au-delà d'une vingtaine d'appels par minute, et
      // répond alors une liste vide. On retente une fois avant de conclure.
      return appeler(params)
        .then(function (data) {
          if (data.results && data.results.length) return data;
          return attendre(2500).then(function () { return appeler(params); });
        })
        .then(function (data) {
          var resolue = enPiste(meilleur(data.results || [], piste));

          // Un « rien trouvé » n'est mémorisé qu'une heure : sinon une simple
          // coupure d'Apple bannirait un bon morceau pendant un mois.
          cache[cle] = { le: Date.now(), piste: resolue, vide: !resolue };
          sauver();

          return resolue ? habiller(resolue, piste) : null;
        })
        .catch(function () { return null; });
    });
  }

  /* Ajoute les réponses acceptées. On garde le titre et l'artiste voulus par la
     playlist (plus propres que ceux d'Apple) et on accepte les deux orthographes. */
  function habiller(resolue, piste) {
    var titreAffiche = piste.t || resolue.titre;
    var artisteAffiche = piste.a || resolue.artiste;

    var vT = Match.variantesTitre(titreAffiche).concat(Match.variantesTitre(resolue.titre));
    var vA = Match.variantesArtiste(artisteAffiche);

    /* Catégories strictes (films, animes, jeux) : la réponse attendue est le nom
       de l'œuvre, et seules les formes écrites dans la playlist comptent. Ailleurs,
       on accepte aussi l'artiste tel qu'Apple l'orthographie, et les invités cachés
       dans le titre — "Uptown Funk (feat. Bruno Mars)" — que les joueurs citent
       souvent à la place de l'artiste principal. */
    if (!piste.strict) {
      vA = vA.concat(Match.variantesArtiste(resolue.artiste));
      var invite = String(resolue.titre).match(
        /[\(\[]\s*(?:feat\.?|ft\.?|featuring|avec|with|and)\s+([^\)\]]+)[\)\]]/i);
      if (invite) vA = vA.concat(Match.variantesArtiste(invite[1]));
    }

    (piste.altT || []).forEach(function (x) { vT = vT.concat(Match.variantesTitre(x)); });
    (piste.altA || []).forEach(function (x) { vA = vA.concat(Match.variantesArtiste(x)); });

    /* Volontairement sans album, année ni lien Apple : rien ne les affiche,
       et l'URL du lien contient le titre du morceau en toutes lettres. Moins
       on publie, moins il y a à lire dans la console. */
    return {
      titre: titreAffiche,
      artiste: artisteAffiche,
      apercu: resolue.apercu,
      /* `pochette` dans la playlist remplace celle de l'album. Sert quand le
         seul enregistrement disponible vit sur une compilation dont l'image ne
         dit rien de la réponse. */
      pochette: piste.pochette || resolue.pochette,
      categorie: piste.categorie || '',
      labelA: piste.labelA || 'Artiste',
      labelT: piste.labelT || 'Titre',
      solo: piste.solo || null,
      strict: !!piste.strict,
      variantesTitre: unique(vT),
      variantesArtiste: unique(vA)
    };
  }

  function unique(liste) {
    var vu = {}, out = [];
    liste.forEach(function (x) { if (x && !vu[x]) { vu[x] = 1; out.push(x); } });
    return out;
  }

  /* Recherche libre pour l'éditeur de playlists : renvoie des propositions. */
  function chercher(texte, limite) {
    if (!texte || texte.trim().length < 2) return Promise.resolve([]);
    return enfiler(function () {
      return appeler({
        term: texte, media: 'music', entity: 'song', limit: limite || 12, country: PAYS
      }).then(function (data) {
        return (data.results || []).map(enPiste).filter(Boolean);
      }).catch(function () { return []; });
    });
  }

  function viderCache() {
    cache = {};
    try { localStorage.removeItem(CLE_CACHE); } catch (e) {}
  }

  return {
    resoudre: resoudre,
    chercher: chercher,
    viderCache: viderCache,
    habiller: habiller
  };
})();
