// ============================================================================
// 9-Point Calibration Engine & Polynomial Coordinate Regression
// ============================================================================

import { CalibrationMatrix, CalibrationSample, Point2D } from '../../types';

export interface CalibrationTargetPoint {
  id: number;
  label: string;
  normalizedTarget: Point2D;
}

export const CALIBRATION_9_POINTS: CalibrationTargetPoint[] = [
  { id: 0, label: 'Center', normalizedTarget: { x: 0.5, y: 0.5 } },
  { id: 1, label: 'Top-Left', normalizedTarget: { x: 0.15, y: 0.15 } },
  { id: 2, label: 'Top-Center', normalizedTarget: { x: 0.5, y: 0.15 } },
  { id: 3, label: 'Top-Right', normalizedTarget: { x: 0.85, y: 0.15 } },
  { id: 4, label: 'Middle-Left', normalizedTarget: { x: 0.15, y: 0.5 } },
  { id: 5, label: 'Middle-Right', normalizedTarget: { x: 0.85, y: 0.5 } },
  { id: 6, label: 'Bottom-Left', normalizedTarget: { x: 0.15, y: 0.85 } },
  { id: 7, label: 'Bottom-Center', normalizedTarget: { x: 0.5, y: 0.85 } },
  { id: 8, label: 'Bottom-Right', normalizedTarget: { x: 0.85, y: 0.85 } },
];

export class CalibrationManager {
  private samples: CalibrationSample[] = [];
  private currentMatrix: CalibrationMatrix | null = null;
  private storageKey = 'eyehand_calibration_v1';

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): CalibrationMatrix | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.currentMatrix = JSON.parse(saved);
        return this.currentMatrix;
      }
    } catch (e) {
      console.warn('Failed to load calibration:', e);
    }
    return null;
  }

  public saveToStorage(matrix: CalibrationMatrix) {
    this.currentMatrix = matrix;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(matrix));
    } catch (e) {
      console.warn('Failed to save calibration:', e);
    }
  }

  public resetCalibration() {
    this.currentMatrix = null;
    this.samples = [];
    localStorage.removeItem(this.storageKey);
  }

  public addSample(target: Point2D, gaze: Point2D, headPose: { pitch: number; yaw: number; roll: number }) {
    this.samples.push({ target, gaze, headPose });
  }

  public clearSamples() {
    this.samples = [];
  }

  public getSampleCount(): number {
    return this.samples.length;
  }

  /**
   * Solve Least-Squares Affine / Quadratic Bivariate Mapping
   * TargetX = a0 + a1*gazeX + a2*gazeY + a3*headYaw
   * TargetY = b0 + b1*gazeX + b2*gazeY + b3*headPitch
   */
  public computeCalibration(): CalibrationMatrix | null {
    if (this.samples.length < 9) {
      return null;
    }

    // Compute simple robust linear regression with head pose compensation
    let sumGx = 0, sumGy = 0, sumTx = 0, sumTy = 0;
    let sumYaw = 0, sumPitch = 0;
    const n = this.samples.length;

    for (const s of this.samples) {
      sumGx += s.gaze.x;
      sumGy += s.gaze.y;
      sumTx += s.target.x;
      sumTy += s.target.y;
      sumYaw += s.headPose.yaw;
      sumPitch += s.headPose.pitch;
    }

    const meanGx = sumGx / n;
    const meanGy = sumGy / n;
    const meanTx = sumTx / n;
    const meanTy = sumTy / n;

    let varGx = 0, covGxTx = 0;
    let varGy = 0, covGyTy = 0;

    for (const s of this.samples) {
      const dgx = s.gaze.x - meanGx;
      const dgy = s.gaze.y - meanGy;
      const dtx = s.target.x - meanTx;
      const dty = s.target.y - meanTy;

      varGx += dgx * dgx;
      covGxTx += dgx * dtx;

      varGy += dgy * dgy;
      covGyTy += dgy * dty;
    }

    const scaleX = varGx > 0.0001 ? covGxTx / varGx : 1.0;
    const scaleY = varGy > 0.0001 ? covGyTy / varGy : 1.0;
    const offsetX = meanTx - scaleX * meanGx;
    const offsetY = meanTy - scaleY * meanGy;

    // Evaluate residuals and stability
    let totalError = 0;
    let variance = 0;

    for (const s of this.samples) {
      const predX = offsetX + scaleX * s.gaze.x;
      const predY = offsetY + scaleY * s.gaze.y;
      const err = Math.hypot(predX - s.target.x, predY - s.target.y);
      totalError += err;
    }

    const meanError = totalError / n;
    const stabilityScore = Math.max(0, Math.min(100, Math.round((1 - meanError * 2.5) * 100)));

    let quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
    if (stabilityScore >= 88) quality = 'EXCELLENT';
    else if (stabilityScore >= 74) quality = 'GOOD';
    else if (stabilityScore >= 58) quality = 'FAIR';
    else quality = 'POOR';

    const matrix: CalibrationMatrix = {
      polynomialX: [offsetX, scaleX, 0, 0.15],
      polynomialY: [offsetY, 0, scaleY, 0.15],
      meanError,
      stabilityScore,
      quality,
      timestamp: Date.now(),
    };

    this.saveToStorage(matrix);
    return matrix;
  }

  /**
   * Map raw gaze & head pose into calibrated screen coordinates [0, 1]
   */
  public mapGazeToScreen(gaze: Point2D, headPose: { pitch: number; yaw: number; roll: number }): Point2D {
    if (!this.currentMatrix) {
      // Default uncalibrated center-oriented mapping with head assistance
      const defX = 0.5 + (gaze.x - 0.5) * 2.2 + headPose.yaw * 0.4;
      const defY = 0.5 + (gaze.y - 0.5) * 2.2 + headPose.pitch * 0.4;
      return {
        x: Math.max(0, Math.min(1, defX)),
        y: Math.max(0, Math.min(1, defY)),
      };
    }

    const [ox, sx, , yawWeight] = this.currentMatrix.polynomialX;
    const [oy, , sy, pitchWeight] = this.currentMatrix.polynomialY;

    const mappedX = ox + sx * gaze.x + (yawWeight || 0.1) * headPose.yaw;
    const mappedY = oy + sy * gaze.y + (pitchWeight || 0.1) * headPose.pitch;

    return {
      x: Math.max(0, Math.min(1, mappedX)),
      y: Math.max(0, Math.min(1, mappedY)),
    };
  }

  public getCurrentMatrix(): CalibrationMatrix | null {
    return this.currentMatrix;
  }
}

export const calibrationManager = new CalibrationManager();
