import Foundation

struct GameEvent: Identifiable {
    let id: String
    let title: String
    let narrative: String
    let seasons: Set<Season>
    let trigger: EventTrigger
    let choices: [EventChoice]
}

struct EventChoice {
    let text: String
    let consequence: String
    let delta: ResourceDelta
}

// Pas de closure — Swift Playgrounds est strict sur les function types dans les enums
enum EventTrigger {
    case random(weight: Int)
    case lowFood       // food < 15
    case lowGold       // gold < 10
    case lowPrestige   // prestige < 15
    case plague        // population > 150 && food < 30
}

extension EventTrigger {
    func isTriggered(by resources: Resources) -> Bool {
        switch self {
        case .random:       return true
        case .lowFood:      return resources.food < 15 && resources.population > 20
        case .lowGold:      return resources.gold < 10
        case .lowPrestige:  return resources.prestige < 15 && resources.population > 50
        case .plague:       return resources.population > 150 && resources.food < 30
        }
    }

    var isCrisis: Bool {
        switch self {
        case .random: return false
        default:      return true
        }
    }
}
