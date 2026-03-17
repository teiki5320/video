import SwiftUI

struct NarrativeView: View {
    @EnvironmentObject private var game: GameState
    let text: String
    @State private var visibleChars = 0
    @State private var timer: Timer?

    var displayedText: String {
        String(text.prefix(visibleChars))
    }

    var body: some View {
        ZStack {
            Color(red: 0.05, green: 0.04, blue: 0.02).ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Parchemin
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(red: 0.18, green: 0.14, blue: 0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color(red: 0.5, green: 0.4, blue: 0.2), lineWidth: 1.5)
                        )

                    Text(displayedText)
                        .font(.system(size: 17, weight: .regular, design: .serif))
                        .foregroundStyle(Color(red: 0.92, green: 0.85, blue: 0.7))
                        .lineSpacing(6)
                        .padding(28)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 24)

                Spacer()

                // Bouton continuer (visible quand le texte est entièrement affiché)
                if visibleChars >= text.count {
                    Button {
                        game.beginPlaying()
                    } label: {
                        HStack(spacing: 8) {
                            Text("Continuer")
                            Image(systemName: "chevron.right")
                        }
                        .font(.headline)
                        .foregroundStyle(.black)
                        .padding(.horizontal, 40)
                        .padding(.vertical, 14)
                        .background(Color.yellow)
                        .clipShape(Capsule())
                    }
                    .transition(.opacity)
                    .padding(.bottom, 48)
                } else {
                    // Skip
                    Button("Passer") {
                        timer?.invalidate()
                        visibleChars = text.count
                    }
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.4))
                    .padding(.bottom, 48)
                }
            }
        }
        .animation(.easeIn(duration: 0.4), value: visibleChars >= text.count)
        .onAppear { startTyping() }
        .onDisappear { timer?.invalidate() }
    }

    private func startTyping() {
        visibleChars = 0
        timer = Timer.scheduledTimer(withTimeInterval: 0.03, repeats: true) { t in
            if visibleChars < text.count {
                visibleChars += 1
            } else {
                t.invalidate()
            }
        }
    }
}
