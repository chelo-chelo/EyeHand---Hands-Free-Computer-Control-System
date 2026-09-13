import { describe, it, expect, beforeEach } from 'vitest';
import { SafetyManager } from '../src/core/safetyManager';

describe('SafetyManager', () => {
  let safety: SafetyManager;

  beforeEach(() => {
    // Mock window event listener for testing
    global.window = {
      addEventListener: () => {},
    } as any;
    safety = new SafetyManager();
  });

  it('immediately pauses control upon emergency stop', () => {
    safety.triggerEmergencyStop();
    const status = safety.getStatus();
    expect(status.isEmergencyStopped).toBe(true);
    expect(status.isControlPaused).toBe(true);
    expect(safety.canExecuteAction(0.95)).toBe(false);
  });

  it('pauses control when tracking is lost', () => {
    safety.handleTrackingLoss(true, 'No face detected');
    const status = safety.getStatus();
    expect(status.isTrackingLost).toBe(true);
    expect(status.isControlPaused).toBe(true);
    expect(safety.canExecuteAction(0.95)).toBe(false);
  });

  it('pauses control when multiple faces are detected', () => {
    safety.handleMultipleFaces(true);
    const status = safety.getStatus();
    expect(status.multipleFacesDetected).toBe(true);
    expect(status.isControlPaused).toBe(true);
    expect(safety.canExecuteAction(0.95)).toBe(false);
  });

  it('enforces action cooldowns to prevent accidental repeat clicks', () => {
    const t0 = 10000;
    safety.setActionCooldown(300);

    expect(safety.canExecuteAction(0.9, t0)).toBe(true);
    safety.markActionExecuted(t0);

    // Immediate subsequent action within 300ms must be rejected
    expect(safety.canExecuteAction(0.9, t0 + 100)).toBe(false);

    // Action after 300ms is permitted
    expect(safety.canExecuteAction(0.9, t0 + 350)).toBe(true);
  });
});
