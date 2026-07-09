import React, { useState } from 'react';
import { Settings, Bell, Shield, Globe, Monitor, Palette, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
      {value ? <ToggleRight size={28} color="#22c55e" /> : <ToggleLeft size={28} color="var(--text-dim)" />}
    </button>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailAlerts: true, smsAlerts: false, criticalOnly: false, weeklyDigest: true,
    twoFactor: true, sessionTimeout: '30', auditLogging: true,
    autoRefresh: true, refreshInterval: '30',
    darkMode: localStorage.getItem('urja_dark_mode') !== 'false',
    compactView: false,
    apiAccess: false, language: 'English', timezone: 'IST (UTC+5:30)',
  });

  const update = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    if (key === 'darkMode') {
      localStorage.setItem('urja_dark_mode', String(val));
      document.body.classList.toggle('light-theme', !val);
    }
  };
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const sections = [
    {
      id: 'notifications', label: 'Notification Preferences', icon: Bell, color: '#1d8cff',
      items: [
        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via email', type: 'toggle' },
        { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive SMS for CRITICAL events only', type: 'toggle' },
        { key: 'criticalOnly', label: 'Critical Only Mode', desc: 'Suppress non-critical notifications', type: 'toggle' },
        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly intelligence summary report', type: 'toggle' },
      ]
    },
    {
      id: 'security', label: 'Security & Access', icon: Shield, color: '#ef4444',
      items: [
        { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require OTP on every login', type: 'toggle' },
        { key: 'sessionTimeout', label: 'Session Timeout (mins)', desc: 'Auto-logout after inactivity', type: 'select', options: ['15', '30', '60', '120'] },
        { key: 'auditLogging', label: 'Enhanced Audit Logging', desc: 'Log all data access events', type: 'toggle' },
        { key: 'apiAccess', label: 'API Access', desc: 'Enable external API integration', type: 'toggle' },
      ]
    },
    {
      id: 'display', label: 'Display & Interface', icon: Palette, color: '#8b5cf6',
      items: [
        { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark command-center theme', type: 'toggle' },
        { key: 'compactView', label: 'Compact View', desc: 'Reduce padding for more data density', type: 'toggle' },
        { key: 'language', label: 'Language', desc: 'Interface display language', type: 'select', options: ['English', 'Hindi', 'Tamil', 'Telugu'] },
        { key: 'timezone', label: 'Timezone', desc: 'Default timezone for all timestamps', type: 'select', options: ['IST (UTC+5:30)', 'UTC', 'EST', 'PST'] },
      ]
    },
    {
      id: 'data', label: 'Data & Performance', icon: Monitor, color: '#22c55e',
      items: [
        { key: 'autoRefresh', label: 'Auto Refresh', desc: 'Automatically refresh live dashboards', type: 'toggle' },
        { key: 'refreshInterval', label: 'Refresh Interval (secs)', desc: 'How often to pull live data', type: 'select', options: ['15', '30', '60', '120'] },
      ]
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Platform preferences, security controls, and notification management"
        actions={
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} onClick={handleSave}>
            <Save size={13} />{saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Navigation */}
        <GlassCard className="card" style={{ padding: '12px 0', height: 'fit-content' }}>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <a key={s.id} href={`#${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <Icon size={15} color={s.color} />{s.label}
              </a>
            );
          })}
        </GlassCard>

        {/* Settings Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map(section => {
            const SIcon = section.icon;
            return (
              <GlassCard key={section.id} id={section.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ background: `${section.color}18`, borderRadius: 8, padding: 8 }}><SIcon size={16} color={section.color} /></div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{section.label}</div>
                </div>
                {section.items.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.desc}</div>
                    </div>
                    <div style={{ flexShrink: 0, marginLeft: 16 }}>
                      {item.type === 'toggle' ? (
                        <Toggle value={settings[item.key]} onChange={val => update(item.key, val)} />
                      ) : (
                        <select value={settings[item.key]} onChange={e => update(item.key, e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
                          {item.options.map(opt => <option key={opt} value={opt} style={{ background: '#0d1a2d' }}>{opt}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
