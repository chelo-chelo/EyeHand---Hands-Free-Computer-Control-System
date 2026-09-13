// ============================================================================
// Landing Page: Hero, Feature Highlights & Demonstration
// ============================================================================

import React from 'react';
import { NavView } from '../components/layout/AppLayout';
import {
  Eye,
  Hand,
  Mic,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  MousePointer,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigate: (view: NavView) => void }> = ({ onNavigate }) => {
  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '48px 16px 36px 16px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} /> Accessible Human-Computer Interaction
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '18px',
            background: 'linear-gradient(135deg, #ffffff 40%, #a5f3fc 70%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Control Your Computer Naturally.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
          }}
        >
          Interact with your computer using your <strong>eyes</strong>, <strong>hands</strong>, and <strong>voice</strong>.
          Designed from the ground up as a production-grade assistive desktop platform with 100% local, privacy-first computer vision.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('calibration')}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}
          >
            <Sparkles size={20} />
            Start Calibration
          </button>

          <button
            onClick={() => onNavigate('demo')}
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}
          >
            <ArrowRight size={20} />
            Try Interactive Demo
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}
          >
            Open Dashboard
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ marginTop: '48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '32px' }}>
          Engineered for Accessibility & Reliability
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1: Eye & Gaze Control */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
                marginBottom: '16px',
              }}
            >
              <Eye size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Eye & Head Tracking</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              478 3D facial landmarks with sub-pixel iris geometry, Eye Aspect Ratio (EAR) blink classification, and 9-point polynomial coordinate mapping.
            </p>
          </div>

          {/* Card 2: Hand Tracking & Gestures */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '16px',
              }}
            >
              <Hand size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Hand Gestures & Pinch</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              21 landmarks per hand. Detects Pinch-to-click, Hand Drag, Two-Finger scroll, Open Palm, Fist, and directional swipes with hysteresis debouncing.
            </p>
          </div>

          {/* Card 3: Hybrid HCI */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                marginBottom: '16px',
              }}
            >
              <MousePointer size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Hybrid Control Mode</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              The best of both worlds: your eyes guide the cursor smoothly across the display, while your hand pinch or gaze dwell triggers intentional clicks without fatigue.
            </p>
          </div>

          {/* Card 4: Voice Commands */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                marginBottom: '16px',
              }}
            >
              <Mic size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Voice Commands</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Optional local speech recognition with explicit command whitelisting: "Click", "Scroll down", "Pause control", and direct application launching.
            </p>
          </div>

          {/* Card 5: Privacy First */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Privacy-First & Local</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Webcam video frames never leave your local device. No biometric data or video footage is ever stored or transmitted to external servers.
            </p>
          </div>

          {/* Card 6: Safety System */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fb7185',
                marginBottom: '16px',
              }}
            >
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Multi-Layer Safety</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Emergency Stop via physical ESC key, automatic tracking-loss interlock, multi-face presence pause, and action cooldowns prevent accidental triggers.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Summary */}
      <section style={{ marginTop: '56px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '32px 24px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Ready to Experience Hands-Free Control?</h3>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Run the 2-minute Calibration Wizard to personalize the eye-tracking model to your facial geometry and screen distance.
          </p>
          <button
            onClick={() => onNavigate('onboarding')}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            Launch Setup Wizard
          </button>
        </div>
      </section>
    </div>
  );
};
