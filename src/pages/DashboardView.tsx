// ============================================================================
// Dashboard View: Real-time Telemetry Widgets & Live Vision Preview
// ============================================================================

import React, { useEffect, useState } from 'react';
import { WebcamView } from '../components/webcam/WebcamView';
import { visionManager } from '../vision/visionManager';
import { controlEngine } from '../core/controlEngine';
import { safetyManager } from '../core/safetyManager';
import { profileManager } from '../core/profileManager';
import { voiceController } from '../voice/voiceController';
import { EyeTrackingData, HandTrackingData, CursorState, SafetyStatus, CursorMode } from '../types';
import { Eye, Hand, MousePointer, Cpu, Activity, Play, Sparkles } from 'lucide-react';
import { NavView } from '../components/layout/AppLayout';

export const DashboardView: React.FC<{ onNavigate: (view: NavView) => void }> = ({ onNavigate }) => {
  const [eyeData, setEyeData] = useState<EyeTrackingData | null>(null);
  const [handData, setHandData] = useState<HandTrackingData | null>(null);
  const [cursor, setCursor] = useState<CursorState>(controlEngine.getCursorState());
  const [safety, setSafety] = useState<SafetyStatus>(safetyManager.getStatus());
  const [settings, setSettings] = useState(profileManager.getActiveProfile().settings);
  const [isVoiceActive, setIsVoiceActive] = useState(voiceController.getIsListening());

  useEffect(() => {
    const unsubVision = visionManager.onFrame((eye, hand) => {
      setEyeData(eye);
      setHandData(hand);
    });
    const unsubCursor = controlEngine.subscribeCursor((c) => setCursor({ ...c }));
    const unsubSafety = safetyManager.subscribe((s) => setSafety({ ...s }));

    return () => {
      unsubVision();
      unsubCursor();
      unsubSafety();
    };
  }, []);

  const setCursorMode = (mode: CursorMode) => {
    controlEngine.setMode(mode);
    profileManager.updateActiveSettings({ cursorMode: mode });
    setSettings(profileManager.getActiveProfile().settings);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Quick Actions */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>Telemetry & Control Center</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Active Profile: <strong>{profileManager.getActiveProfile().name}</strong> | Control State:{' '}
            <span style={{ color: safety.isControlPaused ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
              {safety.isControlPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('calibration')} className="btn btn-primary" style={{ padding: '8px 16px' }}>
            <Sparkles size={16} /> Eye Calibration
          </button>
          <button onClick={() => onNavigate('demo')} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            <Play size={16} /> Test Playground
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry Cards & Live Camera */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Live Webcam View */}
        <div>
          <WebcamView />
        </div>

        {/* Right Column: 4 Telemetry Control Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: EYE TRACKING */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#22d3ee" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>EYE TRACKING</h3>
              </div>
              <span className={`badge ${eyeData?.detected ? 'badge-active' : 'badge-paused'}`}>
                {eyeData?.detected ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Confidence:</span>
                <p style={{ fontWeight: 700, color: '#f8fafc' }}>{eyeData?.detected ? `${Math.round(eyeData.confidence * 100)}%` : '--'}</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Gaze Direction:</span>
                <p style={{ fontWeight: 700, color: '#38bdf8' }}>{eyeData?.gazeDirection || 'CENTER'}</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Blink State:</span>
                <p style={{ fontWeight: 700, color: eyeData?.blinkState !== 'OPEN' ? '#34d399' : '#f8fafc' }}>
                  {eyeData?.blinkState === 'OPEN' ? 'OPEN' : eyeData?.blinkState || 'DETECTED'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Head Position:</span>
                <p style={{ fontWeight: 700, color: '#f8fafc' }}>
                  {eyeData?.headPose ? `Y: ${(eyeData.headPose.yaw * 10).toFixed(1)}° P: ${(eyeData.headPose.pitch * 10).toFixed(1)}°` : 'CENTER'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: HAND TRACKING */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hand size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>HAND TRACKING</h3>
              </div>
              <span className={`badge ${handData?.detected ? 'badge-active' : 'badge-paused'}`}>
                {handData?.detected ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Detected Hand:</span>
                <p style={{ fontWeight: 700, color: '#f8fafc' }}>{handData?.detected ? `${handData.handedness} Hand` : 'None'}</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Active Gesture:</span>
                <p style={{ fontWeight: 700, color: '#34d399' }}>{handData?.gesture || 'NONE'}</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Pinch State:</span>
                <p style={{ fontWeight: 700, color: handData?.isPinching ? '#fbbf24' : '#f8fafc' }}>
                  {handData?.pinchState || 'NONE'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Confidence:</span>
                <p style={{ fontWeight: 700, color: '#f8fafc' }}>
                  {handData?.detected ? `${Math.round(handData.gestureConfidence * 100)}%` : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: CURSOR CONTROL */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MousePointer size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>CURSOR</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['EYE', 'HAND', 'HYBRID'] as CursorMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCursorMode(m)}
                    className={`badge ${cursor.mode === m ? 'badge-active' : 'badge-cyan'}`}
                    style={{ cursor: 'pointer', border: 'none', padding: '3px 8px' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Screen Position:</span>
                <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  X: {Math.round(cursor.x)} / Y: {Math.round(cursor.y)}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Mode:</span>
                <p style={{ fontWeight: 700, color: '#818cf8' }}>{cursor.mode} CURSOR</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Dwell Timing:</span>
                <p style={{ fontWeight: 700, color: cursor.isDwellActive ? '#38bdf8' : '#f8fafc' }}>
                  {cursor.isDwellActive ? `${Math.round(cursor.dwellProgress * 100)}%` : `${settings.eyeDwellTimeMs}ms`}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Sensitivity:</span>
                <p style={{ fontWeight: 700, color: '#f8fafc' }}>{Math.round(settings.eyeSensitivity * 65)}%</p>
              </div>
            </div>
          </div>

          {/* Card 4: SYSTEM STATUS */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>SYSTEM</h3>
              </div>
              <span className="badge badge-active">HEALTHY</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Mouse Control:</span>
                <p style={{ fontWeight: 700, color: safety.isSystemControlEnabled ? '#34d399' : '#fbbf24' }}>
                  {safety.isSystemControlEnabled ? 'ENABLED (WIN32)' : 'SIMULATION'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Keyboard Control:</span>
                <p style={{ fontWeight: 700, color: '#34d399' }}>ENABLED</p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Voice Control:</span>
                <p style={{ fontWeight: 700, color: isVoiceActive ? '#34d399' : '#64748b' }}>
                  {isVoiceActive ? 'ACTIVE' : 'DISABLED'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Safety Interlocks:</span>
                <p style={{ fontWeight: 700, color: '#34d399' }}>ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
