// ============================================================================
// Cursor View: One Euro Smoothing, Dead Zone, Dwell Clicker Tuning
// ============================================================================

import React, { useState } from 'react';
import { controlEngine } from '../core/controlEngine';
import { profileManager } from '../core/profileManager';
import { CursorMode } from '../types';
import { MousePointer, Clock, Target, CheckCircle2, Shield } from 'lucide-react';

const DWELL_PRESETS = [100, 250, 500, 750, 1000, 1500];

export const CursorView: React.FC = () => {
  const [settings, setSettings] = useState(profileManager.getActiveProfile().settings);
  const [testClickCount, setTestClickCount] = useState(0);
  const [testTargetActive, setTestTargetActive] = useState(false);

  const updateSetting = (key: string, value: any) => {
    profileManager.updateActiveSettings({ [key]: value });
    const updated = profileManager.getActiveProfile().settings;
    setSettings(updated);

    if (key === 'cursorMode') {
      controlEngine.setMode(value as CursorMode);
    } else if (key === 'eyeDwellTimeMs') {
      controlEngine.updateDwellDuration(value);
    } else if (key === 'eyeSmoothing' || key === 'eyeDeadZone') {
      controlEngine.updateSmoothing(1.1, updated.eyeSmoothing, updated.eyeDeadZone);
    }
  };

  const handleTestTargetClick = () => {
    setTestClickCount((c) => c + 1);
    setTestTargetActive(true);
    setTimeout(() => setTestTargetActive(false), 500);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <MousePointer size={24} color="#818cf8" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Virtual Cursor & Dwell Clicker</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Fine-tune One Euro jitter reduction, dead zone filters, and dwell countdown durations for effortless clicking.
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {(
          [
            { id: 'HYBRID', title: 'Hybrid Mode (Recommended)', desc: 'Eyes control cursor position, Hand pinch or dwell clicks.' },
            { id: 'EYE', title: 'Eye Only Mode', desc: 'Eyes control cursor position and dwell countdown triggers clicks.' },
            { id: 'HAND', title: 'Hand Only Mode', desc: 'Index finger pointing guides cursor, Pinch gestures trigger clicks.' },
          ] as { id: CursorMode; title: string; desc: string }[]
        ).map((m) => (
          <div
            key={m.id}
            onClick={() => updateSetting('cursorMode', m.id)}
            className="glass-panel glass-panel-interactive"
            style={{
              padding: '20px',
              border: settings.cursorMode === m.id ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
              boxShadow: settings.cursorMode === m.id ? '0 0 20px rgba(6, 182, 212, 0.35)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.title}</h3>
              {settings.cursorMode === m.id && <CheckCircle2 size={18} color="#06b6d4" />}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Dwell Click Configuration */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dwell-Based Click Duration</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          When fixating your gaze on an interactive element, a circular countdown appears before triggering a click.
        </p>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {DWELL_PRESETS.map((ms) => (
            <button
              key={ms}
              onClick={() => updateSetting('eyeDwellTimeMs', ms)}
              className={`btn ${settings.eyeDwellTimeMs === ms ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '84px' }}
            >
              {ms} ms
            </button>
          ))}
        </div>

        {/* Interactive Dwell Test Target */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px dashed rgba(6, 182, 212, 0.4)',
            borderRadius: '12px',
            padding: '36px 20px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '14px' }}>
            Look or hover at the target below to test your dwell click timing:
          </p>

          <button
            onClick={handleTestTargetClick}
            className="btn btn-primary"
            style={{
              padding: '16px 36px',
              fontSize: '1.1rem',
              transform: testTargetActive ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.1s ease',
              background: testTargetActive ? '#10b981' : undefined,
            }}
          >
            <Target size={22} />
            {testTargetActive ? 'CLICK TRIGGERED!' : 'Fixate Here to Click'}
          </button>

          <p style={{ marginTop: '14px', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
            Total Test Clicks: {testClickCount}
          </p>
        </div>
      </div>

      {/* Smoothing & Dead Zone Sliders */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Filter & Dead Zone Parameters</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Smoothing Factor (OneEuro Beta) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Jitter Smoothing (One Euro Filter Responsiveness)</label>
              <span style={{ color: '#06b6d4', fontWeight: 700 }}>{(settings.eyeSmoothing * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.08"
              step="0.005"
              value={settings.eyeSmoothing}
              onChange={(e) => updateSetting('eyeSmoothing', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Dead Zone Radius */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Movement Dead Zone Radius (Pixel Threshold)</label>
              <span style={{ color: '#06b6d4', fontWeight: 700 }}>{settings.eyeDeadZone} px</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={settings.eyeDeadZone}
              onChange={(e) => updateSetting('eyeDeadZone', parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
