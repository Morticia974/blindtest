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
        { t: "Les Démons de minuit", a: "Images" },

        /* Vingt-quatre sur vingt-quatre : la meilleure vague de la journée. Les
           tubes de cette décennie sont tous chez Apple en version d'origine. */
        { t: "Shout", a: "Tears for Fears" },
        { t: "Don't You (Forget About Me)", a: "Simple Minds" },
        { t: "Call Me", a: "Blondie", q: "Blondie Call Me American Gigolo" },
        { t: "Rio", a: "Duran Duran" },
        { t: "I Wanna Dance with Somebody", a: "Whitney Houston" },
        { t: "What's Love Got to Do with It", a: "Tina Turner" },
        { t: "Venus", a: "Bananarama" },
        { t: "In the Air Tonight", a: "Phil Collins" },
        { t: "Once in a Lifetime", a: "Talking Heads" },
        { t: "Need You Tonight", a: "INXS" },
        { t: "Flashdance... What a Feeling", a: "Irene Cara" },
        { t: "Kids in America", a: "Kim Wilde" },
        { t: "Brother Louie", a: "Modern Talking" },
        { t: "Self Control", a: "Laura Branigan" },
        { t: "Rock Me Amadeus", a: "Falco" },
        { t: "99 Luftballons", a: "Nena" },
        { t: "Forever Young", a: "Alphaville" },
        { t: "Tainted Love", a: "Soft Cell" },
        { t: "Amoureux solitaires", a: "Lio" },
        { t: "T'en va pas", a: "Elsa" },
        { t: "Les Sunlights des tropiques", a: "Gilbert Montagné" },
        { t: "Partenaire particulier", a: "Partenaire Particulier" },
        { t: "Tchiki boum", a: "Niagara" },
        { t: "Femme que j'aime", a: "Jean-Luc Lahaye" }
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
        { t: "Foule sentimentale", a: "Alain Souchon", q: "Alain Souchon Foule sentimentale C'est deja ca" },
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
        // Le nom de l'album dans la recherche : sans lui, « Dernière danse »
        // tombe sur celle d'Indila, qui est déjà dans les années 2010.
        { t: "Dernière danse", a: "Kyo", q: "Kyo Dernière danse Le chemin" },
        // L'album « Schrei » n'est pas sur Apple France : c'est le Best of qui
        // sert l'enregistrement, et sa pochette reste une pochette du groupe.
        { t: "Durch den Monsun", a: "Tokio Hotel", q: "Tokio Hotel Durch den Monsun Best of" },
        { t: "La Boulette", a: "Diam's" },
        { t: "En apesanteur", a: "Calogero" },
        { t: "Butterfly", a: "Superbus" },
        // « Ces soirées-là » retiré : Apple n'a que des reprises (Generation Mix,
        // Shewood Band, Les Enfoirés en live), jamais l'original de Yannick.
        { t: "L'Hymne de nos campagnes", a: "Tryo" },

        /* Ajouts validés par Audrey. Écartés faute de mieux chez Apple France :
           Green Day (que des reprises au quatuor à cordes), James Blunt pour
           « You're Beautiful », Lady Gaga pour « Poker Face » — ces deux-là sont
           remplacés par un autre titre du même artiste — et Leslie, absente.
           Corneille, Amel Bent et K-Maro sont déjà dans le rap, Shaggy dans le
           dancefloor : on ne les remet pas ici. */
        // « Bring Me to Life » est déjà dans la catégorie Métal.
        { t: "The Reason", a: "Hoobastank" },
        { t: "How You Remind Me", a: "Nickelback" },
        { t: "Complicated", a: "Avril Lavigne" },
        { t: "Beautiful", a: "Christina Aguilera" },
        { t: "So What", a: "P!nk", altA: ["Pink"] },
        { t: "I Gotta Feeling", a: "The Black Eyed Peas", altA: ["Black Eyed Peas"] },
        { t: "Apologize", a: "Timbaland", altA: ["OneRepublic", "One Republic"] },
        { t: "Yeah!", a: "Usher", altA: ["Lil Jon", "Ludacris"] },
        { t: "In Da Club", a: "50 Cent" },
        { t: "Chasing Cars", a: "Snow Patrol" },
        { t: "That's Not My Name", a: "The Ting Tings" },
        { t: "Porcelain", a: "Moby" },
        { t: "Get Busy", a: "Sean Paul" },
        { t: "Since U Been Gone", a: "Kelly Clarkson" },
        { t: "I Kissed a Girl", a: "Katy Perry" },
        { t: "Just Dance", a: "Lady Gaga", q: "Lady Gaga Just Dance The Fame", altA: ["Colby O'Donis"] },
        { t: "This Is the Life", a: "Amy Macdonald" },
        { t: "Goodbye My Lover", a: "James Blunt" },
        { t: "White Flag", a: "Dido" },
        { t: "Aux arbres citoyens", a: "Yannick Noah" },
        { t: "C'est quand le bonheur ?", a: "Cali", altT: ["C'est quand le bonheur"] },
        { t: "Caravane", a: "Raphaël" },
        { t: "Le Dîner", a: "Bénabar" },
        { t: "On s'attache", a: "Christophe Maé" },
        { t: "Toi + Moi", a: "Grégoire" },
        { t: "Les Voisines", a: "Renan Luce" },
        { t: "Ta douleur", a: "Camille" },
        { t: "J'traîne des pieds", a: "Olivia Ruiz" },
        { t: "J'ai demandé à la lune", a: "Indochine" },
        /* Apple n'a de « Au soleil » que le « Nouveau Mix 2002 » — c'est bien le
           single de l'époque. Sans « voulue », le mot « Mix » le faisait
           rétrograder derrière la reprise des Kids United. */
        { t: "Au Soleil", a: "Jenifer", voulue: true, q: "Jenifer Au Soleil Nouveau Mix 2002" },
        { t: "Près de moi", a: "Lorie" },
        // « La musique » est une reprise d'Angelica : c'est sous ce nom-là
        // qu'Apple la range, et sans le préciser on tombait sur l'album
        // Michel Berger de la Star Academy 2.
        { t: "La musique (Angelica)", a: "Star Academy", altT: ["La musique"], q: "Star Academy La musique Angelica" },
        { t: "Elle me contrôle", a: "M. Pokora", altA: ["Matt Pokora", "Sweety"] },
        { t: "Parle-moi", a: "Nâdiya", altT: ["Parle moi"] },
        { t: "Tu seras", a: "Emma Daumas" }
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
        { t: "Papaoutai", a: "Stromae" },

        { t: "Ne me quitte pas", a: "Jacques Brel" },
        { t: "Le Gorille", a: "Georges Brassens" },
        /* Sans l'album, Apple servait la reprise de La Grande Sophie. */
        { t: "Comme un arbre dans la ville", a: "Maxime Le Forestier", q: "Maxime Le Forestier Comme un arbre dans la ville Mon frere" },
        { t: "Ella, elle l'a", a: "France Gall" },
        { t: "Dis, quand reviendras-tu ?", a: "Barbara" },
        { t: "Requiem pour un fou", a: "Johnny Hallyday" },
        { t: "Quelque chose de Tennessee", a: "Johnny Hallyday" },
        { t: "L'Encre de tes yeux", a: "Francis Cabrel" },
        { t: "Je l'aime à mourir", a: "Francis Cabrel" },
        { t: "S'il suffisait d'aimer", a: "Céline Dion" },
        { t: "Elle a les yeux revolver", a: "Marc Lavoine" },
        { t: "Désenchantée", a: "Mylène Farmer" },
        { t: "Libertine", a: "Mylène Farmer" },
        { t: "Mon mec à moi", a: "Patricia Kaas" },
        { t: "Voyage en Italie", a: "Lilicub" },
        { t: "Tous les cris les SOS", a: "Daniel Balavoine" },
        { t: "Encore un matin", a: "Jean-Jacques Goldman" },
        { t: "Je te donne", a: "Jean-Jacques Goldman", altA: ["Michael Jones"] },
        { t: "Ma Liberté de penser", a: "Florent Pagny" },
        { t: "Jardin d'hiver", a: "Henri Salvador" },
        { t: "Sur un prélude de Bach", a: "Maurane" },
        { t: "Sous le vent", a: "Garou & Céline Dion", altA: ["Garou", "Céline Dion"] },
        { t: "Manhattan-Kaboul", a: "Renaud & Axelle Red", altA: ["Renaud", "Axelle Red"] },
        { t: "Lettre à France", a: "Michel Polnareff" }
      ]
    },
    {
      id: 'disney',
      nom: "Disney et compagnie",
      emoji: "🏰",
      desc: "Ici on devine le film.",
      /* Une seule réponse : le film. Le titre de la chanson ne compte plus —
         la catégorie mélange du français et de l'anglais, et personne n'a envie
         d'écrire « Hawaiian Roller Coaster Ride » pour reconnaître Lilo & Stitch.
         Il est quand même révélé à la fin, pour l'anecdote. */
      solo: 'artiste',
      // Comme pour les génériques et les animes : c'est le film qu'on cherche,
      // donc le nom du chanteur relevé chez Apple ne vaut pas réponse.
      strict: true,
      labelT: "Chanson",
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
        // Sans le nom de Laura Mayne, Apple sert la reprise de Jenifer (We Love
        // Disney) à la place de la bande originale du film.
        { t: "L'Air du vent", a: "Pocahontas", q: "Laura Mayne L'Air du vent Pocahontas" },
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
        { t: "Prince Ali", a: "Aladdin", q: "Prince Ali Aladdin" },

        /* Apple France n'a rien d'utilisable pour Dumbo, Coco, Le Prince
           d'Égypte, Kuzco, Oliver et Compagnie ni Rox et Rouky : que des
           versions piano, anglaises, ou un autre film entièrement. */
        { t: "Bibbidi-Bobbidi-Boo", a: "Cendrillon", q: "Cendrillon Bibbidi Bobbidi Boo Bande Originale Française" },
        { t: "Supercalifragilisticexpialidocious", a: "Mary Poppins", q: "Mary Poppins Supercalifragilisticexpialidocious Julie Andrews" },
        { t: "J'en ai rêvé", a: "La Belle au bois dormant", q: "La Belle au bois dormant J'en ai rêvé bande originale française" },
        { t: "Tu t'envoles", a: "Peter Pan", q: "Peter Pan Tu t'envoles bande originale française" },
        { t: "Toujours dans mon cœur", a: "Tarzan", q: "Tarzan Toujours dans mon coeur Phil Collins" },
        { t: "Au bout du rêve", a: "La Princesse et la Grenouille", q: "La Princesse et la Grenouille Au bout du rêve" },
        { t: "Cruella De Vil", a: "Les 101 Dalmatiens", q: "Les 101 Dalmatiens Cruella De Vil", altA: ["101 Dalmatiens"] },
        { t: "Dans un autre monde", a: "La Reine des neiges 2", q: "La Reine des neiges 2 Dans un autre monde", altA: ["La Reine des neiges"] },
        { t: "Ne parlons pas de Bruno", a: "Encanto", q: "Encanto Ne parlons pas de Bruno", altA: ["La Fantastique Famille Madrigal"] },
        { t: "Loin du froid de décembre", a: "Anastasia", q: "Anastasia Loin du froid de décembre" },
        { t: "Bella Notte", a: "La Belle et le Clochard", q: "La Belle et le Clochard Bella Notte français" },
        // Audrey a validé ce titre-là pour Merlin plutôt que « Un tout petit rien ».
        { t: "Higitus Figitus", a: "Merlin l'Enchanteur", q: "Merlin l'Enchanteur Higitus Figitus" },
        { t: "Être un homme comme vous", a: "Le Livre de la jungle", q: "Le Livre de la jungle Être un homme comme vous" },
        // Venu des génériques : c'est un dessin animé, sa place est ici.
        { t: "Test Drive", a: "Dragons", q: "Test Drive John Powell How to Train Your Dragon", altA: ["How to Train Your Dragon"] },

        /* Le « et compagnie » du nom sert enfin : Shrek, Les Trolls et Zootopie
           rejoignent la maison. Madagascar et Kung Fu Panda sont écartés — Apple
           n'a que des reprises du premier, et pour le second la version du film
           n'y est pas, seulement l'original de Carl Douglas, qui ferait répondre
           « Kung Fu Fighting » plutôt que le nom du film. */
        { t: "Le Festin", a: "Ratatouille", q: "Camille Le Festin Ratatouille" },
        { t: "Down to Earth", a: "Wall-E", q: "Peter Gabriel Down to Earth Wall-E" },
        { t: "The Glory Days", a: "Les Indestructibles", q: "Michael Giacchino The Glory Days The Incredibles", altA: ["The Incredibles"] },
        { t: "Bundle of Joy", a: "Vice-versa", q: "Michael Giacchino Bundle of Joy Inside Out", altA: ["Inside Out"] },
        { t: "Touch the Sky", a: "Rebelle", q: "Julie Fowlis Touch the Sky Brave", altA: ["Brave"] },
        { t: "Hawaiian Roller Coaster Ride", a: "Lilo & Stitch", q: "Hawaiian Roller Coaster Ride Lilo and Stitch Original Motion Picture Soundtrack" },
        { t: "I'm Still Here (Jim's Theme)", a: "La Planète au trésor", q: "John Rzeznik I'm Still Here Jim's Theme Treasure Planet", altT: ["I'm Still Here"] },
        { t: "L'Apprenti sorcier", a: "Fantasia", q: "L'apprenti sorcier Philadelphia Orchestra Leopold Stokowski" },
        { t: "L'Amour nous guidera", a: "Le Roi Lion 2", q: "Le Roi Lion 2 L'amour nous guidera Best of", altA: ["Le Roi Lion"] },
        { t: "I'm a Believer", a: "Shrek", q: "Smash Mouth I'm a Believer Shrek Original Motion Picture Soundtrack" },
        { t: "Can't Stop the Feeling!", a: "Les Trolls", q: "Justin Timberlake Can't Stop the Feeling Trolls Original Motion Picture Soundtrack", altA: ["Trolls"] },
        { t: "Try Everything", a: "Zootopie", q: "Shakira Try Everything Zootopie Bande Originale", altA: ["Zootopia"] },
        { t: "Winnie l'ourson", a: "Winnie l'ourson", q: "Winnie l'Ourson Nicole Croisille 100% Disney" },
        { t: "Oo-De-Lally", a: "Robin des Bois", q: "Roger Miller Oo-De-Lally Robin Hood Legacy Collection" },

        /* Trois Pixar pour aligner la catégorie sur les autres. « Là-haut »
           vient des films cultes, où il n'avait rien à faire. */
        { t: "Married Life", a: "Là-haut", q: "Michael Giacchino Married Life Up Soundtrack from the Motion Picture", altA: ["Up"] },
        { t: "Life Is a Highway", a: "Cars", q: "Rascal Flatts Life Is a Highway Cars Original Motion Picture Soundtrack" },
        { t: "If I Didn't Have You", a: "Monstres & Cie", q: "Billy Crystal John Goodman If I Didn't Have You Monsters Inc Original Soundtrack", altA: ["Monstres et Cie", "Monsters, Inc."] }
      ]
    },
    {
      id: 'generiques',
      nom: "Films cultes",
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
        { t: "Hedwig's Theme", a: "Harry Potter à l'école des sorciers", q: "Hedwig's Theme John Williams", altA: ["Harry Potter"] },
        { t: "He's a Pirate", a: "Pirates des Caraïbes : La Malédiction du Black Pearl", q: "He's a Pirate Klaus Badelt", altA: ["Pirates des Caraïbes", "Pirates of the Caribbean"] },
        { t: "Main Title", a: "Star Wars, épisode IV : Un nouvel espoir", q: "Star Wars Main Title John Williams", altA: ["Star Wars", "La Guerre des étoiles"] },
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
        // « Circle of Life » retiré : c'est la version anglaise de « L'Histoire
        // de la vie », déjà dans la catégorie Disney & dessins animés.
        // « Dragons » déplacé vers Disney & dessins animés : c'est un DreamWorks.
        { t: "Now We Are Free", a: "Gladiator", q: "Now We Are Free Hans Zimmer" },
        { t: "Back to the Future", a: "Retour vers le futur", q: "Back to the Future Theme Alan Silvestri" },
        { t: "The Imperial March", a: "Star Wars, épisode V : L'Empire contre-attaque", q: "Imperial March John Williams", altT: ["Marche impériale"], altA: ["Star Wars", "La Guerre des étoiles"] },
        // « Là-haut » retiré : c'est un Pixar, sa place est dans la catégorie
        // Disney & dessins animés, pas parmi les films.

        /* Abandonnés : Les Simpson (Apple France n'a que des arrangements pour
           orchestre de chambre), E.T. (uniquement en medley) et 2001 (Apple ne
           remonte pas le bon mouvement de Zarathoustra). */
        { t: "Theme from Jurassic Park", a: "Jurassic Park", q: "Jurassic Park Original Motion Picture Soundtrack John Williams main theme" },
        { t: "The Terminator Theme", a: "Terminator", q: "Terminator Main Title Brad Fiedel" },
        { t: "Tubular Bells", a: "L'Exorciste", q: "Tubular Bells Mike Oldfield" },
        { t: "Halloween Theme", a: "Halloween", q: "Halloween Theme John Carpenter" },
        { t: "Concerning Hobbits", a: "Le Seigneur des anneaux", q: "Concerning Hobbits Howard Shore" },
        { t: "Lux Aeterna", a: "Requiem for a Dream", q: "Lux Aeterna Clint Mansell" },
        { t: "The Pink Panther Theme", a: "La Panthère rose", q: "Pink Panther Theme Henry Mancini" },
        { t: "The Ecstasy of Gold", a: "Le Bon, la Brute et le Truand", q: "Ecstasy of Gold Ennio Morricone" },
        { t: "Chariots of Fire", a: "Les Chariots de feu", q: "Vangelis Chariots of Fire" },

        /* Vingt-six films cités par Audrey. Huit d'entre eux sortaient sur une
           reprise et ont demandé une requête épinglée : Matrix arrivait en
           quatuor à cordes, OSS 117 en fanfare, Rabbi Jacob en version
           classique, « Laid » chez un autre artiste que James. */
        { t: "The Godfather Waltz", a: "Le Parrain", q: "The Godfather Waltz Nino Rota" },
        // « Clubbed to Death » n'existe chez Apple qu'en reprise : on prend
        // l'autre morceau emblématique du film, la scène du hall.
        { t: "Spybreak!", a: "Matrix", q: "Propellerheads Spybreak Decksandrumsandrockandroll" },
        { t: "Time", a: "Inception", q: "Time Hans Zimmer Inception" },
        { t: "Cornfield Chase", a: "Interstellar", q: "Cornfield Chase Hans Zimmer Interstellar" },
        { t: "The Diva Dance", a: "Le Cinquième Élément", q: "Eric Serra Diva Dance Fifth Element Original Motion Picture Soundtrack", altA: ["Le 5e Élément"] },
        { t: "Forrest Gump Suite", a: "Forrest Gump", q: "Forrest Gump Suite Alan Silvestri" },
        { t: "Misirlou", a: "Pulp Fiction", q: "Misirlou Dick Dale Pulp Fiction" },
        { t: "Main Title and First Victim", a: "Les Dents de la mer", q: "Jaws Main Title and First Victim John Williams", altA: ["Jaws"] },
        { t: "Prelude", a: "Psychose", q: "Bernard Herrmann Psycho Original Motion Picture Score Prelude", altA: ["Psycho"] },
        { t: "Main Title (The Shining)", a: "Shining", q: "The Shining Main Title Wendy Carlos" },
        { t: "Main Title", a: "Le Silence des agneaux", q: "Silence of the Lambs Main Title Howard Shore" },
        { t: "C'era una volta il West", a: "Il était une fois dans l'Ouest", q: "Ennio Morricone C'era una volta il West" },
        { t: "Main Title", a: "Braveheart", q: "Braveheart Main Title James Horner" },
        { t: "The Big Blue (Overture)", a: "Le Grand Bleu", q: "The Big Blue Overture Eric Serra" },
        { t: "Enae Volare", a: "Les Visiteurs", q: "Les Visiteurs Eric Levi bande originale" },
        { t: "Reality", a: "La Boum", q: "Reality Richard Sanderson La Boum" },
        { t: "Oss 117 thème", a: "OSS 117", q: "Ludovic Bource OSS 117 Le Caire nid d'espions bande originale du film" },
        { t: "I'm Just Ken", a: "Barbie", q: "I'm Just Ken Ryan Gosling Barbie" },
        { t: "Laid", a: "American Pie", q: "James Laid Laid album" },
        { t: "I See You", a: "Avatar", q: "I See You Leona Lewis Avatar" },
        { t: "Astérix et Obélix: Mission Cléopâtre", a: "Astérix et Obélix : Mission Cléopâtre", q: "Asterix Obelix Mission Cleopatre bande originale Philippe Chany", altA: ["Mission Cléopâtre", "Astérix et Obélix"] },
        { t: "La Carioca", a: "La Cité de la peur", q: "La Carioca La Cite de la peur Les Nuls" },
        { t: "The Addams Family - Main Theme", a: "La Famille Addams", q: "Vic Mizzy Addams Family Original Music From The T.V. Show", altT: ["The Addams Family"] },
        { t: "Rabbi Jacob", a: "Les Aventures de Rabbi Jacob", q: "Vladimir Cosma Rabbi Jacob bande originale du film", altA: ["Rabbi Jacob"] },
        { t: "Come and Get Your Love", a: "Les Gardiens de la Galaxie", q: "Come and Get Your Love Redbone" },
        { t: "Can You Hear the Music", a: "Oppenheimer", q: "Can You Hear the Music Ludwig Goransson Oppenheimer" },
        /* Celui-là s'imposait : le nom du site vient de Fatal Bazooka. */
        { t: "Ce matin va être une pure soirée", a: "Fatal", q: "Fatal Bazooka Ce matin va être une pure soirée Big Ali", altA: ["Fatal Bazooka"] },
        // Demandé par une amie d'Audrey. La bande originale de Harry Manfredini
        // est chez Apple : c'est bien le générique d'origine, pas une reprise.
        { t: "Overlay of Evil / Main Title", a: "Vendredi 13", q: "Harry Manfredini Friday the 13th Overlay of Evil Main Title Original Motion Picture Soundtrack", altA: ["Friday the 13th"] }
      ]
    },
    {
      id: 'series',
      nom: "Séries cultes",
      emoji: "📺",
      desc: "Les génériques qu'on connaît par cœur. Ici on devine la série.",
      // Même principe que les films : c'est l'œuvre qu'on cherche, pas le nom
      // du compositeur relevé chez Apple.
      solo: 'artiste',
      strict: true,
      labelT: "Titre du morceau",
      labelA: "Série",
      pistes: [
        { t: "I'll Be There for You", a: "Friends", q: "I'll Be There for You The Rembrandts" },
        { t: "Main Title", a: "Game of Thrones", q: "Game of Thrones Main Title Ramin Djawadi", altA: ["Le Trône de fer"] },
        { t: "The X-Files Theme", a: "X-Files", q: "X Files Theme Mark Snow", altT: ["Materia Primoris"] },
        { t: "Doctor Who Theme", a: "Doctor Who", q: "Doctor Who Theme Murray Gold" },
        { t: "Woke Up This Morning", a: "Les Soprano", q: "Woke Up This Morning Alabama 3", altA: ["The Sopranos"] },
        { t: "Stranger Things", a: "Stranger Things", q: "Stranger Things Theme Kyle Dixon Michael Stein" },
        { t: "Red Right Hand", a: "Peaky Blinders", q: "Red Right Hand Nick Cave and the Bad Seeds" },
        { t: "Twin Peaks Theme", a: "Twin Peaks", q: "Twin Peaks Theme Angelo Badalamenti" },

        /* ---- enregistrements officiels ---- */
        { t: "Yo Home to Bel-Air", a: "Le Prince de Bel-Air", q: "Fresh Prince of Bel Air theme Will Smith Yo Home to Bel Air", altA: ["Fresh Prince"] },
        { t: "Boss of Me", a: "Malcolm", q: "They Might Be Giants Boss of Me Mink Car", altA: ["Malcolm in the Middle"] },
        { t: "Superman", a: "Scrubs", q: "Superman Lazlo Bane All the Time in the World" },
        { t: "Hey Beautiful", a: "How I Met Your Mother", q: "Hey Beautiful The Solids How I Met Your Mother" },
        { t: "Big Bang Theory Theme", a: "The Big Bang Theory", q: "Barenaked Ladies Big Bang Theory Theme" },
        { t: "Desperate Housewives Theme", a: "Desperate Housewives", q: "Desperate Housewives Main Title Danny Elfman" },
        { t: "Teardrop", a: "Dr House", q: "Teardrop Massive Attack Mezzanine", altA: ["House", "House M.D."] },
        { t: "Secret", a: "Pretty Little Liars", q: "Secret The Pierces Thirteen Tales of Love and Revenge" },
        { t: "You've Got Time", a: "Orange Is the New Black", q: "You've Got Time Regina Spektor" },
        { t: "Toss a Coin to Your Witcher", a: "The Witcher", q: "Toss a Coin to Your Witcher Sonya Belousova Joey Batey" },
        { t: "Theme from the Walking Dead", a: "The Walking Dead", q: "Bear McCreary Theme from the Walking Dead Original Television Soundtrack" },
        { t: "Goo Goo Muck", a: "Mercredi", q: "Goo Goo Muck The Cramps Psychedelic Jungle", altA: ["Wednesday"] },
        { t: "Theme from Beverly Hills, 90210", a: "Beverly Hills 90210", q: "Theme from Beverly Hills 90210 John Davis Soundtrack", altA: ["90210"] },
        { t: "Dexter Main Title", a: "Dexter", q: "Rolfe Kent Dexter Main Title" },
        { t: "Main Title Season 3", a: "Prison Break", q: "Ramin Djawadi Prison Break Seasons 3 & 4 Original Television Soundtrack", altT: ["Prison Break Theme"] },
        { t: "Life and Death", a: "Lost", q: "Michael Giacchino Lost Season 1 Original Television Soundtrack Life and Death" },
        { t: "Breaking Bad (Main Title Theme)", a: "Breaking Bad", q: "Dave Porter Breaking Bad Main Title Theme Music from the Original TV Series" },
        { t: "It's a Jungle Out There", a: "Monk", q: "Randy Newman It's a Jungle Out There" },
        { t: "Main Title", a: "Stargate SG-1", q: "Stargate SG-1 Main Title Joel Goldsmith Best of Soundtrack", altA: ["Stargate"] },
        { t: "Rick and Morty Theme", a: "Rick et Morty", q: "Ryan Elder Rick and Morty Theme", altA: ["Rick and Morty"] },
        { t: "Futurama Main Theme", a: "Futurama", q: "Christopher Tyng Futurama Main Theme" },
        // Trouvé au troisième essai seulement : la version officielle existe, sur
        // l'album « Testify » de la série. Les requêtes évidentes ne sortaient
        // que des arrangements pour orchestre de chambre.
        { t: "The Simpsons Main Title Theme", a: "Les Simpson", q: "Simpsons Main Title Theme Testify original music television series", altA: ["The Simpsons"] },
        { t: "Enemy", a: "Arcane", q: "Enemy Imagine Dragons JID Arcane League of Legends" },
        { t: "Main Title", a: "Battlestar Galactica", q: "Battlestar Galactica Main Title John Williams Boston Pops" },
        { t: "The Mandalorian", a: "The Mandalorian", q: "Ludwig Goransson The Mandalorian Chapter 1 Original Score" },
        { t: "Justice League Unlimited Theme", a: "La Ligue des justiciers", q: "Justice League Unlimited Theme Michael McCuistion Music of DC Comics", altA: ["Justice League"] },
        { t: "This Life", a: "Sons of Anarchy", q: "This Life Curtis Stigers Forest Rangers Songs of Anarchy" },
        { t: "Arthur à la Tour", a: "Kaamelott", q: "Kaamelott Premier Volet Alexandre Astier bande originale" },

        /* ---- reprises instrumentales fidèles ----
           Ces génériques-là ne sont jamais sortis en disque. On garde une
           reprise fidèle : ici on devine la série à la mélodie, et la mélodie
           est la même. C'est le choix déjà fait pour les jeux Nintendo. */
        { t: "The A-Team - Theme from the TV Series", a: "L'Agence tous risques", q: "Dominik Hauser The A-Team Theme from the Television Series single", altT: ["The A-Team"], altA: ["A-Team"] },
        { t: "Magnum P.I. Theme", a: "Magnum", q: "Dominik Hauser Magnum P.I. Theme from the Television Series", altA: ["Magnum P.I."] },
        { t: "South Park - Theme from the TV Series", a: "South Park", q: "Dominik Hauser South Park Theme from the Television Series", altT: ["South Park Theme"] },
        { t: "Buffy the Vampire Slayer", a: "Buffy contre les vampires", q: "Buffy the Vampire Slayer TV Tunesters TV's Greatest Themes 90's", altA: ["Buffy"] },
        { t: "The Office", a: "The Office", q: "The Office Scranton Crew TV Generation" },
        { t: "Mystery Movie Theme", a: "Columbo", q: "Mystery Movie Theme Columbo Geek Music" },
        { t: "Criminal Minds", a: "Esprits criminels", q: "Criminal Minds Movie Sounds Unlimited Best of American TV Themes", altA: ["Criminal Minds"] },

        /* Rattrapées après coup : je n'avais cherché que le générique, alors
           qu'il fallait fouiller le catalogue des interprètes. */
        // Apple n'a de « Sámbame » que le « Radio Edit Remix », qui est la
        // version single : « voulue » empêche le moteur de la rétrograder.
        { t: "Sámbame", a: "Un dos tres", voulue: true, q: "Upa Dance Sámbame Radio Edit Remix Collector Edition", altA: ["Upa Dance", "Un paso adelante"] },
        // Audrey a écouté les cinq candidats et retenu celui-ci : la reprise
        // au piano, moins marquée par le tube d'origine que celles au quatuor.
        { t: "Wildest Dreams", a: "Les Chroniques de Bridgerton", q: "Duomo Wildest Dreams Bridgerton Covers From the Netflix Original Series", altA: ["Bridgerton"] },
        { t: "American Horror Story Theme", a: "American Horror Story", q: "American Horror Story Theme Cesar Davila-Irizarry Charlie Clouser", altA: ["AHS"] },
        // Laurie Johnson, depuis la bande originale officielle de la série.
        { t: "Main Titles Theme", a: "Chapeau melon et bottes de cuir", q: "Laurie Johnson Main Titles Theme The Avengers 1968-1969 Soundtrack from the TV Series", altA: ["The Avengers"] },
        /* La chanson du récapitulatif de chaque fin de saison. C'est un titre de
           Kansas, mais la catégorie demande explicitement une série : personne ne
           répondra « Kansas ». Le groupe n'est nulle part ailleurs dans le jeu. */
        { t: "Carry On Wayward Son", a: "Supernatural", q: "Kansas Carry On Wayward Son Leftoverture" },
        { t: "I'm Always Here", a: "Alerte à Malibu", q: "Jim Jamison I'm Always Here Baywatch", altA: ["Baywatch"] },
        // Le thème de 1996, celui de la musique officielle de RTL.
        { t: "Original Theme 1996", a: "Alerte Cobra", q: "Reinhard Scheuregger Original Theme 1996 Alarm für Cobra 11 Originalmusik RTL Serie", altA: ["Alarm für Cobra 11", "Cobra 11"] }
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
        { t: "On Écrit Sur Les Murs", a: "Kids United", q: "On écrit sur les murs Kids United" },

        { t: "Lady (Hear Me Tonight)", a: "Modjo" },
        // Sans l'album, une reprise de « Dance Fruits Music » passait devant.
        { t: "Music Sounds Better with You", a: "Stardust", q: "Stardust Music Sounds Better With You 1998" },
        { t: "L'Amour Toujours", a: "Gigi D'Agostino" },
        { t: "9 PM (Till I Come)", a: "ATB", altT: ["9 PM Till I Come"] },
        { t: "Sandstorm", a: "Darude" },
        { t: "Better Off Alone", a: "Alice Deejay" },
        // « Heaven » tout court ramenait celui d'Avicii.
        { t: "Heaven", a: "DJ Sammy", q: "DJ Sammy Yanou Do Heaven Candlelight" },
        { t: "Everytime We Touch", a: "Cascada" },
        { t: "Cotton Eye Joe", a: "Rednex" },
        { t: "Boom, Boom, Boom, Boom!!", a: "Vengaboys" },
        { t: "Gasolina", a: "Daddy Yankee" },
        { t: "Give Me Everything", a: "Pitbull", altA: ["Ne-Yo", "Afrojack"] },
        { t: "Low", a: "Flo Rida", altA: ["T-Pain"] },
        { t: "Party Rock Anthem", a: "LMFAO" },
        { t: "Gangnam Style", a: "PSY" },
        { t: "Cheerleader", a: "OMI", q: "OMI Cheerleader Me 4 U" },
        { t: "Be Mine", a: "Ofenbach" },
        { t: "Axel F", a: "Crazy Frog" },
        { t: "Who Let the Dogs Out", a: "Baha Men" },
        { t: "Mi Gente", a: "J Balvin & Willy William", altA: ["J Balvin", "Willy William"] }
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
        { t: "Born to Be Wild", a: "Steppenwolf" },

        { t: "Another Brick in the Wall, Pt. 2", a: "Pink Floyd" },
        { t: "Baba O'Riley", a: "The Who" },
        { t: "Heroes", a: "David Bowie" },
        { t: "Riders on the Storm", a: "The Doors" },
        // Sans l'album, Apple servait une prise alternative de l'anthologie.
        { t: "Purple Haze", a: "Jimi Hendrix", q: "Jimi Hendrix Purple Haze Are You Experienced" },
        { t: "Sweet Home Alabama", a: "Lynyrd Skynyrd" },
        { t: "I Was Made for Lovin' You", a: "Kiss" },
        { t: "Blitzkrieg Bop", a: "Ramones" },
        { t: "Anarchy in the U.K.", a: "Sex Pistols" },
        { t: "I Love Rock 'n Roll", a: "Joan Jett & the Blackhearts", altA: ["Joan Jett"] },
        { t: "Fortunate Son", a: "Creedence Clearwater Revival", altA: ["CCR", "Creedence"] },
        { t: "Friday I'm in Love", a: "The Cure" },
        { t: "Enjoy the Silence", a: "Depeche Mode" },
        { t: "Alive", a: "Pearl Jam" },
        { t: "Pretty Fly (For a White Guy)", a: "The Offspring" },
        { t: "Buddy Holly", a: "Weezer" },
        { t: "Take Me Out", a: "Franz Ferdinand" },
        { t: "Last Nite", a: "The Strokes" },
        { t: "Sex on Fire", a: "Kings of Leon" },
        { t: "Californication", a: "Red Hot Chili Peppers", altA: ["RHCP"] },
        { t: "It's My Life", a: "Bon Jovi" },
        /* « Rage Against Power Machines » : un groupe hommage remontait avant
           l'original. On épingle l'album. */
        { t: "Killing in the Name", a: "Rage Against the Machine", q: "Rage Against the Machine Killing in the Name 1992 album", altA: ["RATM"] },
        { t: "Lambé An Dro", a: "Matmatah" },
        // « Brand New Eyes » plutôt que la B.O. de Twilight : même
        // enregistrement, mais la pochette est celle du groupe.
        { t: "Decode", a: "Paramore", q: "Paramore Decode Brand New Eyes" }
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
        { t: "Évier Metal", a: "Ultra Vomit", q: "Evier Metal Ultra Vomit", altT: ["Evier Metal"] },

        /* Alice in Chains écarté : Apple n'en a qu'un quatuor à cordes puis une
           reprise coréenne. */
        { t: "Thunderstruck", a: "AC/DC" },
        { t: "Poison", a: "Alice Cooper" },
        { t: "We're Not Gonna Take It", a: "Twisted Sister" },
        { t: "Caught in a Mosh", a: "Anthrax" },
        { t: "Roots Bloody Roots", a: "Sepultura" },
        { t: "Numb", a: "Linkin Park" },
        { t: "Rollin' (Air Raid Vehicle)", a: "Limp Bizkit" },
        { t: "Down with the Sickness", a: "Disturbed" },
        // « The Beautiful People » ramenait David Guetta : on prend le morceau-titre.
        { t: "Antichrist Superstar", a: "Marilyn Manson", q: "Marilyn Manson Antichrist Superstar album" },
        { t: "Dragula", a: "Rob Zombie" },
        { t: "Bat Country", a: "Avenged Sevenfold" },
        { t: "Throne", a: "Bring Me the Horizon" },
        { t: "Square Hammer", a: "Ghost" },
        { t: "Demons Are a Girl's Best Friend", a: "Powerwolf" },
        { t: "Ice Queen", a: "Within Temptation" },
        { t: "Pull Me Under", a: "Dream Theater" },
        { t: "Schism", a: "Tool" },
        { t: "Change (In the House of Flies)", a: "Deftones" },
        { t: "Black Hole Sun", a: "Soundgarden" },
        { t: "Blood and Thunder", a: "Mastodon" },
        { t: "O Father O Satan O Sun", a: "Behemoth", altT: ["O Father O Satan O Sun!"] }
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
        { t: "Sobakasu", a: "Kenshin le vagabond", q: "Sobakasu JUDY AND MARY The Great Escape", altA: ["Rurouni Kenshin"] },

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
        { t: "Seishun Satsubatsuron", a: "Assassination Classroom", q: "Seishun Satsubatsuron 3-nen E-gumi Utatan", altA: ["Ansatsu Kyoushitsu"] },
        { t: "Sono Chi no Sadame", a: "JoJo's Bizarre Adventure", q: "Sono Chi no Sadame Hiroaki Tommy Tominaga", altA: ["JoJo"] },
        { t: "Rose", a: "NANA", q: "Rose Anna Tsuchiya NANA" },
        { t: "This Game", a: "No Game No Life", q: "This Game Konomi Suzuki" },
        { t: "Grain", a: "Monster", q: "Grain Kuniaki Haishima Monster" },
        /* La requête générique ne donnait rien du tout : la bande originale
           est cataloguée au nom du compositeur, pas de la série. */
        { t: "Wakfu opening song", a: "Wakfu", q: "Wakfu Guillaume Houzé opening song", altT: ["Wakfu"] },

        /* Sept abandons : Mob Psycho, Dr. Stone, Black Clover, Frieren, Détective
           Conan, Akira et Konosuba. Apple les noie sous les reprises de chaînes
           YouTube — Miura Jam, Jonathan Young — quand il ne rend pas rien du tout. */
        { t: "GO!!!", a: "Naruto", q: "GO!!! FLOW Naruto opening" },
        { t: "Hacking to the Gate", a: "Steins;Gate", q: "Hacking to the Gate ITO KANAKO", altA: ["Steins Gate"] },
        { t: "Redo", a: "Re:Zero", q: "Redo Konomi Suzuki Re Zero", altA: ["Re Zero"] },
        { t: "Mukanjyo", a: "Vinland Saga", q: "Mukanjyo Survive Said The Prophet Inside Your Head" },
        /* Seule version officielle disponible : l'enregistrement acoustique en
           direct de THE FIRST TAKE. C'est bien SPYAIR, mais plus dépouillé que
           le générique — l'alternative était une boîte à musique. */
        { t: "Imagination", a: "Haikyu!!", q: "SPYAIR イマジネーション From THE FIRST TAKE", altA: ["Haikyuu"] },
        { t: "Can Do", a: "Kuroko no Basket", q: "GRANRODEO Can Do Single", altA: ["Kuroko's Basketball"] },
        { t: "Cry Baby", a: "Tokyo Revengers", q: "Official HIGE DANDISM Cry Baby Single" },
        { t: "Mixed Nuts", a: "Spy x Family", q: "OFFICIAL HIGE DANDISM ミックスナッツ Rejoice", altT: ["ミックスナッツ"] },
        { t: "Clattanoia", a: "Overlord", q: "Clattanoia OxT Overlord" },
        { t: "Touch off", a: "The Promised Neverland", q: "Touch off UVERworld Promised Neverland", altA: ["Yakusoku no Neverland"] },
        { t: "Princesse Mononoké", a: "Princesse Mononoké", q: "Joe Hisaishi Yoshikazu Mera Princesse Mononoké chant Original Soundtrack", altA: ["Mononoke"] },
        { t: "Making of Cyborg", a: "Ghost in the Shell", q: "Kenji Kawai Making of Cyborg Ghost in the Shell Original Soundtrack" },
        { t: "Sincerely", a: "Violet Evergarden", q: "Sincerely TRUE Violet Evergarden Vocal Album" },
        { t: "Hikarunara", a: "Your Lie in April", q: "Goose house Hikarunara Milk", altT: ["Hikaru Nara"], altA: ["Shigatsu wa Kimi no Uso"] },
        { t: "My Soul, Your Beats!", a: "Angel Beats!", q: "My Soul Your Beats Lia Angel Beats", altA: ["Angel Beats"] }
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
        // Among Us retiré à la demande d'Audrey : le « drip theme » qu'Apple
        // propose n'est pas la musique qu'on associe au jeu.
        { t: "Rainbow Road", a: "Mario Kart", q: "Rainbow Road Mario Kart 64 Qumu", altA: ["Mario Kart 64"] },
        { t: "Fallout 4 Main Theme", a: "Fallout", q: "Fallout 4 Main Theme Inon Zur", altA: ["Fallout 4"] },
        { t: "Gwyn, Lord of Cinder", a: "Dark Souls", q: "Gwyn Lord of Cinder Motoi Sakuraba Dark Souls" },
        { t: "Call of Duty Modern Warfare 2: Theme", a: "Call of Duty", q: "Call of Duty Modern Warfare 2 Theme Orchestre Philharmonique de Londres", altA: ["COD", "Modern Warfare"] },
        { t: "Pac Man Theme", a: "Pac-Man", q: "Pac Man Theme Theme Mania Video Games Themes Collection", altA: ["Pacman"] },
        { t: "Tetris Theme (Korobeiniki)", a: "Tetris", q: "Tetris Theme Korobeiniki Orchestre Philharmonique de Londres", altT: ["Korobeiniki"] },

        /* Quatre abandons : Half-Life (Valve ne distribue pas sa musique — la
           recherche finit chez Adele), Persona 5, Street Fighter II et NieR:
           Automata, qui n'existent qu'en reprises. */
        { t: "Snake Eater", a: "Metal Gear Solid 3", q: "Snake Eater Cynthia Harrell Metal Gear Solid", altA: ["Metal Gear Solid"] },
        { t: "Promise (Reprise)", a: "Silent Hill 2", q: "Akira Yamaoka Promise Reprise Silent Hill 2 Original Soundtrack", altT: ["Promise"], altA: ["Silent Hill"] },
        { t: "Techno Syndrome", a: "Mortal Kombat", q: "Techno Syndrome Mortal Kombat The Immortals" },
        { t: "Green Hill Zone", a: "Sonic the Hedgehog", q: "Masato Nakamura Green Hill Zone Sonic The Hedgehog Soundtrack", altA: ["Sonic"] },
        { t: "Vampire Killer", a: "Castlevania", q: "Vampire Killer Castlevania" },
        { t: "Corridors of Time", a: "Chrono Trigger", q: "Corridors of Time Yasunori Mitsuda Chrono Trigger" },
        { t: "Greenpath", a: "Hollow Knight", q: "Greenpath Christopher Larkin Hollow Knight" },
        { t: "Stardew Valley Overture", a: "Stardew Valley", q: "Stardew Valley Overture ConcernedApe" },
        { t: "Simple and Clean", a: "Kingdom Hearts", q: "Simple and Clean Hikaru Utada" },
        { t: "Proof of a Hero", a: "Monster Hunter", q: "Proof of a Hero Monster Hunter World Original Soundtrack" },
        { t: "Hell March 3", a: "Command & Conquer", q: "Frank Klepacki Hell March 3 Red Alert 3", altT: ["Hell March"], altA: ["Red Alert"] },
        { t: "Nate's Theme", a: "Uncharted", q: "Nate's Theme Greg Edmonson Uncharted Drake's Fortune" },
        { t: "Aloy's Theme", a: "Horizon Zero Dawn", q: "Joris de Man Aloy's Theme Horizon Zero Dawn Original Soundtrack", altA: ["Horizon"] },
        { t: "Angry Birds Theme", a: "Angry Birds", q: "Angry Birds Theme Ari Pulkkinen" }
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
        { t: "Les Mystérieuses Cités d'or", a: "Le Groupe Apollo", q: "Les Mystérieuses Cités d'or générique" },

        { t: "Ulysse 31", a: "Le Groupe Apollo", q: "Ulysse revient Le Groupe Apollo Ulysse 31", altT: ["Ulysse revient", "Ulysse"] },
        { t: "Bomber X", a: "Le Groupe Apollo & Lionel Leroy", q: "Bomber X Le Groupe Apollo Lionel Leroy générique" },
        { t: "Clémentine", a: "Marie Dauphin", q: "Clémentine Marie Dauphin bande originale feuilleton" },
        { t: "Lady Oscar", a: "Marie Dauphin", q: "Lady Oscar Marie Dauphin" },
        { t: "Princesse Sarah", a: "Claude Lombard", q: "Princesse Sarah Claude Lombard" },
        { t: "Embrasse-moi Lucille", a: "Claude Lombard", q: "Embrasse-moi Lucille Claude Lombard", altT: ["Max et Compagnie"] },
        { t: "Les Quatre Filles du docteur March", a: "Claude Lombard", q: "Les quatre filles du docteur March Claude Lombard" },
        { t: "Les Samouraïs de l'éternel", a: "Bernard Minet", q: "Les samouraïs de l'éternel Bernard Minet" },
        { t: "She-Ra", a: "Bernard Minet", q: "She Ra J'ai le pouvoir Bernard Minet Caline", altT: ["J'ai le pouvoir", "She-Ra la princesse du pouvoir"] },
        { t: "Tom Sawyer", a: "Elfie", q: "Tom Sawyer générique original du dessin animé" },
        { t: "Les Minipouss", a: "Les Minipouss", q: "Les Minipouss générique original du dessin animé" },
        { t: "Inspecteur Gadget", a: "Jacques Cardona", q: "Inspecteur Gadget générique original du dessin animé" },
        /* Seule version disponible : le générique remixé. « voulue » empêche le
           moteur de la rétrograder pour le mot « remix ». */
        { t: "Creamy, merveilleuse Creamy", a: "Majokko Club", q: "Creamy merveilleuse Creamy générique", voulue: true, altT: ["Creamy"] },
        { t: "Les Mondes engloutis", a: "Vladimir Cosma", q: "Les mondes engloutis générique Vladimir Cosma" },
        { t: "Jayce et les Conquérants de la lumière", a: "Nick Carr", q: "Jayce et les conquérants de la lumière générique", altT: ["Jayce"] },
        { t: "Les Entrechats", a: "Noam", q: "Les entrechats sont là générique original du dessin animé", altT: ["Les entrechats sont là !"] },
        { t: "Les Schtroumpfs", a: "Dorothée", q: "La danse des Schtroumpfs Dorothée", altT: ["La danse des Schtroumpfs"] }
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
        { t: "Ça va ça vient", a: "Vitaa & Slimane", altA: ["Vitaa", "Slimane"] },

        /* Le rap français récent est très inégalement distribué chez Apple.
           Vald, Sinik, PLK, Lartiste et Wallen n'y sont pas du tout. Plusieurs
           autres y sont, mais sous un autre morceau que celui demandé : on prend
           celui qui existe, l'artiste reste le bon. */
        { t: "Zoo", a: "Kaaris", q: "Kaaris Zoo Or Noir" },
        { t: "Madre Mia", a: "SCH", q: "SCH Madre Mia Morad Autobahn" },
        { t: "Terrasser", a: "Gradur", q: "Gradur Terrasser" },
        { t: "J'pète les plombs", a: "Disiz la Peste", q: "Disiz J'pète les plombs Le poisson rouge", altA: ["Disiz"] },
        { t: "Mon papa à moi est un gangster", a: "Stomy Bugsy", q: "Stomy Bugsy Mon papa à moi est un gangster Le calibre qu'il te faut" },
        { t: "Jour 2 tonnerre", a: "Ärsenik", q: "Ärsenik Jour 2 tonnerre Quelques gouttes suffisent", altA: ["Arsenik"] },
        { t: "365 jours", a: "Oxmo Puccino", q: "Oxmo Puccino 365 jours L'arme de paix" },
        { t: "Samuraï", a: "Shurik'n", q: "Shurik'n Samuraï Où je vis" },
        { t: "C'est chelou", a: "Zaho", q: "Zaho C'est chelou Dima" },
        { t: "Femme de couleur", a: "Shy'm", q: "Shy'm Femme de couleur Mes Fantaisies" },
        { t: "Boozillé", a: "Rim'K", q: "Rim'K Boozillé L'enfant du pays" },
        { t: "Maharaja", a: "Heuss l'Enfoiré", q: "Heuss L'enfoiré Maharaja" },
        { t: "KASSAV", a: "Gazo", q: "Gazo KASSAV Tiakola DRILL FR", altA: ["Tiakola"] },
        { t: "Bazardée", a: "KeBlack", q: "KeBlack Bazardée Premier étage" },
        { t: "Ce soir ne sors pas", a: "Lacrim", q: "Lacrim Ce soir ne sors pas Maître Gims R.I.P.R.O 3" }
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
        { t: "Andalouse", a: "Kendji Girac" },

        // « Sugar » seul ramenait « Maps » : on précise l'album.
        { t: "Sugar", a: "Maroon 5", q: "Maroon 5 Sugar V album" },
        { t: "Just the Way You Are", a: "Bruno Mars" },
        { t: "Diamonds", a: "Rihanna" },
        { t: "Roar", a: "Katy Perry" },
        { t: "Sorry", a: "Justin Bieber" },
        { t: "Closer", a: "The Chainsmokers", altA: ["Halsey"] },
        { t: "Rather Be", a: "Clean Bandit", altA: ["Jess Glynne"] },
        { t: "Let Her Go", a: "Passenger" },
        { t: "Little Talks", a: "Of Monsters and Men" },
        { t: "Royals", a: "Lorde" },
        { t: "Summertime Sadness", a: "Lana Del Rey" },
        { t: "Stressed Out", a: "Twenty One Pilots" },
        // Sans l'album, on tombait sur une reprise de « Madilyn ».
        { t: "Thrift Shop", a: "Macklemore & Ryan Lewis", q: "Macklemore Ryan Lewis Thrift Shop The Heist", altA: ["Macklemore", "Wanz"] },
        { t: "Hymn for the Weekend", a: "Coldplay" },
        { t: "Stay With Me", a: "Sam Smith" },
        { t: "Señorita", a: "Shawn Mendes & Camila Cabello", altA: ["Shawn Mendes", "Camila Cabello"] },
        { t: "Dance Monkey", a: "Tones and I" },
        { t: "Le Lac", a: "Julien Doré" },
        { t: "J'ai cherché", a: "Amir" },
        { t: "Un homme debout", a: "Claudio Capéo" },
        { t: "Makeba", a: "Jain" },
        { t: "Le Chant des sirènes", a: "Fréro Delavega" }
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
        { t: "Vois sur ton chemin", a: "Les Choristes", q: "Vois sur ton chemin Les Choristes Bruno Coulais" },
        { t: "Paroles, paroles", a: "Dalida", altA: ["Alain Delon"] },
        { t: "I Will Survive", a: "Gloria Gaynor" },
        { t: "YMCA", a: "Village People" },
        { t: "Don't Stop Believin'", a: "Journey" },
        { t: "Sweet Caroline", a: "Neil Diamond" },
        { t: "Total Eclipse of the Heart", a: "Bonnie Tyler" },
        { t: "Twist and Shout", a: "The Beatles" },
        { t: "La Bamba", a: "Ritchie Valens" },
        { t: "Petit Papa Noël", a: "Tino Rossi" },

        { t: "Femme libérée", a: "Cookie Dingler" },
        { t: "Santiano", a: "Hugues Aufray" },
        { t: "Les Corons", a: "Pierre Bachelet" },
        { t: "Étienne", a: "Guesch Patti" },
        { t: "La Mer", a: "Charles Trenet" },
        { t: "Lily", a: "Pierre Perret" },
        { t: "La Salsa du démon", a: "Le Grand Orchestre du Splendid" },
        { t: "Macumba", a: "Jean-Pierre Mader" },
        { t: "Il est libre Max", a: "Hervé Cristiani" },
        { t: "Pour un flirt", a: "Michel Delpech" },
        { t: "Les Copains d'abord", a: "Georges Brassens" },
        { t: "Vieille Canaille", a: "Serge Gainsbourg" },
        { t: "Le Chanteur", a: "Daniel Balavoine" },
        { t: "We Are the Champions", a: "Queen" },
        { t: "Take Me Home, Country Roads", a: "John Denver", altT: ["Country Roads"] },
        { t: "Stand by Me", a: "Ben E. King" },
        { t: "My Way", a: "Frank Sinatra" },
        { t: "Summer of '69", a: "Bryan Adams" },
        { t: "Angels", a: "Robbie Williams" },
        { t: "Hallelujah", a: "Jeff Buckley" },
        { t: "Karma Chameleon", a: "Culture Club" }
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
        { t: "Chanson des jumelles", a: "Les Demoiselles de Rochefort", q: "Chanson des jumelles Les Demoiselles de Rochefort" },

        /* « Ziggy » est catalogué chez Apple sous son sous-titre : on affiche
           les deux, et les deux sont acceptés. */
        { t: "Un garçon pas comme les autres", a: "Starmania", q: "Starmania Un garçon pas comme les autres Fabienne Thibeault", altT: ["Ziggy"] },
        { t: "Danse mon Esmeralda", a: "Notre-Dame de Paris", q: "Notre Dame de Paris Danse mon Esmeralda Garou" },
        { t: "Dieu que le monde est injuste", a: "Notre-Dame de Paris", q: "Notre Dame de Paris Dieu que le monde est injuste" },
        { t: "Vivre à en crever", a: "Mozart l'Opéra Rock", q: "Mozart l'Opera Rock Vivre a en crever" },
        { t: "Je dors sur les roses", a: "Mozart l'Opéra Rock", q: "Mozart l'Opera Rock Je dors sur des roses", altT: ["Je dors sur des roses"] },
        { t: "Mon frère", a: "Les Dix Commandements", q: "Les Dix Commandements Mon frere Daniel Levi" },
        { t: "Ça ira mon amour", a: "1789, Les Amants de la Bastille", q: "1789 Les Amants de la Bastille Ca ira mon amour", altA: ["1789"] },
        { t: "Pour la peine", a: "1789, Les Amants de la Bastille", q: "1789 Les Amants de la Bastille Pour la peine", altA: ["1789"] },
        { t: "Être à la hauteur", a: "Le Roi Soleil", q: "Le Roi Soleil Etre a la hauteur Emmanuel Moire" },
        { t: "J'avais rêvé d'une autre vie", a: "Les Misérables", q: "Les Miserables J'avais reve d'une autre vie" },
        { t: "Memory", a: "Cats", q: "Cats Memory Elaine Paige" },
        { t: "The Phantom of the Opera", a: "Le Fantôme de l'Opéra", q: "The Phantom of the Opera Andrew Lloyd Webber", altA: ["The Phantom of the Opera"] },
        { t: "Alexander Hamilton", a: "Hamilton", q: "Hamilton Alexander Hamilton Original Broadway Cast" },
        { t: "Defying Gravity", a: "Wicked", q: "Wicked Defying Gravity Idina Menzel" },
        { t: "This Is Me", a: "The Greatest Showman", q: "The Greatest Showman This Is Me Keala Settle" }
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
        // « Intime » (2014) est un réenregistrement : on épingle 1965.
        { t: "Aline", a: "Christophe", q: "Christophe Aline 2013 Remaster 1965" },
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
        { t: "I Feel Love", a: "Donna Summer" },

        { t: "Sympathy for the Devil", a: "The Rolling Stones" },
        { t: "Good Vibrations", a: "The Beach Boys" },
        { t: "The House of the Rising Sun", a: "The Animals" },
        { t: "Respect", a: "Aretha Franklin" },
        { t: "I Want You Back", a: "The Jackson 5", altA: ["Jackson 5", "Michael Jackson"] },
        { t: "My Girl", a: "The Temptations" },
        { t: "What's Going On", a: "Marvin Gaye" },
        { t: "Imagine", a: "John Lennon" },
        { t: "Killing Me Softly with His Song", a: "Roberta Flack" },
        { t: "Le Freak", a: "CHIC" },
        { t: "Born to Be Alive", a: "Patrick Hernandez" },
        { t: "Ring My Bell", a: "Anita Ward" },
        { t: "Le Métèque", a: "Georges Moustaki" },
        { t: "Mamy Blue", a: "Nicoletta" },
        { t: "Capri c'est fini", a: "Hervé Vilard" },
        { t: "Les Mots bleus", a: "Christophe" },
        { t: "Tous les garçons et les filles", a: "Françoise Hardy" },
        { t: "La Poupée qui fait non", a: "Michel Polnareff" },
        { t: "Nathalie", a: "Gilbert Bécaud" },
        { t: "Belles belles belles", a: "Claude François" },
        { t: "Je suis malade", a: "Serge Lama" },
        { t: "Waterloo", a: "ABBA" },
        { t: "September", a: "Earth, Wind & Fire" },
        { t: "Le Téléfon", a: "Nino Ferrer" }
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
        { t: "Jerusalema", a: "Master KG" },

        { t: "Sofia", a: "Alvaro Soler" },
        { t: "Mambo Italiano", a: "Dean Martin" },
        { t: "Guantanamera", a: "Compay Segundo" },
        { t: "Oye Como Va", a: "Santana" },
        { t: "Smooth", a: "Santana", altA: ["Rob Thomas"] },
        { t: "Lady Marmalade", a: "Labelle" },
        { t: "7 Seconds", a: "Youssou N'Dour", altT: ["Seven Seconds"], altA: ["Neneh Cherry"] },
        { t: "Sweet Lullaby", a: "Deep Forest" },
        { t: "Magic in the Air", a: "Magic System", altA: ["Ahmed Chawki"] },
        { t: "Zombie", a: "Fela Kuti" },
        { t: "Mas Que Nada", a: "Sergio Mendes" },
        { t: "The Girl from Ipanema", a: "Stan Getz & João Gilberto", altA: ["Astrud Gilberto"] },
        { t: "Bella Ciao", a: "Manu Pilas", altA: ["La Casa de Papel"] },
        /* Sans précision, Apple servait la version « Ao Vivo », enregistrée en
           concert. On demande la version studio. */
        { t: "Balada", a: "Gusttavo Lima", altT: ["Balada Tchê Tcherere Tchê Tchê"], q: "Gusttavo Lima Balada Tche Tcherere Tche Tche" },
        // Apple France n'a « Tusa » que sur des compilations : la pochette
        // montree ne dirait rien de Karol G. On prend un titre a elle.
        { t: "Dákiti", a: "Bad Bunny & Jhay Cortez", q: "Bad Bunny Jhay Cortez Dakiti", altA: ["Bad Bunny", "Jhay Cortez"] },
        { t: "El Perdón", a: "Nicky Jam & Enrique Iglesias", altA: ["Nicky Jam", "Enrique Iglesias"] },
        { t: "Baila Morena", a: "Zucchero" },
        { t: "Obsesión", a: "Aventura" },
        { t: "La Isla Bonita", a: "Madonna" },
        { t: "La Bomba", a: "King Africa", altT: ["Bomba"] }
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
      strict: !!m.strict,
      // D'où vient le morceau. Sert au Grand mélange, où l'en-tête ne peut pas
      // le dire : sans ça on ne sait pas si on cherche un jeu ou un Disney.
      categorie: m.emoji + ' ' + m.nom
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

      /* Catégorie à réponse unique : la réponse est l'œuvre, pas le morceau.
         Trois chansons du Roi Lion donneraient donc trois fois la même réponse
         dans la même partie. On mélange d'abord, puis on ne garde qu'un morceau
         par œuvre — celui qui sort en tête. Le tirage change à chaque partie,
         donc ce n'est pas toujours « Hakuna Matata » qui représente le film. */
      if (m.solo) {
        var melange = melangerAvecGraine(source, graine);
        var vues = {};
        source = [];
        melange.forEach(function (p) {
          var oeuvre = cleOeuvre(p, m);
          if (oeuvre) {
            if (vues[oeuvre]) return;
            vues[oeuvre] = 1;
          }
          source.push(p);
        });
        return source.slice(0, nombre);
      }
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
