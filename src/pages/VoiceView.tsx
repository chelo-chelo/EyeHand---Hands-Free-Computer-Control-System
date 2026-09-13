// ============================================================================
// Voice View: Speech Recognition Whitelist, Live Testing & App Shortcuts
// ============================================================================

import React, { useState, useEffect } from 'react';
import { voiceController, VOICE_COMMANDS, VoiceCommandMatch } from '../voice/voiceController';
import { profileManager } from '../core/profileManager';
import { Mic, MicOff, Check, ShieldCheck, Play, Sparkles } from 'lucide-react';

export const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(voiceController.getIsListening());
  const [lastMatch, setLastMatch] = useState<VoiceCommandMatch | null>(null);
  const [isSupported] = useState(voiceController.getIsSupported());

  useEffect(() => {
    const unsub = voiceController.subscribe((match) => {
      setLastMatch(match);
    });
    return unsub;
  }, []);

  const handleToggleVoice = () => {
    if (isListening) {
      voiceController.stop();
      setIsListening(false);
      profileManager.updateActiveSettings({ voiceEnabled: false });
    } else {
      voiceController.start();
      setIsListening(true);
      profileManager.updateActiveSettings({ voiceEnabled: true });
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Toggle */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Mic size={24} color="#f59e0b" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Voice Command Assistant</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
              Hands-free speech recognition matching strictly predefined, safe desktop command phrases.
            </p>
          </div>

          <button
            onClick={handleToggleVoice}
            disabled={!isSupported}
            className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Stop Listening' : 'Start Voice Control'}
          </button>
        </div>
      </div>

      {/* Live Status & Audio Feedback */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Speech Recognizer Telemetry</h3>
          <div className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Strict Whitelist Protected
          </div>
        </div>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Last Heard Speech:</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              "{lastMatch ? lastMatch.rawTranscript : isListening ? 'Listening for speech...' : 'Microphone inactive'}"
            </p>
          </div>

          {lastMatch && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Triggered Action:</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {lastMatch.action} ({Math.round(lastMatch.confidence * 100)}%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Whitelisted Command Reference Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Whitelisted Voice Command Grammar</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          For absolute safety, EyeHand strictly ignores any spoken phrases not explicitly listed below.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          {VOICE_COMMANDS.map((cmd) => (
            <div
              key={cmd.phrase}
              style={{
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22d3ee', fontSize: '0.95rem' }}>
                  "{cmd.phrase}"
                </span>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{cmd.desc}</p>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                {cmd.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
