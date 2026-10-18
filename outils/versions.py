# -*- coding: utf-8 -*-
"""Une page pour comparer toutes les versions d'un meme morceau.

       python outils/versions.py "Christophe Willem" "Double je"
       python outils/versions.py "Ricky Martin" "Maria" --actuel 1234567

   Audrey entend parfois qu'un enregistrement n'est pas celui qu'elle
   connait, sans pouvoir dire lequel elle a en tete — et moi je ne peux
   pas ecouter. Plutot que de lui faire decrire un son, on met toutes les
   versions qu'Apple possede cote a cote, et elle montre du doigt.

   Les enregistrements identiques publies sur plusieurs albums partagent
   le meme extrait : on les regroupe, sinon la page affiche dix fois la
   meme chose. Ce qui reste, ce sont les versions vraiment differentes.

   `--actuel` prend un bout de l'adresse de l'extrait utilise par le jeu,
   pour le signaler dans la page. L'outil le trouve tout seul si le
   morceau est dans un fichier de resolution passe par `--resolu`.
"""
import io, json, os, re, sys, unicodedata
try:
    from urllib.parse import quote
    from urllib.request import urlopen
except ImportError:                                     # python 2
    from urllib import quote
    from urllib2 import urlopen

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
sys.path.insert(0, ICI)
import pages_verif as P

SORTIE = os.path.join(DEPOT, "verif")


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def apple(terme, limite=50):
    u = ("https://itunes.apple.com/search?term=" + quote(terme.encode("utf-8"))
         + "&country=FR&media=music&entity=song&limit=%d" % limite)
    return json.loads(urlopen(u, timeout=30).read().decode("utf-8")).get("results", [])


def duree(ms):
    if not ms:
        return u""
    s = int(ms) // 1000
    return u"%d min %02d" % (s // 60, s % 60)


def versions(artiste, titre):
    """Tout ce qu'Apple a de cet artiste sous ce titre, une ligne par
       enregistrement distinct. Deux albums qui portent le meme extrait
       portent le meme enregistrement : on les reunit."""
    pa, pt = plat(artiste), plat(titre)
    par_extrait = {}
    for r in apple(artiste + u" " + titre):
        if pa not in plat(r.get("artistName")):
            continue
        if pt not in plat(r.get("trackName")):
            continue
        ap = r.get("previewUrl")
        if not ap:
            continue
        d = par_extrait.setdefault(ap, {
            u"nom": r.get("trackName"), u"ms": r.get("trackTimeMillis"),
            u"img": (r.get("artworkUrl100") or u"").replace("100x100bb", "600x600bb"),
            u"artiste": r.get("artistName"), u"albums": []})
        alb = u"%s (%s)" % (r.get("collectionName") or u"?",
                            (r.get("releaseDate") or u"????")[:4])
        if alb not in d[u"albums"]:
            d[u"albums"].append(alb)
    return par_extrait


def main(artiste, titre, actuel=None):
    trouve = versions(artiste, titre)
    if not trouve:
        raise SystemExit(u"rien trouve pour %s / %s" % (artiste, titre))

    # l'enregistrement du jeu d'abord, les autres du plus court album au plus long
    ordre = sorted(trouve.items(),
                   key=lambda kv: (0 if actuel and actuel in kv[0] else 1,
                                   plat(kv[1][u"nom"])))

    lignes = []
    for n, (ap, d) in enumerate(ordre, 1):
        cest_lui = bool(actuel and actuel in ap)
        badge = (u' <span class="doute">celle du jeu</span>' if cest_lui else u"")
        img = (u'<img class="pochette" loading="lazy" alt="" src="%s">' % P.ech(d[u"img"])) \
            if d[u"img"] else u'<div class="pochette"></div>'
        detail = u"%s &nbsp;·&nbsp; %s" % (P.ech(d[u"artiste"]), duree(d[u"ms"]))
        albums = u"<br>".join(P.ech(a) for a in d[u"albums"])
        lignes.append(
            u'<div class="piste">\n  <div class="num">%d</div>\n  %s\n  <div>\n'
            u'    <p class="reponse">%s%s</p>\n    <p class="detail">%s</p>\n'
            u'    <audio controls preload="none" src="%s"></audio>\n'
            u'    <p class="detail">%s</p>\n  </div>\n</div>'
            % (n, img, P.ech(d[u"nom"]), badge, detail, P.ech(ap), albums))

    entete = (u'<header>\n<a class="retour" href="index.html">← toutes les '
              u'catégories</a>\n<h1>%s — %s</h1>\n'
              u'<p class="sous">%d version%s différente%s chez Apple. Écoute-les '
              u'et dis-moi le numéro de celle que tu connais.</p>\n</header>'
              % (P.ech(artiste), P.ech(titre), len(ordre),
                 u"s" if len(ordre) > 1 else u"", u"s" if len(ordre) > 1 else u""))

    corps = entete + u'<div class="liste">\n' + u"\n".join(lignes) + u'\n</div>'
    nom = u"versions-%s.html" % plat(artiste + u" " + titre).replace(u" ", u"-")
    chemin = os.path.join(SORTIE, nom)
    io.open(chemin, "w", encoding="utf-8", newline="").write(
        P.page(u"%s — %s" % (artiste, titre), corps, P.STYLE))
    print(u"%d version(s) distincte(s)" % len(ordre))
    for n, (ap, d) in enumerate(ordre, 1):
        print(u"  %d. %-40s %s" % (n, d[u"nom"][:40], u" | ".join(d[u"albums"])[:60]))
    print(chemin)


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith(u"--")]
    actuel = None
    if u"--actuel" in sys.argv:
        actuel = sys.argv[sys.argv.index(u"--actuel") + 1]
        a = [x for x in a if x != actuel]
    if len(a) < 2:
        raise SystemExit(__doc__)
    main(a[0], a[1], actuel)
