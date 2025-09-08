# LoveWorld Praise App - PWA

A Progressive Web App (PWA) for managing praise and worship events, built with Next.js 15, React 19, and TypeScript.

## 🚀 Features

### PWA Capabilities
- **Installable**: Can be installed on mobile devices and desktop
- **Offline Access**: Works without internet connection
- **App-like Experience**: Native app feel with smooth animations
- **Responsive Design**: Optimized for all screen sizes

### Core Features
- **Praise Night Management**: Organize and manage praise night events
- **Song Management**: Complete CRUD operations for songs
- **Admin Panel**: Edit, add, and delete songs with real-time updates
- **Rehearsal Tracking**: Visual progress tracking with tick marks
- **Audio Player**: Built-in audio player for different song phases
- **Search & Filter**: Find songs quickly by title, writer, or lead singer
- **Table of Contents**: Easy navigation through song sections

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with PWA setup
│   ├── page.tsx                # Home page
│   └── pages/                  # Main app pages
│       ├── praise-night/       # Praise Night display page
│       └── admin/              # Admin management page
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── Navigation.tsx          # Main navigation
│   └── PWAInstall.tsx         # PWA install prompt
└── data/
    └── songs.ts               # Centralized song data management
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **PWA**: next-pwa + Workbox
- **State Management**: React hooks (useState, useMemo)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loveworldpraise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
```bash
npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for the "Install App" banner or "Add to Home Screen" option
3. Follow the prompts to install

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" when prompted

## 🎵 Using the App

### Praise Night Page
- View all songs organized by sections
- Use search to find specific songs
- Click on songs to see details (remarks, audio, lyrics)
- Track rehearsal progress with visual indicators

### Admin Page
- Add new songs with complete details
- Edit existing song information
- Delete songs you no longer need
- Manage song sections and status

## 🔧 Customization

### Adding New Songs
1. Go to the Admin page
2. Click "Add New Song"
3. Fill in the song details
4. Save to add to the database

### Managing Song Data
All song data is centralized in `src/data/songs.ts`. You can:
- Add new songs programmatically
- Update existing songs
- Modify song structure
- Add new sections

### Styling
The app uses Tailwind CSS for styling. Key files:
- `src/app/globals.css` - Global styles and CSS variables
- Component files - Individual component styles

## 📊 Data Structure

### Song Object
```typescript
interface Song {
  sn: number;                    // Song number
  section: string;               // Section category
  status: "HEARD" | "UNHEARD";   // Rehearsal status
  title: string;                 // Song title
  writer: string;                // Song writer
  leadSinger: string;            // Lead singer
  page: number;                  // Page number
  duration: string;              // Song duration
  rehearsals: {                  // Rehearsal tracking
    count: number;
    extra: number;
  };
  key: string;                   // Musical key
  remarks: Array<{               // Pastor remarks
    date: string;
    text: string;
  }>;
  audioLinks: {                  // Audio files
    phases: Array<{
      name: string;
      fullMix: string;
      soprano: string;
      tenor: string;
      alto: string;
      instrumentation: string;
    }>;
  };
  lyrics: {                      // Song lyrics
    start: string;
    continue: string;
  };
  instrumentation: string;        // Instrumentation details
  conductor: string;             // Conductor name
}
```

## 🔄 PWA Features

### Service Worker
- Caches app resources for offline access
- Automatically updates when new versions are available
- Handles network requests with fallback strategies

### Manifest
- Defines app metadata and icons
- Enables installation prompts
- Sets display mode and theme colors

### Offline Support
- App works without internet connection
- Cached resources load instantly
- Graceful degradation for network requests

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push
3. PWA features work out of the box

### Other Platforms
- Netlify
- AWS Amplify
- Firebase Hosting
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for LoveWorld Praise Ministry**