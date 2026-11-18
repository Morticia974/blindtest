# -*- coding: utf-8 -*-
"""Cherche les doublons de REPONSE, et pas de titre ou d'artiste.

       python outils/doublons_reponse.py [categorie_en_attente]

   Audrey a trouve le defaut le 12/11/2026, sur les OST animes :
   « je pense qu'il y a pas mal de doublons avec les dessins animes,
   du genre Dragon Ball Z, Chevalier du Zodiac, Nicky Larson ».

   Mon script de tri n'ecartait que les animes deja dans la categorie
   `anime`. Or « Dragon Ball Z » est la reponse a donner dans
   « Dessins animes » aussi : deux categories differentes, la meme
   reponse. Pire, la reponse n'y est pas dans le meme champ : la
   categorie porte `solo: 'titre'`, donc c'est `t` qui est la reponse et
   `a` qui vaut « Bernard Minet ». Chercher dans `a` ne pouvait rien
   trouver.

   On lit donc `solo` pour savoir ou est la reponse, et on prend aussi
   les orthographes acceptees (altT / altA) : c'est la que dorment
   « Saint Seiya », « City Hunter » et « Captain Tsubasa », les noms
   japonais que mes fiches utilisaient.
"""
import io, json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.dirname(ICI)
sys.path.insert(0, ICI)
import editeur as E

PETITS = set(u"le la les un une des du de dans au aux et l d the a of".split())


def plat(s):
    s = unicodedata.normalize("NFD", s or u"")
    s = u"".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", s).strip()


def noyau(s):
    """Sans les petits mots : « le chateau dans le ciel » -> « chateau ciel ».

       Evite que deux titres se ressemblent par leurs seuls articles.
    """
    return u" ".join(m for m in plat(s).split() if m not in PETITS)


def dedans(petit, grand):
    """Les mots de `petit` se suivent-ils tels quels dans `grand` ?"""
    if not petit or len(petit) > len(grand):
        return False
    for i in range(len(grand) - len(petit) + 1):
        if grand[i:i + len(petit)] == petit:
            return True
    return False


def parent(un, autre):
    """Deux noms designent-ils la meme oeuvre ?

       Par MOTS ENTIERS dans un sens ou dans l'autre, et non par egalite
       ni par bouts de chaine. L'egalite laissait passer « Goldorak : Et
       l'aventure continue » face a « Goldorak », et « Dis-moi Bioman »
       face a « Bioman » : memes reponses, cribles differents. Les bouts
       de chaine, eux, ecartaient « Supernana » a cause de « NANA ».
    """
    a, b = noyau(un).split(), noyau(autre).split()
    return dedans(a, b) or dedans(b, a)


def liste(bloc, champ):
    m = re.search(champ + r': \[([^\]]*)\]', bloc)
    if not m:
        return []
    return re.findall(r'"([^"]+)"', m.group(1))


def reponses():
    """Toutes les reponses du jeu : {noyau: [(categorie, reponse)]}."""
    s = E.lire()
    out = {}
    for cat, solo in categories(s):
        for d, f in E.entrees(s, cat):
            bloc = s[d:f + 1]
            if solo == u"titre":
                champ, alt = u"t", u"altT"
            else:
                champ, alt = u"a", u"altA"
            m = re.search(champ + r': "([^"]+)"', bloc)
            noms = ([m.group(1)] if m else []) + liste(bloc, alt)
            for n in noms:
                out.setdefault(noyau(n), []).append((cat, noms[0]))
    return out


def categories(s):
    """(id, solo) de chaque categorie dont la reponse est une oeuvre."""
    out = []
    for m in re.finditer(r"id: '([a-z0-9]+)'", s):
        bout = s[m.end():m.end() + 900]
        so = re.search(r"solo: '(titre|artiste)'", bout)
        if so:
            out.append((m.group(1), so.group(1)))
    return out


def main(cat_attente=None):
    deja = reponses()
    d = json.load(io.open(os.path.join(DEPOT, "nouveautes.json"), encoding="utf-8"))
    for cat in ([cat_attente] if cat_attente else list(d)):
        pistes = d.get(cat, [])
        print(u"\n### %s : %d fiche(s) en attente, %d reponses au jeu"
              % (cat, len(pistes), len(deja)))
        coll = []
        for i, p in enumerate(pistes, 1):
            vus, ou = set(), []
            for cle, v in deja.items():
                if not parent(p["a"], cle):
                    continue
                for c, n in v:
                    if (c, n) not in vus:
                        vus.add((c, n))
                        ou.append((c, n))
            if ou:
                coll.append((i, p["a"], p["t"], ou))
        print(u"=== %d doublon(s) de reponse ===" % len(coll))
        for i, a, t, ou in coll:
            print(u"%3d  %-28s %-24s  deja : %s"
                  % (i, a[:28], t[:24],
                     u" / ".join(u"%s (%s)" % (n[:26], c) for c, n in ou)))
        print(u"il resterait %d fiche(s)" % (len(pistes) - len(coll)))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
