// ============================================================================
// Eye Control View: Gaze Sensitivity, Blink Thresholds & Head Pose Coupling
// ============================================================================

import React, { useState, useEffect } from 'react';
import { visionManager } from '../vision/visionManager';
import { profileManager } from '../core/profileManager';
import { EyeTrackingData } from '../types';
import { Eye, Sliders, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const EyeControlView: React.FC = () => {
  const [eyeData, setEyeData] = useState<EyeTrackingData | null>(null);
  const [settings, setSettings] = useState(profileManager.getActiveProfile().settings);

  useEffect(() => {
    const unsub = visionManager.onFrame((eye) => setEyeData(eye));
    return unsub;
  }, []);

  const updateSetting = (key: string, value: any) => {
    profileManager.updateActiveSettings({ [key]: value });
    setSettings(profileManager.getActiveProfile().settings);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Eye size={24} color="#06b6d4" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Eye & Head Tracking Controls</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Configure gaze direction mapping, Eye Aspect Ratio (EAR) blink detection, and head pose coupling.
        </p>
      </div>

      {/* Live Eye Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Card 1: Gaze Direction Visualizer */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Current Gaze Direction</h3>
          <div
            style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 20px auto',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '2px solid rgba(6, 182, 212, 0.3)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Crosshairs */}
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Moving Iris Gaze Dot */}
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 15px #06b6d4',
                position: 'absolute',
                top: `${(eyeData?.normalizedGaze?.y || 0.5) * 100}%`,
                left: `${(eyeData?.normalizedGaze?.x || 0.5) * 100}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.08s ease-out',
              }}
            />
          </div>

          <span className="badge badge-cyan" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
            {eyeData?.gazeDirection || 'CENTER'}
          </span>
        </div>

        {/* Card 2: Blink & EAR Diagnostics */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Eye Openness (EAR)</h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
              <span>Left Eye EAR:</span>
              <strong style={{ color: '#22d3ee' }}>{(eyeData?.leftEyeOpenness || 0.3).toFixed(3)}</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}>
              <div
                style={{
                  width: `${Math.min(100, (eyeData?.leftEyeOpenness || 0.3) * 260)}%`,
                  height: '100%',
                  background: '#06b6d4',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
              <span>Right Eye EAR:</span>
              <strong style={{ color: '#22d3ee' }}>{(eyeData?.rightEyeOpenness || 0.3).toFixed(3)}</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}>
              <div
                style={{
                  width: `${Math.min(100, (eyeData?.rightEyeOpenness || 0.3) * 260)}%`,
                  height: '100%',
                  background: '#06b6d4',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Detected State:</span>
            <span
              className={`badge ${eyeData?.blinkState !== 'OPEN' ? 'badge-active' : 'badge-cyan'}`}
            >
              {eyeData?.blinkState || 'OPEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings & Tuning Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Blink & Head Assistance Preferences</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gaze Sensitivity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Gaze Cursor Sensitivity</label>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{settings.eyeSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.eyeSensitivity}
              onChange={(e) => updateSetting('eyeSensitivity', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Long Blink Click Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Intentional Long Blink Click</p>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Holding eyes closed intentionally for &gt;450ms triggers left click
              </span>
            </div>
            <button
              onClick={() => updateSetting('enableBlinkClick', !settings.enableBlinkClick)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.enableBlinkClick ? '#06b6d4' : '#64748b' }}
            >
              {settings.enableBlinkClick ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          {/* Head Assistance Coupling Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Combine Head Orientation with Eye Tracking</p>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Subtly tilts cursor coordinates based on natural head posture (pitch/yaw)
              </span>
            </div>
            <button
              onClick={() => updateSetting('enableHeadAssistance', !settings.enableHeadAssistance)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.enableHeadAssistance ? '#06b6d4' : '#64748b' }}
            >
              {settings.enableHeadAssistance ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
