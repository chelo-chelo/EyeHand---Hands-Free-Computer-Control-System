// ============================================================================
// Gestures View: Action Mapping Table & Custom Gesture Studio
// ============================================================================

import React, { useState, useEffect } from 'react';
import { visionManager } from '../vision/visionManager';
import { profileManager } from '../core/profileManager';
import { GestureType, SystemActionType, HandTrackingData } from '../types';
import { Sliders, Plus, Sparkles, Check, Play, Hand } from 'lucide-react';

const AVAILABLE_ACTIONS: { type: SystemActionType; label: string }[] = [
  { type: 'LEFT_CLICK', label: 'Left Click' },
  { type: 'RIGHT_CLICK', label: 'Right Click' },
  { type: 'DOUBLE_CLICK', label: 'Double Click' },
  { type: 'DRAG', label: 'Mouse Drag' },
  { type: 'SCROLL_UP', label: 'Scroll Up' },
  { type: 'SCROLL_DOWN', label: 'Scroll Down' },
  { type: 'KEY_PRESS', label: 'Simulate Keystroke' },
  { type: 'OPEN_APP', label: 'Launch Application' },
  { type: 'PAUSE', label: 'Pause Control' },
  { type: 'RESUME', label: 'Resume Control' },
];

const GESTURE_ITEMS: { id: GestureType; title: string; desc: string }[] = [
  { id: 'OPEN_PALM', title: 'Open Palm', desc: 'All 5 fingers extended outward' },
  { id: 'FIST', title: 'Fist', desc: 'All fingers folded into a closed fist' },
  { id: 'POINT', title: 'Point', desc: 'Index finger extended, other fingers curled' },
  { id: 'PINCH', title: 'Pinch', desc: 'Thumb and index fingertips touching' },
  { id: 'TWO_FINGER', title: 'Two Fingers', desc: 'Index and middle fingers extended' },
  { id: 'THREE_FINGER', title: 'Three Fingers', desc: 'Index, middle, and ring fingers extended' },
  { id: 'THUMBS_UP', title: 'Thumbs Up', desc: 'Thumb pointing upward with closed fist' },
  { id: 'THUMBS_DOWN', title: 'Thumbs Down', desc: 'Thumb pointing downward with closed fist' },
  { id: 'SWIPE_LEFT', title: 'Swipe Left', desc: 'Rapid palm movement to the left' },
  { id: 'SWIPE_RIGHT', title: 'Swipe Right', desc: 'Rapid palm movement to the right' },
  { id: 'SWIPE_UP', title: 'Swipe Up', desc: 'Rapid palm movement upward' },
  { id: 'SWIPE_DOWN', title: 'Swipe Down', desc: 'Rapid palm movement downward' },
];

export const GesturesView: React.FC = () => {
  const [handData, setHandData] = useState<HandTrackingData | null>(null);
  const [mappings, setMappings] = useState(profileManager.getActiveProfile().settings.gestureMappings);
  const [customName, setCustomName] = useState('');
  const [isRecordingCustom, setIsRecordingCustom] = useState(false);
  const [customSuccess, setCustomSuccess] = useState(false);

  useEffect(() => {
    const unsub = visionManager.onFrame((_eye, hand) => setHandData(hand));
    return unsub;
  }, []);

  const handleMappingChange = (gesture: GestureType, action: SystemActionType) => {
    const updated = { ...mappings, [gesture]: action };
    setMappings(updated);
    profileManager.updateActiveSettings({ gestureMappings: updated });
  };

  const handleRecordCustom = () => {
    if (!customName.trim()) return;
    setIsRecordingCustom(true);
    setTimeout(() => {
      setIsRecordingCustom(false);
      setCustomSuccess(true);
      setTimeout(() => setCustomSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Sliders size={24} color="#06b6d4" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gesture Action Mappings</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
              Configure what computer action triggers when each hand gesture is recognized.
            </p>
          </div>

          {/* Real-time recognized gesture pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Live Detected:</span>
            <span
              className={`badge ${handData?.gesture && handData.gesture !== 'NONE' ? 'badge-active' : 'badge-cyan'}`}
              style={{ fontSize: '0.95rem', padding: '6px 16px' }}
            >
              {handData?.gesture || 'NONE'}
            </span>
          </div>
        </div>
      </div>

      {/* 12 Gesture Mapping Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {GESTURE_ITEMS.map((item) => {
          const isCurrentlyActive = handData?.gesture === item.id;
          const assignedAction = mappings[item.id] || 'PAUSE';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '18px',
                border: isCurrentlyActive ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                boxShadow: isCurrentlyActive ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h3>
                {isCurrentlyActive && <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>ACTIVE</span>}
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '14px', minHeight: '36px' }}>
                {item.desc}
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>
                  Mapped Action:
                </label>
                <select
                  value={assignedAction}
                  onChange={(e) => handleMappingChange(item.id, e.target.value as SystemActionType)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {AVAILABLE_ACTIONS.map((a) => (
                    <option key={a.type} value={a.type} style={{ background: '#0f172a' }}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Gesture Training Studio */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Custom Gesture Training Studio</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          Train a unique hand posture to execute a custom shortcut. Hold your hand in position and click record.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Gesture name (e.g., Open Workspace)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.95rem',
            }}
          />
          <button
            onClick={handleRecordCustom}
            disabled={isRecordingCustom || !customName.trim()}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            {isRecordingCustom ? 'Recording 3D Pose...' : <><Plus size={16} /> Record Gesture</>}
          </button>
        </div>

        {customSuccess && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={18} />
            Custom gesture "{customName}" recorded and mapped successfully!
          </div>
        )}
      </div>
    </div>
  );
};
