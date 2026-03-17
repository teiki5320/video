import SwiftUI

struct FieldsView: View {
    let resources: Resources
    let season: Season
    let width: CGFloat
    let height: CGFloat

    var cropColor: Color {
        switch season {
        case .spring: return Color(red: 0.5, green: 0.75, blue: 0.3)
        case .summer: return Color(red: 0.8, green: 0.7, blue: 0.2)
        case .autumn: return Color(red: 0.75, green: 0.55, blue: 0.2)
        case .winter: return Color(red: 0.7, green: 0.72, blue: 0.75)
        }
    }

    var soilColor: Color {
        season == .winter
            ? Color(red: 0.65, green: 0.68, blue: 0.72)
            : Color(red: 0.5, green: 0.35, blue: 0.2)
    }

    // Nombre de parcelles selon la nourriture
    var plotCount: Int {
        switch resources.foodLevel {
        case 0: return 1
        case 1: return 2
        case 2: return 3
        default: return 4
        }
    }

    var body: some View {
        Canvas { ctx, size in
            let startX = size.width * 0.62
            let baseY  = size.height * 0.58

            for i in 0..<plotCount {
                let row = i / 2
                let col = i % 2
                let x = startX + CGFloat(col) * 70
                let y = baseY + CGFloat(row) * 32

                // Sol
                let plot = CGRect(x: x, y: y, width: 60, height: 28)
                ctx.fill(Path(plot), with: .color(soilColor))

                // Sillons
                for r in 0..<4 {
                    var furrow = Path()
                    let fy = y + CGFloat(r) * 6 + 3
                    furrow.move(to: CGPoint(x: x + 4, y: fy))
                    furrow.addLine(to: CGPoint(x: x + 56, y: fy))
                    ctx.stroke(furrow, with: .color(soilColor.opacity(0.5)), lineWidth: 1)
                }

                // Cultures (absentes en hiver si nourriture faible)
                if season != .winter || resources.foodLevel >= 2 {
                    for c in 0..<8 {
                        let cx2 = x + 6 + CGFloat(c) * 7
                        let cy2 = y + 5
                        var stalk = Path()
                        stalk.move(to: CGPoint(x: cx2, y: cy2 + 18))
                        stalk.addLine(to: CGPoint(x: cx2, y: cy2 + 4))
                        ctx.stroke(stalk, with: .color(cropColor), lineWidth: 1.5)

                        // Épi
                        let ear = CGRect(x: cx2 - 3, y: cy2, width: 6, height: 6)
                        ctx.fill(Path(ellipseIn: ear), with: .color(cropColor))
                    }
                }
            }

            // Épouvantail (été/printemps si nourriture suffisante)
            if resources.foodLevel >= 2 && (season == .summer || season == .spring) {
                let sx = startX + 130
                let sy = baseY - 5
                // Corps
                var body = Path()
                body.move(to: CGPoint(x: sx, y: sy))
                body.addLine(to: CGPoint(x: sx, y: sy + 30))
                ctx.stroke(body, with: .color(.brown), lineWidth: 2)
                // Bras
                var arms = Path()
                arms.move(to: CGPoint(x: sx - 12, y: sy + 10))
                arms.addLine(to: CGPoint(x: sx + 12, y: sy + 10))
                ctx.stroke(arms, with: .color(.brown), lineWidth: 2)
                // Tête
                ctx.fill(Path(ellipseIn: CGRect(x: sx - 6, y: sy - 12, width: 12, height: 12)),
                         with: .color(Color(red: 0.8, green: 0.65, blue: 0.4)))
            }
        }
    }
}
