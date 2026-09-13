import { describe, it, expect } from 'vitest';
import { OneEuroFilter, Point2DSmoother } from '../src/core/filters/oneEuroFilter';

describe('OneEuroFilter', () => {
  it('smooths high frequency noise during stationary gaze', () => {
    const filter = new OneEuroFilter(1.0, 0.02);
    let time = 1000;
    const baseValue = 500;

    // First value initializes the filter
    const initial = filter.filter(baseValue, time);
    expect(initial).toBe(baseValue);

    // Apply high frequency jitter around 500: alternating 505 and 495
    const results: number[] = [];
    for (let i = 0; i < 20; i++) {
      time += 33; // ~30 FPS
      const noisy = baseValue + (i % 2 === 0 ? 5 : -5);
      results.push(filter.filter(noisy, time));
    }

    // Filter output must be significantly smoother than ±5
    const last = results[results.length - 1];
    expect(Math.abs(last - baseValue)).toBeLessThan(2.5);
  });

  it('Point2DSmoother suppresses micro-jitter within dead zone', () => {
    const smoother = new Point2DSmoother(1.0, 0.02, 5); // 5px deadzone
    const pt1 = smoother.smooth(100, 200, 1000);
    expect(pt1.x).toBeCloseTo(100, 0);

    // Minor deviation below 5px
    const pt2 = smoother.smooth(102, 201, 1033);
    // Should remain locked to initial position due to dead zone
    expect(pt2.x).toBe(pt1.x);
    expect(pt2.y).toBe(pt1.y);
  });
});
