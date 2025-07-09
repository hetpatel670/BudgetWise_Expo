import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToStorage, loadFromStorage } from '../../utils/storage';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  dateFormat: string;
  timezone: string;
}

export interface NotificationSettings {
  budgetAlerts: boolean;
  transactionReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface SecuritySettings {
  biometricAuth: boolean;
  pinCode: string;
  autoLock: boolean;
  autoLockTime: number; // minutes
  dataEncryption: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

export interface PreferencesSettings {
  defaultTransactionType: 'income' | 'expense';
  defaultCategory: string;
  showDecimalPlaces: boolean;
  groupTransactionsByDate: boolean;
  showCategoryIcons: boolean;
  enableQuickActions: boolean;
}

interface SettingsState {
  profile: UserProfile;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
  preferences: PreferencesSettings;
}

const initialState: SettingsState = {
  profile: loadFromStorage('profile') || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
  },
  notifications: loadFromStorage('notifications') || {
    budgetAlerts: true,
    transactionReminders: true,
    weeklyReports: true,
    monthlyReports: true,
    pushNotifications: true,
    emailNotifications: false,
  },
  security: loadFromStorage('security') || {
    biometricAuth: false,
    pinCode: '',
    autoLock: true,
    autoLockTime: 5,
    dataEncryption: true,
  },
  appearance: loadFromStorage('appearance') || {
    theme: 'system',
    primaryColor: '#3B82F6',
    fontSize: 'medium',
    language: 'en',
  },
  preferences: loadFromStorage('preferences') || {
    defaultTransactionType: 'expense',
    defaultCategory: 'Others',
    showDecimalPlaces: true,
    groupTransactionsByDate: true,
    showCategoryIcons: true,
    enableQuickActions: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
      saveToStorage('profile', state.profile);
    },
    updateNotifications: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
      saveToStorage('notifications', state.notifications);
    },
    updateSecurity: (state, action: PayloadAction<Partial<SecuritySettings>>) => {
      state.security = { ...state.security, ...action.payload };
      saveToStorage('security', state.security);
    },
    updateAppearance: (state, action: PayloadAction<Partial<AppearanceSettings>>) => {
      state.appearance = { ...state.appearance, ...action.payload };
      saveToStorage('appearance', state.appearance);
    },
    updatePreferences: (state, action: PayloadAction<Partial<PreferencesSettings>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      saveToStorage('preferences', state.preferences);
    },
    resetSettings: (state) => {
      state.profile = initialState.profile;
      state.notifications = initialState.notifications;
      state.security = initialState.security;
      state.appearance = initialState.appearance;
      state.preferences = initialState.preferences;
      
      saveToStorage('profile', state.profile);
      saveToStorage('notifications', state.notifications);
      saveToStorage('security', state.security);
      saveToStorage('appearance', state.appearance);
      saveToStorage('preferences', state.preferences);
    },
  },
});

export const {
  updateProfile,
  updateNotifications,
  updateSecurity,
  updateAppearance,
  updatePreferences,
  resetSettings,
} = settingsSlice.actions;

// Selectors
export const selectProfile = (state: { settings: SettingsState }) => state.settings.profile;
export const selectNotifications = (state: { settings: SettingsState }) => state.settings.notifications;
export const selectSecurity = (state: { settings: SettingsState }) => state.settings.security;
export const selectAppearance = (state: { settings: SettingsState }) => state.settings.appearance;
export const selectPreferences = (state: { settings: SettingsState }) => state.settings.preferences;

export default settingsSlice.reducer;

