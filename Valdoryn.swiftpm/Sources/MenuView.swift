import SwiftUI

struct MenuView: View {
    @EnvironmentObject private var game: GameState
    @State private var titleScale = 0.8
    @State private var titleOpacity = 0.0

    var body: some View {
        ZStack {
            // Fond dégradé médiéval
            LinearGradient(colors: [
                Color(red: 0.05, green: 0.05, blue: 0.15),
                Color(red: 0.1, green: 0.05, blue: 0.1),
                Color(red: 0.15, green: 0.08, blue: 0.05)
            ], startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()

            // Étoiles
            StarsView()

            VStack(spacing: 0) {
                Spacer()

                // Titre
                VStack(spacing: 12) {
                    Text("⚔️")
                        .font(.system(size: 64))

                    Text("VALDORYN")
                        .font(.system(size: 42, weight: .black, design: .serif))
                        .foregroundStyle(
                            LinearGradient(colors: [.yellow, Color(red: 0.9, green: 0.7, blue: 0.2)],
                                           startPoint: .top, endPoint: .bottom)
                        )
                        .shadow(color: .orange.opacity(0.6), radius: 12)

                    Text("Régnez. Survivez. Devenez légende.")
                        .font(.subheadline.italic())
                        .foregroundStyle(.white.opacity(0.6))
                }
                .scaleEffect(titleScale)
                .opacity(titleOpacity)

                Spacer()

                // Bouton
                Button {
                    game.phase = .originPicker
                } label: {
                    Text("Commencer le règne")
                        .font(.title3.bold())
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            LinearGradient(colors: [.yellow, Color(red: 0.8, green: 0.6, blue: 0.1)],
                                           startPoint: .leading, endPoint: .trailing)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .shadow(color: .yellow.opacity(0.4), radius: 12)
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 60)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                titleScale = 1.0
                titleOpacity = 1.0
            }
        }
    }
}

struct StarsView: View {
    private let stars: [(Double, Double, Double)] = (0..<80).map { _ in
        (Double.random(in: 0...1), Double.random(in: 0...0.7), Double.random(in: 0.3...1))
    }

    var body: some View {
        GeometryReader { geo in
            ForEach(0..<stars.count, id: \.self) { i in
                Circle()
                    .fill(Color.white.opacity(stars[i].2 * 0.7))
                    .frame(width: 2, height: 2)
                    .position(x: stars[i].0 * geo.size.width,
                              y: stars[i].1 * geo.size.height)
            }
        }
    }
}
