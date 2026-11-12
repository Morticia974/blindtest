# -*- coding: utf-8 -*-
"""Dit, pour chaque morceau resolu, ce qu'Apple joue vraiment.

       python outils/verifier_versions.py resolu.json [categorie]

   A passer AVANT de livrer une page d'ecoute a Audrey : elle l'a demande
   le 23/10/2026, apres avoir trouve elle-meme une version live et une
   chanson en francais.

   Le moteur ne garde volontairement ni le titre ni l'artiste d'Apple : la
   fiche resolue porte ce qu'on VOULAIT, pour que la page montre la bonne
   reponse. Comparer la fiche a elle-meme n'apprend donc rien. Il faut
   redemander a Apple et retrouver le morceau par l'adresse de son extrait.

   Quatre choses sont signalees, et chacune vient d'une erreur reelle :

   - REPRISE : l'artiste d'Apple n'est pas celui qu'on voulait. Un quatuor
     a cordes jouait « Boulevard of Broken Dreams », et rien ne pouvait le
     trahir puisque la fiche disait « Green Day ».
   - AUTRE TITRE : le bon artiste joue le mauvais morceau. « American
     Idiot » servait « Holiday », du meme album ; Audrey trouvait que
     « ca passait tres bien ».
   - version : live, remix, acoustique, 8 bit. « K 2000 » jouait sa
     version 8 bit, injouable en blind test.
   - compilation : Apple credite le disque a « Various Artists ». La
     pochette ne dira rien de la reponse. Le nom ne suffit pas a les
     reperer : « What's My Age Again? » venait d'un disque intitule
     « Teenage dirtbag », qui annoncait une tout autre chanson.

   Quand la categorie met une oeuvre en reponse (series, films, jeux), le
   champ `a` porte le nom de l'oeuvre et non celui de l'interprete : on
   lit alors `interprete` dans la liste d'attente pour savoir qui on
   voulait.
"""
import io, json, os, re, sys, time, unicodedata
try:
    from urllib.parse import quote
    from urllib.request import urlopen
except ImportError:                                     # python 2
    from urllib import quote
    from urllib2 import urlopen

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
ATTENTE = os.path.join(DEPOT, "nouveautes.json")

AUTRE_VERSION = re.compile(
    u"\\blive\\b|remix|acoustic|acoustique|unplugged|karaoke|instrumental|"
    u"\\bdemo\\b|8 bit|8-bit|chiptune|lullaby|music box|re-record|rerecord", re.I)

COMPILATION = re.compile(
    u"various artists|multi interpretes|compilation", re.I)


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def apple(terme, limite=25):
    u = ("https://itunes.apple.com/search?term=" + quote(terme.encode("utf-8"))
         + "&country=FR&media=music&entity=song&limit=%d" % limite)
    try:
        return json.loads(urlopen(u, timeout=30).read().decode("utf-8")).get("results", [])
    except Exception:
        return []


def interpretes_voulus():
    """Qui on voulait, quand `a` ne le dit pas (series, films, jeux)."""
    try:
        d = json.load(io.open(ATTENTE, encoding="utf-8"))
    except Exception:
        return {}
    return dict(((c, p["t"]), p["interprete"])
                for c in d for p in d[c] if p.get("interprete"))


def main(source, cat=None):
    d = json.load(io.open(source, encoding="utf-8"))
    if cat:
        d = [e for e in d if e["cat"] == cat]
    voulus = interpretes_voulus()
    suspects, inconnus = [], []

    for n, e in enumerate(d, 1):
        trouve = None
        for r in apple(e["a"] + u" " + e["t"]):
            if r.get("previewUrl") == e["apercu"]:
                trouve = r
                break
        if not trouve:
            inconnus.append(e["t"])
        else:
            tn = trouve.get("trackName") or u""
            cn = trouve.get("collectionName") or u""
            an = trouve.get("artistName") or u""
            pourquoi = []
            veut = voulus.get((e["cat"], e["t"]), e["a"])
            if plat(veut) not in plat(an) and plat(an) not in plat(veut):
                pourquoi.append(u"REPRISE (%s)" % an[:24])
            if plat(e["t"]) not in plat(tn) and plat(tn) not in plat(e["t"]):
                pourquoi.append(u"AUTRE TITRE (%s)" % tn[:24])
            if AUTRE_VERSION.search(tn):
                pourquoi.append(u"version")
            if COMPILATION.search(trouve.get("collectionArtistName") or u""):
                pourquoi.append(u"compilation")
            if pourquoi:
                suspects.append((e["a"], e["t"], tn, cn, u" + ".join(pourquoi)))
        sys.stderr.write(u"%d/%d\r" % (n, len(d)))
        time.sleep(2.6)

    print(u"\n=== %d à regarder sur %d ===" % (len(suspects), len(d)))
    for a, t, tn, cn, q in suspects:
        print(u"  [%s]" % q)
        print(u"      %-30s %s" % (a[:30], t[:36]))
        print(u"      Apple : %-40s | %s" % (tn[:40], cn[:34]))
    if inconnus:
        print(u"\n%d extrait(s) non retrouvé(s) chez Apple : %s"
              % (len(inconnus), u", ".join(inconnus[:8])))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
