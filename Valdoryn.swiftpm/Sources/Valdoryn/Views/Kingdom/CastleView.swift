import SwiftUI

struct CastleView: View {
    let resources: Resources
    let season: Season
    let width: CGFloat
    let height: CGFloat

    // Le château évolue avec le prestige
    var castleScale: CGFloat {
        switch resources.prestigeLevel {
        case 0: return 0.7
        case 1: return 0.85
        case 2: return 1.0
        default: return 1.15
        }
    }

    var stoneColor: Color {
        season == .winter
            ? Color(red: 0.75, green: 0.78, blue: 0.82)
            : Color(red: 0.6, green: 0.58, blue: 0.55)
    }

    var body: some View {
        Canvas { ctx, size in
            let cx = size.width * 0.5
            let base = size.height * 0.56
            let sc = castleScale

            // --- Corps principal ---
            let body = CGRect(x: cx - 55*sc, y: base - 80*sc, width: 110*sc, height: 80*sc)
            ctx.fill(Path(body), with: .color(stoneColor))

            // --- Donjon central ---
            let keep = CGRect(x: cx - 25*sc, y: base - 130*sc, width: 50*sc, height: 60*sc)
            ctx.fill(Path(keep), with: .color(stoneColor))

            // --- Tours latérales ---
            let towerLeft  = CGRect(x: cx - 70*sc, y: base - 100*sc, width: 28*sc, height: 70*sc)
            let towerRight = CGRect(x: cx + 42*sc,  y: base - 100*sc, width: 28*sc, height: 70*sc)
            ctx.fill(Path(towerLeft),  with: .color(stoneColor))
            ctx.fill(Path(towerRight), with: .color(stoneColor))

            // --- Créneaux donjon ---
            for i in 0..<5 {
                let cx2 = cx - 20*sc + CGFloat(i) * 10*sc
                let merlon = CGRect(x: cx2, y: base - 138*sc, width: 7*sc, height: 10*sc)
                ctx.fill(Path(merlon), with: .color(stoneColor))
            }

            // --- Créneaux tours ---
            for i in 0..<3 {
                let mL = CGRect(x: cx - 69*sc + CGFloat(i)*10*sc, y: base - 108*sc, width: 7*sc, height: 9*sc)
                let mR = CGRect(x: cx + 43*sc + CGFloat(i)*10*sc, y: base - 108*sc, width: 7*sc, height: 9*sc)
                ctx.fill(Path(mL), with: .color(stoneColor))
                ctx.fill(Path(mR), with: .color(stoneColor))
            }

            // --- Toit conique donjon ---
            var roof = Path()
            roof.move(to: CGPoint(x: cx, y: base - 165*sc))
            roof.addLine(to: CGPoint(x: cx - 28*sc, y: base - 130*sc))
            roof.addLine(to: CGPoint(x: cx + 28*sc, y: base - 130*sc))
            roof.closeSubpath()
            ctx.fill(roof, with: .color(Color(red: 0.5, green: 0.1, blue: 0.1)))

            // --- Toits tours ---
            for sign in [-1.0, 1.0] {
                var tr = Path()
                let tx = cx + CGFloat(sign) * 56*sc
                tr.move(to: CGPoint(x: tx, y: base - 118*sc))
                tr.addLine(to: CGPoint(x: tx - 16*sc, y: base - 100*sc))
                tr.addLine(to: CGPoint(x: tx + 16*sc, y: base - 100*sc))
                tr.closeSubpath()
                ctx.fill(tr, with: .color(Color(red: 0.45, green: 0.1, blue: 0.1)))
            }

            // --- Porte ---
            var gate = Path()
            gate.move(to: CGPoint(x: cx - 12*sc, y: base))
            gate.addLine(to: CGPoint(x: cx - 12*sc, y: base - 25*sc))
            gate.addQuadCurve(to: CGPoint(x: cx + 12*sc, y: base - 25*sc),
                              control: CGPoint(x: cx, y: base - 38*sc))
            gate.addLine(to: CGPoint(x: cx + 12*sc, y: base))
            ctx.fill(gate, with: .color(Color(red: 0.15, green: 0.1, blue: 0.08)))

            // --- Fenêtres ---
            let windows: [CGPoint] = [
                CGPoint(x: cx - 35*sc, y: base - 55*sc),
                CGPoint(x: cx + 35*sc, y: base - 55*sc),
                CGPoint(x: cx, y: base - 100*sc)
            ]
            for pos in windows {
                let wr = CGRect(x: pos.x - 5*sc, y: pos.y - 8*sc, width: 10*sc, height: 13*sc)
                ctx.fill(Path(wr), with: .color(Color(red: 0.9, green: 0.75, blue: 0.3).opacity(0.8)))
            }

            // --- Bannière (si prestige élevé) ---
            if resources.prestigeLevel >= 2 {
                var flag = Path()
                flag.move(to: CGPoint(x: cx, y: base - 165*sc))
                flag.addLine(to: CGPoint(x: cx, y: base - 185*sc))
                ctx.stroke(flag, with: .color(.brown), lineWidth: 1.5)
                let banner = CGRect(x: cx, y: base - 185*sc, width: 14*sc, height: 9*sc)
                ctx.fill(Path(banner), with: .color(.red))
            }
        }
    }
}
