// ============================================================================
// Hand Control View: Landmark Diagnostics, Pinch Calibration & Drag Tuning
// ============================================================================

import React, { useState, useEffect } from 'react';
import { visionManager } from '../vision/visionManager';
import { profileManager } from '../core/profileManager';
import { HandTrackingData } from '../types';
import { Hand, Sliders, Move, ArrowUpDown, CheckCircle } from 'lucide-react';

export const HandControlView: React.FC = () => {
  const [handData, setHandData] = useState<HandTrackingData | null>(null);
  const [settings, setSettings] = useState(profileManager.getActiveProfile().settings);

  useEffect(() => {
    const unsub = visionManager.onFrame((_eye, hand) => setHandData(hand));
    return unsub;
  }, []);

  const updateSetting = (key: string, value: any) => {
    profileManager.updateActiveSettings({ [key]: value });
    setSettings(profileManager.getActiveProfile().settings);
  };

  const pinchDist = handData?.pinchDistance || 0.15;
  const pinchThreshold = settings.pinchClickThreshold;
  const isPinching = pinchDist < pinchThreshold;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Hand size={24} color="#10b981" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hand Tracking & Gesture Controls</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Calibrate thumb-index pinch click thresholds, finger pointing sensitivity, and two-finger scroll acceleration.
        </p>
      </div>

      {/* Live Pinch Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Pinch Meter Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Pinch Distance Calibrator</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
            Touch thumb and index fingertips together. When the distance falls below threshold, a click is triggered.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
              <span>Measured Distance:</span>
              <strong style={{ color: isPinching ? '#34d399' : '#f8fafc' }}>{(pinchDist * 100).toFixed(1)} mm</strong>
            </div>

            {/* Visual Pinch Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (pinchDist / 0.15) * 100)}%`,
                  height: '100%',
                  background: isPinching ? '#10b981' : '#f59e0b',
                  borderRadius: '8px',
                  transition: 'width 0.05s ease',
                }}
              />
              {/* Threshold Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(pinchThreshold / 0.15) * 100}%`,
                  width: '3px',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>State:</span>
            <span className={`badge ${isPinching ? 'badge-active' : 'badge-cyan'}`}>
              {handData?.pinchState || 'NONE'}
            </span>
          </div>
        </div>

        {/* Hand Landmark Status Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>21-Point Skeleton Feed</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Detection Status:</span>
              <p style={{ fontWeight: 700, color: handData?.detected ? '#34d399' : '#64748b' }}>
                {handData?.detected ? 'HAND DETECTED' : 'SEARCHING...'}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Handedness:</span>
              <p style={{ fontWeight: 700, color: '#f8fafc' }}>{handData?.handedness || 'Unknown'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Index Fingertip:</span>
              <p style={{ fontWeight: 700, color: '#38bdf8' }}>
                {handData ? `X: ${(handData.indexTip.x * 100).toFixed(0)}% Y: ${(handData.indexTip.y * 100).toFixed(0)}%` : '--'}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Dragging Mode:</span>
              <p style={{ fontWeight: 700, color: handData?.isDragging ? '#fb7185' : '#64748b' }}>
                {handData?.isDragging ? 'ACTIVE (DRAGGING)' : 'IDLE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hand Tuning Sliders */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Sensitivity & Gesture Tuning</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pinch Threshold Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Pinch Click Trigger Distance</label>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{(settings.pinchClickThreshold * 100).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.03"
              max="0.10"
              step="0.005"
              value={settings.pinchClickThreshold}
              onChange={(e) => updateSetting('pinchClickThreshold', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          {/* Scrolling Sensitivity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Two-Finger Vertical Scroll Sensitivity</label>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{settings.scrollSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.scrollSensitivity}
              onChange={(e) => updateSetting('scrollSensitivity', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
