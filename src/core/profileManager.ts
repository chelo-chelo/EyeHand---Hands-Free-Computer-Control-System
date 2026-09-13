// ============================================================================
// User Profile Manager (Multi-profile, Export/Import, Local Persistence)
// ============================================================================

import { AppSettings, UserProfile } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  cursorMode: 'HYBRID',
  isSystemControlEnabled: false,
  performancePreset: 'BALANCED',

  eyeSensitivity: 1.0,
  eyeSmoothing: 0.03,
  eyeDeadZone: 4,
  eyeDwellTimeMs: 750,
  enableBlinkClick: false,
  blinkHoldDurationMs: 450,
  enableHeadAssistance: true,

  handSensitivity: 1.0,
  handSmoothing: 0.04,
  pinchClickThreshold: 0.06,
  scrollSensitivity: 1.0,

  gestureMappings: {
    NONE: 'PAUSE',
    OPEN_PALM: 'PAUSE',
    FIST: 'KEY_PRESS',
    POINT: 'MOVE',
    PINCH: 'LEFT_CLICK',
    TWO_FINGER: 'SCROLL_DOWN',
    THREE_FINGER: 'OPEN_APP',
    THUMBS_UP: 'KEY_PRESS',
    THUMBS_DOWN: 'KEY_PRESS',
    SWIPE_LEFT: 'KEY_PRESS',
    SWIPE_RIGHT: 'KEY_PRESS',
    SWIPE_UP: 'SCROLL_UP',
    SWIPE_DOWN: 'SCROLL_DOWN',
  },

  voiceEnabled: false,
  voiceVolumeThreshold: 0.2,

  theme: 'dark',
  largeUi: false,
  largeCursor: false,
  cursorTrail: false,
  soundFeedback: true,
  reducedMotion: false,

  pauseOnTrackingLoss: true,
  pauseOnMultipleFaces: true,
  clickCooldownMs: 400,
  maxCursorSpeed: 100,
};

export class ProfileManager {
  private profiles: UserProfile[] = [];
  private activeProfileId: string = 'default';
  private storageKey = 'eyehand_profiles_v1';

  constructor() {
    this.loadProfiles();
  }

  private loadProfiles() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.profiles = JSON.parse(saved);
        const active = this.profiles.find((p) => p.isDefault) || this.profiles[0];
        if (active) this.activeProfileId = active.id;
        return;
      }
    } catch (e) {
      console.warn('Profile load error:', e);
    }

    // Default built-in profile
    this.profiles = [
      {
        id: 'default',
        name: 'Default (Balanced Hybrid)',
        isDefault: true,
        settings: { ...DEFAULT_SETTINGS },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'accessibility_high_contrast',
        name: 'High Contrast & Dwell',
        isDefault: false,
        settings: {
          ...DEFAULT_SETTINGS,
          theme: 'high-contrast',
          largeUi: true,
          largeCursor: true,
          cursorMode: 'EYE',
          eyeDwellTimeMs: 1000,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hand_precision',
        name: 'Hand Only Precision',
        isDefault: false,
        settings: {
          ...DEFAULT_SETTINGS,
          cursorMode: 'HAND',
          handSensitivity: 1.2,
          pinchClickThreshold: 0.05,
        },
        createdAt: new Date().toISOString(),
      },
    ];
    this.saveProfiles();
  }

  private saveProfiles() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('Profile save error:', e);
    }
  }

  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getActiveProfile(): UserProfile {
    return this.profiles.find((p) => p.id === this.activeProfileId) || this.profiles[0];
  }

  public setActiveProfile(id: string) {
    this.activeProfileId = id;
    this.profiles = this.profiles.map((p) => ({ ...p, isDefault: p.id === id }));
    this.saveProfiles();
  }

  public updateActiveSettings(newSettings: Partial<AppSettings>) {
    const profile = this.getActiveProfile();
    profile.settings = { ...profile.settings, ...newSettings };
    this.saveProfiles();
  }

  public createProfile(name: string, baseSettings?: AppSettings): UserProfile {
    const newProfile: UserProfile = {
      id: 'profile_' + Date.now(),
      name,
      isDefault: false,
      settings: baseSettings ? { ...baseSettings } : { ...DEFAULT_SETTINGS },
      createdAt: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.saveProfiles();
    return newProfile;
  }

  public deleteProfile(id: string): boolean {
    if (this.profiles.length <= 1) return false;
    this.profiles = this.profiles.filter((p) => p.id !== id);
    if (this.activeProfileId === id) {
      this.activeProfileId = this.profiles[0].id;
    }
    this.saveProfiles();
    return true;
  }

  public exportProfileJson(id: string): string {
    const p = this.profiles.find((x) => x.id === id) || this.getActiveProfile();
    return JSON.stringify(p, null, 2);
  }

  public importProfileJson(jsonStr: string): UserProfile | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.name && parsed.settings) {
        parsed.id = 'imported_' + Date.now();
        parsed.isDefault = false;
        this.profiles.push(parsed);
        this.saveProfiles();
        return parsed;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return null;
  }
}

export const profileManager = new ProfileManager();
