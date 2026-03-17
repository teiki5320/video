import SwiftUI

struct OriginPickerView: View {
    @EnvironmentObject private var game: GameState
    @State private var selected: Origin? = nil

    var body: some View {
        ZStack {
            Color(red: 0.08, green: 0.06, blue: 0.04).ignoresSafeArea()

            VStack(spacing: 24) {
                VStack(spacing: 6) {
                    Text("Choisissez votre histoire")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundStyle(.white)
                    Text("Votre passé forgera votre règne")
                        .font(.subheadline.italic())
                        .foregroundStyle(.white.opacity(0.5))
                }
                .padding(.top, 48)

                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(Origin.allCases) { origin in
                            OriginCard(origin: origin, isSelected: selected == origin)
                                .onTapGesture { selected = origin }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }

                // Bouton confirmer
                if let origin = selected {
                    Button {
                        game.startGame(with: origin)
                    } label: {
                        Text("Commencer — \(origin.title)")
                            .font(.headline)
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.yellow)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .animation(.spring(response: 0.4), value: selected)
    }
}

struct OriginCard: View {
    let origin: Origin
    let isSelected: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(origin.title)
                .font(.system(size: 18, weight: .bold, design: .serif))
                .foregroundStyle(.white)

            Text(origin.subtitle)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 16) {
                Label(origin.bonus, systemImage: "arrow.up.circle.fill")
                    .font(.caption.bold())
                    .foregroundStyle(.green)

                Label(origin.malus, systemImage: "arrow.down.circle.fill")
                    .font(.caption)
                    .foregroundStyle(.red.opacity(0.85))
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(isSelected
                      ? Color(red: 0.3, green: 0.2, blue: 0.05)
                      : Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(isSelected ? Color.yellow : Color.white.opacity(0.1), lineWidth: isSelected ? 2 : 1)
                )
        )
    }
}
