import Foundation

enum Origin: CaseIterable, Identifiable {
    case filsDuRoi, soldatSeigneur, marchand

    var id: Self { self }

    var title: String {
        switch self {
        case .filsDuRoi:      return "Le Fils du Roi déchu"
        case .soldatSeigneur: return "Le Soldat devenu Seigneur"
        case .marchand:       return "Le Marchand enrichi"
        }
    }

    var subtitle: String {
        switch self {
        case .filsDuRoi:      return "Votre père a été trahi. Vous revenez réclamer le trône."
        case .soldatSeigneur: return "Vous avez gagné ces terres à la guerre."
        case .marchand:       return "Vous avez acheté ces terres. L'or ouvre toutes les portes."
        }
    }

    var bonus: String {
        switch self {
        case .filsDuRoi:      return "+30 Prestige"
        case .soldatSeigneur: return "+30 Défense"
        case .marchand:       return "+50 Or"
        }
    }

    var malus: String {
        switch self {
        case .filsDuRoi:      return "Des ennemis vous surveillent dès le départ"
        case .soldatSeigneur: return "Prestige faible, légitimité fragile"
        case .marchand:       return "Le peuple vous méprise, Prestige faible"
        }
    }

    var startingResources: Resources {
        switch self {
        case .filsDuRoi:
            return Resources(gold: 50, population: 120, food: 80, prestige: 50, defense: 30)
        case .soldatSeigneur:
            return Resources(gold: 50, population: 100, food: 70, prestige: 10, defense: 60)
        case .marchand:
            return Resources(gold: 100, population: 110, food: 80, prestige: 10, defense: 20)
        }
    }

    var startingNarrative: String {
        switch self {
        case .filsDuRoi:
            return "Vous posez le pied sur les terres de Valdoryn après dix ans d'exil. Le château de votre père tombe en ruines, mais votre nom inspire encore respect et crainte. Les anciens vassaux vous reconnaissent. Le temps de la reconquête est venu."
        case .soldatSeigneur:
            return "Après vingt batailles et autant de cicatrices, le Roi vous a remis les terres de Valdoryn en récompense. Les paysans vous regardent avec méfiance — vous êtes un guerrier, pas un noble. Il faudra mériter leur confiance."
        case .marchand:
            return "Vos coffres débordaient d'or, alors vous avez acheté le titre de Seigneur de Valdoryn. L'aristocratie ricane dans votre dos. Mais l'argent est une puissance en soi, et vous saurez en faire bon usage."
        }
    }
}
