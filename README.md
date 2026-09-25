# 🎧 Ok Balance le Son Papa

Un blind test en ligne, pour jouer à plusieurs, chacun sur son téléphone.

Pas de maître du jeu : la playlist s'enchaîne toute seule, tout le monde tape
ses réponses en même temps, et les points tombent automatiquement — plus tu
réponds vite, plus tu marques.

- **12 titres par partie** (réglable de 5 à 25)
- **18 catégories prêtes** (384 morceaux), plus le « Grand mélange » qui pioche
  dans tout :

  | | | |
  |---|---|---|
  | 📻 Années 60-70 | 🕹️ Années 80 | 📼 Années 90 |
  | 💿 Années 2000 | 📱 Années 2010-2020 | 🥖 Variété française |
  | 🎙️ Rap & R'n'B français | 🎸 Rock intemporel | 🤘 Métal |
  | 🕶️ Dancefloor & tubes d'été | 🍻 Karaoké | 🌍 Musiques du monde & latino |
  | 🏰 Disney & dessins animés | 📺 Dessins animés des années 90 \* | 🍥 OST animés \* |
  | 🎮 Jeux vidéo \* | 🍿 Génériques cultes \* | 🎭 Comédies musicales |

  \* Ces quatre catégories ne demandent **qu'une seule réponse** : le dessin
  animé, l'anime, le jeu, le film. Deviner « Kaikai Kitan » ou « Ezio's Family »
  n'aurait aucun intérêt. La réponse rapporte alors autant qu'une manche
  complète, et le titre du morceau est affiché à la révélation.
- **Les extraits viennent du catalogue Apple Music** : 30 secondes, gratuits,
  sans compte, sans clé, et les liens ne périment jamais
- **Correction tolérante** : les fautes de frappe, les accents oubliés et les
  variantes (« guns and roses » pour « Guns N' Roses ») sont acceptés
- **Réponse groupée** : si tu connais tout, tape tout d'un coup — « Africa Toto »,
  « Toto Africa » ou « Africa de Toto » marquent les deux points en une fois

---

## Essayer tout de suite

Double-clique sur `index.html`. Le jeu démarre en **mode local** : tout
fonctionne — la musique, les manches, les scores — mais seuls les onglets de
**ton** navigateur se voient entre eux. C'est parfait pour tester, et tu peux
même ouvrir deux onglets pour simuler deux joueurs.

Pour jouer pour de vrai avec tes amis, chacun chez soi, il faut passer à
l'étape suivante.

---

## Mettre le jeu en ligne

Deux choses à faire, gratuites toutes les deux : une **base de données** (pour
que les joueurs se voient entre eux) et un **hébergement** (pour que le site
ait une adresse).

Compte une vingtaine de minutes la première fois.

### Étape 1 — La base de données (Firebase)

1. Va sur **console.firebase.google.com** et connecte-toi avec un compte Google.
2. **Créer un projet**. Donne-lui un nom (« blindtest » par exemple).
   Tu peux refuser Google Analytics, on n'en a pas besoin.
3. Dans le menu de gauche : **Créer** → **Realtime Database** → **Créer une base
   de données**.
   - Choisis l'emplacement **europe-west1** (Belgique) — c'est le plus proche.
   - Choisis **Démarrer en mode verrouillé**. On va écrire les règles nous-mêmes
     juste après.
4. Onglet **Règles** de la base. Remplace tout par ceci, puis **Publier** :

   ```json
   {
     "rules": {
       "salons": {
         "$code": {
           ".read": "auth != null",
           ".write": "auth != null"
         }
       }
     }
   }
   ```

   Traduction : seules les personnes connectées au jeu peuvent lire et écrire
   dans les salons, et rien d'autre dans la base n'est accessible.

   > **Journal de bord.** Le site enregistre discrètement qui passe : nombre de
   > visites, de visiteurs, de parties lancées, et le pseudo de chaque personne
   > entrée dans un salon. Rien ne s'affiche sur le site ; ça se consulte sur
   > **`journal.html`**, une page qui n'est liée nulle part.
   >
   > Ces données sont rangées dans `salons/_prive`, pour tenir dans les règles
   > ci-dessus sans en ajouter. Les vrais codes de salon font quatre lettres,
   > donc aucun risque de collision. Le bouton « Vider le journal » de la page
   > remet tout à zéro ; on peut aussi supprimer le nœud à la main dans l'onglet
   > **Données** de la base.
   >
   > ⚠️ Page discrète, pas secrète : elle n'est liée nulle part et les moteurs de
   > recherche l'ignorent, mais quelqu'un qui connaîtrait l'adresse pourrait
   > l'ouvrir. Ce ne sont que des pseudos de jeu et des dates.

5. Menu de gauche → **Authentication** → **Commencer** → onglet **Sign-in
   method** → active **Anonyme**.
   C'est ce qui donne une identité à chaque joueur sans lui demander de créer
   un compte.

6. Menu de gauche → **⚙️ Paramètres du projet** → descends jusqu'à **Vos
   applications** → clique l'icône **`</>`** (Web) → donne un surnom →
   **Enregistrer l'application**.

7. Firebase t'affiche un bloc `const firebaseConfig = { ... }`.
   Recopie ces valeurs dans **`js/config.js`**, à la place des `"COLLE-ICI..."`.

   ⚠️ Vérifie qu'il y a bien une ligne **`databaseURL`**. Si elle manque, va la
   chercher dans **Realtime Database** : c'est l'adresse affichée en haut, du
   genre `https://blindtest-xxxx-default-rtdb.europe-west1.firebasedatabase.app`.

> Ces clés sont visibles par tout le monde dans la page : c'est normal et prévu
> par Firebase. Ce ne sont pas des mots de passe — la sécurité vient des règles
> écrites à l'étape 4.

### Étape 2 — L'hébergement (GitHub Pages)

1. Crée un compte gratuit sur **github.com**.
2. **New repository** : donne-lui un nom (`blindtest`), coche **Public**,
   puis **Create repository**.
3. Sur la page du dépôt vide, clique **uploading an existing file**.
4. Fais glisser **tout le contenu** du dossier `blindtest` (le fichier
   `index.html`, le dossier `css`, le dossier `js`) dans la zone de dépôt,
   puis **Commit changes**.
5. Onglet **Settings** → **Pages** (menu de gauche) → sous *Source*, choisis
   **Deploy from a branch**, branche **main**, dossier **/ (root)** → **Save**.
6. Attends deux minutes, recharge la page : GitHub affiche l'adresse de ton
   site, du genre `https://tonpseudo.github.io/blindtest/`.

C'est cette adresse que tu envoies à tes amis. 🎉

> **Alternative encore plus simple** : va sur **app.netlify.com/drop** et fais
> glisser le dossier `blindtest` dans la page. Tu obtiens une adresse
> immédiatement. Il faudra créer un compte gratuit pour la garder.

---

## Comment on joue

1. Chacun ouvre l'adresse du site sur son téléphone.
2. Une personne clique **Créer un salon** et partage le **code à 4 lettres**
   (ou le lien, avec le bouton *Copier le lien*).
3. Les autres entrent le code et cliquent **Rejoindre**.
4. L'hôte choisit la playlist et clique **Lancer la partie**.
5. Pendant chaque extrait, tape ce que tu reconnais : le **titre**, l'**artiste**,
   ou **les deux d'un coup** si tu connais toute la réponse.

   « Africa », « Toto », « Africa Toto », « Toto Africa », « Africa de Toto » :
   tout est accepté. Le jeu découpe lui-même ta phrase et t'attribue tout ce
   qu'il y reconnaît. Et si une moitié est juste et l'autre fausse, tu gardes
   les points de la bonne moitié.

   Sur certaines catégories (jeux vidéo, animes, génériques, Club Dorothée),
   une seule case s'affiche : il n'y a qu'une chose à trouver.

**Les points** : 100 pour le titre, 100 pour l'artiste, +50 de bonus si tu
trouves les deux. Le tout diminue au fil des secondes, donc répondre vite paie.

**L'hôte** est simplement le joueur arrivé en premier. C'est son navigateur qui
prépare les extraits et fait avancer les manches. S'il ferme son onglet, le
joueur suivant prend le relais automatiquement — la partie ne s'arrête pas.

---

## Changer les playlists

Tout est dans **`js/playlists.js`**. Chaque morceau est écrit comme une
recherche, pas comme un lien figé :

```js
{ t: "Alors on danse", a: "Stromae" },
```

- `t` = le titre, `a` = l'artiste. C'est aussi ce qu'il faudra deviner.
- `q` (facultatif) = la recherche à envoyer à Apple, si le titre seul ne suffit
  pas à retrouver le bon morceau.
- `altT` / `altA` (facultatif) = d'autres réponses acceptées.
  Exemple : `altT: ["Satisfaction"]`.

Pour créer une playlist entière, copie un bloc existant et change son `id`, son
`nom`, son `emoji` et sa liste de `pistes`. Elle apparaîtra toute seule dans
le salon.

Trois réglages se posent sur la **catégorie** (et non sur un morceau) :

- `labelT` et `labelA` : l'intitulé des deux cases de réponse. « Titre » et
  « Artiste » par défaut, mais aussi « Jeu », « Anime », « Film ou série »,
  « Dessin animé », « Interprète »…
- `solo` : rend la manche à réponse unique. `solo: 'artiste'` ne fait deviner
  que la deuxième case (le jeu, l'anime, le film) ; `solo: 'titre'` ne fait
  deviner que la première. L'autre information reste affichée à la révélation,
  mais ne rapporte rien — et la bonne réponse vaut alors le score plein.
- `strict` : exige le titre **exact** de l'œuvre. Normalement, le jeu accepte
  aussi le nom de l'artiste tel qu'Apple l'écrit — ce qui laisserait répondre
  « Hans Zimmer » au lieu de « Gladiator », ou « Yann Tiersen » au lieu du
  « Fabuleux Destin d'Amélie Poulain ». Avec `strict: true`, seules les formes
  écrites dans `a` et `altA` comptent. Les fautes de frappe restent pardonnées.

  Activé sur les génériques, les animes et les jeux vidéo.

  **La règle retenue** : le titre du film doit être écrit en entier, mais le
  nom de la **licence** est toujours accepté. « Star Wars » vaut pour la Marche
  impériale, « Harry Potter » pour le thème d'Hedwige, « Rocky » pour *Rocky III*.
  En revanche un titre simplement tronqué ne passe pas : « Amélie Poulain » est
  refusé, il faut « Le Fabuleux Destin d'Amélie Poulain ».

  Concrètement : `a` reçoit le titre complet et exact, `altA` la licence et les
  titres officiels en VO. Si une réponse te paraît trop sévère à l'usage,
  ajoute-la dans `altA` : c'est le seul endroit à toucher.

**Deux pièges appris à la dure**, si tu ajoutes des morceaux :

- **Recopie l'orthographe exacte du catalogue Apple.** « Ranma ½ » ne donne
  rien, « Ranma 1/2 » fonctionne. En cas de doute, cherche d'abord le morceau
  sur music.apple.com et recopie le titre affiché dans le champ `q`.
- **Certains catalogues sont absents.** Nintendo n'est pas sur Apple Music :
  les morceaux de Zelda et Mario du jeu sont des versions orchestrales, dont la
  mélodie est identique. Et quelques génériques (Albator, Cobra, Inspecteur
  Gadget, Les Mondes engloutis) n'existent nulle part — inutile d'insister.

---

## Réglages

Dans **`js/config.js`**, section `partie` : nombre de titres, durée des
extraits, points, part du score qui dépend de la rapidité. Les trois premiers
sont aussi réglables directement depuis l'écran du salon, avant de lancer.

---

## Si ça coince

**« Mode local » s'affiche alors que j'ai rempli config.js**
Une valeur contient encore `COLLE-ICI`, ou `databaseURL` est absente. La
bannière jaune en haut de l'accueil affiche le message d'erreur exact.

**Le son ne démarre pas sur iPhone**
Les iPhone n'autorisent le son qu'après un vrai geste. Touche l'écran une fois
après avoir rejoint le salon. Vérifie aussi le petit bouton silencieux sur la
tranche du téléphone.

**Un morceau est sauté**
Apple n'a pas d'extrait pour celui-là dans le catalogue français. Le jeu passe
automatiquement au suivant, il y a toujours de la réserve.

**Plus rien ne se charge après plusieurs parties d'affilée**
Apple limite le nombre de recherches par minute. Attends une minute. Les
morceaux déjà joués sont gardés en mémoire, donc ça s'arrange à l'usage.

**J'ai modifié un fichier et rien ne change**
Le navigateur sert l'ancienne version gardée en mémoire. Dans `index.html`,
remplace tous les `?v=2` par `?v=3` (puis `?v=4` la fois suivante, etc.) et
recharge. C'est à ça que servent ces petits numéros.

**Je veux repartir de zéro**
Dans la console du navigateur (touche F12) : `localStorage.clear()` puis
recharge la page.

---

## Sous le capot

| Fichier | Rôle |
|---|---|
| `index.html` | Les quatre écrans : accueil, salon, jeu, résultats |
| `css/style.css` | Toute la mise en forme |
| `js/config.js` | **Le seul fichier à modifier** : clés Firebase et réglages |
| `js/match.js` | La correction des réponses (fautes de frappe, accents, variantes) |
| `js/playlists.js` | Les playlists |
| `js/itunes.js` | La recherche des extraits chez Apple, avec cache |
| `js/net.js` | Le salon partagé — version locale et version Firebase |
| `js/game.js` | La boucle de jeu, la synchro et les points |
| `js/app.js` | L'interface, le lecteur audio et le visualiseur |

Tous les joueurs se calent sur **l'heure du serveur**, pas sur celle de leur
téléphone : c'est ce qui garantit que tout le monde entend le même passage au
même moment, et qu'un retardataire tombe au bon endroit de l'extrait.

À noter : les réponses circulent en clair dans le salon. Quelqu'un de vraiment
décidé pourrait aller les lire dans les outils de développement de son
navigateur. Entre amis, ça n'a jamais posé de problème — mais autant que tu le
saches.
