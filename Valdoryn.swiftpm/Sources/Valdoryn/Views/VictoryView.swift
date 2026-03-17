import SwiftUI

struct VictoryView: View {
    @EnvironmentObject private var game: GameState
    let reason: VictoryReason
    @State private var appeared = false
    @State private var glowPulse = false

    var icon: String {
        switch reason {
        case .grandSeigneur: return "👑"
        case .legende:       return "🏆"
        case .cathedrale:    return "⛪"
        }
    }

    var body: some View {
        ZStack {
            // Fond doré
            LinearGradient(colors: [
                Color(red: 0.08, green: 0.06, blue: 0.01),
                Color(red: 0.15, green: 0.1, blue: 0.02),
                Color(red: 0.08, green: 0.06, blue: 0.01)
            ], startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()

            // Particules dorées
            GoldenParticles()

            VStack(spacing: 28) {
                Spacer()

                Text(icon)
                    .font(.system(size: 90))
                    .scaleEffect(appeared ? 1 : 0.2)
                    .shadow(color: .yellow.opacity(glowPulse ? 0.9 : 0.3), radius: 30)
                    .animation(.spring(response: 0.7, dampingFraction: 0.5).delay(0.1), value: appeared)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: glowPulse)

                VStack(spacing: 10) {
                    Text("VICTOIRE")
                        .font(.system(size: 14, weight: .heavy, design: .rounded))
                        .foregroundStyle(.yellow.opacity(0.7))
                        .kerning(6)

                    Text(reason.title)
                        .font(.system(size: 26, weight: .black, design: .serif))
                        .foregroundStyle(
                            LinearGradient(colors: [.yellow, Color(red: 0.9, green: 0.7, blue: 0.2)],
                                           startPoint: .top, endPoint: .bottom)
                        )
                        .multilineTextAlignment(.center)

                    Text("An \(game.year) — \(game.season.name)")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut.delay(0.4), value: appeared)

                Text(reason.narrative)
                    .font(.system(size: 15, design: .serif))
                    .foregroundStyle(Color(red: 0.92, green: 0.85, blue: 0.7))
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 28)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut.delay(0.7), value: appeared)

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        game.phase = .originPicker
                    } label: {
                        Text("Nouveau règne")
                            .font(.headline)
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(LinearGradient(colors: [.yellow, Color(red: 0.8, green: 0.6, blue: 0.1)],
                                                       startPoint: .leading, endPoint: .trailing))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }

                    Button {
                        game.restartToMenu()
                    } label: {
                        Text("Menu principal")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.4))
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut.delay(1.0), value: appeared)
            }
        }
        .onAppear {
            appeared = true
            glowPulse = true
        }
    }
}

struct GoldenParticles: View {
    private let particles: [(Double, Double, Double)] = (0..<25).map { _ in
        (Double.random(in: 0...1), Double.random(in: 0...1), Double.random(in: 2...6))
    }

    var body: some View {
        TimelineView(.animation) { tl in
            Canvas { ctx, size in
                let t = tl.date.timeIntervalSinceReferenceDate
                for (px, py, speed) in particles {
                    let y = (py * size.height - t * speed * 15)
                        .truncatingRemainder(dividingBy: size.height + 10)
                    let adjY = y < -10 ? y + size.height + 10 : y
                    let r = CGRect(x: px * size.width - 3, y: adjY - 3, width: 6, height: 6)
                    ctx.fill(Path(ellipseIn: r), with: .color(Color.yellow.opacity(0.5)))
                }
            }
        }
        .ignoresSafeArea()
    }
}
