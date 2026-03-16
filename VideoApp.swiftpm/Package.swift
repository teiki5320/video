// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "VideoApp",
    platforms: [
        .iOS("16.0")
    ],
    targets: [
        .executableTarget(
            name: "VideoApp",
            path: "Sources/VideoApp"
        )
    ]
)
