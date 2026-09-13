// ============================================================================
// Telemetry & Usage Statistics Manager (100% Local Storage, Zero Biometric Upload)
// ============================================================================

import { ActionEvent, UsageStatistics } from '../types';

export class StatisticsManager {
  private stats: UsageStatistics = {
    sessionDurationSec: 0,
    totalClicks: 0,
    totalPinches: 0,
    totalDwells: 0,
    totalGestures: 0,
    totalVoiceCommands: 0,
    averageConfidence: 94,
    trackingInterruptions: 0,
    timeInEyeControlSec: 0,
    timeInHandControlSec: 0,
  };

  private storageKey = 'eyehand_stats_v1';
  private sessionStartTime = Date.now();

  constructor() {
    this.loadStats();
    setInterval(() => this.tick(), 1000);
  }

  private loadStats() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.stats = { ...this.stats, ...JSON.parse(saved) };
      }
    } catch {}
  }

  public saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    } catch {}
  }

  private tick() {
    this.stats.sessionDurationSec++;
    this.saveStats();
  }

  public recordAction(action: ActionEvent) {
    if (action.type === 'LEFT_CLICK' || action.type === 'RIGHT_CLICK' || action.type === 'DOUBLE_CLICK') {
      this.stats.totalClicks++;
      if (action.source === 'HAND') {
        this.stats.totalPinches++;
      } else if (action.source === 'EYE') {
        this.stats.totalDwells++;
      }
    }

    if (action.source === 'HAND') {
      this.stats.totalGestures++;
    } else if (action.source === 'VOICE') {
      this.stats.totalVoiceCommands++;
    }

    this.saveStats();
  }

  public recordInterruption() {
    this.stats.trackingInterruptions++;
    this.saveStats();
  }

  public getStats(): UsageStatistics {
    return { ...this.stats };
  }

  public resetStats() {
    this.stats = {
      sessionDurationSec: 0,
      totalClicks: 0,
      totalPinches: 0,
      totalDwells: 0,
      totalGestures: 0,
      totalVoiceCommands: 0,
      averageConfidence: 94,
      trackingInterruptions: 0,
      timeInEyeControlSec: 0,
      timeInHandControlSec: 0,
    };
    this.saveStats();
  }
}

export const statisticsManager = new StatisticsManager();
