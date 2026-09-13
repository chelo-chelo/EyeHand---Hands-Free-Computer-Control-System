// ============================================================================
// Vision Manager: Camera Stream & MediaPipe Tasks Vision Pipeline
// ============================================================================

import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import { EyeTracker } from './eyeTracking';
import { GestureRecognizer } from './gestureRecognizer';
import { lightingAnalyzer } from './lightingAnalyzer';
import { safetyManager } from '../core/safetyManager';
import { controlEngine } from '../core/controlEngine';
import { EyeTrackingData, HandTrackingData, Point3D } from '../types';

export interface OverlayToggles {
  showFaceLandmarks: boolean;
  showEyeLandmarks: boolean;
  showHandLandmarks: boolean;
  showGazeDirection: boolean;
  showConfidence: boolean;
  hideCameraPreview: boolean;
}

export type VisionFrameCallback = (
  eyeData: EyeTrackingData | null,
  handData: HandTrackingData | null,
  fps: number
) => void;

export class VisionManager {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;

  private faceLandmarker: FaceLandmarker | null = null;
  private handLandmarker: HandLandmarker | null = null;

  private isRunning: boolean = false;
  private isModelLoading: boolean = false;
  private lastVideoTime: number = -1;
  private animationFrameId: number = 0;

  private eyeTracker: EyeTracker;
  private gestureRecognizer: GestureRecognizer;

  private overlayToggles: OverlayToggles = {
    showFaceLandmarks: true,
    showEyeLandmarks: true,
    showHandLandmarks: true,
    showGazeDirection: true,
    showConfidence: true,
    hideCameraPreview: false,
  };

  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;
  private frameCallbacks: Set<VisionFrameCallback> = new Set();

  constructor() {
    this.eyeTracker = new EyeTracker();
    this.gestureRecognizer = new GestureRecognizer();
  }

  public setElements(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.videoElement = video;
    this.canvasElement = canvas;
  }

  public setOverlayToggles(toggles: Partial<OverlayToggles>) {
    this.overlayToggles = { ...this.overlayToggles, ...toggles };
  }

  public getOverlayToggles(): OverlayToggles {
    return this.overlayToggles;
  }

  public onFrame(callback: VisionFrameCallback): () => void {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }

  /**
   * Initialize MediaPipe Vision Models
   */
  public async initModels(): Promise<boolean> {
    if (this.faceLandmarker && this.handLandmarker) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 2,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      this.isModelLoading = false;
      return true;
    } catch (e) {
      console.warn('[VisionManager] MediaPipe model initialization warning (offline fallback active):', e);
      this.isModelLoading = false;
      return false;
    }
  }

  /**
   * Start Webcam Stream
   */
  public async startCamera(deviceId?: string): Promise<boolean> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      this.isRunning = true;
      this.startRenderLoop();
      return true;
    } catch (e) {
      console.error('[VisionManager] Camera access error:', e);
      return false;
    }
  }

  public stopCamera() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public isCameraRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Real-time 60 FPS Inference & Canvas Overlay Loop
   */
  private startRenderLoop() {
    const processLoop = (now: number) => {
      if (!this.isRunning) return;

      this.calculateFps(now);

      if (this.videoElement && this.videoElement.readyState >= 2) {
        this.processFrame(now);
      }

      this.animationFrameId = requestAnimationFrame(processLoop);
    };

    this.animationFrameId = requestAnimationFrame(processLoop);
  }

  private calculateFps(now: number) {
    this.frameCount++;
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
  }

  private processFrame(now: number) {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let eyeData: EyeTrackingData | null = null;
    let handData: HandTrackingData | null = null;

    const videoTime = video.currentTime;

    if (videoTime !== this.lastVideoTime) {
      this.lastVideoTime = videoTime;

      // 1. Process Face & Eyes
      if (this.faceLandmarker) {
        try {
          const faceResults = this.faceLandmarker.detectForVideo(video, now);
          const numFaces = faceResults.faceLandmarks.length;

          // Multi-face check
          if (numFaces > 1) {
            safetyManager.handleMultipleFaces(true);
          } else {
            safetyManager.handleMultipleFaces(false);
          }

          if (numFaces > 0) {
            safetyManager.handleTrackingLoss(false);
            const rawLandmarks: Point3D[] = faceResults.faceLandmarks[0].map((l) => ({
              x: l.x,
              y: l.y,
              z: l.z || 0,
            }));

            // Analyze lighting & position
            const condition = lightingAnalyzer.evaluateConditions(video, rawLandmarks, numFaces);
            safetyManager.setLightingStatus(condition.status as any);

            const eyeResult = this.eyeTracker.process(rawLandmarks, now);

            eyeData = {
              detected: true,
              confidence: 0.94,
              leftEyeOpenness: eyeResult.leftEyeOpenness,
              rightEyeOpenness: eyeResult.rightEyeOpenness,
              blinkState: eyeResult.blinkState,
              gazeDirection: eyeResult.gazeDirection,
              normalizedGaze: eyeResult.normalizedGaze,
              irisLeft: eyeResult.irisLeft,
              irisRight: eyeResult.irisRight,
              headPose: eyeResult.headPose,
              screenX: Math.round(eyeResult.normalizedGaze.x * window.innerWidth),
              screenY: Math.round(eyeResult.normalizedGaze.y * window.innerHeight),
            };

            // Render Face & Eye Overlays
            if (this.overlayToggles.showFaceLandmarks) {
              this.drawFaceMesh(ctx, rawLandmarks, canvas.width, canvas.height);
            }
            if (this.overlayToggles.showEyeLandmarks) {
              this.drawEyeAndIris(ctx, rawLandmarks, eyeResult.irisLeft, eyeResult.irisRight, canvas.width, canvas.height);
            }
          } else {
            safetyManager.handleTrackingLoss(true, 'No face detected — eye control paused');
          }
        } catch {}
      }

      // 2. Process Hands
      if (this.handLandmarker) {
        try {
          const handResults = this.handLandmarker.detectForVideo(video, now);
          if (handResults.landmarks && handResults.landmarks.length > 0) {
            const rawHand: Point3D[] = handResults.landmarks[0].map((l) => ({
              x: l.x,
              y: l.y,
              z: l.z || 0,
            }));

            const handedness = (handResults.handednesses && handResults.handednesses[0]?.[0]?.categoryName as any) || 'Right';
            const gestureAnalysis = this.gestureRecognizer.analyze(rawHand, now);

            handData = {
              detected: true,
              handedness,
              landmarks: rawHand,
              palmCenter: rawHand[0],
              indexTip: rawHand[8],
              thumbTip: rawHand[4],
              pinchDistance: gestureAnalysis.pinchDistance,
              isPinching: gestureAnalysis.pinchState === 'PINCH_START' || gestureAnalysis.pinchState === 'PINCH_HOLD',
              pinchState: gestureAnalysis.pinchState,
              isDragging: gestureAnalysis.isDragging,
              gesture: gestureAnalysis.gesture,
              gestureConfidence: gestureAnalysis.confidence,
              swipeDirection: gestureAnalysis.swipeDirection,
            };

            // Render Hand Skeleton & Gesture Tag
            if (this.overlayToggles.showHandLandmarks) {
              this.drawHandSkeleton(ctx, rawHand, canvas.width, canvas.height, gestureAnalysis.gesture);
            }
          }
        } catch {}
      }
    }

    // Pass data into Central Control Engine
    controlEngine.updateFrame(eyeData, handData, now);

    // Notify external listeners
    this.frameCallbacks.forEach((cb) => cb(eyeData, handData, this.currentFps));
  }

  // --- Canvas Drawing Routines ---

  private drawFaceMesh(ctx: CanvasRenderingContext2D, landmarks: Point3D[], w: number, h: number) {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1;

    // Connect key face contour points
    const ovalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    ctx.beginPath();
    ovalIndices.forEach((idx, i) => {
      const p = landmarks[idx];
      if (p) {
        const x = (1 - p.x) * w;
        const y = p.y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  private drawEyeAndIris(
    ctx: CanvasRenderingContext2D,
    landmarks: Point3D[],
    irisL: Point3D,
    irisR: Point3D,
    w: number,
    h: number
  ) {
    ctx.fillStyle = '#22d3ee';
    // Draw left iris
    const lx = (1 - irisL.x) * w;
    const ly = irisL.y * h;
    ctx.beginPath();
    ctx.arc(lx, ly, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw right iris
    const rx = (1 - irisR.x) * w;
    const ry = irisR.y * h;
    ctx.beginPath();
    ctx.arc(rx, ry, 4.5, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawHandSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Point3D[],
    w: number,
    h: number,
    gesture: string
  ) {
    // Hand connections
    const fingers = [
      [0, 1, 2, 3, 4],       // Thumb
      [0, 5, 6, 7, 8],       // Index
      [0, 9, 10, 11, 12],    // Middle
      [0, 13, 14, 15, 16],   // Ring
      [0, 17, 18, 19, 20],   // Pinky
    ];

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
    ctx.lineWidth = 2.5;

    fingers.forEach((finger) => {
      ctx.beginPath();
      finger.forEach((idx, i) => {
        const p = landmarks[idx];
        const x = (1 - p.x) * w;
        const y = p.y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Draw landmark joints
    ctx.fillStyle = '#10b981';
    landmarks.forEach((p, idx) => {
      const x = (1 - p.x) * w;
      const y = p.y * h;
      ctx.beginPath();
      // Highlight fingertip
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      ctx.arc(x, y, isTip ? 5 : 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Gesture Badge on Wrist
    if (gesture && gesture !== 'NONE') {
      const wrist = landmarks[0];
      const wx = (1 - wrist.x) * w;
      const wy = Math.max(20, wrist.y * h - 18);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(wx - 45, wy - 14, 90, 20);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(wx - 45, wy - 14, 90, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gesture, wx, wy);
    }
  }
}

export const visionManager = new VisionManager();
