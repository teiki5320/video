import Foundation

struct GameEvent: Identifiable {
    let id: String
    let title: String
    let narrative: String
    let seasons: Set<Season>         // nil = toutes saisons
    let trigger: EventTrigger
    let choices: [EventChoice]
}

struct EventChoice {
    let text: String
    let consequence: String          // Texte narratif après le choix
    let delta: ResourceDelta
}

enum EventTrigger {
    case random(weight: Int)         // Événement aléatoire avec un poids
    case condition((Resources) -> Bool) // Déclenché par état des ressources
}
