// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "MemoryGame",
    platforms: [
        .iOS("16.0")
    ],
    targets: [
        .executableTarget(
            name: "MemoryGame",
            path: "Sources/MemoryGame"
        )
    ]
)
