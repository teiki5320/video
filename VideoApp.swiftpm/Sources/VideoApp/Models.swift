import SwiftUI

// MARK: - Video Model

struct Video: Identifiable {
    let id: UUID
    var title: String
    var durationSeconds: Int
    var date: Date
    var isFavorite: Bool
    var views: Int
    var format: String
    var description: String
    var gradientColors: [Color]

    var durationFormatted: String {
        String(format: "%d:%02d", durationSeconds / 60, durationSeconds % 60)
    }

    var dateFormatted: String {
        date.formatted(date: .abbreviated, time: .omitted)
    }

    var thumbnailGradient: LinearGradient {
        LinearGradient(
            colors: gradientColors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// MARK: - Video Library

@MainActor
class VideoLibrary: ObservableObject {
    @Published var videos: [Video] = Video.samples

    var recentVideos: [Video] {
        videos.sorted { $0.date > $1.date }
    }

    var favoriteVideos: [Video] {
        videos.filter { $0.isFavorite }
    }

    func addSampleVideo() {
        let newVideo = Video(
            id: UUID(),
            title: "Nouvelle vidéo \(videos.count + 1)",
            durationSeconds: Int.random(in: 30...300),
            date: Date(),
            isFavorite: false,
            views: 0,
            format: "MP4",
            description: "Vidéo ajoutée depuis l'application.",
            gradientColors: [
                [.teal, .green],
                [.pink, .orange],
                [.indigo, .purple],
                [.blue, .cyan]
            ].randomElement()!
        )
        videos.insert(newVideo, at: 0)
    }
}

// MARK: - Sample Data

extension Video {
    static let samples: [Video] = [
        Video(
            id: UUID(),
            title: "Vacances d'été 2024",
            durationSeconds: 187,
            date: Calendar.current.date(byAdding: .day, value: -2, to: Date())!,
            isFavorite: true,
            views: 24,
            format: "MP4",
            description: "Un beau souvenir de nos vacances en famille au bord de la mer.",
            gradientColors: [.orange, .pink]
        ),
        Video(
            id: UUID(),
            title: "Présentation projet",
            durationSeconds: 342,
            date: Calendar.current.date(byAdding: .day, value: -5, to: Date())!,
            isFavorite: false,
            views: 8,
            format: "MOV",
            description: "Présentation de notre projet de fin d'année.",
            gradientColors: [.blue, .indigo]
        ),
        Video(
            id: UUID(),
            title: "Anniversaire de Marie",
            durationSeconds: 93,
            date: Calendar.current.date(byAdding: .day, value: -10, to: Date())!,
            isFavorite: true,
            views: 41,
            format: "MP4",
            description: "Les meilleurs moments de la fête d'anniversaire.",
            gradientColors: [.purple, .pink]
        ),
        Video(
            id: UUID(),
            title: "Tutoriel cuisine",
            durationSeconds: 520,
            date: Calendar.current.date(byAdding: .day, value: -15, to: Date())!,
            isFavorite: false,
            views: 102,
            format: "MP4",
            description: "Recette de la tarte tatin traditionnelle.",
            gradientColors: [.green, .teal]
        )
    ]
}
