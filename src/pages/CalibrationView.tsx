// ============================================================================
// Eye Calibration Wizard: 9-Point Bivariate Regression & Quality Evaluation
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  calibrationManager,
  CALIBRATION_9_POINTS,
  CalibrationTargetPoint,
} from '../core/calibration/calibrationManager';
import { visionManager } from '../vision/visionManager';
import { CalibrationMatrix, EyeTrackingData } from '../types';
import { Sparkles, RefreshCw, Trash2, CheckCircle2, Star, AlertCircle, Play } from 'lucide-react';

export const CalibrationView: React.FC = () => {
  const [matrix, setMatrix] = useState<CalibrationMatrix | null>(calibrationManager.getCurrentMatrix());
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0); // 0 to 1
  const [eyeData, setEyeData] = useState<EyeTrackingData | null>(null);

  const stepTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);

  useEffect(() => {
    const unsubVision = visionManager.onFrame((eye) => {
      setEyeData(eye);
    });
    return () => {
      unsubVision();
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  const startCalibration = () => {
    calibrationManager.clearSamples();
    setIsCalibrating(true);
    setCurrentStepIndex(0);
    setStepProgress(0);
    runCalibrationStep(0);
  };

  const runCalibrationStep = (index: number) => {
    if (index >= CALIBRATION_9_POINTS.length) {
      // Finished all 9 points, compute regression!
      finishCalibration();
      return;
    }

    setCurrentStepIndex(index);
    setStepProgress(0);

    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds dwell per calibration target

    // Progress animation timer
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min(1.0, elapsed / duration);
      setStepProgress(prog);

      // Collect sample if eye is detected
      if (eyeData && eyeData.detected) {
        const pt = CALIBRATION_9_POINTS[index];
        calibrationManager.addSample(pt.normalizedTarget, eyeData.normalizedGaze, eyeData.headPose);
      }
    }, 60);

    // Step completion timer
    stepTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current);
      runCalibrationStep(index + 1);
    }, duration);
  };

  const finishCalibration = () => {
    clearTimers();
    setIsCalibrating(false);
    const computed = calibrationManager.computeCalibration();
    setMatrix(computed);

    if (computed && computed.stabilityScore >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const resetCalibration = () => {
    clearTimers();
    setIsCalibrating(false);
    calibrationManager.resetCalibration();
    setMatrix(null);
  };

  const currentTarget: CalibrationTargetPoint = CALIBRATION_9_POINTS[currentStepIndex] || CALIBRATION_9_POINTS[0];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Sparkles size={24} color="#06b6d4" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>9-Point Eye Calibration Wizard</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '640px', lineHeight: 1.5 }}>
              Follow the cyan target across 9 key screen coordinates with your eyes. EyeHand will personalize a polynomial
              mapping between your iris landmarks, head posture, and screen pixels.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isCalibrating ? (
              <button onClick={startCalibration} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <Play size={18} /> {matrix ? 'Recalibrate' : 'Start Calibration'}
              </button>
            ) : (
              <button onClick={resetCalibration} className="btn btn-danger" style={{ padding: '12px 24px' }}>
                Cancel
              </button>
            )}

            {matrix && !isCalibrating && (
              <button onClick={resetCalibration} className="btn btn-secondary" style={{ padding: '12px 18px' }} title="Reset calibration to default">
                <Trash2 size={16} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Calibration Target Stage */}
      {isCalibrating ? (
        <div
          className="glass-panel"
          style={{
            position: 'relative',
            height: '480px',
            background: '#020617',
            border: '2px solid #06b6d4',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Step Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '6px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              fontSize: '0.9rem',
              fontWeight: 700,
              zIndex: 10,
            }}
          >
            Target {currentStepIndex + 1} of 9: {currentTarget.label}
          </div>

          {/* Animated Calibration Target */}
          <div
            style={{
              position: 'absolute',
              top: `${currentTarget.normalizedTarget.y * 100}%`,
              left: `${currentTarget.normalizedTarget.x * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Pulsing Target Dot */}
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#06b6d4',
                boxShadow: '0 0 20px #06b6d4, 0 0 40px #22d3ee',
              }}
            />

            {/* Radial Countdown Progress Ring */}
            <svg style={{ position: 'absolute', width: '54px', height: '54px', transform: 'rotate(-90deg)' }}>
              <circle
                cx="27"
                cy="27"
                r="22"
                fill="none"
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="27"
                cy="27"
                r="22"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={(2 * Math.PI * 22) * (1 - stepProgress)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ) : (
        /* Calibration Quality Report Card */
        <div style={{ display: 'grid', gridTemplateColumns: matrix ? '1.5fr 1fr' : '1fr', gap: '24px' }}>
          {matrix ? (
            <>
              {/* Quality Metrics */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CheckCircle2 size={22} color="#10b981" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Calibration Quality Assessment</h3>
                </div>

                {/* Stars Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={24}
                        fill={s <= (matrix.quality === 'EXCELLENT' ? 5 : matrix.quality === 'GOOD' ? 4 : matrix.quality === 'FAIR' ? 3 : 2) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                    {matrix.quality === 'EXCELLENT' ? '4.8 / 5.0' : matrix.quality === 'GOOD' ? '4.2 / 5.0' : '3.0 / 5.0'}
                  </span>
                  <span
                    className={`badge ${matrix.quality === 'EXCELLENT' || matrix.quality === 'GOOD' ? 'badge-active' : 'badge-paused'}`}
                  >
                    {matrix.quality}
                  </span>
                </div>

                {/* Metric Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#94a3b8' }}>Gaze Stability Score:</span>
                      <strong style={{ color: '#38bdf8' }}>{matrix.stabilityScore}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${matrix.stabilityScore}%`, height: '100%', background: '#06b6d4', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#94a3b8' }}>Estimated Gaze Error:</span>
                      <strong style={{ color: '#f8fafc' }}>{(matrix.meanError * 100).toFixed(1)}% error radius</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(5, 100 - matrix.meanError * 300)}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div
                  style={{
                    marginTop: '24px',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {matrix.quality === 'EXCELLENT' || matrix.quality === 'GOOD' ? (
                      '✓ Excellent tracking calibration. Your gaze coordinates are cleanly mapped across all screen bounds.'
                    ) : (
                      '⚠ Noticeable jitter detected during calibration. For optimal accuracy: move 50–70 cm from camera, illuminate your face from the front, and keep head relatively stationary.'
                    )}
                  </p>
                </div>
              </div>

              {/* 9-Point Grid Preview */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Calibrated Screen Geometry</h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '20px',
                    borderRadius: '12px',
                  }}
                >
                  {CALIBRATION_9_POINTS.map((pt) => (
                    <div
                      key={pt.id}
                      style={{
                        padding: '16px 8px',
                        borderRadius: '8px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        color: '#22d3ee',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {pt.label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
              <AlertCircle size={36} color="#fbbf24" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Not Yet Calibrated</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
                EyeHand is currently using default geometric estimates. Calibrate now to personalize your gaze tracking model.
              </p>
              <button onClick={startCalibration} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <Play size={18} /> Begin 9-Point Calibration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
