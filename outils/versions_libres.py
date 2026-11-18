# -*- coding: utf-8 -*-
"""Une page de comparaison quand aucun artiste ne porte le nom cherche.

       python outils/versions_libres.py versions.json "Code Lyoko"

   `versions.py` epingle l'artiste : il part de l'idee qu'on cherche un
   enregistrement d'un interprete connu. Ca ne marche pas pour un
   generique de dessin anime dont l'original n'est pas chez Apple : les
   douze versions d'« Un monde sans danger » sont signees par douze
   reprises differentes, et aucune ne s'appelle « Code Lyoko ».

   Celui-ci prend donc une liste deja moissonnee et la met en page, sans
   rien chercher lui-meme.

   Audrey a une regle que j'avais oublie d'appliquer, du 23/09/2026 :
   « si y a des versions karaoke c'est pas tres grave tant qu'on
   reconnait la musique ». Une reprise fidele lui convient donc, et
   c'est a son oreille d'en decider, pas a mon jugement sur un nom
   d'artiste.
"""
import io, json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
SORTIE = os.path.join(DEPOT, "verif")
sys.path.insert(0, ICI)
import pages_verif as P


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def page(nom, versions):
    lignes = []
    for n, d in enumerate(versions, 1):
        img = (u'<img class="pochette" loading="lazy" alt="" src="%s">'
               % P.ech(d[u"img"])) if d.get(u"img") else u'<div class="pochette"></div>'
        lignes.append(
            u'<div class="piste">\n  <div class="num">%d</div>\n  %s\n  <div>\n'
            u'    <p class="reponse">%s</p>\n    <p class="detail">%s &nbsp;·&nbsp; %s</p>\n'
            u'    <audio controls preload="none" src="%s"></audio>\n'
            u'    <p class="detail">%s</p>\n  </div>\n</div>'
            % (n, img, P.ech(d[u"t"]), P.ech(d[u"a"]), P.ech(d.get(u"an") or u""),
               P.ech(d[u"apercu"]), P.ech(d.get(u"alb") or u"")))

    entete = (u'<header>\n<a class="retour" href="index.html">← toutes les '
              u'catégories</a>\n<h1>%s — toutes les versions</h1>\n'
              u'<p class="sous">Apple France n\'a pas l\'enregistrement '
              u'd\'origine. Voilà les %d autres versions, remix écartés. '
              u'Écoute et dis-moi le numéro de celle que tu reconnais — '
              u'ou dis-moi qu\'aucune ne va.</p>\n</header>'
              % (P.ech(nom), len(versions)))

    corps = entete + u'<div class="liste">\n' + u"\n".join(lignes) + u'\n</div>'
    fichier = u"versions-%s.html" % plat(nom).replace(u" ", u"-")
    chemin = os.path.join(SORTIE, fichier)
    io.open(chemin, "w", encoding="utf-8", newline="").write(
        P.page(u"%s — toutes les versions" % nom, corps, P.STYLE))
    return chemin, len(versions)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    d = json.load(io.open(sys.argv[1], encoding="utf-8"))
    for nom in sys.argv[2:]:
        if nom not in d:
            print(u"« %s » n'est pas dans le fichier (il y a %s)"
                  % (nom, u", ".join(d)))
            continue
        chemin, n = page(nom, d[nom])
        print(u"%-20s %2d version(s) -> %s" % (nom, n, chemin))
