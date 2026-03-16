import SwiftUI

struct GameView: View {
    @EnvironmentObject private var router: AppRouter
    @StateObject private var model = GameModel()

    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Background
                StarfieldView()

                // Bullets
                ForEach(model.bullets) { bullet in
                    Capsule()
                        .fill(Color.cyan)
                        .frame(width: 4, height: 18)
                        .shadow(color: .cyan, radius: 4)
                        .position(bullet.position)
                }

                // Meteors
                ForEach(model.meteors) { meteor in
                    Text(meteor.emoji)
                        .font(.system(size: meteor.size))
                        .rotationEffect(.degrees(meteor.rotation))
                        .position(meteor.position)
                }

                // Explosions
                ForEach(model.explosions) { ex in
                    ExplosionView()
                        .position(ex.position)
                }

                // Player ship
                Text("🚀")
                    .font(.system(size: 44))
                    .rotationEffect(.degrees(-90))
                    .position(x: model.playerX, y: geo.size.height - 80)
                    .shadow(color: .cyan, radius: 8)

                // HUD
                VStack {
                    HUDView(score: model.score, lives: model.lives, level: model.level)
                    Spacer()
                    // Fire button area (invisible, whole bottom half)
                    Color.clear
                        .frame(height: geo.size.height * 0.35)
                        .contentShape(Rectangle())
                        .onTapGesture { model.shoot() }
                }

                // Pause overlay
                if model.phase == .paused {
                    PauseOverlay { model.phase = .playing }
                }
            }
            .onAppear {
                model.size = geo.size
                model.playerX = geo.size.width / 2
                model.start()
            }
            .onDisappear { model.stop() }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { v in model.movePlayer(to: v.location.x) }
            )
            .simultaneousGesture(
                TapGesture().onEnded { model.shoot() }
            )
            .onChange(of: model.phase) { phase in
                if phase == .over {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        router.endGame(score: model.score)
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        model.phase = model.phase == .paused ? .playing : .paused
                    } label: {
                        Image(systemName: model.phase == .paused ? "play.fill" : "pause.fill")
                            .foregroundStyle(.white)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .background(Color.black)
        .navigationBarBackButtonHidden()
    }
}

// MARK: - HUD

struct HUDView: View {
    let score: Int
    let lives: Int
    let level: Int

    var body: some View {
        HStack {
            // Lives
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Text(i < lives ? "❤️" : "🖤")
                        .font(.title3)
                }
            }

            Spacer()

            // Score
            VStack(spacing: 0) {
                Text("\(score)")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                Text("SCORE")
                    .font(.caption2.bold())
                    .foregroundStyle(.white.opacity(0.5))
            }

            Spacer()

            // Level
            Text("LVL \(level)")
                .font(.headline.bold())
                .foregroundStyle(.cyan)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(.cyan.opacity(0.15))
                .clipShape(Capsule())
        }
        .padding(.horizontal, 20)
        .padding(.top, 60)
        .padding(.bottom, 12)
        .background(
            LinearGradient(colors: [.black, .clear], startPoint: .top, endPoint: .bottom)
        )
    }
}

// MARK: - Starfield

struct StarfieldView: View {
    @State private var offset: Double = 0
    private let stars: [(CGPoint, Double)] = (0..<60).map { _ in
        (CGPoint(x: Double.random(in: 0...400), y: Double.random(in: 0...800)), Double.random(in: 0.2...0.8))
    }

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { ctx, size in
                let speed = 30.0
                let t = timeline.date.timeIntervalSinceReferenceDate
                for (pos, opacity) in stars {
                    let y = (pos.y + t * speed).truncatingRemainder(dividingBy: size.height)
                    let rect = CGRect(x: pos.x, y: y, width: 2, height: 2)
                    ctx.fill(Path(ellipseIn: rect), with: .color(.white.opacity(opacity)))
                }
            }
        }
        .ignoresSafeArea()
        .background(Color.black)
    }
}

// MARK: - Explosion

struct ExplosionView: View {
    @State private var scale = 0.1
    @State private var opacity = 1.0

    var body: some View {
        Text("💥")
            .font(.system(size: 48))
            .scaleEffect(scale)
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeOut(duration: 0.45)) {
                    scale = 1.4
                    opacity = 0
                }
            }
    }
}

// MARK: - Pause Overlay

struct PauseOverlay: View {
    let onResume: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.6).ignoresSafeArea()
            VStack(spacing: 24) {
                Text("PAUSE")
                    .font(.system(size: 48, weight: .black))
                    .foregroundStyle(.white)
                Button(action: onResume) {
                    Text("Reprendre")
                        .font(.title2.bold())
                        .foregroundStyle(.black)
                        .padding(.horizontal, 40)
                        .padding(.vertical, 16)
                        .background(Color.cyan)
                        .clipShape(Capsule())
                }
            }
        }
    }
}
