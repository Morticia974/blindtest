# -*- coding: utf-8 -*-
"""Demande a Apple si des morceaux existent, avant de les proposer a Audrey.

       python outils/cherche.py candidats.txt

   Le fichier : une ligne par morceau, « titre | artiste | recherche »,
   la recherche etant facultative (le titre et l'artiste sinon). Les lignes
   vides et celles qui commencent par # sont ignorees.

   Apple limite ses recherches a une vingtaine par minute et rend des resultats
   vides — pas une erreur, du vide — quand on depasse. On attend donc trois
   secondes entre deux, et on s'arrete net apres plusieurs vides d'affilee :
   continuer ne ferait que fabriquer de faux « introuvable ».

   Ce qui ressort : TROUVE avec l'enregistrement retenu, ou RIEN. Rien ne
   s'ecrit dans la playlist ; c'est a lire, pas a appliquer.
"""
import io, json, re, sys, time, unicodedata
try:
    from urllib.parse import urlencode
    from urllib.request import urlopen
except ImportError:                                     # python 2
    from urllib import urlencode
    from urllib2 import urlopen

PAUSE = 3.0
VIDES_DE_SUITE = 6


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def chercher(terme, pays="FR", limite=8):
    url = "https://itunes.apple.com/search?" + urlencode({
        "term": terme.encode("utf-8"), "media": "music", "entity": "song",
        "country": pays, "limit": limite})
    brut = urlopen(url, timeout=20).read().decode("utf-8", "replace")
    return json.loads(brut or "{}").get("results", [])


def mots_utiles(t):
    """Les mots qui comptent pour reconnaitre un titre : on laisse tomber les
       articles et les mots-outils, qu'Apple ecrit comme il veut."""
    petits = set(u"le la les un une des du de d l et a au aux the a of in on to".split())
    return [m for m in plat(t).split() if m not in petits and len(m) > 1]


def convient(r, titre, artiste):
    if not r.get("previewUrl"):
        return False
    champ = plat(r.get("trackName", "")) + u" " + plat(r.get("collectionName", ""))
    mots = mots_utiles(titre)
    if not mots:
        return False
    # la moitie des mots du titre, au moins, doit se retrouver quelque part
    trouves = sum(1 for m in mots if m in champ)
    return trouves * 2 >= len(mots)


def main(chemin):
    lignes = [l.strip() for l in io.open(chemin, encoding="utf-8").read().split("\n")]
    cas = []
    for l in lignes:
        if not l or l.startswith("#"):
            continue
        bouts = [b.strip() for b in l.split("|")]
        titre = bouts[0]
        artiste = bouts[1] if len(bouts) > 1 else u""
        requete = bouts[2] if len(bouts) > 2 and bouts[2] else (titre + u" " + artiste)
        cas.append((titre, artiste, requete))

    vides = 0
    for titre, artiste, requete in cas:
        try:
            res = chercher(requete)
        except Exception as e:
            print(u"ERREUR  %-46s %s" % (titre[:46], e))
            time.sleep(PAUSE)
            continue

        if not res:
            vides += 1
            print(u"RIEN    %-46s | %s" % (titre[:46], artiste[:26]))
            if vides >= VIDES_DE_SUITE:
                print(u"\n-- %d réponses vides d'affilée : Apple nous a coupé le robinet." % vides)
                print(u"-- Les lignes suivantes n'ont pas été cherchées. Reprendre plus tard.")
                return
        else:
            vides = 0
            bon = None
            for r in res:
                if convient(r, titre, artiste):
                    bon = r
                    break
            if bon:
                print(u"TROUVE  %-46s | %-26s -> %s | %s | %s" % (
                    titre[:46], artiste[:26], bon.get("trackName", "")[:40],
                    bon.get("artistName", "")[:26], bon.get("collectionName", "")[:34]))
            else:
                print(u"RIEN    %-46s | %-26s (%d résultats, aucun qui colle : %s)" % (
                    titre[:46], artiste[:26], len(res), res[0].get("trackName", "")[:34]))
        time.sleep(PAUSE)


if __name__ == "__main__":
    main(sys.argv[1])
