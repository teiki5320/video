import SwiftUI

struct RootView: View {
    @StateObject private var router = AppRouter()

    var body: some View {
        ZStack {
            switch router.screen {
            case .menu:
                MenuView()
                    .environmentObject(router)
                    .transition(.opacity)
            case .game:
                GameView()
                    .environmentObject(router)
                    .transition(.opacity)
            case .gameOver(let score, let best):
                GameOverView(score: score, bestScore: best)
                    .environmentObject(router)
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.4), value: router.screen)
    }
}

// MARK: - Router

enum AppScreen: Equatable {
    case menu
    case game
    case gameOver(score: Int, best: Int)
}

@MainActor
class AppRouter: ObservableObject {
    @Published var screen: AppScreen = .menu
    @AppStorage("bestScore") var bestScore: Int = 0

    func startGame() { screen = .game }

    func endGame(score: Int) {
        if score > bestScore { bestScore = score }
        screen = .gameOver(score: score, best: bestScore)
    }

    func backToMenu() { screen = .menu }
}
