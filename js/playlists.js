/* playlists.js — les manches prêtes à jouer.
   Chaque morceau est une recherche (titre + artiste), pas un lien figé :
   iTunes retrouve l'extrait au moment de la partie, donc rien ne périme.

   Format d'un morceau : { t: titre, a: artiste, q: recherche (facultatif),
                           altT: [autres titres acceptés], altA: [autres artistes acceptés] }
   Format d'une manche : { id, nom, emoji, desc, labelA: étiquette de la 2e réponse,
                           pistes: [...] }                                              */

var Playlists = (function () {
  'use strict';

  var manches = [
    {
      id: 'annees80',
      nom: "Années 80",
      emoji: "🕹️",
      desc: "Synthés, épaulettes et refrains increvables.",
      labelA: "Artiste",
      pistes: [
        { t: "Billie Jean", a: "Michael Jackson" },
        { t: "Take On Me", a: "a-ha" },
        { t: "Africa", a: "Toto" },
        { t: "The Final Countdown", a: "Europe" },
        { t: "Sweet Dreams (Are Made of This)", a: "Eurythmics" },
        { t: "Every Breath You Take", a: "The Police" },
        { t: "Livin' on a Prayer", a: "Bon Jovi" },
        { t: "Girls Just Want to Have Fun", a: "Cyndi Lauper" },
        { t: "Never Gonna Give You Up", a: "Rick Astley" },
        { t: "Wake Me Up Before You Go-Go", a: "Wham!" },
        { t: "Like a Prayer", a: "Madonna" },
        { t: "Kiss", a: "Prince" },
        { t: "Money for Nothing", a: "Dire Straits" },
        { t: "Celebration", a: "Kool & The Gang" },
        { t: "L'Aventurier", a: "Indochine" },
        { t: "Cendrillon", a: "Téléphone" },
        { t: "L'Aziza", a: "Daniel Balavoine" },
        { t: "Quand la musique est bonne", a: "Jean-Jacques Goldman" },
        { t: "Alexandrie Alexandra", a: "Claude François" },
        { t: "Voyage voyage", a: "Desireless" },
        { t: "Joe le taxi", a: "Vanessa Paradis" },
        { t: "Marcia Baila", a: "Les Rita Mitsouko" },

        /* Cités par Audrey. */
        { t: "I Want to Break Free", a: "Queen" },
        { t: "Born in the U.S.A.", a: "Bruce Springsteen", altT: ["Born in the USA"] },
        { t: "With or Without You", a: "U2" },
        { t: "Careless Whisper", a: "George Michael" },
        { t: "I'm So Excited", a: "The Pointer Sisters", altA: ["Pointer Sisters"] },
        { t: "Il jouait du piano debout", a: "France Gall" },
        { t: "Besoin de rien, envie de toi", a: "Peter et Sloane", altA: ["Peter & Sloane", "Peter and Sloane"] },
        { t: "Je ne suis pas un héros", a: "Daniel Balavoine" },
        { t: "Nuit de folie", a: "Début de Soirée" },
        { t: "Les Démons de minuit", a: "Images" }
      ]
    },
    {
      id: 'annees90',
      nom: "Années 90",
      emoji: "📼",
      desc: "Eurodance, boys bands et guitares sales.",
      labelA: "Artiste",
      pistes: [
        { t: "Smells Like Teen Spirit", a: "Nirvana" },
        { t: "Wonderwall", a: "Oasis" },
        { t: "Zombie", a: "The Cranberries" },
        { t: "Creep", a: "Radiohead" },
        { t: "Under the Bridge", a: "Red Hot Chili Peppers" },
        { t: "Wannabe", a: "Spice Girls" },
        { t: "I Want It That Way", a: "Backstreet Boys" },
        { t: "...Baby One More Time", a: "Britney Spears", altT: ["Baby One More Time"] },
        { t: "Barbie Girl", a: "Aqua" },
        { t: "Blue (Da Ba Dee)", a: "Eiffel 65" },
        { t: "What Is Love", a: "Haddaway" },
        { t: "Rhythm Is a Dancer", a: "SNAP!" },
        { t: "All That She Wants", a: "Ace of Base" },
        { t: "Macarena", a: "Los del Río" },
        { t: "I Will Always Love You", a: "Whitney Houston" },
        { t: "Belle", a: "Garou, Daniel Lavoie & Patrick Fiori", altA: ["Notre-Dame de Paris"] },
        { t: "La Tribu de Dana", a: "Manau" },
        { t: "Tomber la chemise", a: "Zebda" },
        { t: "Je danse le mia", a: "IAM" },
        { t: "Foule sentimentale", a: "Alain Souchon" },
        { t: "J't'emmène au vent", a: "Louise Attaque" },

        /* Cités par Audrey. */
        { t: "Losing My Religion", a: "R.E.M.", altA: ["REM"] },
        { t: "The Show Must Go On", a: "Queen" },
        { t: "Knockin' on Heaven's Door", a: "Guns N' Roses", altA: ["Guns and Roses"] },
        { t: "Don't Speak", a: "No Doubt" },
        { t: "I Can't Dance", a: "Genesis" },
        { t: "Runaway", a: "The Corrs" },
        { t: "Torn", a: "Natalie Imbruglia" },
        { t: "Believe", a: "Cher" },
        { t: "Say My Name", a: "Destiny's Child" },
        { t: "Gangsta's Paradise", a: "Coolio", altA: ["L.V.", "Coolio et L.V."] },
        { t: "No Limit", a: "2 Unlimited" },
        { t: "The Rhythm of the Night", a: "Corona", altT: ["Rhythm of the Night"] },
        { t: "Scatman (Ski-Ba-Bop-Ba-Dop-Bop)", a: "Scatman John", altT: ["Scatman"], altA: ["Scatman"] },
        { t: "Ameno", a: "Era" },
        { t: "Over the Rainbow", a: "Israel Kamakawiwo'ole", altT: ["Somewhere Over the Rainbow"], altA: ["IZ", "Kamakawiwo'ole"] },
        { t: "Baby Come Back", a: "Worlds Apart" },
        { t: "Partir un jour", a: "2 Be 3" },
        { t: "Te garder près de moi", a: "Alliage" }
      ]
    },
    {
      id: 'annees2000',
      nom: "Années 2000",
      emoji: "💿",
      desc: "L'époque des sonneries polyphoniques.",
      labelA: "Artiste",
      pistes: [
        { t: "One More Time", a: "Daft Punk" },
        { t: "Hey Ya!", a: "OutKast" },
        { t: "Lose Yourself", a: "Eminem" },
        { t: "In the End", a: "Linkin Park" },
        { t: "Mr. Brightside", a: "The Killers" },
        { t: "Feel Good Inc.", a: "Gorillaz" },
        { t: "Crazy", a: "Gnarls Barkley" },
        { t: "Rehab", a: "Amy Winehouse" },
        { t: "Umbrella", a: "Rihanna" },
        { t: "Crazy in Love", a: "Beyoncé feat. Jay-Z", altA: ["Jay-Z", "Beyoncé"] },
        { t: "Can't Get You Out of My Head", a: "Kylie Minogue" },
        { t: "Whenever, Wherever", a: "Shakira" },
        { t: "Say It Right", a: "Nelly Furtado" },
        { t: "Relax, Take It Easy", a: "MIKA" },
        { t: "Viva la Vida", a: "Coldplay" },
        { t: "Seven Nation Army", a: "The White Stripes" },
        { t: "Le Chemin", a: "Kyo" },
        { t: "La Boulette", a: "Diam's" },
        { t: "En apesanteur", a: "Calogero" },
        { t: "Butterfly", a: "Superbus" },
        // « Ces soirées-là » retiré : Apple n'a que des reprises (Generation Mix,
        // Shewood Band, Les Enfoirés en live), jamais l'original de Yannick.
        { t: "L'Hymne de nos campagnes", a: "Tryo" }
      ]
    },
    {
      id: 'francaise',
      nom: "Variété française",
      emoji: "🥖",
      desc: "De Piaf à Angèle, le patrimoine.",
      labelA: "Artiste",
      pistes: [
        { t: "La Vie en rose", a: "Édith Piaf" },
        { t: "La Bohème", a: "Charles Aznavour" },
        { t: "Les Champs-Élysées", a: "Joe Dassin" },
        { t: "La Javanaise", a: "Serge Gainsbourg" },
        { t: "Les Lacs du Connemara", a: "Michel Sardou" },
        { t: "Résiste", a: "France Gall" },
        { t: "Mistral gagnant", a: "Renaud" },
        { t: "Femmes je vous aime", a: "Julien Clerc" },
        { t: "Amoureuse", a: "Véronique Sanson" },
        { t: "Le Paradis blanc", a: "Michel Berger" },
        { t: "Petite Marie", a: "Francis Cabrel" },
        { t: "Casser la voix", a: "Patrick Bruel" },
        { t: "Savoir aimer", a: "Florent Pagny" },
        { t: "Le Vent nous portera", a: "Noir Désir" },
        { t: "Week-end à Rome", a: "Étienne Daho" },
        { t: "Alors on danse", a: "Stromae" },
        { t: "Balance ton quoi", a: "Angèle" },
        { t: "Avenir", a: "Louane" },
        { t: "Je m'en vais", a: "Vianney" },
        { t: "Christine", a: "Christine and the Queens" },
        { t: "Dernière danse", a: "Indila" },
        { t: "Papaoutai", a: "Stromae" }
      ]
    },
    {
      id: 'disney',
      nom: "Disney & dessins animés",
      emoji: "🏰",
      desc: "En français. Ici on devine la chanson et le film.",
      // Comme pour les génériques et les animes : c'est le film qu'on cherche,
      // donc le nom du chanteur relevé chez Apple ne vaut pas réponse.
      strict: true,
      labelA: "Film",
      pistes: [
        { t: "Libérée, délivrée", a: "La Reine des neiges", q: "Libérée délivrée Anaïs Delva" },
        { t: "Ce rêve bleu", a: "Aladdin", q: "Ce rêve bleu Aladdin" },
        { t: "Histoire éternelle", a: "La Belle et la Bête", q: "Histoire éternelle La Belle et la Bête" },
        { t: "Sous l'océan", a: "La Petite Sirène", q: "Sous l'océan La Petite Sirène" },
        { t: "Il en faut peu pour être heureux", a: "Le Livre de la jungle", q: "Il en faut peu pour être heureux Livre de la jungle" },
        { t: "Hakuna Matata", a: "Le Roi Lion", q: "Hakuna Matata Le Roi Lion" },
        { t: "L'Histoire de la vie", a: "Le Roi Lion", q: "L'Histoire de la vie Le Roi Lion" },
        { t: "Comme un homme", a: "Mulan", q: "Comme un homme Mulan" },
        { t: "L'Air du vent", a: "Pocahontas", q: "L'Air du vent Pocahontas" },
        { t: "De zéro en héros", a: "Hercule", q: "De zéro en héros Hercule" },
        { t: "Tout le monde veut devenir un cat", a: "Les Aristochats", q: "Tout le monde veut devenir un cat Aristochats" },
        { t: "Quand on prie la bonne étoile", a: "Pinocchio", q: "Quand on prie la bonne étoile Pinocchio" },
        { t: "Je veux y croire", a: "Raiponce", q: "Je veux y croire Raiponce" },
        { t: "Le Bleu lumière", a: "Vaiana", q: "Le Bleu lumière Vaiana" },
        { t: "Je suis ton ami", a: "Toy Story", q: "Je suis ton ami Toy Story" },
        { t: "Les Cloches de Notre-Dame", a: "Le Bossu de Notre-Dame", q: "Les Cloches de Notre-Dame Bossu" },
        { t: "C'est la fête", a: "La Belle et la Bête", q: "C'est la fête La Belle et la Bête" },
        { t: "Je voudrais déjà être roi", a: "Le Roi Lion", q: "Je voudrais déjà être roi Le Roi Lion" },
        // Titre complet exigé : « Blanche-Neige » seul est le nom du personnage,
        // pas celui du film. La forme avec le chiffre 7 est acceptée telle quelle.
        { t: "Un jour mon prince viendra", a: "Blanche-Neige et les Sept Nains", q: "Un jour mon prince viendra Blanche Neige", altA: ["Blanche-Neige et les 7 nains"] },
        { t: "Prince Ali", a: "Aladdin", q: "Prince Ali Aladdin" }
      ]
    },
    {
      id: 'generiques',
      nom: "Génériques cultes",
      emoji: "🍿",
      desc: "Films et séries. Ici on devine l'œuvre.",
      // Une seule réponse : le film ou la série, pas le titre du morceau.
      solo: 'artiste',
      // `strict` : seuls les titres listés ici comptent. Sans ça, le jeu
      // accepterait aussi le nom du compositeur trouvé chez Apple, et on
      // pourrait marquer sans jamais donner le titre du film.
      strict: true,
      labelT: "Titre du morceau",
      labelA: "Film ou série",
      pistes: [
        // Le titre du film doit être écrit en entier — mais le nom de la
        // licence est toujours accepté : « Star Wars » vaut pour la Marche
        // impériale. En revanche « Amélie Poulain » tronqué ne passe pas.
        { t: "I'll Be There for You", a: "Friends", q: "I'll Be There for You The Rembrandts" },
        { t: "Hedwig's Theme", a: "Harry Potter à l'école des sorciers", q: "Hedwig's Theme John Williams", altA: ["Harry Potter"] },
        { t: "He's a Pirate", a: "Pirates des Caraïbes : La Malédiction du Black Pearl", q: "He's a Pirate Klaus Badelt", altA: ["Pirates des Caraïbes", "Pirates of the Caribbean"] },
        { t: "Main Title", a: "Star Wars, épisode IV : Un nouvel espoir", q: "Star Wars Main Title John Williams", altA: ["Star Wars", "La Guerre des étoiles"] },
        { t: "Main Title", a: "Game of Thrones", q: "Game of Thrones Main Title Ramin Djawadi", altA: ["Le Trône de fer"] },
        { t: "Mission: Impossible Theme", a: "Mission impossible", q: "Mission Impossible Theme Lalo Schifrin" },
        { t: "Raiders March", a: "Les Aventuriers de l'arche perdue", q: "Raiders March John Williams", altA: ["Indiana Jones", "Indiana", "Raiders of the Lost Ark", "Indiana Jones et les Aventuriers de l'arche perdue"] },
        { t: "Eye of the Tiger", a: "Rocky III", q: "Eye of the Tiger Survivor", altA: ["Rocky"] },
        { t: "Ghostbusters", a: "SOS Fantômes", q: "Ghostbusters Ray Parker Jr", altA: ["Ghostbusters"] },
        // Déplacé depuis les Années 90 : c'est le thème de Titanic avant d'être
        // une chanson de Céline Dion, et ici c'est le film qu'on devine.
        { t: "My Heart Will Go On", a: "Titanic", q: "My Heart Will Go On Céline Dion" },
        { t: "The Time of My Life", a: "Dirty Dancing", q: "I've Had The Time of My Life Bill Medley" },
        { t: "You're the One That I Want", a: "Grease", q: "You're the One That I Want Grease" },
        { t: "Danger Zone", a: "Top Gun", q: "Danger Zone Kenny Loggins" },
        { t: "Skyfall", a: "Skyfall", q: "Skyfall Adele", altA: ["James Bond", "007"] },
        { t: "Comptine d'un autre été", a: "Le Fabuleux Destin d'Amélie Poulain", q: "Comptine d'un autre été Yann Tiersen" },
        { t: "Circle of Life", a: "Le Roi Lion", q: "Circle of Life Lion King", altA: ["The Lion King"] },
        { t: "Test Drive", a: "Dragons", q: "Test Drive John Powell How to Train Your Dragon", altA: ["How to Train Your Dragon"] },
        { t: "Now We Are Free", a: "Gladiator", q: "Now We Are Free Hans Zimmer" },
        { t: "Back to the Future", a: "Retour vers le futur", q: "Back to the Future Theme Alan Silvestri" },
        { t: "The Imperial March", a: "Star Wars, épisode V : L'Empire contre-attaque", q: "Imperial March John Williams", altT: ["Marche impériale"], altA: ["Star Wars", "La Guerre des étoiles"] },
        { t: "Married Life", a: "Là-haut", q: "Married Life Michael Giacchino Up", altA: ["Up"] }
      ]
    },
    {
      id: 'dancefloor',
      nom: "Dancefloor & tubes d'été",
      emoji: "🕶️",
      desc: "Ceux qui vident la terrasse et remplissent la piste.",
      labelA: "Artiste",
      pistes: [
        { t: "Get Lucky", a: "Daft Punk feat. Pharrell Williams & Nile Rodgers", altA: ["Daft Punk", "Pharrell Williams", "Nile Rodgers"] },
        { t: "Freed from Desire", a: "Gala" },
        { t: "Show Me Love", a: "Robin S." },
        { t: "Mambo No. 5", a: "Lou Bega" },
        { t: "Livin' la Vida Loca", a: "Ricky Martin" },
        { t: "It Wasn't Me", a: "Shaggy" },
        { t: "1er Gaou", a: "Magic System", altT: ["Premier Gaou"] },
        { t: "Aserejé", a: "Las Ketchup", altT: ["The Ketchup Song"] },
        { t: "Mr. Saxobeat", a: "Alexandra Stan" },
        { t: "Titanium", a: "David Guetta feat. Sia", altA: ["Sia", "David Guetta"] },
        { t: "Wake Me Up", a: "Avicii", altA: ["Aloe Blacc"] },
        { t: "Uptown Funk", a: "Mark Ronson feat. Bruno Mars", altA: ["Bruno Mars", "Mark Ronson"] },
        { t: "Happy", a: "Pharrell Williams" },
        { t: "Despacito", a: "Luis Fonsi feat. Daddy Yankee", altA: ["Daddy Yankee", "Luis Fonsi"] },
        { t: "Levitating", a: "Dua Lipa" },
        { t: "Blinding Lights", a: "The Weeknd" },
        { t: "World, Hold On", a: "Bob Sinclar" },
        { t: "Hello", a: "Martin Solveig & Dragonette", altA: ["Martin Solveig", "Dragonette"] },
        { t: "This Girl", a: "Kungs vs Cookin' on 3 Burners", altA: ["Kungs", "Cookin' on 3 Burners"] },
        // Sans « Spanish Version », Apple sert la version anglaise avec Sean Paul,
        // moins connue en France — et le jeu acceptait alors « Sean Paul » alors
        // que la réponse affichée restait « Enrique Iglesias ».
        { t: "Bailando", a: "Enrique Iglesias feat. Descemer Bueno & Gente de Zona", q: "Bailando Spanish Version Enrique Iglesias", altA: ["Enrique Iglesias", "Gente de Zona", "Descemer Bueno"] },
        { t: "Danza Kuduro", a: "Don Omar feat. Lucenzo", altA: ["Lucenzo", "Don Omar"] },
        { t: "On Écrit Sur Les Murs", a: "Kids United", q: "On écrit sur les murs Kids United" }
      ]
    },
    {
      id: 'rock',
      nom: "Rock intemporel",
      emoji: "🎸",
      desc: "Les riffs que tout le monde reconnaît en trois notes.",
      labelA: "Artiste",
      pistes: [
        { t: "Bohemian Rhapsody", a: "Queen" },
        { t: "Highway to Hell", a: "AC/DC" },
        { t: "Sweet Child o' Mine", a: "Guns N' Roses" },
        { t: "Smoke on the Water", a: "Deep Purple" },
        { t: "Nothing Else Matters", a: "Metallica" },
        { t: "Whole Lotta Love", a: "Led Zeppelin" },
        { t: "(I Can't Get No) Satisfaction", a: "The Rolling Stones", altT: ["Satisfaction"] },
        { t: "Hey Jude", a: "The Beatles" },
        { t: "Wind of Change", a: "Scorpions" },
        { t: "I Don't Want to Miss a Thing", a: "Aerosmith" },
        { t: "All the Small Things", a: "blink-182" },
        { t: "Uprising", a: "Muse" },
        { t: "Do I Wanna Know?", a: "Arctic Monkeys" },
        { t: "Everlong", a: "Foo Fighters" },
        { t: "Come as You Are", a: "Nirvana" },
        { t: "Un autre monde", a: "Téléphone" },
        { t: "Antisocial", a: "Trust" },
        { t: "Every You Every Me", a: "Placebo" },
        { t: "Basket Case", a: "Green Day" },
        { t: "Should I Stay or Should I Go", a: "The Clash" },
        { t: "Born to Be Wild", a: "Steppenwolf" }
      ]
    },
    {
      id: 'metal',
      nom: "Métal",
      emoji: "🤘",
      desc: "Riffs, double pédale et cheveux au vent.",
      labelA: "Artiste",
      pistes: [
        { t: "Enter Sandman", a: "Metallica" },
        { t: "Master of Puppets", a: "Metallica" },
        { t: "Paranoid", a: "Black Sabbath" },
        { t: "Ace of Spades", a: "Motörhead" },
        { t: "Breaking the Law", a: "Judas Priest" },
        { t: "Run to the Hills", a: "Iron Maiden" },
        { t: "Fear of the Dark", a: "Iron Maiden" },
        { t: "Crazy Train", a: "Ozzy Osbourne" },
        { t: "Holy Diver", a: "Dio" },
        { t: "Symphony of Destruction", a: "Megadeth" },
        { t: "Raining Blood", a: "Slayer" },
        { t: "Walk", a: "Pantera" },
        { t: "Du Hast", a: "Rammstein" },
        { t: "Sonne", a: "Rammstein" },
        { t: "Chop Suey!", a: "System of a Down", altA: ["SOAD"] },
        { t: "Toxicity", a: "System of a Down", altA: ["SOAD"] },
        { t: "Duality", a: "Slipknot" },
        { t: "Freak on a Leash", a: "Korn" },
        { t: "Bring Me to Life", a: "Evanescence" },
        { t: "Nemo", a: "Nightwish" },
        { t: "Stranded", a: "Gojira" },
        { t: "Furia", a: "Mass Hysteria" },

        /* Moins grand public, mais immédiatement reconnaissables pour qui
           écoute du métal — c'est là que les connaisseurs marquent des points. */
        { t: "Downfall", a: "Children of Bodom" },
        { t: "Are You Dead Yet?", a: "Children of Bodom" },
        { t: "Only for the Weak", a: "In Flames" },
        { t: "Twilight of the Thunder God", a: "Amon Amarth" },
        { t: "Nemesis", a: "Arch Enemy" },
        { t: "My Curse", a: "Killswitch Engage" },
        { t: "Tears Don't Fall", a: "Bullet for My Valentine" },
        { t: "Redneck", a: "Lamb of God" },
        { t: "Bleed", a: "Meshuggah" },
        { t: "Davidian", a: "Machine Head" },
        { t: "Primo Victoria", a: "Sabaton" },
        { t: "Évier Metal", a: "Ultra Vomit", q: "Evier Metal Ultra Vomit", altT: ["Evier Metal"] }
      ]
    },
    {
      id: 'anime',
      nom: "OST animés",
      emoji: "🍥",
      desc: "Génériques et musiques d'animes. Ici on devine l'anime.",
      // Une seule réponse : l'anime. Personne ne devine « Kaikai Kitan ».
      solo: 'artiste',
      strict: true,
      labelT: "Titre du morceau",
      labelA: "Anime",
      pistes: [
        { t: "Cha-La Head-Cha-La", a: "Dragon Ball Z", q: "Cha La Head Cha La Hironobu Kageyama" },
        { t: "We Are!", a: "One Piece", q: "We Are Hiroshi Kitadani One Piece" },
        { t: "Blue Bird", a: "Naruto Shippuden", q: "Blue Bird Ikimonogakari", altA: ["Naruto"] },
        { t: "Guren no Yumiya", a: "L'Attaque des Titans", q: "Guren no Yumiya Linked Horizon", altT: ["Feuerroter Pfeil und Bogen"], altA: ["Attack on Titan", "Shingeki no Kyojin"] },
        { t: "Gurenge", a: "Demon Slayer", q: "Gurenge LiSA", altA: ["Kimetsu no Yaiba"] },
        { t: "Unravel", a: "Tokyo Ghoul", q: "Unravel TK from Ling tosite sigure" },
        { t: "Again", a: "Fullmetal Alchemist Brotherhood", q: "Again YUI Fullmetal Alchemist", altA: ["Fullmetal Alchemist"] },
        { t: "Tank!", a: "Cowboy Bebop", q: "Tank Seatbelts Cowboy Bebop" },
        { t: "A Cruel Angel's Thesis", a: "Neon Genesis Evangelion", q: "A Cruel Angel's Thesis Yoko Takahashi", altT: ["Zankoku na Tenshi no These"], altA: ["Evangelion", "Evangelion 1.0"] },
        { t: "Colors", a: "Code Geass", q: "Colors FLOW Code Geass" },
        { t: "Kaikai Kitan", a: "Jujutsu Kaisen", q: "Kaikai Kitan Eve" },
        { t: "Idol", a: "Oshi no Ko", q: "Idol YOASOBI" },
        { t: "Zenzenzense", a: "Your Name", q: "Zenzenzense RADWIMPS", altA: ["Kimi no Na wa"] },
        { t: "Merry-Go-Round of Life", a: "Le Château ambulant", q: "Merry Go Round of Life Joe Hisaishi", altA: ["Howl's Moving Castle"] },
        { t: "One Summer's Day", a: "Le Voyage de Chihiro", q: "One Summer's Day Joe Hisaishi Spirited Away", altA: ["Spirited Away"] },
        { t: "Peace Sign", a: "My Hero Academia", q: "Peace Sign Kenshi Yonezu" },
        { t: "Kick Back", a: "Chainsaw Man", q: "Kick Back Kenshi Yonezu" },
        { t: "Sobakasu", a: "Kenshin le vagabond", q: "Sobakasu Judy and Mary", altA: ["Rurouni Kenshin"] },

        /* Ajoutés sur proposition d'Audrey : la catégorie manquait de variété. */
        { t: "Pokémon Theme", a: "Pokémon", q: "Pokemon Theme Gotta Catch Em All" },
        { t: "Crossing Field", a: "Sword Art Online", q: "Crossing Field LiSA", altA: ["SAO"] },
        { t: "Déjà Vu", a: "Initial D", q: "Deja Vu Dave Rodgers" },
        { t: "The WORLD", a: "Death Note", q: "The World Nightmare Death Note" },
        { t: "Departure!", a: "Hunter x Hunter", q: "Departure Masatoshi Ono Hunter", altA: ["HxH"] },
        { t: "THE HERO !!", a: "One Punch Man", q: "The Hero JAM Project One Punch Man" },
        { t: "Asterisk", a: "Bleach", q: "Asterisk Orange Range Bleach" },
        { t: "Re:Re:", a: "Erased", q: "Re Re Asian Kung-Fu Generation", altA: ["Boku dake ga Inai Machi"] },
        { t: "LEveL", a: "Solo Leveling", q: "LEveL SawanoHiroyuki nZk Tomorrow X Together" },
        { t: "Forces", a: "Berserk", q: "Forces Susumu Hirasawa Berserk" },
        { t: "Snow Fairy", a: "Fairy Tail", q: "Snow Fairy FUNKIST" },
        { t: "Seishun Satsubatsuron", a: "Assassination Classroom", q: "Seishun Satsubatsuron Assassination Classroom", altA: ["Ansatsu Kyoushitsu"] },
        { t: "Sono Chi no Sadame", a: "JoJo's Bizarre Adventure", q: "Sono Chi no Sadame Hiroaki Tommy Tominaga", altA: ["JoJo"] },
        { t: "Rose", a: "NANA", q: "Rose Anna Tsuchiya NANA" },
        { t: "This Game", a: "No Game No Life", q: "This Game Konomi Suzuki" },
        { t: "Grain", a: "Monster", q: "Grain Kuniaki Haishima Monster" },
        { t: "Wakfu", a: "Wakfu", q: "Wakfu générique série animée" }
      ]
    },
    {
      id: 'jeuxvideo',
      nom: "Jeux vidéo",
      emoji: "🎮",
      desc: "Les musiques qui ont bercé des milliers d'heures de manette.",
      // Une seule réponse : le jeu. Personne ne cite « Ezio's Family » de tête.
      solo: 'artiste',
      strict: true,
      labelT: "Titre du morceau",
      labelA: "Jeu",
      pistes: [
        { t: "Megalovania", a: "Undertale", q: "Megalovania Toby Fox Undertale" },
        { t: "Sweden", a: "Minecraft", q: "Sweden C418 Minecraft" },
        { t: "Ezio's Family", a: "Assassin's Creed", q: "Ezio's Family Jesper Kyd" },
        { t: "Dragonborn", a: "Skyrim", q: "Dragonborn Jeremy Soule Skyrim", altA: ["The Elder Scrolls"] },
        { t: "Baba Yetu", a: "Civilization IV", q: "Baba Yetu Christopher Tin", altA: ["Civilization"] },
        { t: "Still Alive", a: "Portal", q: "Still Alive Jonathan Coulton Portal" },
        { t: "One-Winged Angel", a: "Final Fantasy VII", q: "One Winged Angel Final Fantasy VII", altA: ["Final Fantasy"] },
        // Nintendo n'est pas sur Apple Music : ces trois-là sont des versions
        // orchestrales. La mélodie est identique, c'est tout ce qui compte ici.
        { t: "Main Theme", a: "The Legend of Zelda", q: "Main Theme The Legend of Zelda London Music Works Scott Buckley", altT: ["Thème principal", "Thème de Zelda"], altA: ["Zelda"] },
        { t: "Song of Storms", a: "The Legend of Zelda: Ocarina of Time", q: "Song of Storms Marcus Hedges Trend Orchestra Zelda", altA: ["Zelda", "Ocarina of Time"] },
        { t: "Super Mario Bros: Theme", a: "Super Mario Bros.", q: "Super Mario Bros Theme Orchestre Philharmonique de Londres", altT: ["Thème principal"], altA: ["Mario", "Super Mario"] },
        { t: "Halo", a: "Halo", q: "Halo Martin O'Donnell Michael Salvatori Combat Evolved", altT: ["Halo Theme"] },
        { t: "Rip & Tear", a: "Doom", q: "Rip and Tear Mick Gordon Doom" },
        { t: "Geralt of Rivia", a: "The Witcher 3", q: "Geralt of Rivia Marcin Przybylowicz Witcher 3", altA: ["The Witcher"] },
        // L'original de Rosa Walton est absent d'Apple FR : on jouait une reprise.
        { t: "Chippin' In", a: "Cyberpunk 2077", q: "Chippin In Refused Cyberpunk 2077", altA: ["Cyberpunk"] },
        { t: "Build That Wall", a: "Bastion", q: "Build That Wall Darren Korb Bastion" },

        /* Ajoutés sur proposition d'Audrey. Beaucoup d'éditeurs — Nintendo, Valve,
           Rockstar, FromSoftware — ne déposent pas leurs bandes-son chez Apple.
           Quand l'original manque, on prend la reprise la plus fidèle : la mélodie
           est la même, et c'est elle qu'on reconnaît en blind test. */
        { t: "Official Theme Song", a: "GTA San Andreas", q: "Grand Theft Auto San Andreas Official Theme Song Michael Hunter", altA: ["GTA", "Grand Theft Auto", "San Andreas", "Grand Theft Auto San Andreas"] },
        { t: "Elden Ring", a: "Elden Ring", q: "Elden Ring London Music Works" },
        { t: "Unshaken", a: "Red Dead Redemption 2", q: "Unshaken D'Angelo Red Dead Redemption 2", altA: ["Red Dead Redemption", "Red Dead"] },
        { t: "Animal Crossing: New Horizons", a: "Animal Crossing", q: "Animal Crossing New Horizons Theme Blue Brew Music", altA: ["Animal Crossing New Horizons"] },
        { t: "Buy Mode", a: "Les Sims", q: "Buy Mode The Sims Power Up Orchestra", altA: ["The Sims", "Sims"] },
        { t: "Pokemon Red/Blue (Battle Theme)", a: "Pokémon", q: "Pokemon Red Blue Battle Theme Pxls" },
        { t: "Fortnite (Battle Royale Theme)", a: "Fortnite", q: "Fortnite Battle Royale Theme Arcade Player" },
        { t: "Legends of Azeroth", a: "World of Warcraft", q: "Legends of Azeroth Main Title Jason Hayes", altA: ["WoW", "Warcraft"] },
        { t: "POP/STARS", a: "League of Legends", q: "POP STARS K/DA Madison Beer", altA: ["LoL", "League"] },
        { t: "Lumière", a: "Clair Obscur: Expedition 33", q: "Lumière Lorien Testard Clair Obscur Expedition 33", altA: ["Expedition 33", "Clair Obscur"] },
        { t: "Title Theme", a: "Fable", q: "Title Theme Russell Shaw Fable Legends", altA: ["Fable Legends"] },
        { t: "The Last of Us", a: "The Last of Us", q: "The Last of Us Gustavo Santaolalla" },
        { t: "God of War", a: "God of War", q: "God of War Bear McCreary PlayStation Soundtrack" },
        { t: "Tristram", a: "Diablo", q: "Tristram Matt Uelmen Diablo" },
        { t: "Counter-Strike: Global Offensive Main Theme", a: "Counter-Strike", q: "Counter-Strike Global Offensive Main Theme XG Stephen", altA: ["CS", "CS GO", "Counter Strike Global Offensive"] },
        { t: "Rocket League (2015) - Theme", a: "Rocket League", q: "Rocket League 2015 Theme Geek Music" },
        { t: "Among Us Drip Theme", a: "Among Us", q: "Among Us Drip Theme Dario D'Aversa" },
        { t: "Rainbow Road", a: "Mario Kart", q: "Rainbow Road Mario Kart 64 Qumu", altA: ["Mario Kart 64"] },
        { t: "Fallout 4 Main Theme", a: "Fallout", q: "Fallout 4 Main Theme Inon Zur", altA: ["Fallout 4"] },
        { t: "Gwyn, Lord of Cinder", a: "Dark Souls", q: "Gwyn Lord of Cinder Motoi Sakuraba Dark Souls" },
        { t: "Call of Duty Modern Warfare 2: Theme", a: "Call of Duty", q: "Call of Duty Modern Warfare 2 Theme Orchestre Philharmonique de Londres", altA: ["COD", "Modern Warfare"] },
        { t: "Pac Man Theme", a: "Pac-Man", q: "Pac Man Theme Theme Mania Video Games Themes Collection", altA: ["Pacman"] },
        { t: "Tetris Theme (Korobeiniki)", a: "Tetris", q: "Tetris Theme Korobeiniki Orchestre Philharmonique de Londres", altT: ["Korobeiniki"] },
      ]
    },
    {
      id: 'clubdo',
      nom: "Dessins animés des années 90",
      emoji: "📺",
      desc: "Les génériques français du Club Dorothée. Attention aux frissons.",
      // Ici une seule réponse à donner : le dessin animé. L'interprète est
      // presque toujours Bernard Minet, ça n'aurait aucun intérêt à deviner.
      // Il est quand même affiché au moment de la révélation.
      solo: 'titre',
      labelT: "Dessin animé",
      labelA: "Interprète",
      pistes: [
        // Titres calés sur l'orthographe exacte du catalogue Apple : sans ça,
        // la recherche ne remonte rien (« Ranma 1/2 » et pas « Ranma ½ »).
        { t: "Bioman", a: "Bernard Minet", q: "Bioman Bernard Minet" },
        { t: "Les Chevaliers du Zodiaque", a: "Bernard Minet", q: "Les chevaliers du zodiaque Bernard Minet", altT: ["Saint Seiya"] },
        { t: "Dragon Ball Z", a: "Bernard Minet", q: "Dragon Ball et Dragon Ball Z Bernard Minet", altT: ["Dragon Ball"] },
        { t: "Goldorak", a: "Bernard Minet", q: "Goldorak Bernard Minet" },
        { t: "Capitaine Flam", a: "Bernard Minet", q: "Capitaine Flam Bernard Minet" },
        { t: "Nicky Larson", a: "Bernard Minet", q: "Nicky Larson Bernard Minet", altT: ["City Hunter"] },
        { t: "Juliette je t'aime", a: "Bernard Minet", q: "Juliette je t'aime Bernard Minet", altT: ["Maison Ikkoku"] },
        { t: "Denver le dernier dinosaure", a: "Bernard Minet", q: "Denver le dernier Dinosaure Bernard Minet", altT: ["Denver"] },
        { t: "Le Collège fou fou fou", a: "Bernard Minet", q: "Le collège fou, fou, fou Bernard Minet", altT: ["Un collège fou fou fou"] },
        { t: "Ranma ½", a: "Bernard Minet", q: "Ranma 1/2 Bernard Minet", altT: ["Ranma", "Ranma 1/2"] },
        { t: "Sailor Moon", a: "Bernard Minet", q: "Sailor Moon Bernard Minet" },
        { t: "Olive et Tom", a: "Bernard Minet", q: "Olive et Tom Bernard Minet", altT: ["Captain Tsubasa"] },
        { t: "Jeanne et Serge", a: "Bernard Minet", q: "Jeanne et Serge Bernard Minet" },
        { t: "Conan l'aventurier", a: "Bernard Minet", q: "Conan l'aventurier Bernard Minet", altT: ["Conan"] },
        { t: "Robotech", a: "Bernard Minet", q: "Robotech Bernard Minet" },
        { t: "Musclor", a: "Bernard Minet", q: "Musclor Les Maîtres de l'univers Bernard Minet", altT: ["Les Maîtres de l'univers"] },
        { t: "Transformers", a: "Bernard Minet", q: "Transformers pour un monde meilleur Bernard Minet" },
        { t: "Je veux être un Bisounours", a: "Bernard Minet", q: "Je veux être un bisounours Bernard Minet", altT: ["Les Bisounours", "Bisounours"] },
        { t: "L'École des champions", a: "Bernard Minet", q: "L'école des champions Bernard Minet" },
        { t: "Les Mystérieuses Cités d'or", a: "Le Groupe Apollo", q: "Les Mystérieuses Cités d'or générique" }
      ]
    },
    {
      id: 'rapfr',
      nom: "Rap & R'n'B français",
      emoji: "🎙️",
      desc: "D'IAM à Aya Nakamura, trente ans de classiques.",
      labelA: "Artiste",
      pistes: [
        // « Laisse pas traîner ton fils » retiré : Apple France n'a pas le
        // morceau, seulement un karaoké. « Ma Benz » reste.
        { t: "Ma Benz", a: "Suprême NTM", altA: ["NTM"] },
        { t: "Petit Frère", a: "IAM" },
        { t: "Demain c'est loin", a: "IAM" },
        { t: "Caroline", a: "MC Solaar" },
        { t: "Bouge de là", a: "MC Solaar" },
        { t: "Tonton du bled", a: "113" },
        { t: "Basique", a: "Orelsan" },
        { t: "La Pluie", a: "Orelsan" },
        { t: "Djadja", a: "Aya Nakamura" },
        { t: "Copines", a: "Aya Nakamura" },
        { t: "Bella", a: "Maître Gims", altA: ["Gims"] },
        { t: "Sapés comme jamais", a: "Maître Gims", altA: ["Gims"] },
        { t: "Le Monde ou rien", a: "PNL" },
        { t: "Dommage", a: "Bigflo & Oli" },
        { t: "Mon Précieux", a: "Soprano" },
        // « Bande organisée » retiré : quelle que soit la formulation, Apple ne
        // remonte que des parodies Mario Kart. « Au DD » retiré aussi, il
        // renvoyait « Onizuka », un autre titre de PNL.
        { t: "Tchikita", a: "Jul" },

        /* Ajouts demandés par Audrey : la catégorie était trop petite, donc les
           artistes présents deux fois revenaient à presque chaque partie. */
        { t: "Jeune demoiselle", a: "Diam's" },
        { t: "Gravé dans la roche", a: "Sniper" },
        { t: "L'amour du risque", a: "Fonky Family", q: "Fonky Family L'amour du risque Taxi" },
        { t: "Nirvana", a: "Doc Gynéco" },
        { t: "Femme Like U", a: "K-Maro", altA: ["K.Maro", "K Maro"] },
        { t: "Parce qu'on vient de loin", a: "Corneille" },
        { t: "Ma philosophie", a: "Amel Bent" },
        { t: "Du ferme", a: "La Fouine" },
        { t: "La Puissance", a: "Rohff" },
        { t: "Banlieusards", a: "Kery James" },
        { t: "Désolé", a: "Sexion d'Assaut" },
        { t: "Dreamin'", a: "Youssoupha", q: "Youssoupha Dreamin Indila" },
        { t: "Mme. Pavoshko", a: "Black M", altT: ["Madame Pavoshko"] },
        { t: "On verra", a: "Nekfeu" },
        { t: "Reine", a: "Dadju" },
        { t: "Guerilla", a: "Soolking", q: "Soolking Guerilla Best of Raï" },
        { t: "La vie qu'on mène", a: "Ninho", q: "Ninho La vie qu'on mène Destin" },
        { t: "La Kiffance", a: "Naps" },
        { t: "Ça va ça vient", a: "Vitaa & Slimane", altA: ["Vitaa", "Slimane"] }
      ]
    },
    {
      id: 'annees2010',
      nom: "Années 2010-2020",
      emoji: "📱",
      desc: "La décennie des écouteurs blancs et des playlists.",
      labelA: "Artiste",
      pistes: [
        { t: "Rolling in the Deep", a: "Adele" },
        { t: "Someone Like You", a: "Adele" },
        { t: "Shape of You", a: "Ed Sheeran" },
        { t: "Perfect", a: "Ed Sheeran" },
        { t: "Bad Guy", a: "Billie Eilish" },
        { t: "Somebody That I Used to Know", a: "Gotye" },
        { t: "Radioactive", a: "Imagine Dragons" },
        { t: "Believer", a: "Imagine Dragons" },
        { t: "Counting Stars", a: "OneRepublic" },
        { t: "Take Me to Church", a: "Hozier" },
        { t: "Chandelier", a: "Sia" },
        { t: "Shallow", a: "Lady Gaga & Bradley Cooper", altA: ["Lady Gaga", "Bradley Cooper"] },
        { t: "Someone You Loved", a: "Lewis Capaldi" },
        { t: "As It Was", a: "Harry Styles" },
        { t: "Don't Start Now", a: "Dua Lipa" },
        { t: "Flowers", a: "Miley Cyrus" },
        // « Formidable » retiré : trois formulations testées, Apple remonte à
        // chaque fois un autre morceau. Stromae reste présent ailleurs
        // (« Alors on danse » et « Papaoutai » en variété française).
        { t: "Je veux", a: "ZAZ" },
        { t: "Sur ma route", a: "Black M" },
        { t: "Andalouse", a: "Kendji Girac" }
      ]
    },
    {
      id: 'karaoke',
      nom: "Karaoké",
      emoji: "🍻",
      desc: "Les tubes que tout le monde braille en chœur à 2 h du matin.",
      labelA: "Artiste",
      pistes: [
        { t: "Je vais t'aimer", a: "Michel Sardou" },
        { t: "Allumer le feu", a: "Johnny Hallyday" },
        { t: "Que je t'aime", a: "Johnny Hallyday" },
        { t: "Comme d'habitude", a: "Claude François" },
        { t: "Cette année-là", a: "Claude François" },
        { t: "Belle-Île-en-Mer, Marie-Galante", a: "Laurent Voulzy", altT: ["Belle-Île-en-Mer"] },
        { t: "Pour que tu m'aimes encore", a: "Céline Dion" },
        { t: "Chanter", a: "Florent Pagny" },
        { t: "Ma Philosophie", a: "Amel Bent" },
        { t: "Vois sur ton chemin", a: "Les Choristes", q: "Vois sur ton chemin Les Choristes Bruno Coulais" },
        { t: "Paroles, paroles", a: "Dalida", altA: ["Alain Delon"] },
        { t: "I Will Survive", a: "Gloria Gaynor" },
        { t: "YMCA", a: "Village People" },
        { t: "Don't Stop Believin'", a: "Journey" },
        { t: "Sweet Caroline", a: "Neil Diamond" },
        { t: "Total Eclipse of the Heart", a: "Bonnie Tyler" },
        { t: "Twist and Shout", a: "The Beatles" },
        { t: "La Bamba", a: "Ritchie Valens" },
        { t: "Wonderwall", a: "Oasis" },
        { t: "Les Lacs du Connemara", a: "Michel Sardou" }
      ]
    },
    {
      id: 'musicals',
      nom: "Comédies musicales",
      emoji: "🎭",
      desc: "Starmania, Notre-Dame, Mozart… On devine le morceau et le spectacle.",
      labelA: "Comédie musicale",
      pistes: [
        { t: "Le Temps des cathédrales", a: "Notre-Dame de Paris", q: "Le Temps des cathédrales Bruno Pelletier" },
        { t: "Belle", a: "Notre-Dame de Paris", q: "Belle Garou Notre-Dame de Paris" },
        { t: "Vivre", a: "Notre-Dame de Paris", q: "Vivre Julie Zenatti Notre-Dame de Paris" },
        { t: "Le Blues du businessman", a: "Starmania", q: "Le Blues du businessman Starmania" },
        { t: "SOS d'un terrien en détresse", a: "Starmania", q: "SOS d'un terrien en détresse Daniel Balavoine" },
        { t: "Le Monde est stone", a: "Starmania", q: "Le Monde est stone Starmania" },
        { t: "Les Uns contre les autres", a: "Starmania", q: "Les Uns contre les autres Starmania" },
        { t: "L'Envie d'aimer", a: "Les Dix Commandements", q: "L'Envie d'aimer Daniel Lévi" },
        { t: "Je fais de toi mon essentiel", a: "Le Roi Soleil", q: "Je fais de toi mon essentiel Emmanuel Moire", altT: ["Mon essentiel"] },
        { t: "Tant qu'on rêve encore", a: "Le Roi Soleil", q: "Tant qu'on rêve encore Le Roi Soleil" },
        { t: "L'Assasymphonie", a: "Mozart l'Opéra Rock", q: "L'Assasymphonie Mozart l'Opéra Rock" },
        { t: "Le Bien qui fait mal", a: "Mozart l'Opéra Rock", q: "Le Bien qui fait mal Mozart l'Opéra Rock" },
        { t: "Tatoue-moi", a: "Mozart l'Opéra Rock", q: "Tatoue moi Mozart l'Opéra Rock" },
        { t: "Les Rois du monde", a: "Roméo et Juliette", q: "Les Rois du monde Roméo et Juliette" },
        { t: "Aimer", a: "Roméo et Juliette", q: "Aimer Roméo et Juliette Damien Sargue" },
        // Sans « Gérard Presgurvic », Apple ne trouve aucun « Vérone » et se
        // rabat sur « Aimer » — le même extrait sortait alors sous deux noms.
        { t: "Vérone", a: "Roméo et Juliette", q: "Vérone Gérard Presgurvic" },
        { t: "À la volonté du peuple", a: "Les Misérables", q: "À la volonté du peuple Les Misérables" },
        { t: "Mon histoire", a: "Les Misérables", q: "Mon histoire Les Misérables" },
        // Titre corrigé : la chanson des Demoiselles de Rochefort s'appelle
        // « Chanson des jumelles », pas « Je suis un homme heureux ».
        { t: "Chanson des jumelles", a: "Les Demoiselles de Rochefort", q: "Chanson des jumelles Les Demoiselles de Rochefort" }
        // « Résiste » retiré d'ici : c'était un doublon de la chanson de France
        // Gall, déjà présente dans les Années 80, et pas la version du spectacle.
      ]
    },
    {
      id: 'annees6070',
      nom: "Années 60-70",
      emoji: "📻",
      desc: "Yéyé, Woodstock et boule à facettes.",
      labelA: "Artiste",
      pistes: [
        { t: "Poupée de cire, poupée de son", a: "France Gall" },
        { t: "Aline", a: "Christophe" },
        { t: "Il est cinq heures, Paris s'éveille", a: "Jacques Dutronc" },
        { t: "Je t'aime... moi non plus", a: "Jane Birkin & Serge Gainsbourg", altA: ["Serge Gainsbourg", "Jane Birkin"] },
        { t: "Le Pénitencier", a: "Johnny Hallyday" },
        { t: "La Maladie d'amour", a: "Michel Sardou" },
        { t: "L'Été indien", a: "Joe Dassin" },
        { t: "Une belle histoire", a: "Michel Fugain" },
        { t: "Emmenez-moi", a: "Charles Aznavour" },
        { t: "Gigi l'Amoroso", a: "Dalida" },
        { t: "On ira tous au paradis", a: "Michel Polnareff" },
        { t: "Le Sud", a: "Nino Ferrer" },
        { t: "Bang Bang", a: "Sheila" },
        { t: "Let It Be", a: "The Beatles" },
        { t: "Paint It Black", a: "The Rolling Stones" },
        { t: "Stairway to Heaven", a: "Led Zeppelin" },
        { t: "Dancing Queen", a: "ABBA" },
        { t: "Stayin' Alive", a: "Bee Gees" },
        { t: "Hotel California", a: "Eagles" },
        { t: "Rasputin", a: "Boney M." },
        { t: "Superstition", a: "Stevie Wonder" },
        { t: "I Feel Love", a: "Donna Summer" }
      ]
    },
    {
      id: 'monde',
      nom: "Musiques du monde & latino",
      emoji: "🌍",
      desc: "Salsa, raï, gipsy, afrobeats : les tubes qui font voyager.",
      labelA: "Artiste",
      pistes: [
        { t: "Chan Chan", a: "Buena Vista Social Club" },
        { t: "Bamboléo", a: "Gipsy Kings" },
        { t: "Djobi Djoba", a: "Gipsy Kings" },
        { t: "Aïcha", a: "Khaled" },
        { t: "Didi", a: "Khaled" },
        { t: "Clandestino", a: "Manu Chao" },
        { t: "Me Gustas Tu", a: "Manu Chao" },
        { t: "Bongo Bong", a: "Manu Chao" },
        { t: "Waka Waka (This Time for Africa)", a: "Shakira", altT: ["Waka Waka"] },
        { t: "Hips Don't Lie", a: "Shakira" },
        { t: "La Camisa Negra", a: "Juanes" },
        { t: "Suavemente", a: "Elvis Crespo" },
        { t: "Vivir Mi Vida", a: "Marc Anthony" },
        { t: "Ai Se Eu Te Pego", a: "Michel Teló" },
        { t: "Dragostea Din Tei", a: "O-Zone" },
        { t: "Lambada", a: "Kaoma" },
        { t: "Yéké Yéké", a: "Mory Kanté" },
        /* Audrey a choisi l'arrangement rythme de Coumba Gawlo, que le catalogue
           d'Apple n'a qu'en karaoke : la voix manque, mais c'est ce rythme-la
           qu'on reconnait. « voulue » empeche le moteur de lui preferer
           l'originale de Miriam Makeba. */
        { t: "Pata Pata", a: "Miriam Makeba", altA: ["Coumba Gawlo"], voulue: true,
          q: "Pata Pata Karaoke Coumba Gawlo Universal Sound Machine" },
        { t: "Soul Makossa", a: "Manu Dibango" },
        { t: "Jerusalema", a: "Master KG" }
      ]
    }
  ];

  /* Mélange (Fisher-Yates) avec une graine, pour que tous les joueurs d'un
     salon tirent exactement la même sélection de morceaux. */
  function melangerAvecGraine(tableau, graine) {
    var out = tableau.slice();
    var etat = graine >>> 0 || 1;
    function alea() {
      etat ^= etat << 13; etat >>>= 0;
      etat ^= etat >> 17;
      etat ^= etat << 5; etat >>>= 0;
      return etat / 4294967296;
    }
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(alea() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  /* Recopie sur chaque morceau les réglages de sa catégorie : intitulés des
     champs de réponse, et mode « une seule réponse ».
     `solo` vaut null, 'titre' (seul le titre compte) ou 'artiste'. */
  function habillerPiste(p, m) {
    return Object.assign({}, p, {
      labelA: m.labelA || 'Artiste',
      labelT: m.labelT || 'Titre',
      solo: m.solo || null,
      strict: !!m.strict
    });
  }

  /* L'œuvre dont provient un morceau — film, anime, jeu, dessin animé — ou null
     quand la catégorie est organisée par artistes (auquel cas plusieurs titres
     du même chanteur sont tout à fait souhaitables). */
  function cleOeuvre(p, m) {
    var label = m.labelA || 'Artiste';
    if (m.solo === 'titre') return Match.normaliser(p.t);   // Club Dorothée : l'œuvre est le titre
    if (label === 'Artiste' || label === 'Interprète') return null;
    /* On coupe au premier deux-points ou à la première virgule pour remonter à
       la saga : « Star Wars, épisode IV » et « épisode V » comptent pour une
       seule œuvre, tout comme les deux Zelda. */
    return Match.normaliser(String(p.a).split(/[:,]/)[0]);
  }

  function parId(id) {
    for (var i = 0; i < manches.length; i++) if (manches[i].id === id) return manches[i];
    return null;
  }

  /* Sélection tirée au sort pour une partie. `melange` = toutes manches confondues. */
  function tirage(id, nombre, graine) {
    var source;
    if (id === 'melange') {
      /* Deux filtres pour que le Grand mélange reste varié :
         1. le même morceau listé dans deux catégories (« Wonderwall » est à la
            fois dans Années 90 et Karaoké) ;
         2. deux morceaux différents tirés de la même œuvre — le générique de
            Dragon Ball Z et son thème japonais, ou quatre chansons de Starmania.
         Dans les catégories d'artistes, en revanche, on garde bien plusieurs
         titres d'un même chanteur. */
      var vus = {}, vuesOeuvres = {};
      source = [];
      manches.forEach(function (m) {
        m.pistes.forEach(function (p) {
          var cle = Match.normaliser(p.t) + '|' + Match.normaliser(p.a);
          if (vus[cle]) return;

          var oeuvre = cleOeuvre(p, m);
          if (oeuvre) {
            if (vuesOeuvres[oeuvre]) return;
            vuesOeuvres[oeuvre] = 1;
          }

          vus[cle] = 1;
          source.push(habillerPiste(p, m));
        });
      });
    } else {
      var m = parId(id);
      if (!m) return [];
      source = m.pistes.map(function (p) { return habillerPiste(p, m); });
    }
    return melangerAvecGraine(source, graine).slice(0, nombre);
  }

  return {
    manches: manches,
    parId: parId,
    tirage: tirage,
    melangerAvecGraine: melangerAvecGraine
  };
})();
