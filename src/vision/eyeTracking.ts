// ============================================================================
// Eye & Head Tracking: Iris Geometry, EAR Blink Detection & Head Orientation
// ============================================================================

import { BlinkState, GazeDirection, Point2D, Point3D } from '../types';

export interface EyeTrackingResult {
  leftEyeOpenness: number; // EAR
  rightEyeOpenness: number;
  blinkState: BlinkState;
  irisLeft: Point3D;
  irisRight: Point3D;
  normalizedGaze: Point2D; // (0 to 1)
  gazeDirection: GazeDirection;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

export class EyeTracker {
  private earBlinkThreshold: number = 0.17;
  private longBlinkThresholdMs: number = 450;
  private doubleBlinkMaxIntervalMs: number = 550;

  // Blink state tracking
  private isBlinking: boolean = false;
  private blinkStartTime: number = 0;
  private lastBlinkEndTime: number = 0;
  private blinkCountRecent: number = 0;

  constructor(earBlinkThreshold: number = 0.17, longBlinkThresholdMs: number = 450) {
    this.earBlinkThreshold = earBlinkThreshold;
    this.longBlinkThresholdMs = longBlinkThresholdMs;
  }

  private distance2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Compute Eye Aspect Ratio (EAR)
   * EAR = (|p_top - p_bottom|) / (|p_inner - p_outer|)
   */
  public computeEAR(top: Point3D, bottom: Point3D, inner: Point3D, outer: Point3D): number {
    const vertical = this.distance2D(top, bottom);
    const horizontal = this.distance2D(inner, outer);
    if (horizontal < 0.001) return 0.3;
    return vertical / horizontal;
  }

  /**
   * Compute 3D Head Pose (Pitch, Yaw, Roll) from key facial landmarks
   */
  public estimateHeadPose(landmarks: Point3D[]): { pitch: number; yaw: number; roll: number } {
    if (landmarks.length < 468) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }

    const noseTip = landmarks[1];
    const chin = landmarks[152];
    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];
    const midForehead = landmarks[10];

    // Yaw (Left / Right rotation): difference between nose-to-left and nose-to-right distances
    const distNoseLeft = this.distance2D(noseTip, leftTemple);
    const distNoseRight = this.distance2D(noseTip, rightTemple);
    const totalDistX = distNoseLeft + distNoseRight;
    const yaw = totalDistX > 0.001 ? (distNoseRight - distNoseLeft) / totalDistX : 0;

    // Pitch (Up / Down tilt): nose height relative to chin and forehead
    const distNoseForehead = Math.abs(noseTip.y - midForehead.y);
    const distNoseChin = Math.abs(chin.y - noseTip.y);
    const totalDistY = distNoseForehead + distNoseChin;
    const pitch = totalDistY > 0.001 ? (distNoseChin - distNoseForehead) / totalDistY : 0;

    // Roll (Head tilt): angle of the line connecting temples
    const dx = rightTemple.x - leftTemple.x;
    const dy = rightTemple.y - leftTemple.y;
    const roll = Math.atan2(dy, dx);

    return { pitch: pitch * 1.8, yaw: yaw * 2.2, roll };
  }

  public process(landmarks: Point3D[], now: number): EyeTrackingResult {
    // If no landmarks, return default safe values
    if (!landmarks || landmarks.length < 478) {
      return {
        leftEyeOpenness: 0.3,
        rightEyeOpenness: 0.3,
        blinkState: 'OPEN',
        irisLeft: { x: 0.5, y: 0.5, z: 0 },
        irisRight: { x: 0.5, y: 0.5, z: 0 },
        normalizedGaze: { x: 0.5, y: 0.5 },
        gazeDirection: 'CENTER',
        headPose: { pitch: 0, yaw: 0, roll: 0 },
      };
    }

    // Key Eye Landmarks:
    // Left eye (from user perspective, MediaPipe image right):
    // Outer: 33, Inner: 133, Top: 159, Bottom: 145, Iris Center: 468
    const leftOuter = landmarks[33];
    const leftInner = landmarks[133];
    const leftTop = landmarks[159];
    const leftBottom = landmarks[145];
    const irisLeft = landmarks[468];

    // Right eye:
    // Outer: 263, Inner: 362, Top: 386, Bottom: 374, Iris Center: 473
    const rightOuter = landmarks[263];
    const rightInner = landmarks[362];
    const rightTop = landmarks[386];
    const rightBottom = landmarks[374];
    const irisRight = landmarks[473];

    // EAR computation
    const leftEAR = this.computeEAR(leftTop, leftBottom, leftInner, leftOuter);
    const rightEAR = this.computeEAR(rightTop, rightBottom, rightInner, rightOuter);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Blink classification state machine
    let blinkState: BlinkState = 'OPEN';
    const isEyesClosed = avgEAR < this.earBlinkThreshold;

    if (isEyesClosed) {
      if (!this.isBlinking) {
        this.isBlinking = true;
        this.blinkStartTime = now;
      }
      const duration = now - this.blinkStartTime;
      if (duration >= this.longBlinkThresholdMs) {
        blinkState = 'LONG_BLINK';
      } else {
        blinkState = 'NATURAL_BLINK';
      }
    } else {
      if (this.isBlinking) {
        // Blink just ended
        const blinkDuration = now - this.blinkStartTime;
        this.isBlinking = false;

        if (blinkDuration < this.longBlinkThresholdMs) {
          // Check for double blink
          if (now - this.lastBlinkEndTime < this.doubleBlinkMaxIntervalMs) {
            this.blinkCountRecent++;
            if (this.blinkCountRecent >= 2) {
              blinkState = 'DOUBLE_BLINK';
              this.blinkCountRecent = 0;
            }
          } else {
            this.blinkCountRecent = 1;
            blinkState = 'NATURAL_BLINK';
          }
        }
        this.lastBlinkEndTime = now;
      }
    }

    // Iris relative position calculation:
    // Left eye iris relative position (0 = inner, 1 = outer)
    const leftEyeWidth = Math.abs(leftInner.x - leftOuter.x);
    const leftIrisRelX = leftEyeWidth > 0.001 ? (irisLeft.x - leftOuter.x) / (leftInner.x - leftOuter.x) : 0.5;

    const leftEyeHeight = Math.abs(leftBottom.y - leftTop.y);
    const leftIrisRelY = leftEyeHeight > 0.001 ? (irisLeft.y - leftTop.y) / (leftBottom.y - leftTop.y) : 0.5;

    // Right eye iris relative position
    const rightEyeWidth = Math.abs(rightInner.x - rightOuter.x);
    const rightIrisRelX = rightEyeWidth > 0.001 ? (irisRight.x - rightInner.x) / (rightOuter.x - rightInner.x) : 0.5;

    const rightEyeHeight = Math.abs(rightBottom.y - rightTop.y);
    const rightIrisRelY = rightEyeHeight > 0.001 ? (irisRight.y - rightTop.y) / (rightBottom.y - rightTop.y) : 0.5;

    const avgIrisRelX = (leftIrisRelX + rightIrisRelX) / 2;
    const avgIrisRelY = (leftIrisRelY + rightIrisRelY) / 2;

    // Head pose estimation
    const headPose = this.estimateHeadPose(landmarks);

    // Gaze fusion: combines iris position with head pose offset
    const gazeX = Math.max(0, Math.min(1, avgIrisRelX + headPose.yaw * 0.45));
    const gazeY = Math.max(0, Math.min(1, avgIrisRelY + headPose.pitch * 0.45));

    // Direction classification
    let gazeDirection: GazeDirection = 'CENTER';
    if (gazeX < 0.40) gazeDirection = 'LEFT';
    else if (gazeX > 0.60) gazeDirection = 'RIGHT';
    else if (gazeY < 0.38) gazeDirection = 'UP';
    else if (gazeY > 0.62) gazeDirection = 'DOWN';

    return {
      leftEyeOpenness: leftEAR,
      rightEyeOpenness: rightEAR,
      blinkState,
      irisLeft,
      irisRight,
      normalizedGaze: { x: gazeX, y: gazeY },
      gazeDirection,
      headPose,
    };
  }

  public setThresholds(earThreshold: number, longBlinkMs: number) {
    this.earBlinkThreshold = earThreshold;
    this.longBlinkThresholdMs = longBlinkMs;
  }
}
