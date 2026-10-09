# -*- coding: utf-8 -*-
"""Fabrique les pages de verification : une par categorie, tous les morceaux.

   Entree : audit.json (recolte dans le navigateur)
   Sortie : <depot>/verif/*.html
"""
import io, json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
SOURCE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "audit.json")
DOSSIER = r"C:\Users\Audrey\Documents\ClaudeAI\blindtest\verif"
VERSION = sys.argv[2] if len(sys.argv) > 2 else "1"

COMPILATION = re.compile(
    u"compil|greatest|best of|les plus|100 |nrj|top |collection|anthologie|essential|"
    u"vol[.]|annees|ann\u00e9es|generation|g\u00e9n\u00e9ration|tubes|platinum|golden|"
    u"party|karaok|tribute|made famous|in the style|various|string quartet|"
    u"piano tribute|lullaby|hits", re.I)


def plat(t):
    t = unicodedata.normalize("NFD", t or u"")
    t = u"".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", u" ", t).strip()


def douteux(e):
    """Ce qui merite un coup d'oeil : pas d'extrait, un album qui sent la
       compilation ou la reprise, ou un artiste qui n'est pas celui demande."""
    if not e.get("apercu"):
        return u"rien trouvé"
    if COMPILATION.search(e.get("alb") or u"") and not e.get("fix"):
        # Une pochette choisie a la main regle deja le probleme de l'image ;
        # l'album reste une compilation, mais ce n'est plus la peine de le dire.
        return u"album douteux"
    if not e.get("sol"):
        a, aa = plat(e.get("a")), plat(e.get("aa"))
        if a and aa and a not in aa and aa not in a:
            return u"autre artiste"
    return u""


def ech(t):
    return (t or u"").replace(u"&", u"&amp;").replace(u"<", u"&lt;") \
                     .replace(u">", u"&gt;").replace(u'"', u"&quot;")


def fichier_de(nom):
    t = plat(nom).replace(u" ", u"-")
    return (t or u"categorie") + u".html"


STYLE = u"""
:root { --fond:#0f1116; --carte:#171a21; --trait:#262b36; --texte:#e8eaf0;
        --doux:#9aa3b5; --jaune:#ffd166; --vert:#7ee787; --rouge:#ff8a8a; }
* { box-sizing:border-box }
body { margin:0; background:var(--fond); color:var(--texte);
       font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif; padding:22px 14px 90px }
header { max-width:980px; margin:0 auto 22px }
h1 { font-size:26px; margin:0 0 6px }
.sous { color:var(--doux); font-size:15px; margin:0 }
.retour { color:var(--jaune); font-size:14px; text-decoration:none; display:inline-block; margin-bottom:10px }
.liste { max-width:980px; margin:0 auto; display:grid; gap:14px }
.piste { display:grid; grid-template-columns:54px 100px 1fr; gap:14px; align-items:start;
         background:var(--carte); border:1px solid var(--trait); border-radius:14px; padding:12px }
.num { font-size:24px; font-weight:800; color:var(--jaune); text-align:center; padding-top:4px }
.pochette { width:100px; height:100px; border-radius:10px; object-fit:cover;
            background:#222; display:block }
.reponse { font-size:19px; font-weight:700; margin:0 0 2px }
.detail { color:var(--doux); font-size:13px; margin:0 0 9px }
audio { width:100%; max-width:420px; height:36px; margin-bottom:8px; display:block }
.essais { display:flex; flex-wrap:wrap; gap:8px; align-items:center }
button { font:inherit; font-size:14px; background:#222838; color:var(--texte);
         border:1px solid var(--trait); border-radius:999px; padding:7px 13px; cursor:pointer }
button:hover { border-color:var(--jaune) }
button.ecoute { border-color:var(--vert); color:var(--vert) }
input.b-texte { font:inherit; font-size:14px; background:#10141c; color:var(--texte);
                border:1px solid var(--trait); border-radius:999px; padding:7px 13px; width:190px }
.verdict { font-size:14px; width:100%; min-height:1px }
.verdict.bon { color:var(--vert) }
.verdict.rate { color:var(--rouge) }
.doute { font-size:12px; font-weight:600; color:var(--jaune); border:1px solid #6b5a22;
         background:#2a2412; border-radius:999px; padding:2px 8px; vertical-align:middle;
         white-space:nowrap }
@media (max-width:620px) {
  .piste { grid-template-columns:38px 68px 1fr; gap:9px; padding:10px }
  .pochette { width:68px; height:68px }
  .num { font-size:19px }
  .reponse { font-size:16px }
  input.b-texte { width:140px }
}
"""

INDEX_PLUS = u"""
.cats { max-width:980px; margin:0 auto; display:grid; gap:12px;
        grid-template-columns:repeat(auto-fill,minmax(240px,1fr)) }
.cat { display:block; background:var(--carte); border:1px solid var(--trait); border-radius:14px;
       padding:15px; color:var(--texte); text-decoration:none }
.cat:hover { border-color:var(--jaune) }
.cat b { display:block; font-size:17px; margin-bottom:3px }
.cat span { color:var(--doux); font-size:13px }
.mode { max-width:980px; margin:0 auto 22px; background:var(--carte); border:1px solid var(--trait);
        border-radius:14px; padding:15px; font-size:15px; color:var(--doux) }
.mode b { color:var(--texte) }
"""


def page(titre, corps, style, scripts=u""):
    return (u"<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n"
            u"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n"
            u"<title>%s</title>\n<style>%s</style>\n</head>\n<body>\n%s\n%s</body>\n</html>\n"
            % (ech(titre), style, corps, scripts))


def main():
    donnees = json.load(io.open(SOURCE, encoding="utf-8"))
    par_cat = {}
    for e in donnees.values():
        par_cat.setdefault(e["cat"], []).append(e)
    for v in par_cat.values():
        v.sort(key=lambda e: e["i"])

    if not os.path.isdir(DOSSIER):
        os.makedirs(DOSSIER)

    ordre = sorted(par_cat.keys(), key=lambda c: par_cat[c][0].get("nom") or c)
    cartes = []

    for cat in ordre:
        pistes = par_cat[cat]
        nom = pistes[0].get("nom") or cat
        emoji = pistes[0].get("emoji") or u""
        lignes, data, aRegarder = [], [], 0

        for n, e in enumerate(pistes, 1):
            if e.get("sol") == "artiste":
                reponse = e["a"]
                detail = u"musique : " + (e["t"] or u"")
            elif e.get("sol") == "titre":
                reponse = e["t"]
                detail = e["a"] or u""
            else:
                reponse = u"%s — %s" % (e["t"], e["a"])
                detail = u""
            if e.get("alb"):
                detail += (u" · " if detail else u"") + u"album : " + e["alb"]

            doute = douteux(e)
            if doute:
                aRegarder += 1
            badge = (u' <span class="doute">%s</span>' % ech(doute)) if doute else u""

            son = (u'<audio controls preload="none" src="%s"></audio>' % ech(e["apercu"])) \
                if e.get("apercu") else u'<p class="detail">Apple n\'a rien renvoyé.</p>'
            img = (u'<a href="%s" target="_blank" rel="noopener">'
                   u'<img class="pochette" loading="lazy" alt="" src="%s"></a>'
                   % (ech(e["img"]), ech(e["img"]))) if e.get("img") else u'<div class="pochette"></div>'

            lignes.append(
                u'<div class="piste" data-i="%d">\n'
                u'  <div class="num">%d</div>\n  %s\n  <div>\n'
                u'    <p class="reponse">%s%s</p>\n    <p class="detail">%s</p>\n    %s\n'
                u'    <div class="essais">\n'
                u'      <button type="button" class="b-dire">🔊 Entendre la réponse</button>\n'
                u'      <button type="button" class="b-micro">🎙️ Répondre à la voix</button>\n'
                u'      <input class="b-texte" type="text" placeholder="ou tape, puis Entrée…"'
                u' autocomplete="off" spellcheck="false">\n'
                u'      <span class="verdict"></span>\n    </div>\n  </div>\n</div>'
                % (n - 1, n, img, ech(reponse), badge, ech(detail), son))

            data.append({
                "t": e["t"], "a": e["a"], "at": e.get("at") or "", "aa": e.get("aa") or "",
                "altT": e.get("altT") or [], "altA": e.get("altA") or [],
                "strict": bool(e.get("strict")), "sol": e.get("sol") or "",
                "lab": e.get("lab") or "Artiste", "langue": e.get("langue") or "fr",
                "lgT": e.get("lgT") or "", "lgA": e.get("lgA") or "",
                "ditT": e.get("ditT") or "", "ditA": e.get("ditA") or ""
            })

        entete = (u'<header>\n<a class="retour" href="index.html">← toutes les catégories</a>\n'
                  u'<h1>%s %s</h1>\n<p class="sous">%d morceaux. Écoute, et note les numéros qui '
                  u'ne vont pas : mauvaise musique, pochette à côté, réponse mal dite, mot refusé.</p>\n'
                  u'</header>\n' % (emoji, ech(nom), len(pistes)))
        corps = entete + u'<div class="liste">\n' + u"\n".join(lignes) + u'\n</div>'
        scripts = (u'<script>window.PISTES = %s;</script>\n'
                   u'<script src="../js/match.js?v=%s"></script>\n'
                   u'<script src="verif.js?v=%s"></script>\n'
                   % (json.dumps(data, ensure_ascii=False), VERSION, VERSION))

        io.open(os.path.join(DOSSIER, fichier_de(nom)), "w", encoding="utf-8", newline="").write(
            page(nom, corps, STYLE, scripts))

        cartes.append(u'<a class="cat" href="%s"><b>%s %s</b><span>%d morceaux%s</span></a>'
                      % (ech(fichier_de(nom)), emoji, ech(nom), len(pistes),
                         u" · %d à regarder" % aRegarder if aRegarder else u""))

    total = sum(len(v) for v in par_cat.values())
    corps = (u'<header>\n<h1>🎧 Tout le catalogue, à vérifier</h1>\n'
             u'<p class="sous">%d morceaux, %d catégories. Aucun hasard : tout y est.</p>\n</header>\n'
             u'<div class="mode">\nPour chaque morceau&nbsp;: la <b>pochette</b> (clique dessus pour '
             u'la voir en grand), la <b>réponse à trouver</b>, l\'<b>extrait</b> tel qu\'il sera joué, '
             u'et deux boutons — <b>🔊 entendre la réponse</b> comme le site la dit en partie, et '
             u'<b>🎙️ répondre à la voix</b> pour voir si c\'est accepté. Le champ à côté fait pareil '
             u'au clavier.<br><br>L\'étiquette <span class="doute">à regarder</span> est de moi : '
             u'album qui sent la compilation ou la reprise, artiste qui n\'est pas celui demandé. '
             u'C\'est un soupçon, pas un verdict — ton oreille tranche.\n</div>\n'
             u'<div class="cats">\n%s\n</div>'
             % (total, len(par_cat), u"\n".join(cartes)))
    io.open(os.path.join(DOSSIER, u"index.html"), "w", encoding="utf-8", newline="").write(
        page(u"Catalogue à vérifier", corps, STYLE + INDEX_PLUS))

    print(u"%d pages + index dans %s" % (len(par_cat), DOSSIER))


main()
