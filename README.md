# 🎯 SpeakTiles - Multimodal AAC Web App

A modern, accessible communication board web application that works offline and can be installed as a Progressive Web App (PWA). Perfect for nonverbal or minimally verbal users to communicate using customizable tiles and text-to-speech.

## ✨ Features

- **🎯 Communication Board**: Tap tiles to build sentences and speak them aloud
- **🎤 Voice Input**: Use speech recognition to add words to your sentence
- **🔊 Text-to-Speech**: Built-in speech synthesis with multiple voice options
- **📱 PWA Ready**: Install on your device for offline use
- **🎨 Customizable**: Add/edit tiles, categories, colors, and emojis
- **🔗 Shareable**: Generate QR codes and shareable links
- **📁 Import/Export**: Save and load board configurations as JSON files
- **♿ Accessible**: Keyboard navigation and screen reader support
- **🌐 Offline First**: Works without internet connection
- **📱 Responsive**: Optimized for desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Installation
```bash
# Clone the repository
git clone https://github.com/hmerali/speaktiles.git
cd speaktiles

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

## 🎮 How to Use

1. **Build Sentences**: Tap tiles to add words to your phrase
2. **Speak**: Click "Speak" to hear your sentence
3. **Voice Input**: Click "Voice Input" and speak to add words
4. **Customize**: Right-click tiles to edit or add new ones
5. **Organize**: Create categories and organize your tiles
6. **Share**: Generate QR codes or links to share your board
7. **Install**: Use "Add to Home Screen" to install as a PWA

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: CSS Variables with High Contrast Support
- **PWA**: Service Worker with Offline Caching
- **Speech**: Web Speech API (Text-to-Speech & Speech Recognition)
- **QR Codes**: QRCode.js library
- **Storage**: Local Storage with JSON Import/Export
- **Notifications**: Sonner toast notifications

## 📁 Project Structure

```
speaktiles/
├── public/
│   ├── sw.js              # Service Worker
│   ├── manifest.webmanifest # PWA Manifest
│   └── icons/             # App Icons
├── src/
│   ├── App.jsx            # Main Application Component
│   └── main.jsx           # Application Entry Point
├── index.html             # HTML Template
├── package.json           # Dependencies & Scripts
└── README.md              # This File
```

## 🌟 Key Features Explained



### **Offline Functionality**
The service worker caches all assets and provides offline access to your communication boards.

### **Speech Recognition**
Uses the Web Speech API to convert your voice into text, adding words to your sentence.

### **Keyboard Navigation**
Full keyboard support for accessibility:
- **Tab**: Navigate between tiles
- **Enter/Space**: Select a tile
- **Delete/Backspace**: Edit a tile

### **Sharing System**
- **URL Sharing**: Board data is encoded in the URL hash
- **QR Codes**: Generate QR codes for easy sharing
- **JSON Export**: Save your board configuration as a file

## 🎨 Customization

### Adding New Tiles
1. Right-click on a tile or click "+ Tile"
2. Fill in the label, emoji, and optional color
3. Set a custom "Speak as" text if needed

### Creating Categories
1. Click "+ Category" to add a new category
2. Organize your tiles by theme or function
3. Switch between categories using the tabs

### Voice Settings
- Choose from available system voices
- Adjust speech rate and pitch
- Set language preferences

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click to install SpeakTiles as a desktop app

### Mobile
1. Open the app in your mobile browser
2. Use "Add to Home Screen" from the share menu
3. The app will work offline after installation

## 🌐 Browser Support

- **Chrome**: Full support (PWA, Speech Recognition, Offline)
- **Safari**: Full support (PWA, Speech Recognition, Offline)
- **Firefox**: Full support (PWA, Speech Recognition, Offline)
- **Edge**: Full support (PWA, Speech Recognition, Offline)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Inspired by AAC (Augmentative and Alternative Communication) needs
- Designed for accessibility and inclusivity
- PWA capabilities powered by modern web standards

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure your browser supports the required APIs

---

**Made with ❤️ for better communication accessibility**
