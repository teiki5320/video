import SwiftUI

struct HomeView: View {
    @StateObject private var library = VideoLibrary()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HeaderBannerView()

                if library.recentVideos.isEmpty {
                    EmptyLibraryView()
                } else {
                    SectionView(title: "Récents", videos: library.recentVideos)
                    SectionView(title: "Favoris", videos: library.favoriteVideos)
                }
            }
            .padding(.bottom, 32)
        }
        .navigationTitle("Ma Vidéothèque")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    library.addSampleVideo()
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                }
            }
        }
    }
}

// MARK: - Header Banner

struct HeaderBannerView: View {
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [.purple, .indigo, .blue],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 200)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal)

            VStack(alignment: .leading, spacing: 6) {
                Text("Bienvenue")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
                Text("Votre studio vidéo")
                    .font(.title.bold())
                    .foregroundStyle(.white)
            }
            .padding(24)
        }
    }
}

// MARK: - Section

struct SectionView: View {
    let title: String
    let videos: [Video]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title2.bold())
                .padding(.horizontal)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(videos) { video in
                        NavigationLink(destination: VideoDetailView(video: video)) {
                            VideoCardView(video: video)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }
}

// MARK: - Empty State

struct EmptyLibraryView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "film.stack")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)
            Text("Aucune vidéo")
                .font(.title2.bold())
            Text("Appuyez sur + pour ajouter votre première vidéo.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(48)
    }
}
