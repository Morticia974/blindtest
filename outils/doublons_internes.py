# -*- coding: utf-8 -*-
"""Cherche les morceaux du jeu qui font donner DEUX FOIS la meme reponse.

       python outils/doublons_internes.py [categorie]

   Trouve le 18/11/2026, en repondant a une question d'Audrey sur Your
   Name : l'anime y est deux fois, « Zenzenzense » et « Sparkle ». Deux
   extraits differents, mais la categorie fait deviner l'anime, donc la
   meme reponse tombe deux fois dans la manche.

   Mes deux outils de doublons regardaient ailleurs :
     - doublons.py compare des CANDIDATS au catalogue, titre par titre ;
     - doublons_reponse.py compare la LISTE D'ATTENTE au jeu.
   Aucun ne compare le jeu a lui-meme, et c'est pourtant la que le
   joueur s'en apercoit.

   Deux sortes de doublons, et seule la premiere est une vraie faute :

   - meme REPONSE dans une categorie qui n'en demande qu'une (`solo`).
     La reponse tombe deux fois : a corriger.
   - meme morceau (titre + artiste) a deux endroits du jeu. Pas
     forcement une faute : un tube des annees 80 a sa place dans
     « Annees 80 » et dans « Karaoke », qui ne se jouent pas ensemble.
     On le signale a part, pour information.

   Rien n'est ecrit : c'est une lecture.
"""
import io, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import editeur as E

PETITS = set(u"le la les un une des du de dans au aux et l d the a of".split())


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def noyau(t):
    return u" ".join(m for m in plat(t).split() if m not in PETITS)


def categories(s):
    """(id, nom, solo) de chaque categorie, solo = None si deux reponses."""
    out = []
    for m in re.finditer(r"^      id: '(\w+)'", s, re.M):
        bout = s[m.end():m.end() + 1200]
        nom = re.search(r'nom: "([^"]+)"', bout)
        so = re.search(r"solo: '(titre|artiste)'", bout)
        out.append((m.group(1), nom.group(1) if nom else m.group(1),
                    so.group(1) if so else None))
    return out


def champs(bloc):
    t = re.search(r't: "([^"]+)"', bloc)
    a = re.search(r'a: "([^"]+)"', bloc)
    return (t.group(1) if t else u""), (a.group(1) if a else u"")


def main(seule=None):
    s = E.lire()
    fautes, ailleurs, partout = [], [], {}

    for cat, nom, solo in categories(s):
        if seule and cat != seule:
            pass
        vus = {}
        for d, f in E.entrees(s, cat):
            bloc = s[d:f + 1]
            t, a = champs(bloc)
            # la reponse a donner, selon ce que la categorie demande
            rep = t if solo == u"titre" else a
            ligne = s[:d].count(u"\n") + 1
            if solo:
                k = noyau(rep)
                if k and k in vus:
                    fautes.append((nom, cat, rep, vus[k], (t, a, ligne)))
                else:
                    vus[k] = (t, a, ligne)
            partout.setdefault(noyau(t) + u" @ " + noyau(a), []).append((cat, t, a))

    print(u"\n=== %d reponse(s) en double DANS une categorie ===" % len(fautes))
    for nom, cat, rep, un, deux in fautes:
        print(u"  %s  (%s)" % (nom, cat))
        print(u"      reponse « %s » tombe deux fois :" % rep)
        for t, a, l in (un, deux):
            print(u"        ligne %-5d %-34s | %s" % (l, t[:34], a[:28]))

    for k, v in partout.items():
        cats = set(c for c, t, a in v)
        if len(cats) > 1:
            ailleurs.append(v)
    print(u"\n=== %d morceau(x) present(s) dans plusieurs categories ==="
          % len(ailleurs))
    print(u"    (pas forcement une faute : un tube peut etre aussi au karaoke)")
    for v in ailleurs:
        t, a = v[0][1], v[0][2]
        print(u"  %-34s %-26s : %s"
              % (t[:34], a[:26], u", ".join(sorted(set(c for c, _, _ in v)))))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
