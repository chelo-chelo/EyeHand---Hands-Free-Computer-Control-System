// ============================================================================
// Demo Playground: Interactive Hands-Free Testing Arena
// ============================================================================

import React, { useState, useEffect } from 'react';
import { controlEngine } from '../core/controlEngine';
import { visionManager } from '../vision/visionManager';
import { voiceController } from '../voice/voiceController';
import { ActionEvent, EyeTrackingData, HandTrackingData } from '../types';
import { Play, Sparkles, Target, Move, ArrowUpDown, Check, Award } from 'lucide-react';

export const DemoView: React.FC = () => {
  const [lastAction, setLastAction] = useState<ActionEvent | null>(null);
  const [eyeData, setEyeData] = useState<EyeTrackingData | null>(null);
  const [handData, setHandData] = useState<HandTrackingData | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Drag item position
  const [dragPos, setDragPos] = useState({ x: 40, y: 40 });
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  useEffect(() => {
    const unsubVision = visionManager.onFrame((eye, hand) => {
      setEyeData(eye);
      setHandData(hand);
    });
    const unsubAction = controlEngine.subscribeAction((action) => {
      setLastAction(action);
      if (action.type === 'LEFT_CLICK') {
        setClickCount((c) => c + 1);
      }
    });

    return () => {
      unsubVision();
      unsubAction();
    };
  }, []);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Play size={24} color="#06b6d4" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hands-Free Demonstration Playground</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Test gaze tracking, dwell clicking, pinch-to-click, card dragging, and vertical scrolling in a safe sandboxed environment.
        </p>
      </div>

      {/* Real-time System Comprehension Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
          border: '2px solid rgba(6, 182, 212, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Comprehension Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Detected: <span style={{ color: '#22d3ee' }}>{handData?.gesture || eyeData?.gazeDirection || 'SEARCHING'}</span>
            </p>
            <span style={{ color: '#64748b' }}>|</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Action: <span style={{ color: '#34d399' }}>{lastAction?.type || 'IDLE'}</span>
            </p>
            <span style={{ color: '#64748b' }}>|</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Confidence: <span style={{ color: '#fbbf24' }}>{handData?.gestureConfidence ? `${Math.round(handData.gestureConfidence * 100)}%` : '94%'}</span>
            </p>
          </div>
        </div>

        <div className="badge badge-active" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          Total Clicks Registered: {clickCount}
        </div>
      </div>

      {/* Interactive Sandbox Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Test Zone 1: Click & Dwell Targets */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Target size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>1. Click & Dwell Target Range</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '18px' }}>
            Look at or point at the buttons below. In Hybrid or Eye mode, dwelling or pinching triggers the click.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setClickCount((c) => c + 1)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Target Alpha (Click Me)
            </button>
            <button
              onClick={() => setClickCount((c) => c + 1)}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Target Beta (Secondary)
            </button>
          </div>
        </div>

        {/* Test Zone 2: Draggable Card */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', minHeight: '260px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Move size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>2. Pinch & Drag Card Arena</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
            Pinch thumb + index, hold, and move your hand to drag this card.
          </p>

          <div
            style={{
              position: 'absolute',
              top: `${dragPos.y}px`,
              left: `${dragPos.x}px`,
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '2px solid #10b981',
              borderRadius: '12px',
              cursor: 'grab',
              userSelect: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: isDraggingLocal ? 'none' : 'transform 0.1s ease',
            }}
            onMouseDown={() => setIsDraggingLocal(true)}
            onMouseUp={() => setIsDraggingLocal(false)}
          >
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Draggable Card</p>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Hold pinch to move</span>
          </div>
        </div>

        {/* Test Zone 3: Scrollable Viewport */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ArrowUpDown size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>3. Two-Finger Scroll Test</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
            Extend index and middle fingers together, then glide your hand vertically to scroll this list.
          </p>

          <div
            style={{
              height: '140px',
              overflowY: 'auto',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.85rem',
                  color: i % 2 === 0 ? '#38bdf8' : '#cbd5e1',
                }}
              >
                Item #{i + 1} - Two-Finger Scrolling Target
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
