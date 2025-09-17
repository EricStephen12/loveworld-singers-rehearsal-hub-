// Type definitions for Supabase data structures

export interface PraiseNight {
  id: number;
  name: string;
  date: string;
  location: string;
  category: 'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive';
  bannerImage?: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  songs: PraiseNightSong[];
}

export interface PraiseNightSong {
  title: string;
  status: 'heard' | 'unheard';
  category: string;
  praiseNightId: number;
  leadSinger?: string;
  writer?: string;
  conductor?: string;
  key?: string;
  tempo?: string;
  leadKeyboardist?: string;
  leadGuitarist?: string;
  drummer?: string;
  lyrics?: string;
  solfas?: string;
  audioFile?: string;
  mediaId?: number; // Reference to media table for uploaded audio files
  comments: Comment[];
  history: HistoryEntry[];
}

export interface Comment {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface HistoryEntry {
  id: string;
  type: 'lyrics' | 'solfas' | 'audio' | 'comment' | 'metadata';
  content: string;
  date: string;
  version: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


