# -*- coding: utf-8 -*-
"""Range une image envoyee par Audrey dans le site, et la pose sur un morceau.

       python outils/pochette.py <image> <nom-du-fichier> [options]
       python outils/pochette.py <image> <nom> --playlist <manche> <rang>
       python outils/pochette.py <image> <nom> --candidat <categorie> <titre>

   Sans --playlist ni --candidat, l'image est seulement decoupee et rangee ;
   a toi d'ecrire l'adresse ou il faut.

   Options de cadrage, toutes facultatives, toutes entre 0 et 1 :
       --haut   part a retirer en haut avant de carrer (bandeau de console)
       --pos    ou prendre le carre dans une affiche plus haute que large :
                0 en haut (le defaut, le titre y est le plus souvent),
                1 en bas (Spirit, Kirby : leur titre est au pied de l'affiche)
       --gauche, --droite  pour une jaquette scannee en entier, ou deux
                jaquettes cote a cote : on ne garde que la part utile

   Les pochettes s'affichent dans un carre : une affiche plus haute que large
   s'y ferait rogner n'importe ou. On choisit donc nous-memes ce qu'on garde,
   et on garde ce qui porte la reponse — le titre, le visage qu'on reconnait.
"""
import io, json, os, re, sys
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
sys.path.insert(0, ICI)

DOSSIER = os.path.join(DEPOT, "images", "pochettes")
RACINE = u"https://morticia974.github.io/blindtest/images/pochettes/"


def carrer(im, haut=0.0, pos=0.0, gauche=0.0, droite=0.0):
    l, h = im.size
    if gauche or droite:
        im = im.crop((int(l * gauche), 0, int(l * (1 - droite)), h))
        l, h = im.size
    if haut:
        im = im.crop((0, int(h * haut), l, h))
        l, h = im.size
    if h > l:
        y = int((h - l) * max(0.0, min(1.0, pos)))
        return im.crop((0, y, l, y + l))
    if l > h:
        d = (l - h) // 2
        return im.crop((d, 0, d + h, h))      # le milieu
    return im


def ouvrir(source):
    """Les PNG decoupes arrivent avec un fond transparent, qui devient noir en
       RGB. On le pose sur du blanc."""
    im = Image.open(source)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        fond = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(fond, im)
    return im.convert("RGB")


def ranger(source, nom, haut=0.0, pos=0.0, gauche=0.0, droite=0.0):
    im = carrer(ouvrir(source), haut, pos, gauche, droite)
    if im.size[0] > 1000:
        im = im.resize((1000, 1000), Image.LANCZOS)
    if not os.path.isdir(DOSSIER):
        os.makedirs(DOSSIER)
    chemin = os.path.join(DOSSIER, nom + ".jpg")
    im.save(chemin, "JPEG", quality=88, optimize=True)
    return im.size, os.path.getsize(chemin) // 1024, RACINE + nom + ".jpg"


def poser_playlist(manche, rang, url, commentaire=None):
    import editeur as E
    s = E.lire()
    i = rang - 1
    t, a = E.titre_de(s, manche, i)
    mot = commentaire or u"Image donnée par Audrey : Apple n'avait rien qui parle de l'œuvre."
    if "pochette" in E.champs_de(s, *E.entrees(s, manche)[i]):
        s = E.remplacer_champ(s, manche, i, "pochette", url)
    else:
        s = E.ajouter(s, manche, i, [("pochette", url)], mot)
    E.ecrire(s)
    return u"%s #%d  %s | %s" % (manche, rang, t, a)


def poser_candidat(categorie, titre, url):
    """Pour un morceau qui attend encore sa validation, dans nouveautes.json."""
    chemin = os.path.join(DEPOT, "nouveautes.json")
    d = json.load(io.open(chemin, encoding="utf-8"))
    lot = d.get(categorie)
    if lot is None:
        raise SystemExit(u"catégorie inconnue : %s (il y a %s)"
                         % (categorie, u", ".join(sorted(d))))
    vus = [p for p in lot if p["t"].lower().startswith(titre.lower())]
    if len(vus) != 1:
        raise SystemExit(u"« %s » désigne %d morceaux dans %s : %s"
                         % (titre, len(vus), categorie,
                            u" / ".join(p["t"] for p in lot)[:300]))
    vus[0]["pochette"] = url
    io.open(chemin, "w", encoding="utf-8").write(
        json.dumps(d, ensure_ascii=False, indent=2) + u"\n")
    return u"%s : %s | %s" % (categorie, vus[0]["t"], vus[0].get("a") or u"")


def nombre(args, nom, defaut=0.0):
    if nom in args:
        return float(args[args.index(nom) + 1])
    return defaut


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2:
        raise SystemExit(__doc__)
    source, nom = a[0], a[1]
    taille, ko, url = ranger(source, nom, nombre(a, "--haut"), nombre(a, "--pos"),
                             nombre(a, "--gauche"), nombre(a, "--droite"))
    print(u"%d×%d px, %d Ko" % (taille[0], taille[1], ko))
    print(url)
    if "--playlist" in a:
        i = a.index("--playlist")
        print(poser_playlist(a[i + 1], int(a[i + 2]), url))
    elif "--candidat" in a:
        i = a.index("--candidat")
        print(poser_candidat(a[i + 1], a[i + 2], url))
