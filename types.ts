export type Mood = 'great' | 'normal' | 'hard';

export interface Symptom {
  id: string;
  name: string;
  category: 'physical' | 'emotional' | 'intimate';
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  mood: Mood;
  symptoms: string[]; // Array of symptom IDs
  medicationTaken: boolean;
  notes: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  isOnboarded: boolean;
  theme: 'light' | 'dark'; // New theme property
  
  // 1. Biológico
  age: number;
  lastPeriodDate: string;
  surgicalHistory: string[]; // 'hysterectomy', 'oophorectomy', 'none'

  // 2. Sociodemográfico
  maritalStatus: string;
  occupation: string;

  // 3. Contextual
  hrtStatus: 'none' | 'systemic' | 'local' | 'phyto';

  // 4. História de Vida
  menopausePerception: string; // Free text or selected sentiment

  // 5. Relações
  supportNetwork: 'yes' | 'no' | 'partial';
  bodyImageFeeling: string;
  
  goals: string[]; // Mantido para compatibilidade futura
}

export interface AppState {
  profile: UserProfile;
  logs: Record<string, DailyLog>; // Keyed by date YYYY-MM-DD
}

export enum Tab {
  HOME = 'home',
  HISTORY = 'history',
  LEARN = 'learn',
  REPORT = 'report',
  SETTINGS = 'settings',
}

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  isOnboarded: false,
  theme: 'light',
  age: 45,
  lastPeriodDate: '',
  surgicalHistory: [],
  maritalStatus: '',
  occupation: '',
  hrtStatus: 'none',
  menopausePerception: '',
  supportNetwork: 'partial',
  bodyImageFeeling: '',
  goals: [],
};