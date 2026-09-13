// ============================================================================
// Dwell Click Detector & Radial Fixation Timer
// ============================================================================

export interface DwellStatus {
  isActive: boolean;
  progress: number; // 0.0 to 1.0
  hasTriggered: boolean;
  fixationPoint: { x: number; y: number } | null;
}

export class DwellDetector {
  private dwellDurationMs: number;
  private movementThreshold: number; // pixels
  private clickCooldownMs: number;

  private fixationStart: number = 0;
  private anchorX: number = 0;
  private anchorY: number = 0;
  private isDwellActive: boolean = false;
  private lastClickTime: number = 0;
  private hasTriggeredInCurrentFixation: boolean = false;

  constructor(dwellDurationMs: number = 750, movementThreshold: number = 28, clickCooldownMs: number = 600) {
    this.dwellDurationMs = dwellDurationMs;
    this.movementThreshold = movementThreshold;
    this.clickCooldownMs = clickCooldownMs;
  }

  public update(
    currentX: number,
    currentY: number,
    timestampMs: number,
    onTriggerClick: (x: number, y: number) => void
  ): DwellStatus {
    // Check if in cooldown period
    if (timestampMs - this.lastClickTime < this.clickCooldownMs) {
      this.reset();
      return {
        isActive: false,
        progress: 0,
        hasTriggered: false,
        fixationPoint: null,
      };
    }

    if (!this.isDwellActive) {
      // Start fixation
      this.isDwellActive = true;
      this.fixationStart = timestampMs;
      this.anchorX = currentX;
      this.anchorY = currentY;
      this.hasTriggeredInCurrentFixation = false;
      return {
        isActive: true,
        progress: 0,
        hasTriggered: false,
        fixationPoint: { x: this.anchorX, y: this.anchorY },
      };
    }

    // Check distance from anchor
    const dx = currentX - this.anchorX;
    const dy = currentY - this.anchorY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.movementThreshold) {
      // Moved too far, reset fixation to new position
      this.anchorX = currentX;
      this.anchorY = currentY;
      this.fixationStart = timestampMs;
      this.hasTriggeredInCurrentFixation = false;
      return {
        isActive: true,
        progress: 0,
        hasTriggered: false,
        fixationPoint: { x: this.anchorX, y: this.anchorY },
      };
    }

    if (this.hasTriggeredInCurrentFixation) {
      return {
        isActive: false,
        progress: 1,
        hasTriggered: true,
        fixationPoint: { x: this.anchorX, y: this.anchorY },
      };
    }

    // Compute progress
    const elapsed = timestampMs - this.fixationStart;
    const progress = Math.min(1.0, elapsed / this.dwellDurationMs);

    if (progress >= 1.0) {
      this.hasTriggeredInCurrentFixation = true;
      this.lastClickTime = timestampMs;
      onTriggerClick(this.anchorX, this.anchorY);
      return {
        isActive: false,
        progress: 1.0,
        hasTriggered: true,
        fixationPoint: { x: this.anchorX, y: this.anchorY },
      };
    }

    return {
      isActive: true,
      progress,
      hasTriggered: false,
      fixationPoint: { x: this.anchorX, y: this.anchorY },
    };
  }

  public reset() {
    this.isDwellActive = false;
    this.fixationStart = 0;
    this.hasTriggeredInCurrentFixation = false;
  }

  public setParameters(durationMs: number, threshold: number, cooldownMs: number) {
    this.dwellDurationMs = durationMs;
    this.movementThreshold = threshold;
    this.clickCooldownMs = cooldownMs;
  }
}
