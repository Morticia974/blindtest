# -*- coding: utf-8 -*-
"""Combien de morceaux une categorie peut VRAIMENT jouer en une partie.

       python outils/jouables.py

   Le moteur, dans une categorie a reponse unique, melange puis ne garde
   qu'un morceau par oeuvre : trois chansons du Roi Lion ne donnent pas
   trois fois « Le Roi Lion » dans la meme partie, c'est un film qui sort
   une fois, represente par une chanson differente a chaque partie.

   Donc une categorie peut compter 100 fiches et n'en jouer que 97. Pour
   le chantier des 100 par categorie, c'est ce second chiffre qui compte :
   c'est celui que le jeu annonce et celui qu'une partie peut atteindre.

   Les categories d'artistes (Annees 80, Rock...) ne sont pas concernees :
   plusieurs titres d'un meme chanteur y sont voulus.

   Rien n'est ecrit : c'est une lecture.
"""
import io, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import editeur as E


def norm(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def cle_oeuvre(t, a, solo, labelA):
    """La meme regle que cleOeuvre() dans js/playlists.js."""
    if solo == u"titre":
        return norm(t)
    if labelA in (u"Artiste", u"Interprète"):
        return None
    # on coupe a la saga : « Star Wars, episode IV » et « episode V » = une
    return norm(re.split(r"[:,]", a)[0])


s = E.lire()
lignes = []
for m in re.finditer(r"^      id: '(\w+)'", s, re.M):
    cat = m.group(1)
    bout = s[m.end():m.end() + 1200]
    nom = re.search(r'nom: "([^"]+)"', bout)
    so = re.search(r"solo: '(titre|artiste)'", bout)
    lab = re.search(r'labelA: "([^"]+)"', bout)
    nom = nom.group(1) if nom else cat
    solo = so.group(1) if so else None
    labelA = lab.group(1) if lab else u"Artiste"

    oeuvres, n = set(), 0
    for d, f in E.entrees(s, cat):
        bloc = s[d:f + 1]
        t = re.search(r't: "([^"]+)"', bloc)
        a = re.search(r'a: "([^"]+)"', bloc)
        t, a = (t.group(1) if t else u""), (a.group(1) if a else u"")
        n += 1
        k = cle_oeuvre(t, a, solo, labelA)
        oeuvres.add(k if k else u"#%d" % n)
    lignes.append((nom, cat, n, len(oeuvres), solo))

lignes.sort(key=lambda l: l[3])
print(u"%-36s %6s %9s %7s" % (u"catégorie", u"fiches", u"jouables", u"perdu"))
print(u"-" * 62)
perte = 0
for nom, cat, n, j, solo in lignes:
    d = n - j
    perte += d
    print(u"%-36s %6d %9d %7s"
          % (nom[:36], n, j, (u"-%d" % d) if d else u""))
print(u"-" * 62)
print(u"%-36s %6d %9d %7s"
      % (u"TOTAL", sum(l[2] for l in lignes),
         sum(l[3] for l in lignes), u"-%d" % perte if perte else u""))
