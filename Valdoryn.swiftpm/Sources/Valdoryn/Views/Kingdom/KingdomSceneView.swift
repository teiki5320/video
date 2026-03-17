import SwiftUI

/// Vue principale du royaume en style isométrique vectoriel SwiftUI
struct KingdomSceneView: View {
    let resources: Resources
    let season: Season

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height

            ZStack(alignment: .topLeading) {

                // --- Ciel ---
                LinearGradient(colors: season.skyColors, startPoint: .top, endPoint: .bottom)
                    .frame(height: h * 0.55)

                // --- Soleil / Lune selon saison ---
                celestialBody(season: season)
                    .position(x: w * 0.82, y: h * 0.1)

                // --- Nuages ---
                CloudShape()
                    .fill(Color.white.opacity(season == .winter ? 0.85 : 0.6))
                    .frame(width: 90, height: 35)
                    .position(x: w * 0.25, y: h * 0.1)

                CloudShape()
                    .fill(Color.white.opacity(season == .winter ? 0.9 : 0.5))
                    .frame(width: 60, height: 25)
                    .position(x: w * 0.6, y: h * 0.07)

                // --- Sol ---
                Rectangle()
                    .fill(season.groundColor)
                    .frame(height: h * 0.55)
                    .offset(y: h * 0.45)

                // --- Collines fond ---
                HillsView(season: season, width: w, height: h)

                // --- Rivière / Douves ---
                if resources.defenseLevel >= 1 {
                    MoatView(width: w, height: h)
                }

                // --- Champs (droite bas) ---
                FieldsView(resources: resources, season: season, width: w, height: h)

                // --- Village (gauche bas) ---
                VillageView(resources: resources, season: season, width: w, height: h)

                // --- Château (centre) ---
                CastleView(resources: resources, season: season, width: w, height: h)

                // --- Flocons hiver ---
                if season == .winter {
                    SnowOverlay(width: w, height: h)
                }

                // --- Fleurs printemps ---
                if season == .spring {
                    SpringFlowers(width: w, height: h)
                }
            }
        }
    }

    @ViewBuilder
    private func celestialBody(season: Season) -> some View {
        if season == .winter {
            // Soleil pâle
            Circle()
                .fill(Color.white.opacity(0.7))
                .frame(width: 36, height: 36)
                .shadow(color: .white.opacity(0.5), radius: 8)
        } else if season == .summer {
            // Soleil brillant
            ZStack {
                Circle()
                    .fill(Color.yellow.opacity(0.9))
                    .frame(width: 44, height: 44)
                ForEach(0..<8, id: \.self) { i in
                    Capsule()
                        .fill(Color.yellow.opacity(0.5))
                        .frame(width: 4, height: 12)
                        .offset(y: -30)
                        .rotationEffect(.degrees(Double(i) * 45))
                }
            }
        } else {
            Circle()
                .fill(Color.yellow.opacity(0.75))
                .frame(width: 38, height: 38)
                .shadow(color: .yellow.opacity(0.4), radius: 10)
        }
    }
}

// MARK: - Collines

struct HillsView: View {
    let season: Season
    let width: CGFloat
    let height: CGFloat

    var hillColor: Color {
        switch season {
        case .spring: return Color(red: 0.35, green: 0.6, blue: 0.3)
        case .summer: return Color(red: 0.25, green: 0.55, blue: 0.2)
        case .autumn: return Color(red: 0.5, green: 0.4, blue: 0.2)
        case .winter: return Color(red: 0.75, green: 0.8, blue: 0.85)
        }
    }

    var body: some View {
        Canvas { ctx, size in
            var path = Path()
            path.move(to: CGPoint(x: 0, y: size.height * 0.52))
            path.addCurve(
                to: CGPoint(x: size.width, y: size.height * 0.48),
                control1: CGPoint(x: size.width * 0.25, y: size.height * 0.35),
                control2: CGPoint(x: size.width * 0.75, y: size.height * 0.42)
            )
            path.addLine(to: CGPoint(x: size.width, y: size.height))
            path.addLine(to: CGPoint(x: 0, y: size.height))
            path.closeSubpath()
            ctx.fill(path, with: .color(hillColor))
        }
    }
}

// MARK: - Douves

struct MoatView: View {
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        Canvas { ctx, size in
            // Douves elliptiques autour du château
            let cx = size.width * 0.5
            let cy = size.height * 0.54
            let ellipse = CGRect(x: cx - 90, y: cy - 18, width: 180, height: 36)
            ctx.fill(Path(ellipseIn: ellipse), with: .color(Color(red: 0.2, green: 0.45, blue: 0.7).opacity(0.75)))
        }
    }
}

// MARK: - Nuage

struct CloudShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let w = rect.width, h = rect.height
        p.addEllipse(in: CGRect(x: w*0.1, y: h*0.3, width: w*0.4, height: h*0.6))
        p.addEllipse(in: CGRect(x: w*0.3, y: h*0.05, width: w*0.4, height: h*0.65))
        p.addEllipse(in: CGRect(x: w*0.55, y: h*0.2, width: w*0.35, height: h*0.55))
        p.addRect(CGRect(x: w*0.1, y: h*0.5, width: w*0.8, height: h*0.5))
        return p
    }
}

// MARK: - Flocons

struct SnowOverlay: View {
    let width: CGFloat
    let height: CGFloat
    private let flakes: [(CGFloat, CGFloat)] = (0..<20).map { _ in
        (CGFloat.random(in: 0...1), CGFloat.random(in: 0...0.9))
    }

    var body: some View {
        Canvas { ctx, size in
            for (fx, fy) in flakes {
                let r = CGRect(x: fx * size.width - 3, y: fy * size.height - 3, width: 6, height: 6)
                ctx.fill(Path(ellipseIn: r), with: .color(.white.opacity(0.7)))
            }
        }
    }
}

// MARK: - Fleurs printemps

struct SpringFlowers: View {
    let width: CGFloat
    let height: CGFloat
    private let flowers: [(CGFloat, CGFloat, Color)] = (0..<15).map { _ in
        let colors: [Color] = [.pink, .yellow, .white, .purple]
        return (CGFloat.random(in: 0...1), CGFloat.random(in: 0.7...0.95), colors.randomElement()!)
    }

    var body: some View {
        Canvas { ctx, size in
            for (fx, fy, color) in flowers {
                let r = CGRect(x: fx * size.width - 4, y: fy * size.height - 4, width: 8, height: 8)
                ctx.fill(Path(ellipseIn: r), with: .color(color.opacity(0.9)))
            }
        }
    }
}
