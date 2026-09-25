# -*- coding: utf-8 -*-
"""Ecrit la liste complete des morceaux dans un fichier texte, pour Audrey.

   A LANCER APRES CHAQUE AJOUT OU RETRAIT DE MORCEAU :

       python outils/catalogue.py

   Le script relit js/playlists.js et index.html, donc le document ne peut pas
   se desynchroniser du jeu. Il ecrit en dehors du depot, dans le dossier
   Documents\ClaudeAI d'Audrey : ce document est pour elle, pas pour le site.
"""
import io, json, os, re, subprocess, sys, datetime

DEPOT = r"C:\Users\Audrey\Documents\ClaudeAI\blindtest"
SORTIE = r"C:\Users\Audrey\Documents\ClaudeAI\Catalogue blind test.txt"

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]

# ---------- lecture de la playlist ----------

src = io.open(os.path.join(DEPOT, "js", "playlists.js"), encoding="utf-8").read()
CAT = re.compile(r"id: '([a-z0-9]+)',")
PISTE = re.compile(r'\{ t: "((?:[^"\\]|\\.)*)", a: "((?:[^"\\]|\\.)*)"', re.S)


def champ(bloc, nom):
    m = re.search(r'%s: "((?:[^"\\]|\\.)*)"' % nom, bloc)
    return m.group(1).replace('\\"', '"') if m else None


categories = []
for m in CAT.finditer(src):
    fin = src.find("\n    },", m.end())
    bloc = src[m.end():fin]
    entete = bloc[:bloc.index("pistes: [")]
    solo = re.search(r"solo: '(\w+)'", entete)
    categories.append({
        "nom": champ(entete, "nom"),
        "emoji": champ(entete, "emoji"),
        "labelT": champ(entete, "labelT") or "Titre",
        "labelA": champ(entete, "labelA") or "Artiste",
        "solo": solo.group(1) if solo else None,
        "pistes": [{"t": t.replace('\\"', '"'), "a": a.replace('\\"', '"')}
                   for t, a in PISTE.findall(bloc)],
    })

total = sum(len(c["pistes"]) for c in categories)

# ---------- numero de version affiche par le site ----------

html = io.open(os.path.join(DEPOT, "index.html"), encoding="utf-8").read()
version = re.search(r"app\.js\?v=(\d+)", html).group(1)

# ---------- ecriture ----------

aujourdhui = datetime.date.today()
date_fr = "%d %s %d" % (aujourdhui.day, MOIS[aujourdhui.month - 1], aujourdhui.year)

lignes = []
lignes.append("OK BALANCE LE SON PAPA")
lignes.append("Catalogue complet des morceaux en ligne")
lignes.append("")
lignes.append("%d morceaux  ·  %d catégories  ·  version %s du site"
              % (total, len(categories), version))
lignes.append("Mis à jour le %s" % date_fr)
lignes.append("morticia974.github.io/blindtest")
lignes.append("")

# Sommaire
lignes.append("=" * 68)
lignes.append("SOMMAIRE")
lignes.append("=" * 68)
lignes.append("")
for c in categories:
    lignes.append("  %-34s %3d morceaux" % (c["emoji"] + " " + c["nom"], len(c["pistes"])))
lignes.append("")
lignes.append("")

# Une section par categorie
for c in categories:
    if c["solo"] == "artiste":
        attendu = "seulement %s" % c["labelA"].lower()
    elif c["solo"] == "titre":
        attendu = "seulement %s" % c["labelT"].lower()
    else:
        attendu = "%s ET %s" % (c["labelT"].lower(), c["labelA"].lower())

    lignes.append("=" * 68)
    lignes.append("%s %s  —  %d morceaux" % (c["emoji"], c["nom"].upper(), len(c["pistes"])))
    lignes.append("Réponse attendue : %s" % attendu)
    lignes.append("=" * 68)
    lignes.append("")
    for i, p in enumerate(c["pistes"], 1):
        lignes.append("%3d. %s  —  %s" % (i, p["t"], p["a"]))
    lignes.append("")
    lignes.append("")

texte = "\r\n".join(lignes)
# utf-8-sig : le Bloc-notes de Windows affiche alors correctement les accents.
io.open(SORTIE, "w", encoding="utf-8-sig", newline="").write(texte)

print("Écrit : %s" % SORTIE)
print("%d morceaux, %d catégories, version %s" % (total, len(categories), version))
