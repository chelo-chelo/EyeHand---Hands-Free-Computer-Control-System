// ============================================================================
// Onboarding Wizard: First-Time User Experience & Step-by-Step Setup
// ============================================================================

import React, { useState } from 'react';
import { NavView } from '../components/layout/AppLayout';
import { WebcamView } from '../components/webcam/WebcamView';
import { Sparkles, ShieldCheck, Camera, Eye, Hand, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = [
  { id: 'welcome', title: 'Welcome to EyeHand', desc: 'Introduction to natural hands-free computer control' },
  { id: 'privacy', title: 'Privacy & Security', desc: '100% local processing guarantee' },
  { id: 'camera', title: 'Webcam Alignment', desc: 'Ergonomic positioning and lighting checks' },
  { id: 'eye_calib', title: 'Eye Calibration', desc: '9-point gaze model personalization' },
  { id: 'hand_test', title: 'Hand Gesture Test', desc: 'Pinch-to-click & pointing verification' },
  { id: 'safety', title: 'Safety Interlocks', desc: 'Emergency stop (ESC) and tracking protection' },
  { id: 'ready', title: 'Setup Complete', desc: 'EyeHand is primed and ready' },
];

export const OnboardingView: React.FC<{ onNavigate: (view: NavView) => void }> = ({ onNavigate }) => {
  const [stepIdx, setStepIdx] = useState(0);

  const nextStep = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const prevStep = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const current = STEPS[stepIdx];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Stepper Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase' }}>
              Step {stepIdx + 1} of {STEPS.length}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{current.title}</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{current.desc}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px' }}>
          <div
            style={{
              width: `${((stepIdx + 1) / STEPS.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Step Content Area */}
      <div className="glass-panel" style={{ padding: '36px', minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {stepIdx === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <Sparkles size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Welcome to EyeHand</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              EyeHand empowers you to control your computer without a physical mouse or keyboard. We will guide you
              through camera setup, eye calibration, and hand gestures in under two minutes.
            </p>
          </div>
        )}

        {stepIdx === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Privacy-First Guarantee</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '560px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              Your camera frames are processed <strong>100% locally</strong> on your processor and GPU using MediaPipe.
              <br /><br />
              • No raw footage is uploaded or stored.
              <br />• No facial or biometric data is transmitted.
              <br />• You can pause or stop the camera anytime.
            </p>
          </div>
        )}

        {stepIdx === 2 && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', textAlign: 'center' }}>Position Your Face in View</h3>
            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '20px', fontSize: '0.92rem' }}>
              Sit approximately 50–70 cm from your screen. Make sure your face is evenly illuminated.
            </p>
            <div style={{ maxWidth: '440px', margin: '0 auto' }}>
              <WebcamView />
            </div>
          </div>
        )}

        {stepIdx === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <Eye size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Eye Gaze Calibration</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              To personalize cursor accuracy to your distance and posture, EyeHand will track your gaze across 9 points.
            </p>
            <button onClick={() => onNavigate('calibration')} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Open Calibration Wizard
            </button>
          </div>
        )}

        {stepIdx === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <Hand size={32} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Pinch-to-Click Verification</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              Hold up your hand and touch your thumb to your index finger. You can also point with your index finger to move the cursor.
            </p>
            <button onClick={() => onNavigate('demo')} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Test in Playground
            </button>
          </div>
        )}

        {stepIdx === 5 && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Safety Invariants</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              You are always in total control:
              <br /><br />
              • Press <strong>ESC</strong> on your physical keyboard anytime for Emergency Stop.
              <br />• If your face leaves the camera view, cursor control immediately pauses.
              <br />• EyeHand starts in Simulation Mode by default until you explicitly enable system control.
            </p>
          </div>
        )}

        {stepIdx === 6 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>EyeHand is Ready!</h3>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              Your hands-free environment is configured. Start navigating your computer naturally.
            </p>
            <button onClick={() => onNavigate('dashboard')} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
              Enter Main Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={prevStep}
          disabled={stepIdx === 0}
          className="btn btn-secondary"
          style={{ visibility: stepIdx === 0 ? 'hidden' : 'visible' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {stepIdx < STEPS.length - 1 && (
          <button onClick={nextStep} className="btn btn-primary">
            Next Step <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
