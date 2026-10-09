# -*- coding: utf-8 -*-
"""Edite les entrees de js/playlists.js sans jamais casser la syntaxe.

   Chaque entree est un objet JS { t: "...", a: "...", ... } ecrit sur une ou
   plusieurs lignes. On la retrouve par sa manche et son rang, on lit ses
   accolades en comptant celles qui sont dans des chaines, et on ajoute les
   champs demandes juste avant la fermeture.
"""
import io, json, re, shutil

CHEMIN = r"C:\Users\Audrey\Documents\ClaudeAI\blindtest\js\playlists.js"


def lire():
    return io.open(CHEMIN, encoding="utf-8").read()


def ecrire(s):
    io.open(CHEMIN + ".tmp", "w", encoding="utf-8", newline="").write(s)
    shutil.move(CHEMIN + ".tmp", CHEMIN)


def bloc_manche(s, idm):
    """Les bornes du bloc d'une manche dans le fichier."""
    d = s.index(u"id: '%s'" % idm)
    suite = s.find(u"      id: '", d + 10)
    return d, (suite if suite != -1 else len(s))


def saut_commentaire(s, i):
    """Si un commentaire commence ici, l'indice juste apres sa fin."""
    if s.startswith(u"//", i):
        f = s.find(chr(10), i)
        return len(s) if f == -1 else f
    if s.startswith(u"/*", i):
        f = s.find(u"*/", i + 2)
        return len(s) if f == -1 else f + 2
    return i


def fin_objet(s, debut):
    """Indice de l'accolade fermante de l'objet ouvert en `debut`.

       Les commentaires sont sautes en entier : il y en a beaucoup dans ce
       fichier, et une apostrophe francaise dedans — « l'album » — passait pour
       le debut d'une chaine, apres quoi plus rien n'etait compte juste."""
    i, prof, chaine, echap = debut, 0, None, False
    while i < len(s):
        if not chaine:
            j = saut_commentaire(s, i)
            if j != i:
                i = j
                continue
        c = s[i]
        if chaine:
            if echap:
                echap = False
            elif c == u"\\":
                echap = True
            elif c == chaine:
                chaine = None
        elif c in u"\"'":
            chaine = c
        elif c == u"{":
            prof += 1
        elif c == u"}":
            prof -= 1
            if prof == 0:
                return i
        i += 1
    raise ValueError(u"accolade jamais refermee")


def entrees(s, idm):
    """[(debut, fin)] des pistes d'une manche, dans l'ordre."""
    d, f = bloc_manche(s, idm)
    p = s.index(u"pistes: [", d)
    out, i = [], p
    prof = 0
    while i < f:
        j = saut_commentaire(s, i)
        if j != i:
            i = j
            continue
        c = s[i]
        if c == u"{":
            j = fin_objet(s, i)
            out.append((i, j))
            i = j + 1
            continue
        if c == u"]" and prof == 0:
            break
        i += 1
    return out


def champs_de(s, debut, fin):
    """Les noms de champs deja presents dans l'entree."""
    return set(re.findall(r"(\w+)\s*:", s[debut:fin + 1]))


def ajouter(s, idm, rang, champs, commentaire=None):
    """Ajoute des champs a la piste `rang` (0 = la premiere) de la manche."""
    lst = entrees(s, idm)
    debut, fin = lst[rang]
    texte = s[debut:fin + 1]
    deja = champs_de(s, debut, fin)

    morceaux = []
    for cle, val in champs:
        if cle in deja:
            raise ValueError(u"%s#%d a deja un champ %s : %s" % (idm, rang, cle, texte[:90]))
        morceaux.append(u"%s: %s" % (cle, json.dumps(val, ensure_ascii=False)))
    if not morceaux:
        return s

    ajout = u", " + u", ".join(morceaux)
    if commentaire:
        ajout = u",\n          /* %s */\n          " % commentaire + u", ".join(morceaux)

    neuf = texte[:-1].rstrip()
    if neuf.endswith(u","):
        neuf = neuf[:-1]
    neuf = neuf + ajout + u" }"
    return s[:debut] + neuf + s[fin + 1:]


def remplacer_champ(s, idm, rang, cle, val):
    """Change la valeur d'un champ existant (ou l'ajoute s'il manque)."""
    lst = entrees(s, idm)
    debut, fin = lst[rang]
    texte = s[debut:fin + 1]
    if cle not in champs_de(s, debut, fin):
        return ajouter(s, idm, rang, [(cle, val)])
    motif = re.compile(r"(\b%s\s*:\s*)(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|\[[^\]]*\]|[^,}\n]+)" % cle)
    neuf, n = motif.subn(lambda m: m.group(1) + json.dumps(val, ensure_ascii=False), texte, count=1)
    assert n == 1, u"champ %s introuvable dans %s" % (cle, texte[:80])
    return s[:debut] + neuf + s[fin + 1:]


def supprimer(s, idm, rang):
    """Retire une piste entiere, virgule comprise."""
    lst = entrees(s, idm)
    debut, fin = lst[rang]
    f = fin + 1
    while f < len(s) and s[f] in u" ,":
        f += 1
    d = debut
    while d > 0 and s[d - 1] in u" ":
        d -= 1
    # on emporte la ligne si elle ne contenait que ca
    if d > 0 and s[d - 1] == u"\n" and f < len(s) and s[f] == u"\n":
        f += 1
    return s[:d] + s[f:]


def titre_de(s, idm, rang):
    lst = entrees(s, idm)
    debut, fin = lst[rang]
    m = re.search(r't:\s*"((?:[^"\\]|\\.)*)"', s[debut:fin + 1])
    a = re.search(r'a:\s*"((?:[^"\\]|\\.)*)"', s[debut:fin + 1])
    return (m.group(1) if m else u"?"), (a.group(1) if a else u"?")


def ajouter_liste(s, idm, rang, cle, valeurs, commentaire=None):
    """Ajoute des valeurs a un champ liste (altT, altA), qu'il existe ou non.

       Les doublons sont ecartes, et l'ordre d'origine est garde : ce qui etait
       ecrit a la main dans la playlist reste en tete."""
    lst = entrees(s, idm)
    debut, fin = lst[rang]
    texte = s[debut:fin + 1]

    if cle not in champs_de(s, debut, fin):
        return ajouter(s, idm, rang, [(cle, list(valeurs))], commentaire)

    m = re.search(r"\b%s\s*:\s*(\[[^\]]*\])" % cle, texte)
    assert m, u"%s introuvable dans %s" % (cle, texte[:90])
    deja = json.loads(m.group(1))
    out = list(deja)
    for v in valeurs:
        if v not in out:
            out.append(v)
    neuf = texte[:m.start(1)] + json.dumps(out, ensure_ascii=False) + texte[m.end(1):]
    return s[:debut] + neuf + s[fin + 1:]
