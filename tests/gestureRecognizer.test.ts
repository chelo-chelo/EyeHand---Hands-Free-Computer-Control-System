import { describe, it, expect } from 'vitest';
import { GestureRecognizer } from '../src/vision/gestureRecognizer';
import { Point3D } from '../src/types';

describe('GestureRecognizer', () => {
  const recognizer = new GestureRecognizer(0.06);

  // Helper to construct a synthetic hand skeleton
  const createHand = (options: {
    thumbTipDist?: number;
    indexExtended?: boolean;
    middleExtended?: boolean;
    ringExtended?: boolean;
    pinkyExtended?: boolean;
  }): Point3D[] => {
    const landmarks: Point3D[] = [];
    const wrist: Point3D = { x: 0.5, y: 0.8, z: 0 };
    landmarks[0] = wrist;

    // Thumb
    landmarks[1] = { x: 0.45, y: 0.75, z: 0 };
    landmarks[2] = { x: 0.40, y: 0.70, z: 0 };
    landmarks[3] = { x: 0.38, y: 0.65, z: 0 };
    const thumbDist = options.thumbTipDist ?? 0.15;
    landmarks[4] = { x: 0.40, y: 0.8 - thumbDist, z: 0 }; // Thumb tip

    // Fingers: Index (5-8), Middle (9-12), Ring (13-16), Pinky (17-20)
    const setupFinger = (baseIdx: number, extended: boolean, baseX: number) => {
      landmarks[baseIdx] = { x: baseX, y: 0.6, z: 0 };     // MCP
      landmarks[baseIdx + 1] = { x: baseX, y: 0.5, z: 0 }; // PIP
      landmarks[baseIdx + 2] = { x: baseX, y: 0.4, z: 0 }; // DIP
      landmarks[baseIdx + 3] = { x: baseX, y: extended ? 0.3 : 0.65, z: 0 }; // Tip
    };

    setupFinger(5, options.indexExtended ?? true, 0.45);
    setupFinger(9, options.middleExtended ?? true, 0.50);
    setupFinger(13, options.ringExtended ?? true, 0.55);
    setupFinger(17, options.pinkyExtended ?? true, 0.60);

    return landmarks;
  };

  it('recognizes OPEN_PALM when all fingers are extended', () => {
    const hand = createHand({
      thumbTipDist: 0.35,
      indexExtended: true,
      middleExtended: true,
      ringExtended: true,
      pinkyExtended: true,
    });
    const result = recognizer.analyze(hand, 1000);
    expect(result.gesture).toBe('OPEN_PALM');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('recognizes FIST when all fingers are folded', () => {
    const hand = createHand({
      thumbTipDist: 0.05,
      indexExtended: false,
      middleExtended: false,
      ringExtended: false,
      pinkyExtended: false,
    });
    const result = recognizer.analyze(hand, 1000);
    expect(result.gesture).toBe('FIST');
  });

  it('recognizes POINT when only index finger is extended', () => {
    const hand = createHand({
      thumbTipDist: 0.05,
      indexExtended: true,
      middleExtended: false,
      ringExtended: false,
      pinkyExtended: false,
    });
    const result = recognizer.analyze(hand, 1000);
    expect(result.gesture).toBe('POINT');
  });

  it('triggers PINCH_START when thumb and index tip distance falls below threshold', () => {
    const hand = createHand({
      indexExtended: true,
      middleExtended: false,
      ringExtended: false,
      pinkyExtended: false,
    });
    // Set thumb tip close to index tip (landmark 8)
    hand[4] = { x: hand[8].x + 0.02, y: hand[8].y + 0.02, z: 0 };

    const result = recognizer.analyze(hand, 2000);
    expect(result.pinchState).toBe('PINCH_START');
    expect(result.isDragging).toBe(false);
  });
});
