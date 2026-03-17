import Foundation

struct AllEvents {
    static let all: [GameEvent] = seasonal + crises + opportunities

    // MARK: - Événements saisonniers

    static let seasonal: [GameEvent] = [

        // PRINTEMPS
        GameEvent(
            id: "spring_merchant",
            title: "Les Marchands du Printemps",
            narrative: "Des marchands itinérants s'arrêtent à Valdoryn à la fonte des neiges. Leurs chariots regorgent de denrées et d'outils. Ils demandent l'autorisation de tenir un marché dans votre village.",
            seasons: [.spring],
            trigger: .random(weight: 3),
            choices: [
                EventChoice(text: "Autoriser le marché librement",
                            consequence: "Le marché anime le village. Les paysans échangent et rient. Votre popularité monte.",
                            delta: ResourceDelta(gold: 15, population: 5, food: 10, prestige: 5)),
                EventChoice(text: "Taxer lourdement les marchands",
                            consequence: "Vos coffres se remplissent mais les marchands partent mécontents. Le village murmure.",
                            delta: ResourceDelta(gold: 35, prestige: -5)),
                EventChoice(text: "Refuser — les étrangers ne sont pas les bienvenus",
                            consequence: "Les marchands repartent. Votre village reste isolé. L'hiver a laissé des traces.",
                            delta: ResourceDelta(gold: -5, food: -5))
            ]
        ),

        GameEvent(
            id: "spring_sowing",
            title: "Les Semailles",
            narrative: "Le printemps est là. Vos paysans vous demandent s'il faut consacrer plus de terres aux semailles cette année, ou maintenir les pâturages pour l'élevage.",
            seasons: [.spring],
            trigger: .random(weight: 3),
            choices: [
                EventChoice(text: "Étendre les cultures — priorité aux céréales",
                            consequence: "Les champs s'étendent jusqu'à l'horizon. L'été promet d'être généreux.",
                            delta: ResourceDelta(gold: -10, food: 25, prestige: 3)),
                EventChoice(text: "Maintenir l'équilibre cultures/élevage",
                            consequence: "Une gestion prudente. Ni excès ni manque. Le village est stable.",
                            delta: ResourceDelta(food: 10, population: 3)),
                EventChoice(text: "Priorité à l'élevage — la viande vaut cher",
                            consequence: "Vos marchands vendent bien la viande. Mais les greniers sont moins fournis.",
                            delta: ResourceDelta(gold: 20, food: -5))
            ]
        ),

        // ÉTÉ
        GameEvent(
            id: "summer_tournament",
            title: "Tournoi d'Été",
            narrative: "Un noble voisin propose d'organiser un tournoi de joutes à Valdoryn. Cela attirerait des chevaliers et des spectateurs de tout le pays.",
            seasons: [.summer],
            trigger: .random(weight: 2),
            choices: [
                EventChoice(text: "Financer le tournoi généreusement",
                            consequence: "Le tournoi est somptueux. Votre nom résonne dans tout le pays. Les chevaliers vantent votre hospitalité.",
                            delta: ResourceDelta(gold: -40, population: 10, prestige: 20)),
                EventChoice(text: "Organiser un tournoi modeste",
                            consequence: "Le tournoi attire quelques participants. L'ambiance est festive sans être mémorable.",
                            delta: ResourceDelta(gold: -15, prestige: 8)),
                EventChoice(text: "Refuser — c'est une dépense inutile",
                            consequence: "Le noble voisin organise le tournoi chez lui. Votre absence est remarquée et commentée.",
                            delta: ResourceDelta(prestige: -8))
            ]
        ),

        GameEvent(
            id: "summer_harvest",
            title: "La Grande Récolte",
            narrative: "L'été est exceptionnel cette année. Vos paysans ont travaillé dur et les greniers débordent. Comment gérez-vous cet excédent ?",
            seasons: [.summer],
            trigger: .random(weight: 3),
            choices: [
                EventChoice(text: "Vendre l'excédent aux royaumes voisins",
                            consequence: "Les convois partent chargés. L'or coule dans vos caisses.",
                            delta: ResourceDelta(gold: 45, food: -15, prestige: 5)),
                EventChoice(text: "Conserver pour l'hiver",
                            consequence: "Vos greniers sont pleins. L'hiver ne vous fait pas peur. Le peuple se sent en sécurité.",
                            delta: ResourceDelta(food: 30, population: 5, prestige: 3)),
                EventChoice(text: "Organiser un festin pour tout le village",
                            consequence: "Trois jours de fête. Le peuple vous acclame. Une joie simple mais profonde.",
                            delta: ResourceDelta(food: -10, population: 15, prestige: 10))
            ]
        ),

        // AUTOMNE
        GameEvent(
            id: "autumn_refugees",
            title: "Les Réfugiés",
            narrative: "Une colonne de réfugiés fuit un conflit dans un royaume voisin. Ils sont plusieurs centaines, épuisés et affamés, aux portes de Valdoryn.",
            seasons: [.autumn],
            trigger: .random(weight: 2),
            choices: [
                EventChoice(text: "Ouvrir les portes — accueillir tout le monde",
                            consequence: "Valdoryn accueille les réfugiés. Votre générosité est connue de tous. Mais les ressources s'amenuisent.",
                            delta: ResourceDelta(gold: -20, population: 40, food: -25, prestige: 15)),
                EventChoice(text: "Accueillir les artisans et soldats seulement",
                            consequence: "Vous sélectionnez ceux qui peuvent contribuer au royaume. Un choix difficile mais pragmatique.",
                            delta: ResourceDelta(gold: -10, population: 20, defense: 10, prestige: 3)),
                EventChoice(text: "Fermer les portes",
                            consequence: "Les gardes repoussent les réfugiés. Le village n'est pas à l'abri des regards. Le bruit court que Valdoryn est un royaume sans pitié.",
                            delta: ResourceDelta(prestige: -12))
            ]
        ),

        GameEvent(
            id: "autumn_taxes",
            title: "La Levée des Impôts",
            narrative: "L'automne est le temps de la collecte. Vos intendants vous présentent les options de taxation pour financer les caisses du royaume avant l'hiver.",
            seasons: [.autumn],
            trigger: .random(weight: 3),
            choices: [
                EventChoice(text: "Taxe lourde — l'hiver sera rude",
                            consequence: "Les coffres se remplissent. Mais les visages sont sombres dans le village. La grogne monte.",
                            delta: ResourceDelta(gold: 50, population: -5, prestige: -8)),
                EventChoice(text: "Taxe équitable",
                            consequence: "Chacun paye selon ses moyens. Le village s'y résigne. Les caisses sont correctement alimentées.",
                            delta: ResourceDelta(gold: 25, prestige: 2)),
                EventChoice(text: "Taxe légère — le peuple a besoin de souffler",
                            consequence: "Votre clémence est saluée. Les habitants vous sourient dans les rues. Mais vos caisses restent modestes.",
                            delta: ResourceDelta(gold: 10, population: 5, prestige: 10))
            ]
        ),

        // HIVER
        GameEvent(
            id: "winter_cold",
            title: "L'Hiver Rigoureux",
            narrative: "Un froid exceptionnel s'abat sur Valdoryn. Les rivières gèlent, les routes sont impraticables. Vos réserves de bois s'épuisent. Le village frissonne.",
            seasons: [.winter],
            trigger: .random(weight: 3),
            choices: [
                EventChoice(text: "Envoyer des bûcherons en forêt d'urgence",
                            consequence: "Vos hommes bravaient le froid. Le bois arrive juste à temps. Quelques-uns tombent malades.",
                            delta: ResourceDelta(gold: -15, population: -3, food: -10)),
                EventChoice(text: "Rationner — chaque famille reçoit le minimum",
                            consequence: "Le rationnement est strict. Certains souffrent, mais le village survit.",
                            delta: ResourceDelta(food: -20, population: -5, prestige: -3)),
                EventChoice(text: "Ouvrir le château aux familles les plus pauvres",
                            consequence: "Vos salles accueillent les plus vulnérables. Un geste qui ne sera pas oublié.",
                            delta: ResourceDelta(food: -15, prestige: 15, population: 3))
            ]
        ),

        GameEvent(
            id: "winter_spy",
            title: "L'Espion",
            narrative: "Vos gardes ont capturé un homme qui rôdait près des douves. Sous l'interrogatoire, il avoue être un espion d'un seigneur ennemi venu étudier vos défenses.",
            seasons: [.winter],
            trigger: .random(weight: 2),
            choices: [
                EventChoice(text: "L'exécuter publiquement",
                            consequence: "L'exécution est un message clair. Vos ennemis hésiteront. Mais certains trouvent la décision sévère.",
                            delta: ResourceDelta(defense: 10, prestige: -5)),
                EventChoice(text: "Le retourner — en faire un double agent",
                            consequence: "L'espion, menacé, accepte de travailler pour vous. Une mine d'informations précieuses.",
                            delta: ResourceDelta(gold: 20, defense: 15, prestige: 5)),
                EventChoice(text: "Le relâcher avec un message pour son maître",
                            consequence: "Votre message d'avertissement est direct. La situation se calme temporairement.",
                            delta: ResourceDelta(defense: 5, prestige: 8))
            ]
        ),
    ]

    // MARK: - Crises (déclenchées par ressources)

    static let crises: [GameEvent] = [

        GameEvent(
            id: "crisis_famine",
            title: "La Famine Menace",
            narrative: "Les greniers sont presque vides. Les enfants ont faim. Des familles ont commencé à partir. Si rien n'est fait, la famine emportera Valdoryn.",
            seasons: [],
            trigger: .condition { $0.food < 15 && $0.population > 20 },
            choices: [
                EventChoice(text: "Acheter des vivres à prix d'or",
                            consequence: "Les convois de nourriture arrivent. Le village respire. Vos coffres s'allègent considérablement.",
                            delta: ResourceDelta(gold: -50, food: 40)),
                EventChoice(text: "Organiser des chasses collectives en forêt",
                            consequence: "Le gibier est maigre mais suffisant pour passer les jours critiques. Le peuple se serre les coudes.",
                            delta: ResourceDelta(food: 20, population: -3, prestige: 5)),
                EventChoice(text: "Prier et espérer",
                            consequence: "L'inaction est un choix. La famine empire. Des familles partent dans la nuit.",
                            delta: ResourceDelta(food: -10, population: -20, prestige: -15))
            ]
        ),

        GameEvent(
            id: "crisis_broke",
            title: "Les Caisses sont Vides",
            narrative: "Vos intendants vous annoncent une nouvelle terrible : il ne reste plus un denier dans les coffres. Les gardes réclament leur solde. Les artisans attendent leur dû.",
            seasons: [],
            trigger: .condition { $0.gold < 10 },
            choices: [
                EventChoice(text: "Vendre des terres du domaine",
                            consequence: "Un sacrifice douloureux. Votre domaine rétrécit mais les caisses se renflouent.",
                            delta: ResourceDelta(gold: 40, prestige: -10)),
                EventChoice(text: "Emprunter auprès des marchands",
                            consequence: "Les marchands acceptent, à des conditions sévères. Vous avez du temps, mais une dette à honorer.",
                            delta: ResourceDelta(gold: 30, prestige: -5)),
                EventChoice(text: "Lever une taxe d'urgence",
                            consequence: "Le peuple grogne mais paye. La tension est palpable dans le village.",
                            delta: ResourceDelta(gold: 25, population: -5, prestige: -12))
            ]
        ),

        GameEvent(
            id: "crisis_plague",
            title: "La Peste",
            narrative: "Une épidémie se propage dans le village. Les malades se comptent par dizaines. Votre médecin vous implore d'agir avant que la maladie ne devienne incontrôlable.",
            seasons: [],
            trigger: .condition { $0.population > 150 && $0.food < 30 },
            choices: [
                EventChoice(text: "Quarantaine stricte — isoler les malades",
                            consequence: "La quarantaine est douloureuse mais efficace. L'épidémie est contenue.",
                            delta: ResourceDelta(gold: -20, population: -15, prestige: 5)),
                EventChoice(text: "Payer des médecins itinérants",
                            consequence: "Les médecins soignent les malades. Coûteux mais humain.",
                            delta: ResourceDelta(gold: -40, population: -8, prestige: 10)),
                EventChoice(text: "Laisser faire — la nature sélectionne",
                            consequence: "L'épidémie fait rage. Le bilan est lourd. Le village ne vous pardonnera pas facilement.",
                            delta: ResourceDelta(population: -40, prestige: -20))
            ]
        ),

        GameEvent(
            id: "crisis_revolt",
            title: "Le Début d'une Révolte",
            narrative: "Des agitateurs parcourent le village, promettant un seigneur plus juste. Une foule commence à se former devant le château. Vos gardes sont nerveux.",
            seasons: [],
            trigger: .condition { $0.prestige < 15 && $0.population > 50 },
            choices: [
                EventChoice(text: "Sortir et parler au peuple",
                            consequence: "Vos mots touchent la foule. La tension retombe. Vous promettez de mieux gouverner.",
                            delta: ResourceDelta(prestige: 15, population: 5)),
                EventChoice(text: "Disperser la foule par la force",
                            consequence: "Les gardes chargent. La révolte est écrasée mais la haine grandit.",
                            delta: ResourceDelta(defense: 5, population: -10, prestige: -10)),
                EventChoice(text: "Distribuer de l'or et de la nourriture",
                            consequence: "L'argent calme les esprits. Une solution rapide mais coûteuse.",
                            delta: ResourceDelta(gold: -35, food: -15, prestige: 8, population: 5))
            ]
        ),
    ]

    // MARK: - Opportunités rares

    static let opportunities: [GameEvent] = [

        GameEvent(
            id: "opp_alliance",
            title: "Une Alliance Proposée",
            narrative: "Un seigneur puissant des terres du Nord vous envoie un émissaire. Il propose une alliance militaire et commerciale. En échange, il demande une partie de vos récoltes annuelles.",
            seasons: [],
            trigger: .random(weight: 1),
            choices: [
                EventChoice(text: "Accepter l'alliance complète",
                            consequence: "L'alliance est scellée. Un traité gravé dans le marbre. Valdoryn n'est plus seul.",
                            delta: ResourceDelta(gold: 20, food: -15, prestige: 20, defense: 25)),
                EventChoice(text: "Négocier des conditions moins contraignantes",
                            consequence: "Après des jours de négociations, un accord partiel est trouvé. Moins d'avantages mais plus de liberté.",
                            delta: ResourceDelta(prestige: 10, defense: 12)),
                EventChoice(text: "Refuser — Valdoryn reste indépendant",
                            consequence: "Votre indépendance est préservée. Mais vous avez peut-être refusé un allié précieux.",
                            delta: ResourceDelta(prestige: 5))
            ]
        ),

        GameEvent(
            id: "opp_cathedral",
            title: "Le Projet de la Cathédrale",
            narrative: "Un architecte réputé propose de construire une cathédrale à Valdoryn. Ce serait un projet de plusieurs années, coûteux, mais qui marquerait votre règne dans l'histoire.",
            seasons: [],
            trigger: .random(weight: 1),
            choices: [
                EventChoice(text: "Financer immédiatement — poser la première pierre",
                            consequence: "Les travaux commencent. Les pierres s'élèvent. Votre nom sera gravé dans l'histoire de Valdoryn.",
                            delta: ResourceDelta(gold: -60, prestige: 15)),
                EventChoice(text: "Promettre de financer plus tard",
                            consequence: "L'architecte attend. Le projet est suspendu. La promesse reste à honorer.",
                            delta: ResourceDelta(prestige: 3)),
                EventChoice(text: "Refuser — ce n'est pas le moment",
                            consequence: "L'architecte part proposer son projet ailleurs. Une occasion manquée.",
                            delta: ResourceDelta())
            ]
        ),

        GameEvent(
            id: "opp_treasure",
            title: "Le Trésor Enfoui",
            narrative: "En creusant pour agrandir les douves, vos ouvriers découvrent un vieux coffre portant les armoiries d'un roi oublié. Il contient de l'or, des bijoux et un parchemin mystérieux.",
            seasons: [],
            trigger: .random(weight: 1),
            choices: [
                EventChoice(text: "Garder le trésor pour le royaume",
                            consequence: "Le trésor enrichit Valdoryn. Le parchemin révèle des informations sur d'anciens passages secrets.",
                            delta: ResourceDelta(gold: 60, defense: 10, prestige: 8)),
                EventChoice(text: "Donner une partie au peuple",
                            consequence: "Votre générosité est acclamée. L'or se répartit dans les foyers du village.",
                            delta: ResourceDelta(gold: 30, population: 10, prestige: 18)),
                EventChoice(text: "Faire étudier le parchemin par des érudits",
                            consequence: "Les érudits déchiffrent des formules agricoles anciennes. Vos récoltes s'en trouvent améliorées.",
                            delta: ResourceDelta(gold: 20, food: 20, prestige: 5))
            ]
        ),

        GameEvent(
            id: "opp_knight",
            title: "Le Chevalier Errant",
            narrative: "Un chevalier en armure noircie se présente seul à votre porte. Vétéran de dix guerres, il cherche un seigneur digne de le servir. Ses conditions : ni or ni terres, juste du respect.",
            seasons: [],
            trigger: .random(weight: 1),
            choices: [
                EventChoice(text: "L'accueillir et lui confier la garde du château",
                            consequence: "Le chevalier prend ses fonctions avec sérieux. Vos défenses ne sont plus les mêmes.",
                            delta: ResourceDelta(defense: 30, prestige: 10)),
                EventChoice(text: "L'engager pour former vos gardes",
                            consequence: "Sous sa direction, vos gardes deviennent de vrais soldats. Valdoryn est mieux protégé.",
                            delta: ResourceDelta(defense: 20, prestige: 5, population: 5)),
                EventChoice(text: "Refuser — les étrangers ne sont pas de confiance",
                            consequence: "Le chevalier repart sans un mot. Une occasion de renforcer vos défenses s'évanouit.",
                            delta: ResourceDelta(prestige: -3))
            ]
        ),
    ]
}
