// ============================================================================
// Live Webcam View Component with Privacy Indicator & Overlay Controls
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { visionManager, OverlayToggles } from '../../vision/visionManager';
import { safetyManager } from '../../core/safetyManager';
import { Camera, CameraOff, ShieldCheck, Eye, Hand, Sparkles, AlertTriangle } from 'lucide-react';

export const WebcamView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [toggles, setToggles] = useState<OverlayToggles>(visionManager.getOverlayToggles());
  const [safety, setSafety] = useState(safetyManager.getStatus());
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      visionManager.setElements(videoRef.current, canvasRef.current);
      visionManager.initModels().then(() => {
        handleToggleCamera(true);
      });
    }

    const unsubSafety = safetyManager.subscribe((s) => setSafety({ ...s }));
    const unsubFrame = visionManager.onFrame((_eye, _hand, currentFps) => {
      setFps(currentFps);
    });

    return () => {
      unsubSafety();
      unsubFrame();
      visionManager.stopCamera();
    };
  }, []);

  const handleToggleCamera = async (activate?: boolean) => {
    const shouldStart = activate !== undefined ? activate : !isCameraActive;
    if (shouldStart) {
      const success = await visionManager.startCamera();
      setIsCameraActive(success);
    } else {
      visionManager.stopCamera();
      setIsCameraActive(false);
    }
  };

  const updateToggle = (key: keyof OverlayToggles) => {
    const updated = { ...toggles, [key]: !toggles[key] };
    setToggles(updated);
    visionManager.setOverlayToggles(updated);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', overflow: 'hidden' }}>
      {/* Top Header & Privacy Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Vision Feed</span>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
              {fps} FPS
            </span>
          </div>

          <div
            className="badge badge-active"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="All webcam video frames are processed 100% locally on your device."
          >
            <ShieldCheck size={14} />
            Camera processing: Local
          </div>
        </div>

        {/* Camera On/Off Toggle Button */}
        <button
          onClick={() => handleToggleCamera()}
          className={`btn ${isCameraActive ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
          {isCameraActive ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>

      {/* Video Preview Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          maxHeight: '340px',
          background: '#040711',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror preview for natural interaction
            opacity: toggles.hideCameraPreview ? 0.05 : 1,
            transition: 'opacity 0.2s ease',
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Lighting or Safety Alert Banners */}
        {safety.pauseReason && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              background: 'rgba(244, 63, 94, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
            }}
          >
            <AlertTriangle size={18} />
            <span>{safety.pauseReason}</span>
          </div>
        )}

        {!isCameraActive && (
          <div
            style={{
              position: 'absolute',
              color: '#64748b',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CameraOff size={36} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Webcam Inactive</span>
            <button onClick={() => handleToggleCamera(true)} className="btn btn-primary" style={{ marginTop: '6px' }}>
              Activate Camera
            </button>
          </div>
        )}
      </div>

      {/* Overlay Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button
          className={`btn ${toggles.showFaceLandmarks ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => updateToggle('showFaceLandmarks')}
        >
          <Eye size={14} /> Face Mesh
        </button>

        <button
          className={`btn ${toggles.showEyeLandmarks ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => updateToggle('showEyeLandmarks')}
        >
          <Sparkles size={14} /> Iris Track
        </button>

        <button
          className={`btn ${toggles.showHandLandmarks ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => updateToggle('showHandLandmarks')}
        >
          <Hand size={14} /> Hand Skeleton
        </button>

        <button
          className={`btn ${toggles.hideCameraPreview ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.78rem', marginLeft: 'auto' }}
          onClick={() => updateToggle('hideCameraPreview')}
        >
          {toggles.hideCameraPreview ? 'Show Video' : 'Hide Video'}
        </button>
      </div>
    </div>
  );
};
