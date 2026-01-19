export type Mood = 'great' | 'normal' | 'hard';

export interface Symptom {
  id: string;
  name: string;
  category: 'physical' | 'emotional' | 'intimate';
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
}

export interface DailyLog {
  date: string; // ISO string YYYY-MM-DD
  mood: Mood;
  symptoms: string[]; // Array of symptom IDs
  medicationTaken: boolean;
  notes: string;
  timestamp: number;
  timeline?: TimelineEvent[]; // New field for timeline tracking
}

export interface NotificationSettings {
  enabled: boolean;
  dailyTime: string; // "20:00"
  reminderTypes: {
    daily: boolean;
    periodPrediction: boolean; // 5 days before projected
    medicationCheck: boolean; // Follow up
    inactivity: boolean; // "Skipped days"
  }
}

export interface UserProfile {
  name: string;
  isOnboarded: boolean;
  theme: 'light' | 'dark'; // New theme property
  notifications: NotificationSettings; // New notifications settings
  
  // 1. Biológico
  age: number;
  lastPeriodDate: string;
  surgicalHistory: string[]; // 'hysterectomy', 'oophorectomy', 'none'

  // 2. Sociodemográfico
  maritalStatus: string;
  occupation: string;

  // 3. Contextual
  hrtStatus: 'none' | 'systemic' | 'local' | 'phyto';
  hrtStartDate?: string; // New field for comparison dashboard

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
  CHAT = 'chat', // Added Chat Tab
}

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  isOnboarded: false,
  theme: 'light',
  notifications: {
    enabled: false,
    dailyTime: '20:00',
    reminderTypes: {
      daily: true,
      periodPrediction: false,
      medicationCheck: false,
      inactivity: true
    }
  },
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