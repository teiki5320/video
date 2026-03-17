import SwiftUI
import Combine

enum GamePhase {
    case menu, originPicker, narrative(String), playing, event(GameEvent), gameOver(GameOverReason), victory(VictoryReason)
}

enum GameOverReason {
    case abandoned    // Population à 0
    case rebellion    // Or à 0 + famine
    case invaded      // Prestige à 0

    var title: String {
        switch self {
        case .abandoned:  return "Royaume Abandonné"
        case .rebellion:  return "Rébellion !"
        case .invaded:    return "Invasion !"
        }
    }

    var narrative: String {
        switch self {
        case .abandoned:
            return "Le dernier habitant a quitté Valdoryn. Les rues du village sont désertes, les champs en friche. Votre château s'effondre dans le silence. Valdoryn n'est plus qu'un souvenir."
        case .rebellion:
            return "La famine et la misère ont eu raison de la patience de votre peuple. Dans la nuit, les paysans se soulèvent. Vos gardes, non payés, ouvrent les portes. On vous retrouve au matin, déchu."
        case .invaded:
            return "Vos ennemis attendaient ce moment. Votre réputation en ruines, aucun allié ne répond à votre appel. Les armées ennemies franchissent les douves au lever du jour. Valdoryn tombe."
        }
    }
}

enum VictoryReason {
    case grandSeigneur   // 100 prestige
    case legende         // 20 ans
    case cathedrale      // Cathédrale construite

    var title: String {
        switch self {
        case .grandSeigneur: return "Grand Seigneur de Valdoryn"
        case .legende:       return "La Légende de Valdoryn"
        case .cathedrale:    return "La Cathédrale de Valdoryn"
        }
    }

    var narrative: String {
        switch self {
        case .grandSeigneur:
            return "Votre prestige atteint des sommets inégalés. Le Roi en personne envoie ses émissaires. Vous êtes officiellement proclamé Grand Seigneur de Valdoryn — une noblesse que nul ne peut vous contester."
        case .legende:
            return "Vingt ans ont passé. Des royaumes entiers ont sombré pendant que Valdoryn prospérait sous votre gouvernance. Les bardes chantent votre nom. Vous êtes entré dans la légende."
        case .cathedrale:
            return "La cathédrale de Valdoryn s'élève au-dessus des collines. Des pèlerins viennent de tout le continent. Votre nom sera gravé dans la pierre pour l'éternité."
        }
    }
}

@MainActor
class GameState: ObservableObject {
    @Published var phase: GamePhase = .menu
    @Published var resources: Resources = .initial
    @Published var season: Season = .spring
    @Published var year: Int = 1
    @Published var origin: Origin = .filsDuRoi
    @Published var cathedralProgress: Int = 0   // 0-100
    @Published var seasonCount: Int = 0          // total saisons jouées

    private var usedEventIds: Set<String> = []
    private var pendingEvents: [GameEvent] = []

    // MARK: - Démarrage

    func startGame(with origin: Origin) {
        self.origin = origin
        self.resources = origin.startingResources
        self.season = .spring
        self.year = 1
        self.seasonCount = 0
        self.usedEventIds = []
        self.cathedralProgress = 0
        phase = .narrative(origin.startingNarrative)
    }

    func beginPlaying() {
        phase = .playing
        drawNextEvent()
    }

    // MARK: - Progression de saison

    func advanceSeason() {
        // Effets saisonniers
        let consumption = season.foodConsumption(population: resources.population)
        resources.food = max(0, resources.food + season.foodDelta - consumption)

        // Famine : perte de population
        if resources.food == 0 {
            resources.population = max(0, resources.population - Int.random(in: 5...15))
        }

        // Vérifier conditions de victoire
        if let victory = checkVictory() {
            phase = .victory(victory)
            return
        }

        // Vérifier conditions de défaite
        if let reason = checkDefeat() {
            phase = .gameOver(reason)
            return
        }

        // Passer à la saison suivante
        season = season.next
        if season == .spring { year += 1 }
        seasonCount += 1

        drawNextEvent()
    }

    // MARK: - Événements

    func drawNextEvent() {
        let available = AllEvents.all.filter { event in
            // Saison compatible
            guard event.seasons.isEmpty || event.seasons.contains(season) else { return false }
            // Trigger
            switch event.trigger {
            case .random:
                return !usedEventIds.contains(event.id)
            case .condition(let check):
                return check(resources)
            }
        }

        // Priorité aux événements conditionnels
        let conditional = available.filter {
            if case .condition = $0.trigger { return true }
            return false
        }

        if let event = conditional.first {
            phase = .event(event)
            return
        }

        // Événement aléatoire pondéré
        let weighted = available.flatMap { event -> [GameEvent] in
            if case .random(let w) = event.trigger { return Array(repeating: event, count: w) }
            return []
        }

        if let event = weighted.randomElement() {
            usedEventIds.insert(event.id)
            phase = .event(event)
        } else {
            // Plus d'événements : reset partiel
            usedEventIds.removeAll()
            phase = .playing
        }
    }

    func applyChoice(_ choice: EventChoice) {
        resources.apply(choice.delta)

        // Cathédrale
        if choice.delta.gold < -40 && cathedralProgress < 100 {
            cathedralProgress = min(100, cathedralProgress + 25)
        }

        phase = .narrative(choice.consequence)
    }

    // MARK: - Victoire / Défaite

    private func checkVictory() -> VictoryReason? {
        if cathedralProgress >= 100 { return .cathedrale }
        if resources.prestige >= 100 { return .grandSeigneur }
        if year >= 21 { return .legende }
        return nil
    }

    private func checkDefeat() -> GameOverReason? {
        if resources.population <= 0 { return .abandoned }
        if resources.prestige <= 0   { return .invaded }
        if resources.gold <= 0 && resources.food <= 0 { return .rebellion }
        return nil
    }

    func restartToMenu() {
        phase = .menu
    }
}
