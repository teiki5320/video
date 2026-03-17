import SwiftUI

struct RootView: View {
    @StateObject private var game = GameState()

    var body: some View {
        ZStack {
            switch game.phase {
            case .menu:
                MenuView()
                    .environmentObject(game)
                    .transition(.opacity)

            case .originPicker:
                OriginPickerView()
                    .environmentObject(game)
                    .transition(.opacity)

            case .narrative(let text):
                NarrativeView(text: text)
                    .environmentObject(game)
                    .transition(.opacity)

            case .playing:
                KingdomView()
                    .environmentObject(game)
                    .transition(.opacity)

            case .event(let event):
                EventView(event: event)
                    .environmentObject(game)
                    .transition(.move(edge: .bottom).combined(with: .opacity))

            case .gameOver(let reason):
                GameOverView(reason: reason)
                    .environmentObject(game)
                    .transition(.opacity)

            case .victory(let reason):
                VictoryView(reason: reason)
                    .environmentObject(game)
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: game.phase.id)
    }
}

extension GamePhase {
    var id: String {
        switch self {
        case .menu:            return "menu"
        case .originPicker:    return "origin"
        case .narrative:       return "narrative"
        case .playing:         return "playing"
        case .event(let e):    return "event-\(e.id)"
        case .gameOver:        return "gameover"
        case .victory:         return "victory"
        }
    }
}

extension GamePhase: Equatable {
    static func == (lhs: GamePhase, rhs: GamePhase) -> Bool { lhs.id == rhs.id }
}
