// ============================================================================
// Application Layout with Global Emergency Controls, Statuses & Navigation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { safetyManager } from '../../core/safetyManager';
import { nativeBridge } from '../../native/nativeBridgeClient';
import { SafetyStatus } from '../../types';
import {
  ShieldAlert,
  Sun,
  Moon,
  Contrast,
  Play,
  Pause,
  Monitor,
  Laptop,
  Compass,
  Eye,
  Hand,
  Sliders,
  Sparkles,
  MousePointer,
  Keyboard as KeyboardIcon,
  Mic,
  Settings as SettingsIcon,
  BarChart2,
  HelpCircle,
  Home,
  CheckCircle,
} from 'lucide-react';

export type NavView =
  | 'landing'
  | 'dashboard'
  | 'calibration'
  | 'eye-control'
  | 'hand-control'
  | 'gestures'
  | 'cursor'
  | 'keyboard'
  | 'voice'
  | 'settings'
  | 'accessibility'
  | 'statistics'
  | 'demo'
  | 'onboarding'
  | 'help';

export const AppLayout: React.FC<{
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  children: React.ReactNode;
}> = ({ currentView, onNavigate, children }) => {
  const [safety, setSafety] = useState<SafetyStatus>(safetyManager.getStatus());
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBridgeConnected, setIsBridgeConnected] = useState(false);

  useEffect(() => {
    const unsubSafety = safetyManager.subscribe((s) => setSafety({ ...s }));
    const checkBridge = setInterval(() => {
      setIsBridgeConnected(nativeBridge.getIsConnected());
    }, 1500);

    return () => {
      unsubSafety();
      clearInterval(checkBridge);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'high-contrast' : 'dark';
    setTheme(nextTheme);
    document.body.className = `theme-${nextTheme}`;
  };

  const handleSystemControlClick = () => {
    if (!safety.isSystemControlEnabled) {
      // Require explicit safety confirmation
      setShowConfirmModal(true);
    } else {
      safetyManager.setSystemControlEnabled(false);
      nativeBridge.setSystemControlEnabled(false);
    }
  };

  const confirmEnableSystemControl = () => {
    safetyManager.setSystemControlEnabled(true);
    nativeBridge.setSystemControlEnabled(true);
    setShowConfirmModal(false);
  };

  const navItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass size={18} /> },
    { id: 'calibration', label: 'Calibration', icon: <Sparkles size={18} /> },
    { id: 'eye-control', label: 'Eye Control', icon: <Eye size={18} /> },
    { id: 'hand-control', label: 'Hand Control', icon: <Hand size={18} /> },
    { id: 'gestures', label: 'Gestures', icon: <Sliders size={18} /> },
    { id: 'cursor', label: 'Cursor', icon: <MousePointer size={18} /> },
    { id: 'keyboard', label: 'Keyboard', icon: <KeyboardIcon size={18} /> },
    { id: 'voice', label: 'Voice', icon: <Mic size={18} /> },
    { id: 'demo', label: 'Interactive Demo', icon: <Play size={18} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Contrast size={18} /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    { id: 'help', label: 'Help & FAQ', icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '240px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('landing')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
            }}
          >
            EH
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>EyeHand</h1>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Hands-Free HCI</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          <button
            onClick={() => onNavigate('landing')}
            className={`btn ${currentView === 'landing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              marginBottom: '6px',
              padding: '9px 12px',
              fontSize: '0.88rem',
            }}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`btn ${currentView === item.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                marginBottom: '4px',
                padding: '9px 12px',
                fontSize: '0.88rem',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer: Onboarding Button */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onNavigate('onboarding')}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
          >
            <Sparkles size={16} /> Setup Wizard
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Control Bar */}
        <header
          style={{
            height: '64px',
            background: 'var(--bg-surface-glass)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              className={`badge ${safety.isControlPaused ? 'badge-paused' : 'badge-active'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {safety.isControlPaused ? <Pause size={12} /> : <CheckCircle size={12} />}
              {safety.isControlPaused ? 'CONTROL PAUSED' : 'TRACKING ACTIVE'}
            </span>

            {/* Simulation Mode vs Desktop Control Mode Pill */}
            <button
              onClick={handleSystemControlClick}
              className={`badge ${safety.isSystemControlEnabled ? 'badge-emergency' : 'badge-cyan'}`}
              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Click to toggle between safe in-app simulation mode and Windows system mouse control"
            >
              {safety.isSystemControlEnabled ? <Monitor size={14} /> : <Laptop size={14} />}
              {safety.isSystemControlEnabled ? 'DESKTOP OS CONTROL' : 'SIMULATION MODE'}
            </button>

            {/* Native Bridge Pill */}
            <span
              className="badge"
              style={{
                background: isBridgeConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                color: isBridgeConnected ? '#34d399' : '#94a3b8',
                border: `1px solid ${isBridgeConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
              title={isBridgeConnected ? 'Native Win32 SendInput Bridge Connected' : 'Native Bridge Offline (Simulation mode active)'}
            >
              Bridge: {isBridgeConnected ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Right Action Controls: Emergency Stop & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Pause / Resume Button */}
            <button
              onClick={() => safetyManager.togglePause()}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {safety.isControlPaused ? <Play size={16} /> : <Pause size={16} />}
              {safety.isControlPaused ? 'Resume' : 'Pause'}
            </button>

            {/* Large EMERGENCY STOP BUTTON */}
            <button
              onClick={() => safetyManager.triggerEmergencyStop()}
              className="btn btn-emergency"
              title="Emergency Stop: Immediately freezes all cursor movements, clicks, and inputs (Press ESC anytime)"
            >
              <ShieldAlert size={18} />
              STOP ALL CONTROL (ESC)
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: '50%' }}
              aria-label="Toggle visual theme"
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : theme === 'light' ? <Moon size={18} /> : <Contrast size={18} />}
            </button>
          </div>
        </header>

        {/* Child View Container */}
        <main style={{ flex: 1, padding: '24px', position: 'relative' }}>{children}</main>
      </div>

      {/* Safety Confirmation Dialog for System OS Control */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
          }}
          role="alertdialog"
          aria-modal="true"
        >
          <div
            className="glass-panel"
            style={{
              width: '480px',
              maxWidth: '92vw',
              padding: '24px',
              border: '2px solid #06b6d4',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', marginBottom: '12px' }}>
              Enable Real Windows Desktop Control?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              You are about to allow <strong>EyeHand</strong> to take control of your physical Windows mouse and keyboard.
              <br /><br />
              <strong>Safety Invariants Active:</strong>
              <br />• Press <strong>ESC</strong> on your physical keyboard anytime to immediately stop control.
              <br />• If your face leaves camera view, control will automatically pause.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary">
                Keep Simulation Mode
              </button>
              <button onClick={confirmEnableSystemControl} className="btn btn-primary">
                Confirm & Enable Desktop Control
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
