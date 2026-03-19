# Custom Quran Player

A cross-platform mobile application (iOS and Android) built with **React Native (Expo)** for reading the Quran and listening to custom recitations.

## Features

### 📖 Quran Reading
- Display Quran text in Uthmani Hafs script
- Support for multiple display styles:
  - **Plain Uthmani** — clean, distraction-free reading
  - **Tajweed Colors** — color-coded tajweed rules
  - **High Contrast** — yellow on black for accessibility
- Adjustable Arabic font size (Small / Medium / Large / XL)
- Surah navigation via bottom drawer picker
- Highlighted currently-playing ayah

### 🎙 Custom Reciter Audio
- Add multiple custom reciters
- Upload MP3/WAV audio files per Surah/Ayah
- File naming convention: `001_001.mp3` (surah_ayah)
- Switch between reciters instantly

### 🔊 Audio Playback
- Play, Pause, Stop controls
- Next Ayah / Previous Ayah navigation
- Loop single Ayah or entire Surah
- Background audio playback (iOS & Android)
- Audio sync with Ayah highlighting

### ⏩ Playback Speed
- Speed options: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- Maintains proper pitch during speed changes

### 🔖 Bookmarks
- Bookmark any Ayah with one tap
- View all bookmarks with quick navigation
- Bookmarks persist locally across app restarts

### ⚙️ Settings
- Dark mode / Light mode
- Quran display style selection
- Arabic font size adjustment
- Data management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 55 |
| Navigation | React Navigation v7 (Bottom Tabs + Native Stack) |
| Audio | expo-av (with background playback) |
| File Picker | expo-document-picker |
| File System | expo-file-system |
| Storage | @react-native-async-storage/async-storage |
| Icons | @expo/vector-icons (Ionicons) |
| Safe Areas | react-native-safe-area-context |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on device

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with **Expo Go** on your phone

## Project Structure

```
q-mobile-app/
├── App.js                          # App entry point
├── app.json                        # Expo configuration
├── src/
│   ├── context/
│   │   ├── AppContext.js           # Global state (settings, reciters, bookmarks)
│   │   └── AudioContext.js         # Audio playback engine
│   ├── navigation/
│   │   └── AppNavigator.js         # Bottom tab + stack navigator
│   ├── screens/
│   │   ├── HomeScreen.js           # Surah list + search
│   │   ├── ReadScreen.js           # Quran reader
│   │   ├── AudioScreen.js          # Audio player + reciter management
│   │   ├── BookmarksScreen.js      # Saved bookmarks
│   │   └── SettingsScreen.js       # App settings
│   ├── data/
│   │   ├── surahs.js               # All 114 surah metadata
│   │   └── quranData.js            # Sample ayah text data
│   └── styles/
│       └── theme.js                # Colors, typography, spacing
└── assets/                         # App icons and splash screen
```

## Audio File Format

To use custom reciter audio:

1. Open the **Audio** tab
2. Tap **New Reciter** to create a reciter profile
3. Tap **Choose Audio File** to upload
4. Files should be named: `{surah}_{ayah}.mp3`
   - Example: `001_001.mp3` → Surah 1, Ayah 1
   - Example: `114_006.mp3` → Surah 114, Ayah 6

Supported formats: MP3, WAV, M4A

## Quran Data

The app currently includes full text for sample surahs:
- **Surah 1** — Al-Fatihah (7 ayahs)
- **Surah 36** — Ya-Sin (sample)
- **Surah 67** — Al-Mulk (sample)
- **Surah 112** — Al-Ikhlas (4 ayahs)
- **Surah 113** — Al-Falaq (5 ayahs)
- **Surah 114** — An-Nas (6 ayahs)

Full Quran text integration can be added via the [Quran.com API](https://api.quran.com/api/v4) or a local SQLite database.

## License

This project is for personal and educational use. Quran text is provided in Uthmani Hafs script.
