import { AppState, DailyLog, INITIAL_PROFILE, UserProfile } from '../types';

const STORAGE_KEY = 'meno_diary_v1';

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return { profile: INITIAL_PROFILE, logs: {} };
    }
    const parsed = JSON.parse(serialized);
    // Merge loaded profile with INITIAL_PROFILE to ensure new fields (like theme) are present
    return {
      ...parsed,
      profile: { ...INITIAL_PROFILE, ...parsed.profile }
    };
  } catch (e) {
    console.error('Failed to load state', e);
    return { profile: INITIAL_PROFILE, logs: {} };
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const saveLog = (log: DailyLog) => {
  const state = loadState();
  state.logs[log.date] = log;
  saveState(state);
  return state;
};

export const saveProfile = (profile: UserProfile) => {
  const state = loadState();
  state.profile = profile;
  saveState(state);
  return state;
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}