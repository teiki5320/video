import SwiftUI

struct EventView: View {
    @EnvironmentObject private var game: GameState
    let event: GameEvent
    @State private var appeared = false

    var body: some View {
        ZStack {
            // Fond semi-transparent sur le royaume
            Color.black.opacity(0.65).ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 0) {
                    // En-tête
                    VStack(spacing: 8) {
                        Text(game.season.icon)
                            .font(.title)
                        Text(event.title)
                            .font(.system(size: 20, weight: .bold, design: .serif))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 20)
                    .background(Color(red: 0.15, green: 0.1, blue: 0.05))

                    // Narration
                    ScrollView {
                        Text(event.narrative)
                            .font(.system(size: 15, design: .serif))
                            .foregroundStyle(Color(red: 0.92, green: 0.85, blue: 0.7))
                            .lineSpacing(5)
                            .padding(20)
                    }
                    .frame(maxHeight: 120)
                    .background(Color(red: 0.12, green: 0.09, blue: 0.05))

                    Divider().background(Color(red: 0.4, green: 0.3, blue: 0.15))

                    // Choix
                    VStack(spacing: 0) {
                        ForEach(Array(event.choices.enumerated()), id: \.offset) { index, choice in
                            ChoiceRow(choice: choice, index: index) {
                                game.applyChoice(choice)
                            }
                            if index < event.choices.count - 1 {
                                Divider().background(Color.white.opacity(0.08))
                            }
                        }
                    }
                    .background(Color(red: 0.1, green: 0.08, blue: 0.04))
                }
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color(red: 0.5, green: 0.4, blue: 0.2), lineWidth: 1.5))
                .padding(.horizontal, 16)
                .offset(y: appeared ? 0 : 60)
                .opacity(appeared ? 1 : 0)
                .padding(.bottom, 24)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                appeared = true
            }
        }
    }
}

struct ChoiceRow: View {
    let choice: EventChoice
    let index: Int
    let onTap: () -> Void
    @State private var pressed = false

    var label: String { ["A", "B", "C"][index] }

    // Prévisualisation des impacts
    var impactPreview: String {
        var parts: [String] = []
        let d = choice.delta
        if d.gold != 0       { parts.append("\(d.gold > 0 ? "+" : "")\(d.gold) 💰") }
        if d.population != 0 { parts.append("\(d.population > 0 ? "+" : "")\(d.population) 👥") }
        if d.food != 0       { parts.append("\(d.food > 0 ? "+" : "")\(d.food) 🌾") }
        if d.prestige != 0   { parts.append("\(d.prestige > 0 ? "+" : "")\(d.prestige) ⭐") }
        if d.defense != 0    { parts.append("\(d.defense > 0 ? "+" : "")\(d.defense) 🛡️") }
        return parts.joined(separator: "  ")
    }

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 14) {
                // Lettre
                Text(label)
                    .font(.system(size: 14, weight: .black, design: .rounded))
                    .foregroundStyle(.black)
                    .frame(width: 26, height: 26)
                    .background(Color.yellow)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(choice.text)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.leading)

                    if !impactPreview.isEmpty {
                        Text(impactPreview)
                            .font(.system(size: 11))
                            .foregroundStyle(.white.opacity(0.5))
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.3))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(pressed ? Color.white.opacity(0.08) : Color.clear)
        }
        .buttonStyle(.plain)
        ._onButtonGesture(pressing: { pressed = $0 }, perform: {})
    }
}
