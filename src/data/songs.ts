// Shared songs data - both admin and praise night pages use this
export interface PraiseNight {
  id: number;
  name: string;
  date: string;
  location: string;
  songs: Song[];
}

export interface Song {
  sn: number;
  title: string;
  writer?: string;
  leadSinger?: string;
  page?: number;
  section?: string;
  status: 'HEARD' | 'NOT_HEARD';
  duration?: string;
  key?: string;
  rehearsals?: {
    count: number;
    extra: number;
  };
  remarks?: Array<{
    date: string;
    text: string;
  }>;
  audioLinks?: {
    phases: Array<{
      name: string;
      fullMix?: string;
      soprano?: string;
      tenor?: string;
      alto?: string;
      instrumentation?: string;
    }>;
  };
  lyrics?: {
    start: string;
    continue: string;
  };
  instrumentation?: string;
  conductor?: string;
}

// Load songs from localStorage or use initial data
const loadSongs = (): Song[] => {
  if (typeof window === 'undefined') return [];
  
  const savedSongs = localStorage.getItem('praiseNightSongs');
  if (savedSongs) {
    try {
      return JSON.parse(savedSongs);
    } catch (e) {
      console.error('Failed to parse saved songs', e);
      return [];
    }
  }
  return [];
};

// Save songs to localStorage
const saveSongs = (songs: Song[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('praiseNightSongs', JSON.stringify(songs));
  }
};

// Sample data - only used if no data in localStorage
const initialSongs: Song[] = [
  {
    sn: 1,
    section: "Previous Praise Songs Rehearsed But Not Ministered",
    status: "HEARD",
    title: "More Than Life To Me",
    writer: "Evanj",
    leadSinger: "Pastor Saki",
    page: 4,
    duration: "5:43",
    rehearsals: { count: 6, extra: 1 },
    key: "C → C#",
    remarks: [
      { date: "25/AUG/2023", text: "Song started beautifully. Maintain softness; avoid loudness." },
      { date: "06/SEP/2023", text: "Keep tone/texture consistent; no harshness." },
      { date: "08/SEP/2023", text: "Choir match the soloist's emotion; maintain tempo." },
    ],
    audioLinks: {
      phases: [
        { name: "Phase 1", fullMix: "", soprano: "", tenor: "", alto: "", instrumentation: "" },
        { name: "Phase 2", fullMix: "", soprano: "", tenor: "", alto: "", instrumentation: "" },
      ],
    },
    lyrics: {
      start: "I feel your presence, Lord...",
      continue: "Your name is great, O Lord...",
    },
    instrumentation: "",
    conductor: "",
  },
  {
    sn: 2,
    section: "Previous Praise Songs Rehearsed But Not Ministered",
    status: "HEARD",
    title: "The Father of Glory",
    writer: "Vashawn",
    leadSinger: "Vashawn",
    page: 6,
    duration: "5:07",
    rehearsals: { count: 5, extra: 0 },
    key: "E",
    remarks: [
      { date: "25/AUG/2023", text: "Song tempo was increased a little bit, and song was redone a little faster." },
      { date: "08/SEP/2023", text: "That was very good! Very beautiful!" },
    ],
    audioLinks: {
      phases: [
        { name: "Phase 1", fullMix: "", soprano: "", tenor: "", alto: "", instrumentation: "" },
      ],
    },
    lyrics: { start: "My mind marvels at the extravagance of your love...", continue: "Father of Glory, my life you've made so beautiful..." },
    instrumentation: "",
    conductor: "",
  },
];

let songs: Song[] = [];

// Initialize songs
if (typeof window !== 'undefined') {
  const loadedSongs = loadSongs();
  songs = loadedSongs.length > 0 ? loadedSongs : initialSongs;
  
  // Save initial songs if none exist
  if (loadedSongs.length === 0 && initialSongs.length > 0) {
    saveSongs(initialSongs);
  }
}

// Praise Nights data
export const praiseNights: PraiseNight[] = [
  {
    id: 16,
    name: "Praise Night 16",
    date: "9th September 2023",
    location: "Oasis Studio",
    songs: songs
  },
  {
    id: 17,
    name: "Praise Night 17",
    date: "23rd September 2023", 
    location: "Oasis Studio",
    songs: [
      {
        sn: 1,
        section: "New Songs",
        status: "NOT_HEARD",
        title: "Amazing Grace",
        writer: "John Newton",
        leadSinger: "Sarah",
        page: 1,
        duration: "4:30",
        rehearsals: { count: 0, extra: 0 },
        key: "G",
        remarks: [],
        audioLinks: { phases: [] },
        lyrics: { start: "", continue: "" },
        instrumentation: "",
        conductor: "",
      }
    ]
  }
];

let currentPraiseNightId = 16;

// Functions to manage praise nights
export function getCurrentPraiseNight(): PraiseNight {
  return praiseNights.find(pn => pn.id === currentPraiseNightId) || praiseNights[0];
}

export function setCurrentPraiseNight(id: number) {
  currentPraiseNightId = id;
}

export function getAllPraiseNights(): PraiseNight[] {
  return praiseNights;
}

export function addPraiseNight(praiseNight: Omit<PraiseNight, 'id'>) {
  const newId = Math.max(...praiseNights.map(pn => pn.id)) + 1;
  const newPraiseNight = { ...praiseNight, id: newId };
  praiseNights.push(newPraiseNight);
  return newPraiseNight;
}

// Function to add a new song
export const addSong = (song: Song) => {
  songs.push(song);
  // Save to localStorage
  saveSongs(songs);
};

// Function to update a song
export const updateSong = (sn: number, updates: Partial<Song>): Song | undefined => {
  const index = songs.findIndex(song => song.sn === sn);
  if (index === -1) return undefined;
  
  const updatedSong = { ...songs[index], ...updates };
  songs[index] = updatedSong;
  
  // Save to localStorage
  saveSongs(songs);
  
  return updatedSong;
};

export function deleteSong(sn: number) {
  const index = songs.findIndex(s => s.sn === sn);
  if (index !== -1) {
    songs.splice(index, 1);
    // Save to localStorage
    saveSongs(songs);
    return true;
  }
  return false;
}

export function getSongs() {
  const currentPraiseNight = getCurrentPraiseNight();
  return currentPraiseNight.songs;
}

export function getCurrentSongs() {
  return getCurrentPraiseNight().songs;
}


