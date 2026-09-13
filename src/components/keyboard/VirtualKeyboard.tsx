// ============================================================================
// Accessible Virtual On-Screen Keyboard with Dwell Typing & Word Prediction
// ============================================================================

import React, { useState } from 'react';
import { controlEngine } from '../../core/controlEngine';
import { X, Delete, CornerDownLeft, Space, ArrowUp, Maximize2, Minimize2 } from 'lucide-react';

const COMMON_DICTIONARY = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'control', 'camera', 'eye', 'hand', 'gesture', 'computer', 'system', 'click', 'scroll', 'keyboard'
];

export const VirtualKeyboard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [isShift, setIsShift] = useState(false);
  const [isLargeKeys, setIsLargeKeys] = useState(false);
  const [predictions, setPredictions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleChar = (char: string) => {
    const nextChar = isShift ? char.toUpperCase() : char.toLowerCase();
    const updated = text + nextChar;
    setText(updated);
    updatePredictions(updated);
    controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: nextChar });
  };

  const handleBackspace = () => {
    const updated = text.slice(0, -1);
    setText(updated);
    updatePredictions(updated);
    controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: 'backspace' });
  };

  const handleSpace = () => {
    const updated = text + ' ';
    setText(updated);
    updatePredictions(updated);
    controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: 'space' });
  };

  const handleEnter = () => {
    controlEngine.dispatchAction('KEY_PRESS', 'UI', { key: 'enter' });
  };

  const updatePredictions = (currentText: string) => {
    const words = currentText.trim().split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase();
    if (!lastWord || lastWord.length < 1) {
      setPredictions([]);
      return;
    }
    const matches = COMMON_DICTIONARY.filter(
      (w) => w.startsWith(lastWord) && w !== lastWord
    ).slice(0, 4);
    setPredictions(matches);
  };

  const applyPrediction = (word: string) => {
    const words = text.trim().split(/\s+/);
    words[words.length - 1] = word;
    const updated = words.join(' ') + ' ';
    setText(updated);
    setPredictions([]);
  };

  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isLargeKeys ? '92vw' : '820px',
        maxWidth: '96vw',
        padding: '16px',
        zIndex: 9500,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.25)',
        border: '2px solid rgba(6, 182, 212, 0.5)',
      }}
      role="dialog"
      aria-label="Virtual On-Screen Keyboard"
    >
      {/* Top Header & Text Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            VIRTUAL KEYBOARD
          </span>
          <button
            onClick={() => setIsLargeKeys(!isLargeKeys)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {isLargeKeys ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isLargeKeys ? 'Standard' : 'Large Keys'}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Close keyboard"
        >
          <X size={20} />
        </button>
      </div>

      {/* Real-time Typed Text Area */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: isLargeKeys ? '1.25rem' : '1.05rem',
          minHeight: '48px',
          marginBottom: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{text || <span style={{ color: '#64748b' }}>Type using gaze dwell or click...</span>}</span>
        {text && (
          <button
            onClick={() => setText('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f43f5e',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Word Prediction Bar */}
      {predictions.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          {predictions.map((word) => (
            <button
              key={word}
              onClick={() => applyPrediction(word)}
              className="btn btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                borderColor: '#06b6d4',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Key Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isLargeKeys ? '8px' : '6px' }}>
        {rows.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'flex', gap: isLargeKeys ? '8px' : '6px', justifyContent: 'center' }}>
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleChar(k)}
                style={{
                  flex: 1,
                  height: isLargeKeys ? '58px' : '44px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: isLargeKeys ? '1.3rem' : '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {isShift ? k.toUpperCase() : k}
              </button>
            ))}
          </div>
        ))}

        {/* Function Keys Row (Shift, Space, Backspace, Enter) */}
        <div style={{ display: 'flex', gap: isLargeKeys ? '8px' : '6px', justifyContent: 'center' }}>
          <button
            onClick={() => setIsShift(!isShift)}
            style={{
              flex: 1.5,
              height: isLargeKeys ? '58px' : '44px',
              background: isShift ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isShift ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: isShift ? '#38bdf8' : '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ArrowUp size={16} /> Shift
          </button>

          <button
            onClick={handleSpace}
            style={{
              flex: 5,
              height: isLargeKeys ? '58px' : '44px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Space size={16} /> Space
          </button>

          <button
            onClick={handleBackspace}
            style={{
              flex: 1.8,
              height: isLargeKeys ? '58px' : '44px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fb7185',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Delete size={16} /> Delete
          </button>

          <button
            onClick={handleEnter}
            style={{
              flex: 1.8,
              height: isLargeKeys ? '58px' : '44px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CornerDownLeft size={16} /> Enter
          </button>
        </div>
      </div>
    </div>
  );
};
