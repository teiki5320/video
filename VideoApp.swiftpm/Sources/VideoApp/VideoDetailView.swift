import SwiftUI

struct VideoDetailView: View {
    let video: Video
    @State private var isPlaying = false
    @State private var progress: Double = 0.0
    @State private var isFavorite: Bool

    init(video: Video) {
        self.video = video
        _isFavorite = State(initialValue: video.isFavorite)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Player placeholder
                ZStack {
                    video.thumbnailGradient
                        .frame(maxWidth: .infinity)
                        .frame(height: 240)

                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            isPlaying.toggle()
                            if isPlaying { startProgress() }
                        }
                    } label: {
                        Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                            .font(.system(size: 72))
                            .foregroundStyle(.white)
                            .shadow(radius: 8)
                            .scaleEffect(isPlaying ? 1.1 : 1.0)
                            .animation(.spring(response: 0.3), value: isPlaying)
                    }
                }

                // Progress bar
                VStack(spacing: 4) {
                    ProgressView(value: progress)
                        .tint(.white)
                    HStack {
                        Text(progressTime)
                        Spacer()
                        Text(video.durationFormatted)
                    }
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.8))
                }
                .padding()
                .background(Color.black.opacity(0.7))

                // Info section
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(video.title)
                                .font(.title2.bold())
                            Text(video.dateFormatted)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button {
                            withAnimation { isFavorite.toggle() }
                        } label: {
                            Image(systemName: isFavorite ? "heart.fill" : "heart")
                                .font(.title2)
                                .foregroundStyle(isFavorite ? .red : .secondary)
                        }
                    }

                    Divider()

                    // Stats row
                    HStack(spacing: 0) {
                        StatView(icon: "eye", label: "Vues", value: "\(video.views)")
                        Divider().frame(height: 40)
                        StatView(icon: "clock", label: "Durée", value: video.durationFormatted)
                        Divider().frame(height: 40)
                        StatView(icon: "film", label: "Format", value: video.format)
                    }
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Description
                    if !video.description.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Description")
                                .font(.headline)
                            Text(video.description)
                                .font(.body)
                                .foregroundStyle(.secondary)
                        }
                    }

                    // Action buttons
                    HStack(spacing: 12) {
                        ActionButton(icon: "square.and.arrow.up", label: "Partager", color: .blue)
                        ActionButton(icon: "pencil", label: "Éditer", color: .orange)
                        ActionButton(icon: "trash", label: "Supprimer", color: .red)
                    }
                }
                .padding()
            }
        }
        .ignoresSafeArea(edges: .top)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var progressTime: String {
        let seconds = Int(progress * Double(video.durationSeconds))
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }

    private func startProgress() {
        guard isPlaying else { return }
        withAnimation(.linear(duration: Double(video.durationSeconds) * (1 - progress))) {
            progress = 1.0
        }
    }
}

// MARK: - Sub-views

struct StatView: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
    }
}

struct ActionButton: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        Button {
            // Action
        } label: {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.title2)
                Text(label)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(color.opacity(0.12))
            .foregroundStyle(color)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
