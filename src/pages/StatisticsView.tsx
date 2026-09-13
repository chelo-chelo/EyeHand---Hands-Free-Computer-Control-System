// ============================================================================
// Statistics View: Local Usage Analytics & Interactive SVG Charts
// ============================================================================

import React, { useState, useEffect } from 'react';
import { statisticsManager } from '../core/statisticsManager';
import { UsageStatistics } from '../types';
import { BarChart2, Clock, MousePointer, Hand, Mic, ShieldCheck, RefreshCw } from 'lucide-react';

export const StatisticsView: React.FC = () => {
  const [stats, setStats] = useState<UsageStatistics>(statisticsManager.getStats());

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(statisticsManager.getStats());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalActions = stats.totalClicks + stats.totalPinches + stats.totalDwells + stats.totalGestures + stats.totalVoiceCommands;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <BarChart2 size={24} color="#06b6d4" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Usage Statistics & Analytics</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
              Local performance telemetry for monitoring interaction accuracy and fatigue reduction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> 100% Stored Locally
            </div>
            <button
              onClick={() => {
                statisticsManager.resetStats();
                setStats(statisticsManager.getStats());
              }}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* 4 Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Session</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {formatDuration(stats.sessionDurationSec)}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
            <MousePointer size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Clicks</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{stats.totalClicks}</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
            <Hand size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pinches / Gestures</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
            {stats.totalPinches + stats.totalGestures}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
            <Mic size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Voice Commands</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{stats.totalVoiceCommands}</p>
        </div>
      </div>

      {/* Visual SVG Action Distribution Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Modal Action Distribution</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Eye Dwell Clicks', count: stats.totalDwells, color: '#06b6d4' },
            { label: 'Hand Pinch Clicks', count: stats.totalPinches, color: '#10b981' },
            { label: 'Gestures Recognized', count: stats.totalGestures, color: '#6366f1' },
            { label: 'Voice Command Inputs', count: stats.totalVoiceCommands, color: '#f59e0b' },
          ].map((item) => {
            const pct = totalActions > 0 ? Math.round((item.count / totalActions) * 100) : 0;
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                  <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>
                    {item.count} ({pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '5px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
