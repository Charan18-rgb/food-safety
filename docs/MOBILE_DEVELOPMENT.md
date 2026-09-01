# FoodGrade Mobile Development

## Requirements
- **Node.js**: 22.13.x minimum
- **Package Manager**: pnpm 11.x
- **Android Studio**: Required for local Android builds (Android SDK, adb).
- **Java/JDK**: Compatible with Expo/React Native SDK 57 (Java 17/21).

## Architecture
- **Framework**: Expo SDK 57
- **Location**: pps/mobile/
- **Routing**: Expo Router
- **Build**: Local Android development build

## Quick Start
1. Install dependencies from workspace root:
   `ash
   pnpm install
   `
2. Start Metro Bundler:
   `ash
   cd apps/mobile
   npm run start
   `
3. Run Local Android Build (requires physical device or emulator connected):
   `ash
   npm run android
   `

## Monorepo
The mobile application uses the standard Expo automatic monorepo resolution (via expo/metro-config). It directly imports the @foodgrade/* packages using pnpm workspaces.
