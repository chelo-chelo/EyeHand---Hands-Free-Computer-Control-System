// ============================================================================
// Virtual Cursor Overlay with Dwell Countdown & Gesture Feedback
// ============================================================================

import React, { useEffect, useState } from 'react';
import { controlEngine } from '../../core/controlEngine';
import { CursorState } from '../../types';

export const VirtualCursorOverlay: React.FC<{ isLargeCursor?: boolean; showTrail?: boolean }> = ({
  isLargeCursor = false,
  showTrail = false,
}) => {
  const [cursor, setCursor] = useState<CursorState>(controlEngine.getCursorState());
  const [recentAction, setRecentAction] = useState<string | null>(null);

  useEffect(() => {
    const unsubCursor = controlEngine.subscribeCursor((c) => setCursor({ ...c }));
    const unsubAction = controlEngine.subscribeAction((a) => {
      setRecentAction(`${a.type} (${a.source})`);
      setTimeout(() => setRecentAction(null), 1200);
    });
    return () => {
      unsubCursor();
      unsubAction();
    };
  }, []);

  const size = isLargeCursor ? 42 : 28;
  const radius = size / 2 + 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cursor.dwellProgress || 0) * circumference;

  return (
    <div className="virtual-cursor-layer" aria-hidden="true">
      <div
        className="virtual-cursor"
        style={{
          transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Core Cursor Dot */}
        <div
          className="virtual-cursor-dot"
          style={{
            width: isLargeCursor ? '16px' : '10px',
            height: isLargeCursor ? '16px' : '10px',
            background: cursor.isDragging ? '#f43f5e' : cursor.mode === 'HAND' ? '#10b981' : '#22d3ee',
          }}
        />

        {/* Outer Halo Ring */}
        <div
          className="virtual-cursor-ring"
          style={{
            borderColor: cursor.isDragging
              ? '#f43f5e'
              : cursor.mode === 'HAND'
              ? 'rgba(16, 185, 129, 0.6)'
              : 'rgba(6, 182, 212, 0.6)',
          }}
        />

        {/* Circular Dwell Progress Bar */}
        {cursor.isDwellActive && (
          <svg
            className="virtual-cursor-dwell-progress"
            style={{ width: `${size + 12}px`, height: `${size + 12}px`, transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={(size + 12) / 2}
              cy={(size + 12) / 2}
              r={radius}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Mode or Dragging Tag */}
        {cursor.isDragging && (
          <div
            style={{
              position: 'absolute',
              top: `${size + 4}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#f43f5e',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            DRAGGING
          </div>
        )}

        {/* Action Splash Feedback */}
        {recentAction && (
          <div
            style={{
              position: 'absolute',
              bottom: `${size + 6}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #06b6d4',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
              animation: 'fade-up 0.3s ease-out',
            }}
          >
            {recentAction}
          </div>
        )}
      </div>
    </div>
  );
};
