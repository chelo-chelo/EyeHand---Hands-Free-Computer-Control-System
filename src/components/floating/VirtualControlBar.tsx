// ============================================================================
// Floating Accessibility Control Bar
// High-contrast, large-target actions for hands-free navigation
// ============================================================================

import React, { useState } from 'react';
import { controlEngine } from '../../core/controlEngine';
import { safetyManager } from '../../core/safetyManager';
import {
  MousePointer,
  Hand,
  Layers,
  Move,
  ArrowUpDown,
  Keyboard as KeyboardIcon,
  XSquare,
  CornerDownLeft,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const VirtualControlBar: React.FC<{
  onOpenKeyboard: () => void;
  isKeyboardOpen: boolean;
}> = ({ onOpenKeyboard, isKeyboardOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(safetyManager.getStatus().isControlPaused);

  const handleAction = (type: string, label: string) => {
    setActiveAction(label);
    setTimeout(() => setActiveAction(null), 800);

    switch (type) {
      case 'LEFT_CLICK':
        controlEngine.dispatchAction('LEFT_CLICK', 'UI');
        break;
      case 'RIGHT_CLICK':
        controlEngine.dispatchAction('RIGHT_CLICK', 'UI');
        break;
      case 'DOUBLE_CLICK':
        controlEngine.dispatchAction('DOUBLE_CLICK', 'UI');
        break;
      case 'DRAG':
        controlEngine.dispatchAction('MOUSE_DOWN', 'UI');
        break;
      case 'SCROLL':
        controlEngine.dispatchAction('SCROLL_DOWN', 'UI');
        break;
      case 'KEYBOARD':
        onOpenKeyboard();
        break;
      case 'ESC':
        controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: 'escape' });
        break;
      case 'ENTER':
        controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: 'enter' });
        break;
      case 'PAUSE':
        const newPause = !isPaused;
        setIsPaused(newPause);
        safetyManager.togglePause(newPause);
        break;
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '9999px',
          zIndex: 9000,
          border: '1px solid rgba(6, 182, 212, 0.4)',
          color: '#38bdf8',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
        aria-label="Expand accessibility control bar"
      >
        <ChevronUp size={16} /> Show Control Bar
      </button>
    );
  }

  return (
    <div className="floating-control-bar" role="toolbar" aria-label="Accessibility Control Bar">
      <button
        className={`floating-control-btn ${activeAction === 'Left Click' ? 'active' : ''}`}
        onClick={() => handleAction('LEFT_CLICK', 'Left Click')}
        title="Left Click"
      >
        <MousePointer size={18} />
        <span>L-Click</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Right Click' ? 'active' : ''}`}
        onClick={() => handleAction('RIGHT_CLICK', 'Right Click')}
        title="Right Click"
      >
        <Hand size={18} />
        <span>R-Click</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Double Click' ? 'active' : ''}`}
        onClick={() => handleAction('DOUBLE_CLICK', 'Double Click')}
        title="Double Click"
      >
        <Layers size={18} />
        <span>2x-Click</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Drag' ? 'active' : ''}`}
        onClick={() => handleAction('DRAG', 'Drag')}
        title="Click and Drag"
      >
        <Move size={18} />
        <span>Drag</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Scroll' ? 'active' : ''}`}
        onClick={() => handleAction('SCROLL', 'Scroll')}
        title="Scroll Down"
      >
        <ArrowUpDown size={18} />
        <span>Scroll</span>
      </button>

      <button
        className={`floating-control-btn ${isKeyboardOpen ? 'active' : ''}`}
        onClick={() => handleAction('KEYBOARD', 'Keyboard')}
        title="Virtual On-Screen Keyboard"
      >
        <KeyboardIcon size={18} />
        <span>Keybd</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Esc' ? 'active' : ''}`}
        onClick={() => handleAction('ESC', 'Esc')}
        title="Escape Key"
      >
        <XSquare size={18} />
        <span>ESC</span>
      </button>

      <button
        className={`floating-control-btn ${activeAction === 'Enter' ? 'active' : ''}`}
        onClick={() => handleAction('ENTER', 'Enter')}
        title="Enter Key"
      >
        <CornerDownLeft size={18} />
        <span>Enter</span>
      </button>

      <button
        className={`floating-control-btn ${isPaused ? 'active' : ''}`}
        style={{
          background: isPaused ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: isPaused ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
          color: isPaused ? '#fbbf24' : 'inherit',
        }}
        onClick={() => handleAction('PAUSE', 'Pause')}
        title={isPaused ? 'Resume Control' : 'Pause Control'}
      >
        {isPaused ? <Play size={18} /> : <Pause size={18} />}
        <span>{isPaused ? 'Resume' : 'Pause'}</span>
      </button>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Hide bar"
        title="Collapse bar"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
};
