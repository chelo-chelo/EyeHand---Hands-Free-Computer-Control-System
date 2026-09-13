// ============================================================================
// Camera Lighting & Ergonomic Position Analyzer
// ============================================================================

import { Point3D } from '../types';

export interface CameraConditionReport {
  status: 'OPTIMAL' | 'TOO_DARK' | 'TOO_BRIGHT' | 'FACE_TOO_FAR' | 'FACE_OFF_CENTER' | 'MULTIPLE_FACES' | 'NO_FACE';
  brightness: number; // 0 to 255
  faceDistanceScore: number; // 0 (far) to 1 (close)
  isFaceCentered: boolean;
  message: string;
}

export class LightingAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 48;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Sample video frame luminosity
   */
  public analyzeVideoBrightness(video: HTMLVideoElement): number {
    if (!this.ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return 128;
    }

    try {
      this.ctx.drawImage(video, 0, 0, 64, 48);
      const imgData = this.ctx.getImageData(0, 0, 64, 48);
      const data = imgData.data;
      let totalLuma = 0;
      const count = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        // Standard Rec. 601 luma formula
        const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalLuma += luma;
      }

      return totalLuma / count;
    } catch {
      return 128;
    }
  }

  /**
   * Analyze face positioning from landmarks
   */
  public evaluateConditions(
    video: HTMLVideoElement | null,
    faceLandmarks: Point3D[] | null,
    numFaces: number = 1
  ): CameraConditionReport {
    if (numFaces > 1) {
      return {
        status: 'MULTIPLE_FACES',
        brightness: 128,
        faceDistanceScore: 0.5,
        isFaceCentered: false,
        message: 'Multiple faces detected. Control paused for safety.',
      };
    }

    if (!faceLandmarks || faceLandmarks.length === 0) {
      return {
        status: 'NO_FACE',
        brightness: 128,
        faceDistanceScore: 0,
        isFaceCentered: false,
        message: 'No face detected in camera view.',
      };
    }

    const brightness = video ? this.analyzeVideoBrightness(video) : 128;

    if (brightness < 45) {
      return {
        status: 'TOO_DARK',
        brightness,
        faceDistanceScore: 0.5,
        isFaceCentered: true,
        message: 'Lighting is too dark. Illuminate your face from the front.',
      };
    }

    if (brightness > 235) {
      return {
        status: 'TOO_BRIGHT',
        brightness,
        faceDistanceScore: 0.5,
        isFaceCentered: true,
        message: 'Direct glare detected. Avoid strong backlighting.',
      };
    }

    // Distance estimation using eye-to-eye width
    const leftOuter = faceLandmarks[33];
    const rightOuter = faceLandmarks[263];
    const eyeSpan = Math.hypot(leftOuter.x - rightOuter.x, leftOuter.y - rightOuter.y);

    if (eyeSpan < 0.12) {
      return {
        status: 'FACE_TOO_FAR',
        brightness,
        faceDistanceScore: eyeSpan * 5,
        isFaceCentered: true,
        message: 'Move closer to the camera (ideal distance: 50–70 cm).',
      };
    }

    // Centering estimation
    const nose = faceLandmarks[1];
    const isCentered = Math.abs(nose.x - 0.5) < 0.22 && Math.abs(nose.y - 0.5) < 0.22;

    if (!isCentered) {
      return {
        status: 'FACE_OFF_CENTER',
        brightness,
        faceDistanceScore: eyeSpan * 5,
        isFaceCentered: false,
        message: 'Center your face in the camera preview frame.',
      };
    }

    return {
      status: 'OPTIMAL',
      brightness,
      faceDistanceScore: Math.min(1.0, eyeSpan * 4.5),
      isFaceCentered: true,
      message: 'Optimal camera tracking conditions.',
    };
  }
}

export const lightingAnalyzer = new LightingAnalyzer();
