// ============================================================================
// Keyboard View: Virtual Keyboard Studio & Dwell Typing Tester
// ============================================================================

import React, { useState } from 'react';
import { VirtualKeyboard } from '../components/keyboard/VirtualKeyboard';
import { Keyboard as KeyboardIcon, Sparkles, CheckSquare, Maximize2 } from 'lucide-react';

export const KeyboardView: React.FC = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(true);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <KeyboardIcon size={24} color="#06b6d4" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Virtual On-Screen Keyboard</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
              Accessible on-screen keyboard featuring eye-gaze dwell typing, hand pointing selection, and real-time word prediction.
            </p>
          </div>

          <button onClick={() => setIsKeyboardOpen(!isKeyboardOpen)} className="btn btn-primary">
            {isKeyboardOpen ? 'Hide Keyboard' : 'Show Keyboard'}
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#22d3ee' }}>Dwell Typing</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Fixate your gaze on any key to trigger keystrokes without clicking. The dwell progress indicator provides visual confirmation.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#34d399' }}>Word Prediction</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Frequently used vocabulary suggestions appear as you type, reducing required keystrokes by up to 60%.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#818cf8' }}>Large Key Mode</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Expands key target dimensions for users with motor tremors or lower eye-tracking stability.
          </p>
        </div>
      </div>

      {/* Embed Virtual Keyboard component */}
      <VirtualKeyboard isOpen={isKeyboardOpen} onClose={() => setIsKeyboardOpen(false)} />
    </div>
  );
};
