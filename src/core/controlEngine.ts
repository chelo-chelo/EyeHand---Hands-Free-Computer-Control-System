// ============================================================================
// Central HCI Control Engine: Multi-Modal Fusion, Priority & Action Dispatch
// ============================================================================

import {
  ActionEvent,
  CursorMode,
  CursorState,
  EyeTrackingData,
  HandTrackingData,
  SystemActionType,
} from '../types';
import { Point2DSmoother } from './filters/oneEuroFilter';
import { DwellDetector } from './filters/dwellDetector';
import { safetyManager } from './safetyManager';
import { calibrationManager } from './calibration/calibrationManager';
import { nativeBridge } from '../native/nativeBridgeClient';

export type CursorListener = (cursor: CursorState) => void;
export type ActionListener = (action: ActionEvent) => void;

export class ControlEngine {
  private mode: CursorMode = 'HYBRID'; // Default accessibility recommended
  private eyeSmoother: Point2DSmoother;
  private handSmoother: Point2DSmoother;
  private dwellDetector: DwellDetector;

  private cursorState: CursorState = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    normalizedX: 0.5,
    normalizedY: 0.5,
    mode: 'HYBRID',
    isDwellActive: false,
    dwellProgress: 0,
    isDragging: false,
    speed: 0,
  };

  private cursorListeners: Set<CursorListener> = new Set();
  private actionListeners: Set<ActionListener> = new Set();

  private lastPinchState: string = 'NONE';
  private lastBlinkClickTime: number = 0;
  private lastScrollTime: number = 0;
  private prevHandY: number = 0.5;

  constructor() {
    this.eyeSmoother = new Point2DSmoother(1.1, 0.03, 5);
    this.handSmoother = new Point2DSmoother(1.2, 0.04, 3);
    this.dwellDetector = new DwellDetector(750, 32, 500);
  }

  public subscribeCursor(listener: CursorListener): () => void {
    this.cursorListeners.add(listener);
    listener(this.cursorState);
    return () => this.cursorListeners.delete(listener);
  }

  public subscribeAction(listener: ActionListener): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  public setMode(mode: CursorMode) {
    this.mode = mode;
    this.cursorState.mode = mode;
    this.notifyCursor();
  }

  public getMode(): CursorMode {
    return this.mode;
  }

  public getCursorState(): CursorState {
    return this.cursorState;
  }

  public updateDwellDuration(ms: number) {
    this.dwellDetector.setParameters(ms, 32, 500);
  }

  public updateSmoothing(cutoff: number, beta: number, deadZone: number) {
    this.eyeSmoother.setParameters(cutoff, beta, deadZone);
    this.handSmoother.setParameters(cutoff * 1.1, beta * 1.2, deadZone);
  }

  private notifyCursor() {
    this.cursorListeners.forEach((l) => l(this.cursorState));
  }

  private notifyAction(action: ActionEvent) {
    this.actionListeners.forEach((l) => l(action));
  }

  /**
   * Main Frame Fusion Loop: Called every video frame with eye and hand detection
   */
  public updateFrame(
    eyeData: EyeTrackingData | null,
    handData: HandTrackingData | null,
    now: number = Date.now()
  ) {
    const safety = safetyManager.getStatus();

    if (safety.isEmergencyStopped || safety.isControlPaused) {
      this.dwellDetector.reset();
      this.cursorState.isDwellActive = false;
      this.cursorState.dwellProgress = 0;
      this.notifyCursor();
      return;
    }

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let targetX = this.cursorState.x;
    let targetY = this.cursorState.y;

    // 1. CURSOR POSITIONING LOGIC
    if (this.mode === 'EYE' || this.mode === 'HYBRID') {
      if (eyeData && eyeData.detected) {
        // Map raw gaze + head pose through 9-point calibration
        const mapped = calibrationManager.mapGazeToScreen(eyeData.normalizedGaze, eyeData.headPose);
        const rawPxX = mapped.x * screenW;
        const rawPxY = mapped.y * screenH;

        // Apply One Euro Smoothing Filter
        const smoothed = this.eyeSmoother.smooth(rawPxX, rawPxY, now);
        targetX = Math.max(0, Math.min(screenW, smoothed.x));
        targetY = Math.max(0, Math.min(screenH, smoothed.y));
      }
    } else if (this.mode === 'HAND') {
      if (handData && handData.detected) {
        // Index fingertip controls cursor
        // Mirror X for natural webcam interaction
        const mirroredX = 1 - handData.indexTip.x;
        const rawPxX = mirroredX * screenW;
        const rawPxY = handData.indexTip.y * screenH;

        const smoothed = this.handSmoother.smooth(rawPxX, rawPxY, now);
        targetX = Math.max(0, Math.min(screenW, smoothed.x));
        targetY = Math.max(0, Math.min(screenH, smoothed.y));
      }
    }

    // Compute cursor velocity
    const distMoved = Math.hypot(targetX - this.cursorState.x, targetY - this.cursorState.y);
    this.cursorState.speed = distMoved;
    this.cursorState.x = targetX;
    this.cursorState.y = targetY;
    this.cursorState.normalizedX = targetX / screenW;
    this.cursorState.normalizedY = targetY / screenH;

    // Sync with Windows OS via native bridge if System Control is active
    if (safety.isSystemControlEnabled) {
      nativeBridge.queueMove(
        Math.round(targetX),
        Math.round(targetY),
        this.cursorState.normalizedX,
        this.cursorState.normalizedY
      );
    }

    // 2. DWELL CLICK LOGIC (active in EYE mode or when hands are idle)
    if (this.mode === 'EYE' || (this.mode === 'HYBRID' && (!handData || !handData.detected))) {
      const dwell = this.dwellDetector.update(targetX, targetY, now, (cx, cy) => {
        this.dispatchAction('LEFT_CLICK', 'EYE', { x: cx, y: cy });
      });

      this.cursorState.isDwellActive = dwell.isActive;
      this.cursorState.dwellProgress = dwell.progress;
    } else {
      this.cursorState.isDwellActive = false;
      this.cursorState.dwellProgress = 0;
    }

    // 3. EYE BLINK INTENTIONAL CLICK (Long Blink / Double Blink)
    if (eyeData && eyeData.detected) {
      if (eyeData.blinkState === 'LONG_BLINK' && now - this.lastBlinkClickTime > 1200) {
        this.lastBlinkClickTime = now;
        this.dispatchAction('LEFT_CLICK', 'EYE', { type: 'LONG_BLINK' });
      } else if (eyeData.blinkState === 'DOUBLE_BLINK' && now - this.lastBlinkClickTime > 1200) {
        this.lastBlinkClickTime = now;
        this.dispatchAction('RIGHT_CLICK', 'EYE', { type: 'DOUBLE_BLINK' });
      }
    }

    // 4. HAND GESTURE & PINCH ACTIONS
    if (handData && handData.detected) {
      // Pinch state machine handling
      if (handData.pinchState === 'PINCH_START' && this.lastPinchState !== 'PINCH_START') {
        if (safetyManager.canExecuteAction(handData.gestureConfidence, now)) {
          // If in hybrid mode, pinch triggers left click
          this.dispatchAction('LEFT_CLICK', 'HAND', { pinchDistance: handData.pinchDistance });
          safetyManager.markActionExecuted(now);
        }
      }

      // Drag handling: Pinch hold + movement
      if (handData.isDragging && !this.cursorState.isDragging) {
        this.cursorState.isDragging = true;
        this.dispatchAction('MOUSE_DOWN', 'HAND');
      } else if (!handData.isDragging && this.cursorState.isDragging) {
        this.cursorState.isDragging = false;
        this.dispatchAction('MOUSE_UP', 'HAND');
      }

      // Two-Finger Scrolling
      if (handData.gesture === 'TWO_FINGER') {
        const deltaY = handData.palmCenter.y - this.prevHandY;
        if (Math.abs(deltaY) > 0.015 && now - this.lastScrollTime > 120) {
          this.lastScrollTime = now;
          const scrollDelta = deltaY > 0 ? -120 : 120;
          this.dispatchAction(deltaY > 0 ? 'SCROLL_DOWN' : 'SCROLL_UP', 'HAND', { delta: scrollDelta });
        }
      }

      this.prevHandY = handData.palmCenter.y;
      this.lastPinchState = handData.pinchState;
    }

    this.notifyCursor();
  }

  /**
   * Dispatch action to system or simulated UI
   */
  public dispatchAction(type: SystemActionType, source: ActionEvent['source'], payload: any = {}) {
    const safety = safetyManager.getStatus();
    const event: ActionEvent = { type, source, payload, timestamp: Date.now() };

    this.cursorState.lastAction = `${type} (${source})`;
    this.notifyAction(event);

    // If native system control enabled, dispatch to Windows OS!
    if (safety.isSystemControlEnabled) {
      switch (type) {
        case 'LEFT_CLICK':
          nativeBridge.click('left');
          break;
        case 'RIGHT_CLICK':
          nativeBridge.click('right');
          break;
        case 'DOUBLE_CLICK':
          nativeBridge.click('double');
          break;
        case 'MOUSE_DOWN':
          nativeBridge.mouseDown('left');
          break;
        case 'MOUSE_UP':
          nativeBridge.mouseUp('left');
          break;
        case 'SCROLL_UP':
          nativeBridge.scroll(120);
          break;
        case 'SCROLL_DOWN':
          nativeBridge.scroll(-120);
          break;
        case 'KEY_PRESS':
          if (payload.key) nativeBridge.keyPress(payload.key);
          break;
        case 'PAUSE':
          safetyManager.togglePause(true);
          break;
        case 'RESUME':
          safetyManager.togglePause(false);
          break;
        case 'EMERGENCY_STOP':
          safetyManager.triggerEmergencyStop();
          break;
        case 'OPEN_APP':
          if (payload.target) nativeBridge.openApp(payload.target);
          break;
      }
    }
  }
}

export const controlEngine = new ControlEngine();
