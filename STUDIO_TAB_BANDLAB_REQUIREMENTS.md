# 🎙️ STUDIO TAB - BandLab Mobile Design Requirements

## 📱 **WHAT YOU WANT (Based on Screenshot)**

### **Visual Design:**
- ✅ **Dark Theme**: Black background (#1a1a1a)
- ✅ **Horizontal Scrolling Timeline**: Waveforms scroll left-to-right
- ✅ **Color-Coded Tracks**: Each track has unique vibrant color
- ✅ **Waveform Visualization**: Real-time audio waveforms (not bars)
- ✅ **Track List (Left Side)**: Vertical list of tracks with icons
- ✅ **Timeline (Right Side)**: Horizontal scrolling waveform area
- ✅ **Bottom Transport Bar**: Play, Record, Stop controls at bottom
- ✅ **Full-Screen Mode**: Takes over entire screen (no bottom nav)

---

## 🎨 **BANDLAB MOBILE LAYOUT (From Screenshot)**

### **Screen 1: Track List View**
```
┌─────────────────────────────────────────┐
│  ← Back    New Project        ☁️ ⚙️    │ ← Top Bar (Dark)
├─────────────────────────────────────────┤
│                                          │
│  🔴 Voice                ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 1 (Red)
│     Lead Vocals                          │
│                                          │
│  🟣 Bass                 ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 2 (Purple)
│     Bass Line                            │
│                                          │
│  🟢 Guitar               ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 3 (Green)
│     Rhythm Guitar                        │
│                                          │
│  🟡 Khala Vox            ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 4 (Yellow)
│     AI Voice                             │
│                                          │
│  🔵 Female Vox           ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 5 (Blue)
│     AI Voice                             │
│                                          │
│  🟣 Lead                 ▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Track 6 (Purple)
│     Synth Lead                           │
│                                          │
│  ➕ Add Track                            │ ← Add Button
│                                          │
├─────────────────────────────────────────┤
│  ⚡ ⏮ ◀ ⏺ ▶ ⏭ 🔔                      │ ← Transport Controls
└─────────────────────────────────────────┘
```

### **Screen 2: Track Detail View (Modal)**
```
┌─────────────────────────────────────────┐
│              Deep Space            ✓ ✕  │ ← Modal Header
├─────────────────────────────────────────┤
│                                          │
│         [Album Art / Waveform]           │
│                                          │
│  🎤 Lead                                 │
│  🎸 For                                  │
│  🎹 You                                  │
│                                          │
│  ✏️ Customize                            │
│                                          │
├─────────────────────────────────────────┤
│  🎧  🎛️  AutoPitch  🎵  🎚️             │ ← Effects Bar
└─────────────────────────────────────────┘
```

### **Screen 3: Waveform Detail View**
```
┌─────────────────────────────────────────┐
│  ← Back    Bass            🎧 ✏️ ⚙️    │ ← Track Header
├─────────────────────────────────────────┤
│                                          │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ← Large Waveform
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   (Purple/Blue)
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│              │                           │ ← Playhead
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                          │
├─────────────────────────────────────────┤
│  ⚡ ⏮ ◀ ⏺ ▶ ⏭ 🔔                      │ ← Transport Controls
└─────────────────────────────────────────┘
```

---

## 🎯 **KEY FEATURES FROM BANDLAB**

### **1. Track List (Left Panel)**
- ✅ Color dot indicator (🔴 🟣 🟢 🟡 🔵)
- ✅ Track name (editable)
- ✅ Track type/description (Lead Vocals, Bass Line, etc.)
- ✅ Mini waveform preview (horizontal bars)
- ✅ Add Track button at bottom

### **2. Waveform Display**
- ✅ **Horizontal scrolling** (not vertical)
- ✅ **Smooth waveform** (not individual bars)
- ✅ **Color matches track** (red, purple, green, etc.)
- ✅ **Playhead indicator** (vertical line)
- ✅ **Zoom in/out** capability

### **3. Transport Controls (Bottom Bar)**
- ✅ **Dark background** (#2a2a2a)
- ✅ **Icon buttons**:
  - ⚡ Effects/Tools
  - ⏮ Previous
  - ◀ Rewind
  - ⏺ Record (red, large, center)
  - ▶ Play (large, center)
  - ⏭ Forward
  - 🔔 Notifications/Metronome
- ✅ **Large center button** (Play or Record)
- ✅ **Fixed at bottom** (always visible)

### **4. Top Bar**
- ✅ **Back button** (←)
- ✅ **Project name** (center)
- ✅ **Cloud sync icon** (☁️)
- ✅ **Settings icon** (⚙️)
- ✅ **Dark theme** (#2a2a2a)

### **5. Track Colors**
```javascript
const trackColors = {
  voice: '#ff4444',      // Red
  bass: '#8b5cf6',       // Purple
  guitar: '#10b981',     // Green
  drums: '#f59e0b',      // Yellow/Orange
  piano: '#3b82f6',      // Blue
  synth: '#ec4899',      // Pink
  lead: '#a855f7',       // Light Purple
  harmony: '#06b6d4',    // Cyan
}
```

---

## ❌ **WHAT YOU CURRENTLY HAVE (Issues)**

### **Current Implementation:**
- ❌ **Light theme** (white/gray background) - Should be dark
- ❌ **Vertical track list** - Should be horizontal scrolling
- ❌ **Bar visualization** (60 bars) - Should be smooth waveform
- ❌ **No horizontal scrolling** - Timeline should scroll
- ❌ **Transport at bottom** but wrong style
- ❌ **Not full-screen** - Should hide bottom nav
- ❌ **No track detail modal** - Should open on track click
- ❌ **No effects panel** - Should have effects bar

---

## ✅ **WHAT NEEDS TO BE BUILT**

### **1. Dark Theme Layout**
```css
.studio-container {
  background: #1a1a1a;
  color: white;
  height: 100vh;
  overflow: hidden;
}

.top-bar {
  background: #2a2a2a;
  height: 60px;
  border-bottom: 1px solid #333;
}

.transport-bar {
  background: #2a2a2a;
  height: 80px;
  border-top: 1px solid #333;
  position: fixed;
  bottom: 0;
}
```

### **2. Track List Component**
```jsx
<div className="track-list">
  {tracks.map(track => (
    <div className="track-item" onClick={() => openTrackDetail(track)}>
      <div className="track-color" style={{ background: track.color }} />
      <div className="track-info">
        <div className="track-name">{track.name}</div>
        <div className="track-type">{track.type}</div>
      </div>
      <div className="track-waveform-mini">
        {/* Mini waveform preview */}
      </div>
    </div>
  ))}
  <button className="add-track-btn">➕ Add Track</button>
</div>
```

### **3. Horizontal Scrolling Timeline**
```jsx
<div className="timeline-container">
  <div className="timeline-scroll" ref={timelineRef}>
    {tracks.map(track => (
      <div className="timeline-track">
        <canvas 
          ref={el => canvasRefs.current[track.id] = el}
          className="waveform-canvas"
        />
      </div>
    ))}
  </div>
  <div className="playhead" style={{ left: `${playheadPosition}px` }} />
</div>
```

### **4. Real Waveform Visualization**
```javascript
// Use Canvas API to draw actual waveforms
const drawWaveform = (canvas, audioBuffer, color) => {
  const ctx = canvas.getContext('2d');
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  
  ctx.fillStyle = color;
  for (let i = 0; i < canvas.width; i++) {
    const min = Math.min(...data.slice(i * step, (i + 1) * step));
    const max = Math.max(...data.slice(i * step, (i + 1) * step));
    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
};
```

### **5. Transport Controls**
```jsx
<div className="transport-bar">
  <button className="transport-btn">⚡</button>
  <button className="transport-btn">⏮</button>
  <button className="transport-btn">◀</button>
  <button className="transport-btn-large record">⏺</button>
  <button className="transport-btn-large play">▶</button>
  <button className="transport-btn">⏭</button>
  <button className="transport-btn">🔔</button>
</div>
```

---

## 🔗 **FIREBASE INTEGRATION**

### **Studio Projects Collection:**
```javascript
'audio_lab_studio_projects' → {
  id: 'proj_123',
  userId: 'user_456',
  name: 'New Project',
  bpm: 120,
  timeSignature: '4/4',
  tracks: [
    {
      id: 'track_1',
      name: 'Voice',
      type: 'Lead Vocals',
      color: '#ff4444',
      audioUrl: 'https://cloudinary.com/...',
      cloudinaryId: 'audio_123',
      volume: 80,
      pan: 0,
      muted: false,
      solo: false,
      effects: {
        reverb: 0,
        delay: 0,
        eq: { low: 0, mid: 0, high: 0 }
      }
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Save Project:**
```javascript
const saveStudioProject = async (projectData) => {
  await FirebaseDatabaseService.createDocument(
    'audio_lab_studio_projects',
    projectData
  );
};
```

### **Load Project:**
```javascript
const loadStudioProject = async (projectId) => {
  const project = await FirebaseDatabaseService.getDocument(
    'audio_lab_studio_projects',
    projectId
  );
  setTracks(project.tracks);
  setBpm(project.bpm);
};
```

---

## 🎵 **AUDIO RECORDING & STORAGE**

### **Record Track:**
```javascript
// 1. Record audio using MediaRecorder
const recordTrack = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks = [];
  
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    
    // 2. Upload to Cloudinary
    const result = await uploadAudioToCloudinary(audioBlob);
    
    // 3. Add track to project
    const newTrack = {
      id: Date.now().toString(),
      name: 'Voice',
      audioUrl: result.url,
      cloudinaryId: result.publicId,
      color: '#ff4444'
    };
    
    setTracks([...tracks, newTrack]);
  };
  
  mediaRecorder.start();
};
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

- [ ] **Dark theme** (#1a1a1a background)
- [ ] **Horizontal scrolling timeline**
- [ ] **Real waveform visualization** (Canvas API)
- [ ] **Track list with color dots**
- [ ] **Transport controls** (bottom bar)
- [ ] **Full-screen mode** (hide bottom nav)
- [ ] **Track detail modal**
- [ ] **Effects panel**
- [ ] **Real audio recording** (MediaRecorder)
- [ ] **Cloudinary upload**
- [ ] **Firebase save/load projects**
- [ ] **Export to MP3/WAV**
- [ ] **Playhead animation**
- [ ] **Zoom in/out timeline**
- [ ] **Mute/Solo/Record arm per track**

---

**Ready to rebuild the Studio Tab with BandLab design! 🎙️**

