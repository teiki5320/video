import SwiftUI

struct GameOverView: View {
    let score: Int
    let bestScore: Int
    @EnvironmentObject private var router: AppRouter
    @State private var appear = false
    @State private var newRecord: Bool

    init(score: Int, bestScore: Int) {
        self.score = score
        self.bestScore = bestScore
        _newRecord = State(initialValue: score >= bestScore && score > 0)
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Particles
            ParticlesView(active: newRecord)

            VStack(spacing: 32) {
                Spacer()

                // Icon
                Text(newRecord ? "🏆" : "💀")
                    .font(.system(size: 90))
                    .scaleEffect(appear ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1), value: appear)

                // Title
                VStack(spacing: 8) {
                    Text(newRecord ? "NOUVEAU RECORD !" : "GAME OVER")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundStyle(newRecord ? .yellow : .red)

                    Text("Bien joué, continue comme ça !")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.6))
                }
                .opacity(appear ? 1 : 0)
                .animation(.easeOut.delay(0.3), value: appear)

                // Scores
                VStack(spacing: 16) {
                    ScoreRow(label: "Votre score", value: score, color: .cyan)
                    ScoreRow(label: "Meilleur score", value: bestScore, color: .yellow)
                }
                .padding(24)
                .background(.white.opacity(0.05))
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(.white.opacity(0.1), lineWidth: 1))
                .padding(.horizontal, 32)
                .opacity(appear ? 1 : 0)
                .offset(y: appear ? 0 : 30)
                .animation(.easeOut.delay(0.4), value: appear)

                Spacer()

                // Buttons
                VStack(spacing: 12) {
                    Button {
                        router.startGame()
                    } label: {
                        Label("Rejouer", systemImage: "arrow.clockwise")
                            .font(.title2.bold())
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(LinearGradient(colors: [.cyan, .blue], startPoint: .leading, endPoint: .trailing))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }

                    Button {
                        router.backToMenu()
                    } label: {
                        Text("Menu principal")
                            .font(.headline)
                            .foregroundStyle(.white.opacity(0.7))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
                .opacity(appear ? 1 : 0)
                .animation(.easeOut.delay(0.6), value: appear)
            }
        }
        .onAppear { appear = true }
    }
}

struct ScoreRow: View {
    let label: String
    let value: Int
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.white.opacity(0.7))
            Spacer()
            Text("\(value)")
                .font(.title2.bold())
                .foregroundStyle(color)
        }
    }
}

// MARK: - Particles

struct ParticlesView: View {
    let active: Bool
    private let particles: [(CGPoint, Color, Double)] = (0..<30).map { _ in
        let colors: [Color] = [.yellow, .orange, .cyan, .pink, .green]
        return (
            CGPoint(x: Double.random(in: 0...400), y: Double.random(in: 0...800)),
            colors.randomElement()!,
            Double.random(in: 3...8)
        )
    }

    var body: some View {
        if active {
            TimelineView(.animation) { tl in
                Canvas { ctx, size in
                    let t = tl.date.timeIntervalSinceReferenceDate
                    for (pos, color, speed) in particles {
                        let y = (pos.y - t * speed * 20).truncatingRemainder(dividingBy: size.height + 10)
                        let rect = CGRect(x: pos.x, y: y < 0 ? y + size.height : y, width: 4, height: 4)
                        ctx.fill(Path(ellipseIn: rect), with: .color(color.opacity(0.7)))
                    }
                }
            }
            .ignoresSafeArea()
        }
    }
}
