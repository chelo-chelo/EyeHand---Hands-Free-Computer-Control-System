// ============================================================================
// Help View: Camera Ergonomics, Troubleshooting FAQ & Hotkey Reference
// ============================================================================

import React from 'react';
import { HelpCircle, Camera, AlertTriangle, ShieldCheck, Keyboard, Sparkles } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HelpCircle size={24} color="#06b6d4" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Help Center & Ergonomics Guide</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Best practices for camera placement, illumination, gesture reliability, and common troubleshooting solutions.
        </p>
      </div>

      {/* Camera Positioning Guide */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Camera size={20} color="#22d3ee" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ideal Camera Positioning Guidelines</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '6px' }}>Distance: 50–70 cm</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Position yourself approximately an arm's length from your webcam so your face and eyes occupy roughly 30% of the camera frame.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '6px' }}>Height: Eye Level</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Mount the webcam near the top edge of your monitor at eye level. Avoid steep downward or upward angles.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '6px' }}>Lighting: Front Light</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Ensure your face is illuminated from the front. Avoid harsh backlights (e.g. sitting with a bright window behind you).
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting FAQ */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Frequently Asked Questions</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>
              Q: The cursor moves slightly when I look at one spot. How do I stop jitter?
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              In <strong>Cursor Settings</strong>, increase the <em>Dead Zone</em> to 5–8 pixels. This suppresses micro-tremors and natural eye saccades during fixation.
            </p>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>
              Q: What is the difference between Simulation Mode and Desktop OS Control?
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <strong>Simulation Mode</strong> renders a virtual cursor within the EyeHand window for safe practice without altering your Windows desktop. <strong>Desktop OS Control</strong> activates the native Win32 bridge to control physical Windows applications.
            </p>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>
              Q: How do I pause control instantly?
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Press <strong>ESC</strong> on your keyboard, click the red <strong>STOP ALL CONTROL</strong> button at top right, or show an <strong>Open Palm</strong> gesture.
            </p>
          </div>
        </div>
      </div>

      {/* Native Bridge Setup Instructions */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Keyboard size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Starting the Native Windows Control Bridge</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
          To allow EyeHand to send system-level mouse movements and clicks across Windows:
        </p>

        <pre
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
            color: '#38bdf8',
            overflowX: 'auto',
          }}
        >
          .\native\EyeHandBridge.exe
        </pre>
      </div>
    </div>
  );
};
