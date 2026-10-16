# -*- coding: utf-8 -*-
"""Dit lesquels des morceaux proposes sont deja au catalogue.

       python outils/doublons.py candidats.txt

   Une ligne par morceau, « titre | artiste ». On compare sur une forme
   simplifiee — sans accents, sans ponctuation, sans article de tete — parce
   que « L'Ete indien » et « Ete indien » sont le meme morceau, et qu'en
   proposer un deja present ferait perdre du temps a Audrey.

   Rien n'est ecrit : c'est a lire avant d'ajouter quoi que ce soit.
"""
import io, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import editeur as E


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    t = re.sub(r"[^a-z0-9]+", u" ", t).strip()
    return re.sub(r"^(le|la|les|l|un|une|des|du|de|the|a) ", u"", t)


def catalogue():
    s = E.lire()
    vus = {}
    for idm in re.findall(r"^      id: '(\w+)'", s, re.M):
        for i, _ in enumerate(E.entrees(s, idm)):
            t, a = E.titre_de(s, idm, i)
            vus.setdefault(plat(t), []).append((idm, t, a))
            vus.setdefault(plat(t) + u"|" + plat(a), []).append((idm, t, a))
    return vus


def main(chemin):
    vus = catalogue()
    neufs, dejas = 0, 0
    for l in io.open(chemin, encoding="utf-8").read().split("\n"):
        l = l.strip()
        if not l or l.startswith("#"):
            if l:
                print(l)
            continue
        bouts = [b.strip() for b in l.split("|")]
        t = bouts[0]
        a = bouts[1] if len(bouts) > 1 else u""
        ou = vus.get(plat(t) + u"|" + plat(a)) or vus.get(plat(t))
        if ou:
            dejas += 1
            print(u"   DÉJÀ   %-44s | %-24s (dans %s : %s)" % (t[:44], a[:24], ou[0][0], ou[0][1][:30]))
        else:
            neufs += 1
            print(u"   neuf   %-44s | %s" % (t[:44], a[:24]))
    print(u"\n%d nouveaux, %d déjà au catalogue" % (neufs, dejas))


if __name__ == "__main__":
    main(sys.argv[1])
