// ============================================================================
// Main Application Component
// ============================================================================

import React, { useState } from 'react';
import { AppLayout, NavView } from './components/layout/AppLayout';
import { VirtualCursorOverlay } from './components/cursor/VirtualCursorOverlay';
import { VirtualControlBar } from './components/floating/VirtualControlBar';
import { VirtualKeyboard } from './components/keyboard/VirtualKeyboard';

// View Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { CalibrationView } from './pages/CalibrationView';
import { EyeControlView } from './pages/EyeControlView';
import { HandControlView } from './pages/HandControlView';
import { GesturesView } from './pages/GesturesView';
import { CursorView } from './pages/CursorView';
import { KeyboardView } from './pages/KeyboardView';
import { VoiceView } from './pages/VoiceView';
import { AccessibilityView } from './pages/AccessibilityView';
import { StatisticsView } from './pages/StatisticsView';
import { SettingsView } from './pages/SettingsView';
import { DemoView } from './pages/DemoView';
import { OnboardingView } from './pages/OnboardingView';
import { HelpView } from './pages/HelpView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'calibration':
        return <CalibrationView />;
      case 'eye-control':
        return <EyeControlView />;
      case 'hand-control':
        return <HandControlView />;
      case 'gestures':
        return <GesturesView />;
      case 'cursor':
        return <CursorView />;
      case 'keyboard':
        return <KeyboardView />;
      case 'voice':
        return <VoiceView />;
      case 'accessibility':
        return <AccessibilityView />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      case 'demo':
        return <DemoView />;
      case 'onboarding':
        return <OnboardingView onNavigate={setCurrentView} />;
      case 'help':
        return <HelpView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {/* Active Selected View */}
      {renderView()}

      {/* Persistent In-App Virtual Cursor */}
      <VirtualCursorOverlay />

      {/* Floating Accessibility Control Bar */}
      <VirtualControlBar
        onOpenKeyboard={() => setIsKeyboardOpen(!isKeyboardOpen)}
        isKeyboardOpen={isKeyboardOpen}
      />

      {/* On-Screen Virtual Keyboard Overlay */}
      <VirtualKeyboard
        isOpen={isKeyboardOpen}
        onClose={() => setIsKeyboardOpen(false)}
      />
    </AppLayout>
  );
};
