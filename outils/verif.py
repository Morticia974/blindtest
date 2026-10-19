# -*- coding: utf-8 -*-
"""Refabrique les pages de verification : blindtest/verif/*.html

       python outils/verif.py

   Deux temps.

   1. On recopie dans `audit.json` les pochettes choisies a la main dans
      `js/playlists.js`. C'est ce qui manquait : l'audit datait d'une recolte
      faite un jour donne, et les images ajoutees apres coup ne le rejoignaient
      pas. Audrey a donc verifie pendant quelques jours des pochettes qui
      n'etaient plus celles du jeu. Chaque entree est controlee sur son titre
      ET son artiste avant d'etre touchee : un decalage d'un rang dans la
      playlist ferait sinon ecrire la bonne image sur le mauvais morceau.

   2. On regenere les pages, en reprenant le numero de version de index.html
      pour que le navigateur ne serve pas d'anciennes copies.

   `audit.json` garde ce qui ne se trouve que chez Apple : l'extrait de chaque
   morceau, le nom de l'album, la pochette d'origine. Le recolter prend une
   heure, Apple limitant ses recherches a une vingtaine par minute — d'ou ce
   fichier, garde dans le depot plutot que dans un dossier temporaire.
"""
import io, json, os, re, shutil, subprocess, sys

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
sys.path.insert(0, ICI)
import editeur as E

AUDIT = os.path.join(ICI, "audit.json")


def version():
    """Le numero que porte index.html, pour que les pages de verif suivent."""
    s = io.open(os.path.join(DEPOT, "index.html"), encoding="utf-8").read()
    m = re.search(r"\?v=(\d+)", s)
    return m.group(1) if m else "1"


def synchroniser():
    d = json.load(io.open(AUDIT, encoding="utf-8"))
    s = E.lire()
    manches = re.findall(r"^      id: '(\w+)'", s, re.M)

    vues, changees = 0, []
    for idm in manches:
        for i, (debut, fin) in enumerate(E.entrees(s, idm)):
            m = re.search(r'pochette:\s*"([^"]+)"', s[debut:fin + 1])
            if not m:
                continue
            vues += 1
            cle = "%s#%d" % (idm, i)
            e = d.get(cle)
            if e is None:
                raise SystemExit(u"%s absent de l'audit : relance une récolte." % cle)
            t, a = E.titre_de(s, idm, i)
            if e["t"] != t or e["a"] != a:
                raise SystemExit(
                    u"%s : l'audit dit « %s | %s », la playlist « %s | %s ».\n"
                    u"La playlist a bougé depuis la dernière récolte : il en faut une neuve."
                    % (cle, e["t"], e["a"], t, a))
            if e.get("img") != m.group(1) or not e.get("fix"):
                e["img"] = m.group(1)
                e["fix"] = 1
                changees.append(u"%s  %s" % (cle, a))

    if changees:
        shutil.copy(AUDIT, AUDIT + ".avant")
        io.open(AUDIT + ".tmp", "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False))
        shutil.move(AUDIT + ".tmp", AUDIT)
    return vues, changees


def replacer():
    """Remet chaque fiche d'audit a la place qu'elle occupe dans le jeu.

       Une fiche ne porte pas seulement un titre : elle porte sa categorie,
       son rang, le nom et l'emoji de sa manche, et c'est la-dessus que les
       pages de verif se construisent. Deplacer un morceau dans la playlist
       — « Macarena » des Annees 90 au Dancefloor — laissait donc l'audit
       raconter l'ancienne histoire, et la page affichait 99 morceaux la ou
       le jeu en avait 100. Pire : toutes les fiches qui suivaient le trou
       gardaient leur ancien rang.

       On refait le calcul a chaque passage, depuis la playlist qui fait foi."""
    s = E.lire()
    d = json.load(io.open(AUDIT, encoding="utf-8"))
    manches = {}
    for m in re.finditer(r"id: '([a-z0-9]+)'(.*?)pistes", s, re.S):
        nom = re.search(r'nom: "([^"]+)"', m.group(2))
        emo = re.search(r'emoji: "([^"]+)"', m.group(2))
        manches[m.group(1)] = (nom.group(1) if nom else m.group(1),
                               emo.group(1) if emo else u"")

    bouge = 0
    for idm, (nom, emoji) in manches.items():
        for n in range(len(E.entrees(s, idm))):
            e = d.get(u"%s#%d" % (idm, n))
            if e and (e.get("cat"), e.get("i"), e.get("nom")) != (idm, n, nom):
                e["cat"], e["i"], e["nom"], e["emoji"] = idm, n, nom, emoji
                bouge += 1

    if bouge:
        shutil.copy(AUDIT, AUDIT + ".avant")
        io.open(AUDIT + ".tmp", "w", encoding="utf-8").write(
            json.dumps(d, ensure_ascii=False))
        shutil.move(AUDIT + ".tmp", AUDIT)
    return bouge


if __name__ == "__main__":
    bouge = replacer()
    if bouge:
        print(u"%d fiche(s) remises à leur place dans l'audit" % bouge)
    vues, changees = synchroniser()
    print(u"%d pochettes choisies à la main dans la playlist" % vues)
    for c in changees:
        print(u"   remise à jour : %s" % c)
    if not changees:
        print(u"   l'audit était déjà d'accord avec le jeu")

    v = version()
    subprocess.check_call([sys.executable, os.path.join(ICI, "pages_verif.py"), AUDIT, v])
    print(u"pages de vérif en version %s" % v)

    # pages_verif.py refait l'index a partir du seul catalogue : les pages de
    # nouveautes, qui n'en font pas encore partie, en disparaissent. Les
    # fichiers restent, mais plus rien n'y mene, et Audrey a cherche en vain
    # sa page d'ecoute. On le dit, faute de connaitre ici le fichier de
    # resolution qu'il faudrait repasser.
    attente = os.path.join(DEPOT, "nouveautes.json")
    if os.path.exists(attente):
        reste = json.load(io.open(attente, encoding="utf-8"))
        combien = sum(len(x) for x in reste.values())
        if combien:
            print(u"\n   ATTENTION : %d morceau(x) attendent encore dans %s."
                  % (combien, os.path.basename(attente)))
            print(u"   L'index ne les mentionne plus. Repasse :")
            print(u"       python outils/verif_nouveautes.py <resolu>.json")
