# -*- coding: utf-8 -*-
"""Fait entrer dans le jeu des morceaux valides par Audrey.

       python outils/integrer.py resolu.json annees2010 [autre...]

   `nouveautes.json` tient les fiches en attente, `resolu.json` ce que le
   moteur du jeu a trouve pour chacune chez Apple. On integre les categories
   nommees, et seulement celles-la : une categorie qu'elle n'a pas encore
   ecoutee reste en attente.

   Trois ecritures, dans cet ordre :
     1. les morceaux a la fin de leur manche dans playlists.js ;
     2. leurs fiches dans l'audit, aux rangs qu'ils viennent de prendre, pour
        que les pages de verif les montrent a leur place ;
     3. nouveautes.json allege des categories integrees.

   Reste a faire a la main ensuite : relever le numero de version dans
   index.html et journal.html, puis `outils/catalogue.py` et `outils/verif.py`.
"""
import io, json, os, sys

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
sys.path.insert(0, ICI)
import editeur as E

ATTENTE = os.path.join(DEPOT, "nouveautes.json")
AUDIT = os.path.join(ICI, "audit.json")


def main(source, categories):
    resolu = json.load(io.open(source, encoding="utf-8"))
    faits = resolu["faits"] if isinstance(resolu, dict) else resolu
    par_cle = dict(((x["cat"], x["t"], x["a"]), x) for x in faits)
    attente = json.load(io.open(ATTENTE, encoding="utf-8"))

    for cat in categories:
        if cat not in attente:
            raise SystemExit(u"« %s » n'est pas en attente (il y a %s)"
                             % (cat, u", ".join(sorted(attente)) or u"rien"))

    s = E.lire()
    audit = json.load(io.open(AUDIT, encoding="utf-8"))
    audit = dict((k, v) for k, v in audit.items() if not k.startswith("neuf-"))

    for cat in categories:
        pistes = attente[cat]
        manquants = [p["t"] for p in pistes
                     if (cat, p["t"], p.get("a") or u"") not in par_cle]
        if manquants:
            raise SystemExit(u"pas de résolution pour : %s" % u", ".join(manquants))

        avant = len(E.entrees(s, cat))
        s = E.inserer(s, cat, pistes, mot(cat, len(pistes)))
        apres = len(E.entrees(s, cat))
        if apres != avant + len(pistes):
            raise SystemExit(u"%s : %d + %d devrait faire %d, pas %d"
                             % (cat, avant, len(pistes), avant + len(pistes), apres))

        modele = [v for v in audit.values() if v["cat"] == cat][0]
        for n, p in enumerate(pistes):
            r = par_cle[(cat, p["t"], p.get("a") or u"")]
            i = avant + n
            audit["%s#%d" % (cat, i)] = {
                "cat": cat, "nom": modele["nom"], "emoji": modele["emoji"], "i": i,
                "t": p["t"], "a": p.get("a") or u"", "aa": r.get("aa") or u"",
                "alb": r.get("alb") or u"", "img": r.get("img") or u"",
                "apercu": r.get("apercu") or u"",
                "sol": modele.get("sol") or u"", "lab": modele.get("lab") or u"Artiste",
                "langue": modele.get("langue") or u"fr",
                "strict": bool(modele.get("strict")),
                "fix": 1 if p.get("pochette") else 0,
                "altT": p.get("altT") or [], "altA": p.get("altA") or [],
                "lgT": u"", "lgA": u"", "ditT": u"", "ditA": u"",
            }
        print(u"%-12s %d + %d = %d" % (cat, avant, len(pistes), apres))
        del attente[cat]

    E.ecrire(s)
    io.open(AUDIT + ".tmp", "w", encoding="utf-8").write(json.dumps(audit, ensure_ascii=False))
    os.replace(AUDIT + ".tmp", AUDIT)

    if attente:
        io.open(ATTENTE, "w", encoding="utf-8").write(
            json.dumps(attente, ensure_ascii=False, indent=2) + u"\n")
        print(u"restent en attente : %s"
              % u", ".join(u"%s (%d)" % (k, len(v)) for k, v in sorted(attente.items())))
    else:
        os.remove(ATTENTE)
        print(u"plus rien en attente")


def mot(cat, combien):
    import datetime
    return (u"%d morceaux validés par Audrey le %s, après écoute de l'extrait et "
            u"de la pochette sur les pages de vérif."
            % (combien, datetime.date.today().strftime(u"%d/%m/%Y")))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2:])
