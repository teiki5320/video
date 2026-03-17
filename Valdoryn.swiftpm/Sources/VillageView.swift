import SwiftUI

struct VillageView: View {
    let resources: Resources
    let season: Season
    let width: CGFloat
    let height: CGFloat

    // Nombre de maisons selon la population
    var houseCount: Int {
        switch resources.populationLevel {
        case 0: return 1
        case 1: return 3
        case 2: return 5
        default: return 7
        }
    }

    var wallColor: Color {
        season == .winter
            ? Color(red: 0.82, green: 0.8, blue: 0.78)
            : Color(red: 0.88, green: 0.82, blue: 0.72)
    }

    var roofColor: Color {
        Color(red: 0.6, green: 0.3, blue: 0.2)
    }

    var body: some View {
        Canvas { ctx, size in
            let baseY = size.height * 0.6
            let startX = size.width * 0.08

            for i in 0..<houseCount {
                let x = startX + CGFloat(i) * 38
                let houseH: CGFloat = i % 2 == 0 ? 44 : 36
                let houseW: CGFloat = 28

                // Murs
                let wall = CGRect(x: x, y: baseY - houseH, width: houseW, height: houseH)
                ctx.fill(Path(wall), with: .color(wallColor))

                // Toit
                var roof = Path()
                roof.move(to: CGPoint(x: x - 2, y: baseY - houseH))
                roof.addLine(to: CGPoint(x: x + houseW / 2, y: baseY - houseH - 20))
                roof.addLine(to: CGPoint(x: x + houseW + 2, y: baseY - houseH))
                roof.closeSubpath()
                ctx.fill(roof, with: .color(roofColor))

                // Porte
                let door = CGRect(x: x + houseW/2 - 4, y: baseY - 14, width: 8, height: 14)
                ctx.fill(Path(door), with: .color(Color(red: 0.35, green: 0.22, blue: 0.1)))

                // Fenêtre
                let win = CGRect(x: x + 4, y: baseY - houseH + 8, width: 7, height: 7)
                ctx.fill(Path(win), with: .color(Color.yellow.opacity(season == .winter ? 0.9 : 0.5)))

                // Fumée cheminée (hiver)
                if season == .winter {
                    var smoke = Path()
                    smoke.move(to: CGPoint(x: x + houseW - 6, y: baseY - houseH - 20))
                    smoke.addCurve(
                        to: CGPoint(x: x + houseW - 2, y: baseY - houseH - 35),
                        control1: CGPoint(x: x + houseW, y: baseY - houseH - 25),
                        control2: CGPoint(x: x + houseW - 8, y: baseY - houseH - 30)
                    )
                    ctx.stroke(smoke, with: .color(.white.opacity(0.5)), lineWidth: 2)
                }
            }

            // Puits au centre du village
            if resources.populationLevel >= 1 {
                let wx = startX + 14
                let wy = baseY + 8
                ctx.fill(Path(ellipseIn: CGRect(x: wx - 10, y: wy - 5, width: 20, height: 10)),
                         with: .color(Color(red: 0.55, green: 0.5, blue: 0.45)))
            }
        }
    }
}
