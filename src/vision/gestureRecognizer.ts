// ============================================================================
// Hand Gesture Recognizer & Pinch Hysteresis State Machine
// ============================================================================

import { GestureType, PinchState, Point3D } from '../types';

export interface GestureDetectionResult {
  gesture: GestureType;
  confidence: number;
  pinchState: PinchState;
  pinchDistance: number;
  isDragging: boolean;
  swipeDirection?: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
}

interface PalmHistoryPoint {
  x: number;
  y: number;
  time: number;
}

export class GestureRecognizer {
  private pinchThreshold: number; // Normalized distance (e.g. 0.055)
  private pinchReleaseThreshold: number; // Higher for hysteresis (e.g. 0.08)
  private currentPinchState: PinchState = 'NONE';
  private pinchStartTime: number = 0;
  private pinchHoldTriggered: boolean = false;
  private pinchStartPoint: { x: number; y: number } = { x: 0, y: 0 };
  private isDragging: boolean = false;
  private dragThreshold: number = 0.04; // Distance moved during hold to activate drag

  private palmHistory: PalmHistoryPoint[] = [];
  private lastSwipeTime: number = 0;

  constructor(pinchThreshold: number = 0.06) {
    this.pinchThreshold = pinchThreshold;
    this.pinchReleaseThreshold = pinchThreshold * 1.35;
  }

  public setPinchThreshold(threshold: number) {
    this.pinchThreshold = threshold;
    this.pinchReleaseThreshold = threshold * 1.35;
  }

  /**
   * Euclidean distance between two 3D landmarks
   */
  private distance(p1: Point3D, p2: Point3D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if a finger is extended based on tip vs PIP / MCP distance from wrist
   */
  private isFingerExtended(landmarks: Point3D[], tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
    const wrist = landmarks[0];
    const distTip = this.distance(landmarks[tipIdx], wrist);
    const distPip = this.distance(landmarks[pipIdx], wrist);
    const distMcp = this.distance(landmarks[mcpIdx], wrist);
    return distTip > distPip && distTip > distMcp;
  }

  /**
   * Detect dynamic swipe gesture based on recent palm trajectory
   */
  private detectSwipe(palmX: number, palmY: number, now: number): 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | undefined {
    this.palmHistory.push({ x: palmX, y: palmY, time: now });
    // Keep last 400ms
    this.palmHistory = this.palmHistory.filter((p) => now - p.time < 400);

    if (this.palmHistory.length < 5 || now - this.lastSwipeTime < 800) {
      return undefined;
    }

    const first = this.palmHistory[0];
    const dx = palmX - first.x;
    const dy = palmY - first.y;
    const dt = Math.max((now - first.time) / 1000, 0.05);
    const speedX = Math.abs(dx) / dt;
    const speedY = Math.abs(dy) / dt;

    const minSwipeDistance = 0.16; // 16% screen width
    const minSwipeSpeed = 0.55;

    if (speedX > speedY && Math.abs(dx) > minSwipeDistance && speedX > minSwipeSpeed) {
      this.lastSwipeTime = now;
      this.palmHistory = [];
      return dx > 0 ? 'RIGHT' : 'LEFT';
    } else if (speedY > speedX && Math.abs(dy) > minSwipeDistance && speedY > minSwipeSpeed) {
      this.lastSwipeTime = now;
      this.palmHistory = [];
      return dy > 0 ? 'DOWN' : 'UP';
    }

    return undefined;
  }

  public analyze(landmarks: Point3D[], now: number): GestureDetectionResult {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      return {
        gesture: 'NONE',
        confidence: 0,
        pinchState: 'NONE',
        pinchDistance: 1,
        isDragging: false,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];

    const palmX = (wrist.x + middleMcp.x) / 2;
    const palmY = (wrist.y + middleMcp.y) / 2;

    // Check finger extensions
    const isIndexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
    const isMiddleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
    const isRingExtended = this.isFingerExtended(landmarks, 16, 14, 13);
    const isPinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
    
    // Thumb extension relative to index MCP
    const distThumbTipWrist = this.distance(thumbTip, wrist);
    const distThumbMcpWrist = this.distance(thumbMcp, wrist);
    const isThumbExtended = distThumbTipWrist > distThumbMcpWrist * 1.15;

    // Measure pinch distance between thumb tip and index tip
    const pinchDist = this.distance(thumbTip, indexTip);

    // Dynamic swipe detector
    const swipe = this.detectSwipe(palmX, palmY, now);

    // Pinch Hysteresis State Machine
    if (this.currentPinchState === 'NONE') {
      if (pinchDist < this.pinchThreshold) {
        this.currentPinchState = 'PINCH_START';
        this.pinchStartTime = now;
        this.pinchHoldTriggered = false;
        this.pinchStartPoint = { x: indexTip.x, y: indexTip.y };
        this.isDragging = false;
      }
    } else if (this.currentPinchState === 'PINCH_START') {
      if (pinchDist > this.pinchReleaseThreshold) {
        this.currentPinchState = 'PINCH_RELEASE';
      } else {
        if (now - this.pinchStartTime > 180) {
          this.currentPinchState = 'PINCH_HOLD';
          this.pinchHoldTriggered = true;
        }
      }
    } else if (this.currentPinchState === 'PINCH_HOLD') {
      if (pinchDist > this.pinchReleaseThreshold) {
        this.currentPinchState = 'PINCH_RELEASE';
        this.isDragging = false;
      } else {
        // Check for drag: movement while in hold
        const moveDist = Math.hypot(indexTip.x - this.pinchStartPoint.x, indexTip.y - this.pinchStartPoint.y);
        if (moveDist > this.dragThreshold) {
          this.isDragging = true;
        }
      }
    } else if (this.currentPinchState === 'PINCH_RELEASE') {
      this.currentPinchState = 'NONE';
      this.isDragging = false;
    }

    // Static gesture classification
    let gesture: GestureType = 'NONE';
    let confidence = 0.85;

    if (swipe) {
      if (swipe === 'LEFT') gesture = 'SWIPE_LEFT';
      else if (swipe === 'RIGHT') gesture = 'SWIPE_RIGHT';
      else if (swipe === 'UP') gesture = 'SWIPE_UP';
      else if (swipe === 'DOWN') gesture = 'SWIPE_DOWN';
      confidence = 0.95;
    } else if (this.currentPinchState === 'PINCH_START' || this.currentPinchState === 'PINCH_HOLD') {
      gesture = 'PINCH';
      confidence = Math.max(0.7, 1 - pinchDist / this.pinchThreshold);
    } else if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbExtended) {
      gesture = 'OPEN_PALM';
      confidence = 0.94;
    } else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended) {
      gesture = 'FIST';
      confidence = 0.92;
    } else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && isThumbExtended) {
      // Thumb check: orientation
      if (thumbTip.y < indexMcp.y - 0.05) {
        gesture = 'THUMBS_UP';
        confidence = 0.93;
      } else if (thumbTip.y > wrist.y + 0.05) {
        gesture = 'THUMBS_DOWN';
        confidence = 0.91;
      } else {
        gesture = 'FIST';
        confidence = 0.85;
      }
    } else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      gesture = 'POINT';
      confidence = 0.95;
    } else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      gesture = 'TWO_FINGER';
      confidence = 0.94;
    } else if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
      gesture = 'THREE_FINGER';
      confidence = 0.92;
    }

    return {
      gesture,
      confidence,
      pinchState: this.currentPinchState,
      pinchDistance: pinchDist,
      isDragging: this.isDragging,
      swipeDirection: swipe,
    };
  }

  public reset() {
    this.currentPinchState = 'NONE';
    this.isDragging = false;
    this.pinchHoldTriggered = false;
    this.palmHistory = [];
  }
}
