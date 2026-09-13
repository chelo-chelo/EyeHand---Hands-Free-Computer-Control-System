// ============================================================================
// One Euro (1€) Adaptive Filter & Smoothing Pipeline
// Reference: Casiez et al., "1€ Filter: A Simple Speed-based Low-pass Filter for
// Noisy Input in Human-Computer Interaction", CHI 2012.
// ============================================================================

class LowPassFilter {
  private alpha: number = 1;
  private s: number | null = null;

  constructor(alpha: number = 1) {
    this.setAlpha(alpha);
  }

  public setAlpha(alpha: number) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  public filter(val: number): number {
    if (this.s === null) {
      this.s = val;
    } else {
      this.s = this.alpha * val + (1 - this.alpha) * this.s;
    }
    return this.s;
  }

  public hasLast(): boolean {
    return this.s !== null;
  }

  public last(): number {
    return this.s ?? 0;
  }

  public reset() {
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number = 0;

  /**
   * @param minCutoff Minimum cutoff frequency in Hz (lower = less jitter during fixation, e.g. 0.8 - 1.2)
   * @param beta Speed coefficient (higher = faster response during rapid movement, e.g. 0.005 - 0.05)
   * @param dCutoff Cutoff frequency for derivative (typically 1.0 Hz)
   */
  constructor(minCutoff: number = 1.0, beta: number = 0.02, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private alpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(value: number, timestampMs: number): number {
    if (this.lastTime === 0) {
      this.lastTime = timestampMs;
      return this.xFilter.filter(value);
    }

    const dt = Math.max((timestampMs - this.lastTime) / 1000, 0.001);
    this.lastTime = timestampMs;
    const rate = 1.0 / dt;

    const dx = this.xFilter.hasLast() ? (value - this.xFilter.last()) * rate : 0;
    const edx = this.dxFilter.filter(dx);
    this.dxFilter.setAlpha(this.alpha(rate, this.dCutoff));

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    this.xFilter.setAlpha(this.alpha(rate, cutoff));

    return this.xFilter.filter(value);
  }

  public reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = 0;
  }

  public updateParameters(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }
}

export class Point2DSmoother {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private deadZone: number;
  private lastOutputX: number = 0;
  private lastOutputY: number = 0;
  private hasOutput: boolean = false;

  constructor(minCutoff: number = 1.0, beta: number = 0.02, deadZone: number = 4) {
    this.filterX = new OneEuroFilter(minCutoff, beta);
    this.filterY = new OneEuroFilter(minCutoff, beta);
    this.deadZone = deadZone;
  }

  public smooth(x: number, y: number, timestampMs: number): { x: number; y: number } {
    const fx = this.filterX.filter(x, timestampMs);
    const fy = this.filterY.filter(y, timestampMs);

    if (!this.hasOutput) {
      this.lastOutputX = fx;
      this.lastOutputY = fy;
      this.hasOutput = true;
      return { x: fx, y: fy };
    }

    // Dead zone filter: suppress micro-jitter under the deadZone pixel radius
    const dx = fx - this.lastOutputX;
    const dy = fy - this.lastOutputY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.deadZone) {
      return { x: this.lastOutputX, y: this.lastOutputY };
    }

    this.lastOutputX = fx;
    this.lastOutputY = fy;
    return { x: fx, y: fy };
  }

  public reset() {
    this.filterX.reset();
    this.filterY.reset();
    this.hasOutput = false;
  }

  public setParameters(minCutoff: number, beta: number, deadZone: number) {
    this.filterX.updateParameters(minCutoff, beta);
    this.filterY.updateParameters(minCutoff, beta);
    this.deadZone = deadZone;
  }
}
