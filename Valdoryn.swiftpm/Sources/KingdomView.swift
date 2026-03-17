import SwiftUI

struct KingdomView: View {
    @EnvironmentObject private var game: GameState

    var body: some View {
        VStack(spacing: 0) {
            // --- Barre de statut ---
            StatusBarView()
                .environmentObject(game)

            // --- Scène du royaume ---
            KingdomSceneView(resources: game.resources, season: game.season)
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            // --- Panneau ressources ---
            ResourcePanelView()
                .environmentObject(game)

            // --- Bouton passer la saison ---
            Button {
                game.advanceSeason()
            } label: {
                HStack(spacing: 8) {
                    Text("Passer à")
                    Text("\(game.season.next.icon) \(game.season.next.name)")
                        .bold()
                }
                .font(.headline)
                .foregroundStyle(.black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.yellow)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 16)
                .padding(.bottom, 8)
            }
        }
        .background(Color(red: 0.07, green: 0.06, blue: 0.04))
    }
}

// MARK: - Status Bar

struct StatusBarView: View {
    @EnvironmentObject private var game: GameState

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Valdoryn")
                    .font(.system(size: 16, weight: .bold, design: .serif))
                    .foregroundStyle(.white)
                Text("An \(game.year) — \(game.season.icon) \(game.season.name)")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.6))
            }

            Spacer()

            // Progression cathédrale
            if game.cathedralProgress > 0 && game.cathedralProgress < 100 {
                VStack(spacing: 3) {
                    Text("⛪ \(game.cathedralProgress)%")
                        .font(.caption.bold())
                        .foregroundStyle(.yellow)
                    ProgressView(value: Double(game.cathedralProgress), total: 100)
                        .tint(.yellow)
                        .frame(width: 60)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.5))
    }
}

// MARK: - Resource Panel

struct ResourcePanelView: View {
    @EnvironmentObject private var game: GameState

    var body: some View {
        HStack(spacing: 0) {
            ResourceCell(icon: "💰", label: "Or",         value: game.resources.gold,       max: 150)
            ResourceCell(icon: "👥", label: "Population", value: game.resources.population,  max: 250)
            ResourceCell(icon: "🌾", label: "Nourriture", value: game.resources.food,        max: 150)
            ResourceCell(icon: "⭐", label: "Prestige",   value: game.resources.prestige,    max: 100)
            ResourceCell(icon: "🛡️", label: "Défense",   value: game.resources.defense,     max: 100)
        }
        .padding(.vertical, 10)
        .background(Color.black.opacity(0.7))
    }
}

struct ResourceCell: View {
    let icon: String
    let label: String
    let value: Int
    let max: Int

    var barColor: Color {
        let ratio = Double(value) / Double(max)
        if ratio < 0.2 { return .red }
        if ratio < 0.45 { return .orange }
        return .green
    }

    var body: some View {
        VStack(spacing: 4) {
            Text(icon)
                .font(.title3)
            Text("\(value)")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.5))
            // Mini barre
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.white.opacity(0.1))
                    RoundedRectangle(cornerRadius: 2)
                        .fill(barColor)
                        .frame(width: geo.size.width * min(1, Double(value) / Double(max)))
                }
            }
            .frame(height: 4)
            .padding(.horizontal, 4)
        }
        .frame(maxWidth: .infinity)
    }
}
