// ============================================================================
// Safety Manager: Emergency Stop, Interlocks & Accidental Action Invariants
// ============================================================================

import { SafetyStatus } from '../types';

export type SafetyListener = (status: SafetyStatus) => void;

export class SafetyManager {
  private isEmergencyStopped: boolean = false;
  private isControlPaused: boolean = false;
  private isSystemControlEnabled: boolean = false; // Safe simulation mode by default
  private isTrackingLost: boolean = false;
  private multipleFacesDetected: boolean = false;
  private pauseReason: string = '';
  private lightingStatus: SafetyStatus['lightingStatus'] = 'OPTIMAL';

  private minConfidenceThreshold: number = 0.65;
  private lastActionTime: number = 0;
  private actionCooldownMs: number = 300;
  private listeners: Set<SafetyListener> = new Set();

  constructor() {
    this.registerGlobalHotkeys();
  }

  private registerGlobalHotkeys() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.triggerEmergencyStop();
        }
      });
    }
  }

  public subscribe(listener: SafetyListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public getStatus(): SafetyStatus {
    return {
      isEmergencyStopped: this.isEmergencyStopped,
      isControlPaused: this.isControlPaused || this.isEmergencyStopped || this.isTrackingLost || this.multipleFacesDetected,
      isSystemControlEnabled: this.isSystemControlEnabled,
      isTrackingLost: this.isTrackingLost,
      multipleFacesDetected: this.multipleFacesDetected,
      lightingStatus: this.lightingStatus,
      pauseReason: this.pauseReason,
    };
  }

  public triggerEmergencyStop() {
    this.isEmergencyStopped = true;
    this.isControlPaused = true;
    this.pauseReason = 'EMERGENCY STOP TRIGGERED (ESC key or stop button)';
    this.notify();
  }

  public resumeControl() {
    this.isEmergencyStopped = false;
    this.isControlPaused = false;
    this.pauseReason = '';
    this.notify();
  }

  public togglePause(paused?: boolean) {
    this.isControlPaused = paused !== undefined ? paused : !this.isControlPaused;
    this.pauseReason = this.isControlPaused ? 'User manually paused control' : '';
    this.notify();
  }

  public setSystemControlEnabled(enabled: boolean) {
    this.isSystemControlEnabled = enabled;
    this.notify();
  }

  public handleTrackingLoss(lost: boolean, message: string = 'Tracking lost — control paused') {
    if (this.isTrackingLost !== lost) {
      this.isTrackingLost = lost;
      if (lost) {
        this.pauseReason = message;
      } else if (this.pauseReason === message) {
        this.pauseReason = '';
      }
      this.notify();
    }
  }

  public handleMultipleFaces(detected: boolean) {
    if (this.multipleFacesDetected !== detected) {
      this.multipleFacesDetected = detected;
      if (detected) {
        this.pauseReason = 'Multiple faces detected. Control paused for safety.';
      } else if (this.pauseReason.includes('Multiple faces')) {
        this.pauseReason = '';
      }
      this.notify();
    }
  }

  public setLightingStatus(status: SafetyStatus['lightingStatus']) {
    this.lightingStatus = status;
  }

  /**
   * Action guard: checks all safety invariants before dispatching any computer control event
   */
  public canExecuteAction(confidence: number, now: number = Date.now()): boolean {
    if (this.isEmergencyStopped) return false;
    if (this.isControlPaused) return false;
    if (this.isTrackingLost) return false;
    if (this.multipleFacesDetected) return false;

    // Confidence check
    if (confidence < this.minConfidenceThreshold) return false;

    // Action cooldown check
    if (now - this.lastActionTime < this.actionCooldownMs) return false;

    return true;
  }

  public markActionExecuted(now: number = Date.now()) {
    this.lastActionTime = now;
  }

  public setActionCooldown(cooldownMs: number) {
    this.actionCooldownMs = cooldownMs;
  }

  public setMinConfidenceThreshold(threshold: number) {
    this.minConfidenceThreshold = threshold;
  }
}

export const safetyManager = new SafetyManager();
