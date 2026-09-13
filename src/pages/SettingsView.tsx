// ============================================================================
// Settings View: Profile Management, Performance Presets, Safety Invariants
// ============================================================================

import React, { useState } from 'react';
import { profileManager } from '../core/profileManager';
import { AppSettings, UserProfile } from '../types';
import { Settings as SettingsIcon, Users, Sliders, Cpu, Shield, Download, Upload, Plus, Trash2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>(profileManager.getProfiles());
  const [activeProfile, setActiveProfile] = useState<UserProfile>(profileManager.getActiveProfile());
  const [newProfileName, setNewProfileName] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const switchProfile = (id: string) => {
    profileManager.setActiveProfile(id);
    setActiveProfile(profileManager.getActiveProfile());
    setProfiles(profileManager.getProfiles());
  };

  const createProfile = () => {
    if (!newProfileName.trim()) return;
    const created = profileManager.createProfile(newProfileName.trim());
    setNewProfileName('');
    switchProfile(created.id);
  };

  const deleteProfile = (id: string) => {
    profileManager.deleteProfile(id);
    setActiveProfile(profileManager.getActiveProfile());
    setProfiles(profileManager.getProfiles());
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    profileManager.updateActiveSettings({ [key]: value });
    setActiveProfile({ ...profileManager.getActiveProfile() });
  };

  const handleExport = () => {
    const json = profileManager.exportProfileJson(activeProfile.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyehand_profile_${activeProfile.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const imported = profileManager.importProfileJson(importJsonText);
    if (imported) {
      setImportJsonText('');
      setShowImportBox(false);
      switchProfile(imported.id);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <SettingsIcon size={24} color="#06b6d4" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Configuration & Profiles</h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Manage local user profiles, select hardware performance presets, and configure safety thresholds.
        </p>
      </div>

      {/* User Profiles Management */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Local User Profiles</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExport} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} /> Export JSON
            </button>
            <button onClick={() => setShowImportBox(!showImportBox)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Upload size={14} /> Import JSON
            </button>
          </div>
        </div>

        {showImportBox && (
          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px' }}>
            <textarea
              rows={4}
              placeholder="Paste profile JSON here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#090d16', border: '1px solid var(--border-subtle)', color: '#ffffff', borderRadius: '6px' }}
            />
            <button onClick={handleImport} className="btn btn-primary" style={{ marginTop: '8px' }}>
              Load Profile
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {profiles.map((p) => (
            <div
              key={p.id}
              onClick={() => switchProfile(p.id)}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '14px 18px',
                border: activeProfile.id === p.id ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</p>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Mode: {p.settings.cursorMode}</span>
              </div>

              {profiles.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProfile(p.id);
                  }}
                  style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="New profile name..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
            }}
          />
          <button onClick={createProfile} className="btn btn-primary" style={{ padding: '8px 18px' }}>
            <Plus size={16} /> Add Profile
          </button>
        </div>
      </div>

      {/* Performance Presets */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Cpu size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Performance & Hardware Presets</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { id: 'HIGH_QUALITY', title: 'High Quality', desc: 'Full 60 FPS inference with high-detail face and hand mesh rendering.' },
            { id: 'BALANCED', title: 'Balanced (Default)', desc: 'Standard 30-45 FPS with optimized overlay drawing for standard desktops.' },
            { id: 'PERFORMANCE', title: 'Performance Mode', desc: 'Streamlined inference throttled for low-end hardware and laptops.' },
          ].map((preset) => (
            <div
              key={preset.id}
              onClick={() => updateSetting('performancePreset', preset.id)}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '18px',
                border: activeProfile.settings.performancePreset === preset.id ? '2px solid #10b981' : '1px solid var(--border-subtle)',
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{preset.title}</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{preset.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Invariants */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={20} color="#f43f5e" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Safety Invariants & Accidental Click Prevention</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Click Cooldown Duration</label>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{activeProfile.settings.clickCooldownMs} ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={activeProfile.settings.clickCooldownMs}
              onChange={(e) => updateSetting('clickCooldownMs', parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
