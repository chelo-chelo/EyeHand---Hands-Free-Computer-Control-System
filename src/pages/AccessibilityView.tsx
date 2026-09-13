// ============================================================================
// Accessibility View: High Contrast, Large UI, Reduced Motion, Large Cursor
// ============================================================================

import React, { useState } from 'react';
import { profileManager } from '../core/profileManager';
import { Contrast, Eye, Type, Volume2, Sparkles, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export const AccessibilityView: React.FC = () => {
  const [settings, setSettings] = useState(profileManager.getActiveProfile().settings);

  const updateSetting = (key: string, value: any) => {
    profileManager.updateActiveSettings({ [key]: value });
    const updated = profileManager.getActiveProfile().settings;
    setSettings(updated);

    if (key === 'theme') {
      document.body.className = `theme-${value}`;
    }
    if (key === 'reducedMotion') {
      if (value) document.body.classList.add('reduced-motion');
      else document.body.classList.remove('reduced-motion');
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Contrast size={24} color="#06b6d4" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Accessibility & Assistive Settings</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Customize visual contrast, typography scaling, cursor visibility, and motion preferences tailored to individual needs.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Theme Palette */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px' }}>Color Contrast & Visual Theme</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'dark', label: 'Dark Mode (Default)' },
                  { id: 'light', label: 'Light Mode' },
                  { id: 'high-contrast', label: 'High Contrast (WCAG AAA)' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateSetting('theme', t.id)}
                  className={`btn ${settings.theme === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 20px' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Large Cursor Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>Large Virtual Cursor</p>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Enlarges cursor target to 42px diameter with enhanced luminous halo
              </span>
            </div>
            <button
              onClick={() => updateSetting('largeCursor', !settings.largeCursor)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.largeCursor ? '#06b6d4' : '#64748b' }}
            >
              {settings.largeCursor ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>Reduced Motion Mode</p>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Eliminates non-essential UI animations, pulsing effects, and transitions
              </span>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.reducedMotion ? '#06b6d4' : '#64748b' }}
            >
              {settings.reducedMotion ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
            </button>
          </div>

          {/* Sound Feedback Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>Audio Confirmation Cues</p>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Plays subtle auditory clicks upon successful dwell clicks, pinches, and safety pauses
              </span>
            </div>
            <button
              onClick={() => updateSetting('soundFeedback', !settings.soundFeedback)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.soundFeedback ? '#06b6d4' : '#64748b' }}
            >
              {settings.soundFeedback ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
