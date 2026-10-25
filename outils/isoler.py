# -*- coding: utf-8 -*-
"""Met de cote la liste d'attente pour n'en re-resoudre qu'un morceau.

       python outils/isoler.py "Titre" ["Autre titre" ...]
       python outils/isoler.py --rendre

   `outils/resoudre.html` lit toujours `nouveautes.json`, et rien d'autre.
   Pour ne refaire qu'une fiche, il faut donc remplacer ce fichier par un
   fichier d'une seule fiche — et c'est la que ca tourne mal : le fichier
   complet n'existe plus que dans une copie, et la copie suivante risque
   d'etre prise sur le fichier reduit. C'est arrive le 25/10/2026 : les
   cinquante fiches du Rock ont disparu d'un coup, recuperees dans Git.

   D'ou ces deux gestes, et un refus.

   `isoler` ecrit la liste complete dans `nouveautes.complet.json` puis
   reduit `nouveautes.json` aux titres demandes. Il REFUSE si la sauvegarde
   existante contient plus de fiches que ce qu'on s'apprete a sauvegarder :
   une sauvegarde ne retrecit jamais toute seule.

   `--rendre` remet la liste complete en place, en y reportant les
   modifications faites entre-temps sur les fiches isolees.
"""
import io, json, os, sys

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
ATTENTE = os.path.join(DEPOT, "nouveautes.json")
COMPLET = os.path.join(DEPOT, "nouveautes.complet.json")


def lire(chemin):
    if not os.path.exists(chemin):
        return None
    return json.load(io.open(chemin, encoding="utf-8"))


def combien(d):
    return sum(len(v) for v in (d or {}).values())


def ecrire(chemin, d):
    io.open(chemin, "w", encoding="utf-8").write(
        json.dumps(d, ensure_ascii=False, indent=2) + u"\n")


def isoler(titres):
    d = lire(ATTENTE)
    if not d:
        raise SystemExit(u"nouveautes.json est vide ou absent")
    vieux = lire(COMPLET)
    if vieux and combien(vieux) > combien(d):
        raise SystemExit(
            u"REFUS : la sauvegarde contient %d fiches, le fichier courant %d.\n"
            u"       Le fichier courant est deja un fichier isole. Fais d'abord\n"
            u"       « python outils/isoler.py --rendre »."
            % (combien(vieux), combien(d)))
    ecrire(COMPLET, d)

    voulus = set(titres)
    petit, trouves = {}, set()
    for cat, pistes in d.items():
        gardees = [p for p in pistes if p["t"] in voulus]
        if gardees:
            petit[cat] = gardees
            trouves.update(p["t"] for p in gardees)
    absents = voulus - trouves
    if absents:
        raise SystemExit(u"introuvable(s) dans la liste d'attente : %s"
                         % u", ".join(sorted(absents)))
    ecrire(ATTENTE, petit)
    print(u"%d fiche(s) isolee(s), %d mises de cote dans %s"
          % (combien(petit), combien(d), os.path.basename(COMPLET)))


def rendre():
    complet = lire(COMPLET)
    if not complet:
        raise SystemExit(u"aucune sauvegarde a rendre")
    isole = lire(ATTENTE) or {}
    # ce qui a ete corrige pendant l'isolement revient dans la liste complete
    corrigees = {}
    for cat, pistes in isole.items():
        for p in pistes:
            corrigees[(cat, p["t"])] = p
    n = 0
    for cat, pistes in complet.items():
        for i, p in enumerate(pistes):
            neuve = corrigees.get((cat, p["t"]))
            if neuve and neuve != p:
                pistes[i] = neuve
                n += 1
    ecrire(ATTENTE, complet)
    os.remove(COMPLET)
    print(u"liste complete rendue : %d fiches, dont %d mises a jour"
          % (combien(complet), n))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    if sys.argv[1] == u"--rendre":
        rendre()
    else:
        isoler(sys.argv[1:])
