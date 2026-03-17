// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Valdoryn",
    platforms: [.iOS("16.0")],
    products: [
        .iOSApplication(
            name: "Valdoryn",
            targets: ["Valdoryn"],
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "Valdoryn",
            path: "Sources"
        )
    ]
)
