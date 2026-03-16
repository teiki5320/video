import SwiftUI
import Combine

// MARK: - Entities

struct Meteor: Identifiable {
    let id = UUID()
    var position: CGPoint
    var speed: Double
    var size: Double
    var rotation: Double = 0
    var emoji: String = ["☄️", "🪨", "💫"].randomElement()!
}

struct Bullet: Identifiable {
    let id = UUID()
    var position: CGPoint
}

struct Explosion: Identifiable {
    let id = UUID()
    var position: CGPoint
    var scale: Double = 0.1
    var opacity: Double = 1.0
}

// MARK: - Game State

enum GamePhase {
    case playing, paused, over
}

@MainActor
class GameModel: ObservableObject {
    // Canvas size set from view
    var size: CGSize = .zero

    // Entities
    @Published var meteors: [Meteor] = []
    @Published var bullets: [Bullet] = []
    @Published var explosions: [Explosion] = []
    @Published var playerX: Double = 200

    // State
    @Published var score: Int = 0
    @Published var lives: Int = 3
    @Published var phase: GamePhase = .playing
    @Published var level: Int = 1

    // Timers
    private var gameTimer: Timer?
    private var spawnTimer: Timer?
    private var elapsed: Double = 0
    private var spawnInterval: Double = 1.4

    func start() {
        scheduleGameLoop()
        scheduleSpawn()
    }

    func stop() {
        gameTimer?.invalidate()
        spawnTimer?.invalidate()
    }

    // MARK: - Player

    func movePlayer(to x: Double) {
        let half = 30.0
        playerX = min(max(x, half), size.width - half)
    }

    func shoot() {
        guard phase == .playing else { return }
        let bullet = Bullet(position: CGPoint(x: playerX, y: size.height - 90))
        bullets.append(bullet)
    }

    // MARK: - Game Loop

    private func scheduleGameLoop() {
        gameTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.tick() }
        }
    }

    private func scheduleSpawn() {
        spawnTimer = Timer.scheduledTimer(withTimeInterval: spawnInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.spawnMeteor() }
        }
    }

    private func tick() {
        guard phase == .playing else { return }
        elapsed += 1.0 / 60.0

        // Level up every 15s
        let newLevel = Int(elapsed / 15) + 1
        if newLevel != level {
            level = newLevel
            updateDifficulty()
        }

        moveBullets()
        moveMeteors()
        checkCollisions()
    }

    private func updateDifficulty() {
        spawnTimer?.invalidate()
        spawnInterval = max(0.5, 1.4 - Double(level) * 0.12)
        scheduleSpawn()
    }

    // MARK: - Spawn

    private func spawnMeteor() {
        guard phase == .playing, size != .zero else { return }
        let x = Double.random(in: 40...(size.width - 40))
        let speed = Double.random(in: 150...250) + Double(level) * 20
        let size = Double.random(in: 28...48)
        meteors.append(Meteor(position: CGPoint(x: x, y: -40), speed: speed, size: size))
    }

    // MARK: - Movement

    private func moveBullets() {
        let speed = 480.0 / 60.0
        bullets = bullets.compactMap { bullet in
            var b = bullet
            b.position.y -= speed
            return b.position.y > -20 ? b : nil
        }
    }

    private func moveMeteors() {
        meteors = meteors.compactMap { meteor in
            var m = meteor
            m.position.y += m.speed / 60.0
            m.rotation += 1.5

            // Reached bottom → lose life
            if m.position.y > size.height + 40 {
                loseLife()
                return nil
            }
            return m
        }
    }

    // MARK: - Collisions

    private func checkCollisions() {
        var destroyedMeteorIds = Set<UUID>()
        var destroyedBulletIds = Set<UUID>()

        for bullet in bullets {
            for meteor in meteors {
                if destroyedMeteorIds.contains(meteor.id) { continue }
                let dx = bullet.position.x - meteor.position.x
                let dy = bullet.position.y - meteor.position.y
                let dist = (dx*dx + dy*dy).squareRoot()
                if dist < meteor.size / 1.6 {
                    destroyedMeteorIds.insert(meteor.id)
                    destroyedBulletIds.insert(bullet.id)
                    addExplosion(at: meteor.position)
                    score += max(1, Int(meteor.speed / 50))
                }
            }
        }

        // Player collision with meteors
        let playerPos = CGPoint(x: playerX, y: size.height - 80)
        for meteor in meteors {
            if destroyedMeteorIds.contains(meteor.id) { continue }
            let dx = playerPos.x - meteor.position.x
            let dy = playerPos.y - meteor.position.y
            if (dx*dx + dy*dy).squareRoot() < (meteor.size / 2 + 22) {
                destroyedMeteorIds.insert(meteor.id)
                addExplosion(at: playerPos)
                loseLife()
            }
        }

        meteors.removeAll { destroyedMeteorIds.contains($0.id) }
        bullets.removeAll { destroyedBulletIds.contains($0.id) }
    }

    // MARK: - Helpers

    private func addExplosion(at position: CGPoint) {
        let ex = Explosion(position: position)
        explosions.append(ex)
        // Remove after animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.explosions.removeAll { $0.id == ex.id }
        }
    }

    private func loseLife() {
        lives -= 1
        if lives <= 0 {
            phase = .over
            stop()
        }
    }
}
