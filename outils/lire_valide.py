# -*- coding: utf-8 -*-
"""Relit un document annote par Audrey : ce qu'elle garde, refuse, commente.

       python outils/lire_valide.py <fichier.md> <nb de lignes> <sortie.txt>

   Elle barre ce qu'elle ne veut pas — le Bloc-notes l'ecrit `~~comme ceci~~`
   quand on enregistre en Markdown — et ecrit ses remarques ou elle veut.

   Les remarques, justement. Elles ne suivent pas toujours une fleche : la
   premiere fois j'en ai rate trois, glissees dans la colonne de l'artiste
   entre parentheses. « Merzhin (je prefere "Soleil blanc") » n'est pas un nom
   d'artiste, c'est une consigne. Tout ce qui depasse du couple titre/artiste
   est donc signale, quelle qu'en soit la forme, et rien n'est applique
   automatiquement : ces phrases se lisent, elles ne s'executent pas.
"""
import io, re, sys

BS = chr(92)
LIGNE = re.compile(r"(?:^|~~)[ ]*(\d{1,3})" + re.escape(BS) + r"?\.[ ]+(.+)$")
REMARQUE = re.compile(u"=>|\\(|«|\"|\\?$")


def lire(source, combien):
    t = io.open(source, encoding="utf-8").read().replace(u"&#x20;", u" ")
    garde, refuse, remarques = [], [], []

    for l in t.split(u"\n"):
        m = LIGNE.search(l)
        if not m:
            continue
        n = int(m.group(1))
        if not (1 <= n <= combien):
            continue
        nu = m.group(2).replace(BS, u"").replace(u"~~", u"")
        corps, fleche = (nu.split(u"=>", 1) + [u""])[:2]
        # La ligne de pointillés est entouree d'espaces ; les points de
        # suspension d'un titre collent au mot qui precede. Sans cette
        # nuance, « Chante... Comme si tu devais mourir demain .. Michel
        # Fugain » se lisait « Chante » / « Comme si tu devais mourir
        # demain », et le vrai artiste passait a la trappe. On prend aussi
        # le DERNIER morceau, pas le deuxieme, pour la meme raison.
        bouts = re.split(r"\s+\.{2,}\s+", corps.strip())
        if len(bouts) < 2:          # un titre de section, pas un morceau
            continue
        titre = bouts[0].strip(u" .")
        artiste = bouts[-1].strip(u" .")

        note = fleche.strip()
        if REMARQUE.search(artiste):
            note = (note + u" / " + artiste) if note else artiste
        if note:
            remarques.append((n, titre, note))
        (refuse if u"~~" in l else garde).append((n, titre, artiste))

    return garde, refuse, remarques, ajouts(t)


# Ce qui ressemble a un morceau : « Artiste - Titre », ou « Titre | Artiste »
AJOUT = re.compile(u"^(.{2,60}?)\\s+[-–—|]\\s+(.{2,60})$")
# Ce qui n'en est pas : mes propres phrases, et les barres de separation
PAS_UN_MORCEAU = re.compile(
    u"^[=\\-_ ]*$|catalogue|proposé|refus|objectif|Bloc-notes|Markdown|"
    u"ajouter|vérifier|^\\s*\\d{1,3}\\\\?\\.|Apple|morceaux|paquet|"
    u"NOUVEAUX|ZOUK|ANNÉES|tablée|barr", re.I)


def ajouts(t):
    """Les morceaux qu'Audrey ajoute de sa main, sans numero.

       Je les avais tous rates : le lecteur ne regardait que les lignes
       numerotees, et elle en avait ecrit treize a la fin du document, comme
       le fichier le lui proposait. Elle a du demander si je les avais vus.
       Desormais toute ligne qui ressemble a « Artiste - Titre » et qui n'est
       pas une de mes propres phrases est signalee."""
    out = []
    for l in t.split(u"\n"):
        l = l.replace(BS, u"").strip()
        if not l or PAS_UN_MORCEAU.search(l) or u"~~" in l:
            continue
        m = AJOUT.match(l)
        if m and u"." * 3 not in l:
            out.append(l)
    return out


def main(source, combien, sortie):
    garde, refuse, remarques, siens = lire(source, combien)
    tous = sorted(n for n, _, _ in garde + refuse)
    manquants = [n for n in range(1, combien + 1) if n not in tous]
    print(u"lus %d sur %d%s" % (len(tous), combien,
          u"" if not manquants else u"   MANQUANTS : %s" % manquants))
    print(u"%d refusés, %d gardés" % (len(refuse), len(garde)))

    if remarques:
        print(u"\n=== %d remarque(s), à lire et à traiter à la main ===" % len(remarques))
        for n, titre, note in remarques:
            print(u"  %3d  %-30s %s" % (n, titre[:30], note[:110]))

    if siens:
        print(u"\n=== %d morceau(x) qu'elle a ajouté(s) elle-même ===" % len(siens))
        for l in siens:
            print(u"       %s" % l[:100])

    io.open(sortie, "w", encoding="utf-8").write(
        u"\n".join(u"%s | %s" % (t_, a) for _, t_, a in garde) + u"\n")
    print(u"\ngardés écrits dans %s" % sortie)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3])
