import SwiftUI

struct MenuView: View {
    @EnvironmentObject private var router: AppRouter
    @State private var pulse = false
    @State private var starOffsets: [CGPoint] = (0..<20).map { _ in
        CGPoint(x: CGFloat.random(in: 0...400), y: CGFloat.random(in: 0...800))
    }

    var body: some View {
        ZStack {
            // Background
            Color.black.ignoresSafeArea()

            // Stars
            ForEach(0..<20, id: \.self) { i in
                Circle()
                    .fill(Color.white.opacity(Double.random(in: 0.3...0.9)))
                    .frame(width: CGFloat.random(in: 2...5))
                    .position(starOffsets[i])
            }

            VStack(spacing: 40) {
                Spacer()

                // Title
                VStack(spacing: 8) {
                    Text("🚀")
                        .font(.system(size: 80))
                        .scaleEffect(pulse ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: pulse)

                    Text("SPACE BLASTER")
                        .font(.system(size: 36, weight: .black, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(colors: [.cyan, .blue, .purple], startPoint: .leading, endPoint: .trailing)
                        )

                    Text("Détruisez les météorites !")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                }

                // Best score
                if router.bestScore > 0 {
                    HStack(spacing: 8) {
                        Image(systemName: "trophy.fill")
                            .foregroundStyle(.yellow)
                        Text("Meilleur : \(router.bestScore)")
                            .font(.headline)
                            .foregroundStyle(.yellow)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(.yellow.opacity(0.15))
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(.yellow.opacity(0.4), lineWidth: 1))
                }

                Spacer()

                // Play button
                Button {
                    router.startGame()
                } label: {
                    Text("JOUER")
                        .font(.title.bold())
                        .foregroundStyle(.black)
                        .frame(width: 220, height: 60)
                        .background(
                            LinearGradient(colors: [.cyan, .blue], startPoint: .leading, endPoint: .trailing)
                        )
                        .clipShape(Capsule())
                        .shadow(color: .cyan.opacity(0.5), radius: 16)
                }

                // How to play
                VStack(spacing: 6) {
                    Text("Comment jouer")
                        .font(.caption.bold())
                        .foregroundStyle(.white.opacity(0.5))
                    Text("Tapez pour tirer • Évitez les météorites")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                .padding(.bottom, 40)
            }
        }
        .onAppear { pulse = true }
    }
}
