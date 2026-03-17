import SwiftUI

enum Season: Int, CaseIterable {
    case spring = 0, summer, autumn, winter

    var name: String {
        switch self {
        case .spring: return "Printemps"
        case .summer: return "Été"
        case .autumn: return "Automne"
        case .winter: return "Hiver"
        }
    }

    var icon: String {
        switch self {
        case .spring: return "🌸"
        case .summer: return "☀️"
        case .autumn: return "🍂"
        case .winter: return "❄️"
        }
    }

    var skyColors: [Color] {
        switch self {
        case .spring: return [Color(red: 0.53, green: 0.81, blue: 0.98), Color(red: 0.85, green: 0.95, blue: 1.0)]
        case .summer: return [Color(red: 0.2,  green: 0.6,  blue: 1.0),  Color(red: 1.0,  green: 0.85, blue: 0.5)]
        case .autumn: return [Color(red: 0.7,  green: 0.5,  blue: 0.3),  Color(red: 0.95, green: 0.75, blue: 0.5)]
        case .winter: return [Color(red: 0.6,  green: 0.7,  blue: 0.85), Color(red: 0.9,  green: 0.95, blue: 1.0)]
        }
    }

    var groundColor: Color {
        switch self {
        case .spring: return Color(red: 0.4, green: 0.7, blue: 0.3)
        case .summer: return Color(red: 0.3, green: 0.65, blue: 0.2)
        case .autumn: return Color(red: 0.6, green: 0.5, blue: 0.25)
        case .winter: return Color(red: 0.85, green: 0.9, blue: 0.95)
        }
    }

    // Bonus/malus saisonniers sur la nourriture
    var foodDelta: Int {
        switch self {
        case .spring: return 5
        case .summer: return 15
        case .autumn: return 8
        case .winter: return -20
        }
    }

    // Consommation de nourriture par la population
    func foodConsumption(population: Int) -> Int {
        let base = population / 10
        return self == .winter ? base * 2 : base
    }

    var next: Season {
        Season(rawValue: (rawValue + 1) % 4) ?? .spring
    }
}
