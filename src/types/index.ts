// ============================================================================
// EyeHand Core Type Definitions & HCI Interfaces
// ============================================================================

export type Point2D = {
  x: number;
  y: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

// Hand Landmark names for 21 points
export type HandLandmarkName =
  | 'wrist'
  | 'thumb_cmc' | 'thumb_mcp' | 'thumb_ip' | 'thumb_tip'
  | 'index_finger_mcp' | 'index_finger_pip' | 'index_finger_dip' | 'index_finger_tip'
  | 'middle_finger_mcp' | 'middle_finger_pip' | 'middle_finger_dip' | 'middle_finger_tip'
  | 'ring_finger_mcp' | 'ring_finger_pip' | 'ring_finger_dip' | 'ring_finger_tip'
  | 'pinky_mcp' | 'pinky_pip' | 'pinky_dip' | 'pinky_tip';

export type GestureType =
  | 'NONE'
  | 'OPEN_PALM'
  | 'FIST'
  | 'POINT'
  | 'PINCH'
  | 'TWO_FINGER'
  | 'THREE_FINGER'
  | 'THUMBS_UP'
  | 'THUMBS_DOWN'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'
  | 'SWIPE_UP'
  | 'SWIPE_DOWN';

export type PinchState = 'NONE' | 'PINCH_START' | 'PINCH_HOLD' | 'PINCH_RELEASE';

export interface HandTrackingData {
  detected: boolean;
  handedness: 'Left' | 'Right' | 'Unknown';
  landmarks: Point3D[];
  palmCenter: Point3D;
  indexTip: Point3D;
  thumbTip: Point3D;
  pinchDistance: number;
  isPinching: boolean;
  pinchState: PinchState;
  isDragging: boolean;
  gesture: GestureType;
  gestureConfidence: number;
  swipeDirection?: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
}

export type GazeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export type BlinkState = 'OPEN' | 'NATURAL_BLINK' | 'LONG_BLINK' | 'DOUBLE_BLINK';

export interface EyeTrackingData {
  detected: boolean;
  confidence: number;
  leftEyeOpenness: number; // EAR (0.0 to 0.5)
  rightEyeOpenness: number;
  blinkState: BlinkState;
  gazeDirection: GazeDirection;
  normalizedGaze: Point2D; // (0.0 to 1.0) relative to screen
  irisLeft: Point3D;
  irisRight: Point3D;
  headPose: {
    pitch: number; // up/down
    yaw: number;   // left/right
    roll: number;  // tilt
  };
  screenX: number;
  screenY: number;
}

export type CursorMode = 'EYE' | 'HAND' | 'HYBRID';

export interface CursorState {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  mode: CursorMode;
  isDwellActive: boolean;
  dwellProgress: number; // 0 to 1
  isDragging: boolean;
  lastAction?: string;
  speed: number;
}

export type SystemActionType =
  | 'MOVE'
  | 'LEFT_CLICK'
  | 'RIGHT_CLICK'
  | 'DOUBLE_CLICK'
  | 'MOUSE_DOWN'
  | 'MOUSE_UP'
  | 'DRAG'
  | 'SCROLL_UP'
  | 'SCROLL_DOWN'
  | 'KEY_PRESS'
  | 'OPEN_APP'
  | 'PAUSE'
  | 'RESUME'
  | 'EMERGENCY_STOP';

export interface ActionEvent {
  type: SystemActionType;
  source: 'EYE' | 'HAND' | 'VOICE' | 'HOTKEY' | 'UI';
  payload?: any;
  timestamp: number;
}

export interface CalibrationSample {
  target: Point2D; // screen pixel or normalized coordinate
  gaze: Point2D;   // observed iris/pupil relative position
  headPose: { pitch: number; yaw: number; roll: number };
}

export interface CalibrationMatrix {
  polynomialX: number[];
  polynomialY: number[];
  meanError: number;
  stabilityScore: number;
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  timestamp: number;
}

export interface SafetyStatus {
  isEmergencyStopped: boolean;
  isControlPaused: boolean;
  isSystemControlEnabled: boolean; // false = simulation mode, true = real OS control
  isTrackingLost: boolean;
  multipleFacesDetected: boolean;
  lightingStatus: 'OPTIMAL' | 'TOO_DARK' | 'TOO_BRIGHT' | 'FACE_TOO_FAR' | 'FACE_OFF_CENTER';
  pauseReason?: string;
}

export interface SystemMetrics {
  fps: number;
  latencyMs: number;
  frameProcessingTimeMs: number;
  cameraResolution: { width: number; height: number };
  systemScreenWidth: number;
  systemScreenHeight: number;
  isNativeBridgeConnected: boolean;
}

export interface AppSettings {
  // General & Mode
  cursorMode: CursorMode;
  isSystemControlEnabled: boolean;
  performancePreset: 'HIGH_QUALITY' | 'BALANCED' | 'PERFORMANCE';

  // Eye tracking settings
  eyeSensitivity: number; // 0.1 to 3.0
  eyeSmoothing: number;   // 0.1 to 1.0 (OneEuro filter beta)
  eyeDeadZone: number;    // pixel radius threshold
  eyeDwellTimeMs: number; // 100, 250, 500, 750, 1000, 1500
  enableBlinkClick: boolean;
  blinkHoldDurationMs: number;
  enableHeadAssistance: boolean;

  // Hand tracking settings
  handSensitivity: number;
  handSmoothing: number;
  pinchClickThreshold: number; // distance
  scrollSensitivity: number;

  // Gestures
  gestureMappings: Record<GestureType, SystemActionType>;

  // Voice
  voiceEnabled: boolean;
  voiceVolumeThreshold: number;

  // Accessibility
  theme: 'dark' | 'light' | 'high-contrast';
  largeUi: boolean;
  largeCursor: boolean;
  cursorTrail: boolean;
  soundFeedback: boolean;
  reducedMotion: boolean;

  // Safety
  pauseOnTrackingLoss: boolean;
  pauseOnMultipleFaces: boolean;
  clickCooldownMs: number;
  maxCursorSpeed: number;
}

export interface UserProfile {
  id: string;
  name: string;
  isDefault: boolean;
  settings: AppSettings;
  calibration?: CalibrationMatrix;
  createdAt: string;
}

export interface UsageStatistics {
  sessionDurationSec: number;
  totalClicks: number;
  totalPinches: number;
  totalDwells: number;
  totalGestures: number;
  totalVoiceCommands: number;
  averageConfidence: number;
  trackingInterruptions: number;
  timeInEyeControlSec: number;
  timeInHandControlSec: number;
}
