# -*- coding: utf-8 -*-
"""Ajoute aux pages de verif trois pages « nouveautes », a valider avant le jeu.

       python outils/verif_nouveautes.py resolu.json

   Audrey veut entendre et voir les morceaux AVANT qu'ils entrent dans le jeu :
   un titre qui existe chez Apple n'est pas pour autant le bon enregistrement,
   et une pochette d'album ne dit pas toujours de quoi il s'agit.

   On fabrique donc des pages identiques a celles des categories, mais pour des
   morceaux qui ne sont pas encore dans `playlists.js`. Elles s'ajoutent aux
   dix-neuf autres, et disparaitront quand les morceaux seront integres.

   `resolu.json` vient du navigateur, de la page `outils/resoudre.html` : c'est
   le moteur du jeu lui-meme qui y a choisi chaque enregistrement, donc ce
   qu'Audrey entend est exactement ce que le jeu jouera.
"""
import io, json, os, re, subprocess, sys

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
AUDIT = os.path.join(ICI, "audit.json")

def titre_de_categorie(audit, cat):
    """« ⭐ NOUVEAUTÉS — Années 2010-2020 », avec l'emoji de la catégorie telle
       qu'elle existe déjà dans le jeu.

       Une table écrite à la main ne tenait que le temps d'un paquet : il
       fallait l'allonger à chaque nouvelle catégorie, et l'oubli se voyait
       sous la forme d'une page intitulée « annees2010 »."""
    for v in audit.values():
        if v.get("cat") == cat:
            return (u"⭐ NOUVEAUTÉS — " + v["nom"], v.get("emoji") or u"")
    return (u"⭐ NOUVEAUTÉS — " + cat, u"")

NOTE = (u'</p>' + u"\n" +
        u'<p class="sous" style="color:#ffd166">Les %d morceaux des trois pages '
        u'<b>⭐ NOUVEAUTÉS</b> ne sont PAS encore dans le jeu. Ils attendent '
        u'ton avis : écoute, regarde la pochette, et dis-moi les numéros qui '
        u'ne vont pas. Les autres pages, elles, sont le jeu tel qu’il tourne '
        u'ce soir.</p>')


def version():
    s = io.open(os.path.join(DEPOT, "index.html"), encoding="utf-8").read()
    m = re.search(r"\?v=(\d+)", s)
    return m.group(1) if m else "1"


def alternatives():
    """Les reponses acceptees en plus du titre, lues dans nouveautes.json.

       Elles manquaient au premier tour : la page proposait d'essayer sa voix,
       mais sans les connaitre. Audrey a donc vu refuser « Aquarius » pour
       « Aquarius / Let the Sunshine In » alors que le jeu, lui, l'accepte.
       Le test etait plus severe que la realite, ce qui est le pire des
       reglages pour un outil de verification."""
    chemin = os.path.join(DEPOT, "nouveautes.json")
    if not os.path.exists(chemin):
        return {}
    d = json.load(io.open(chemin, encoding="utf-8"))
    out = {}
    for cat, lot in d.items():
        for p in lot:
            out[(cat, p["t"], p.get("a") or u"")] = (
                p.get("altT") or [], p.get("altA") or [], p.get("pochette") or u"")
    return out


def main(source):
    resolu = json.load(io.open(source, encoding="utf-8"))
    faits = resolu["faits"] if isinstance(resolu, dict) else resolu
    audit = json.load(io.open(AUDIT, encoding="utf-8"))
    alt = alternatives()

    # on repart d'un audit propre : les nouveautes d'un tour precedent
    # n'ont pas a s'empiler
    audit = dict((k, v) for k, v in audit.items() if not k.startswith("neuf-"))

    """La resolution garde la trace de tout ce qui est passe par elle, y
       compris de ce qui est deja entre dans le jeu. Seules les categories
       encore en attente meritent une page : sinon on refabrique une page
       « nouveautes » pour des morceaux qui jouent deja."""
    chemin = os.path.join(DEPOT, "nouveautes.json")
    en_attente = set(json.load(io.open(chemin, encoding="utf-8"))) \
        if os.path.exists(chemin) else set()
    faits = [e for e in faits if e["cat"] in en_attente]
    if not faits:
        print(u"rien en attente : aucune page de nouveautés à faire")
        return

    rangs = {}
    for e in faits:
        cat = e["cat"]
        nom, emoji = titre_de_categorie(audit, cat)
        i = rangs.get(cat, 0)
        rangs[cat] = i + 1
        reglage = alt.get((cat, e["t"], e["a"]), ([], [], u""))
        # une pochette choisie a la main remplace celle de l'album, comme en jeu
        if reglage[2]:
            e["img"] = reglage[2]
        audit["neuf-%s#%d" % (cat, i)] = {
            "cat": "neuf-" + cat, "nom": nom, "emoji": emoji, "i": i,
            "t": e["t"], "a": e["a"], "aa": e.get("aa") or "", "alb": e.get("alb") or "",
            "img": e.get("img") or "", "apercu": e.get("apercu") or "",
            "sol": e.get("sol") or "", "lab": e.get("lab") or "Artiste",
            "langue": "fr", "strict": False, "fix": 1,
            "altT": reglage[0], "altA": reglage[1],
            "lgT": "", "lgA": "", "ditT": "", "ditA": "",
        }

    temporaire = os.path.join(ICI, "audit-avec-nouveautes.json")
    io.open(temporaire, "w", encoding="utf-8").write(json.dumps(audit, ensure_ascii=False))
    v = version()
    subprocess.check_call([sys.executable, os.path.join(ICI, "pages_verif.py"), temporaire, v])
    os.remove(temporaire)

    # Le compteur de l'index additionne tout, nouveautes comprises. Laisse tel
    # quel, il ferait croire que le jeu contient deja ces morceaux.
    index = os.path.join(DEPOT, "verif", "index.html")
    s = io.open(index, encoding="utf-8").read()
    ancien = u"</p>" + u"\n" + u"</header>"
    if s.count(ancien) == 1:
        neuf = s.replace(ancien, (NOTE % sum(rangs.values())) + u"\n" + u"</header>")
        io.open(index, "w", encoding="utf-8", newline="").write(neuf)
    else:
        print(u"   (note non posée : l'en-tête de l'index a changé)")

    for cat, n in sorted(rangs.items()):
        print(u"   %-10s %d morceaux" % (cat, n))
    print(u"version %s" % v)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "resolu.json")
