import Foundation

struct Resources {
    var gold: Int
    var population: Int
    var food: Int
    var prestige: Int
    var defense: Int

    static let initial = Resources(gold: 50, population: 120, food: 80, prestige: 20, defense: 30)

    mutating func apply(_ delta: ResourceDelta) {
        gold      = max(0, gold      + delta.gold)
        population = max(0, population + delta.population)
        food      = max(0, food      + delta.food)
        prestige  = max(0, prestige  + delta.prestige)
        defense   = max(0, defense   + delta.defense)
    }

    // Niveau 0-3 pour chaque ressource (pour le visuel du royaume)
    var goldLevel:       Int { level(gold,       steps: [20, 60, 120]) }
    var populationLevel: Int { level(population, steps: [30, 80, 180]) }
    var foodLevel:       Int { level(food,        steps: [20, 60, 120]) }
    var prestigeLevel:   Int { level(prestige,    steps: [25, 60, 100]) }
    var defenseLevel:    Int { level(defense,     steps: [15, 40, 80])  }

    private func level(_ value: Int, steps: [Int]) -> Int {
        for (i, step) in steps.enumerated().reversed() {
            if value >= step { return i + 1 }
        }
        return 0
    }
}

struct ResourceDelta {
    var gold: Int      = 0
    var population: Int = 0
    var food: Int      = 0
    var prestige: Int  = 0
    var defense: Int   = 0

    static func +(lhs: ResourceDelta, rhs: ResourceDelta) -> ResourceDelta {
        ResourceDelta(gold: lhs.gold + rhs.gold,
                      population: lhs.population + rhs.population,
                      food: lhs.food + rhs.food,
                      prestige: lhs.prestige + rhs.prestige,
                      defense: lhs.defense + rhs.defense)
    }
}
