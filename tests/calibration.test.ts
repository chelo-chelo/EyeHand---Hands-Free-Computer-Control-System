import { describe, it, expect } from 'vitest';
import { CalibrationManager, CALIBRATION_9_POINTS } from '../src/core/calibration/calibrationManager';

describe('CalibrationManager', () => {
  it('computes affine polynomial mapping for 9 points with low error', () => {
    // Mock localStorage for test environment
    const storage: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => {},
      key: () => null,
      length: 0,
    } as any;

    const manager = new CalibrationManager();
    manager.clearSamples();

    // Simulate perfect linear mapping: gaze = target
    CALIBRATION_9_POINTS.forEach((pt) => {
      manager.addSample(
        pt.normalizedTarget,
        { x: pt.normalizedTarget.x, y: pt.normalizedTarget.y },
        { pitch: 0, yaw: 0, roll: 0 }
      );
    });

    const matrix = manager.computeCalibration();
    expect(matrix).not.toBeNull();
    expect(matrix!.quality).toBe('EXCELLENT');
    expect(matrix!.stabilityScore).toBeGreaterThanOrEqual(90);

    // Verify mapping of center point (0.5, 0.5)
    const mapped = manager.mapGazeToScreen({ x: 0.5, y: 0.5 }, { pitch: 0, yaw: 0, roll: 0 });
    expect(mapped.x).toBeCloseTo(0.5, 1);
    expect(mapped.y).toBeCloseTo(0.5, 1);
  });
});
