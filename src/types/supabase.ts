// Type definitions for Supabase data structures

// User Profile Types
export interface UserProfile {
  id: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  gender?: 'Male' | 'Female';
  birthday?: string;
  region?: string;
  zone?: string;
  church?: string;
  designation?: 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer';
  administration?: 'Coordinator' | 'Assistant Coordinator' | 'Secretary' | 'Treasurer' | 'Member';
  social_provider?: 'google' | 'kingschat' | 'email';
  social_id?: string;
  profile_image_url?: string;
  profile_completed: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: string;
  user_id: string;
  group_name: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string;
  status: 'Present' | 'Late' | 'Absent';
  check_in_time?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_name: string;
  achievement_description?: string;
  earned_date: string;
  created_at: string;
}

// Auth Types
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProfileCompletionData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: 'Male' | 'Female';
  birthday?: string;
  phoneNumber?: string;
  region?: string;
  zone?: string;
  church?: string;
  designation?: 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer';
  administration?: 'Coordinator' | 'Assistant Coordinator' | 'Secretary' | 'Treasurer' | 'Member';
}

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
  id?: number; // Database ID for the song
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
  rehearsalCount?: number; // Manual rehearsal count
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
  type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'song-details' | 'personnel' | 'music-details';
  title: string;
  description: string;
  old_value: string;
  new_value: string;
  created_by: string;
  date: string;
  version: string;
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


