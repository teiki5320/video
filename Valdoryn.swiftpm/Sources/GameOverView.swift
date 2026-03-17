import SwiftUI

struct GameOverView: View {
    @EnvironmentObject private var game: GameState
    let reason: GameOverReason
    @State private var appeared = false

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.02, blue: 0.02).ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                Text("💀")
                    .font(.system(size: 80))
                    .scaleEffect(appeared ? 1 : 0.3)
                    .animation(.spring(response: 0.6, dampingFraction: 0.6).delay(0.1), value: appeared)

                VStack(spacing: 10) {
                    Text(reason.title)
                        .font(.system(size: 28, weight: .black, design: .serif))
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)

                    Text("An \(game.year) — \(game.season.name)")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.5))
                }
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut.delay(0.3), value: appeared)

                // Narration
                Text(reason.narrative)
                    .font(.system(size: 15, design: .serif))
                    .foregroundStyle(Color(red: 0.85, green: 0.75, blue: 0.65))
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 28)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut.delay(0.5), value: appeared)

                // Stats
                HStack(spacing: 0) {
                    MiniStat(icon: "👥", label: "Population", value: game.resources.population)
                    MiniStat(icon: "💰", label: "Or",         value: game.resources.gold)
                    MiniStat(icon: "⭐", label: "Prestige",   value: game.resources.prestige)
                }
                .background(Color.white.opacity(0.05))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .padding(.horizontal, 24)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut.delay(0.7), value: appeared)

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        game.phase = .originPicker
                    } label: {
                        Text("Recommencer")
                            .font(.headline)
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.yellow)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }

                    Button {
                        game.restartToMenu()
                    } label: {
                        Text("Menu principal")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.5))
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut.delay(0.9), value: appeared)
            }
        }
        .onAppear { appeared = true }
    }
}

struct MiniStat: View {
    let icon: String
    let label: String
    let value: Int

    var body: some View {
        VStack(spacing: 4) {
            Text(icon).font(.title2)
            Text("\(value)").font(.headline).foregroundStyle(.white)
            Text(label).font(.caption2).foregroundStyle(.white.opacity(0.4))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
    }
}
