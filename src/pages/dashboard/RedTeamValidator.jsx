import React, { useState } from 'react';
import { Target, AlertTriangle, Shield, CheckCircle, Play, RotateCcw, Bot } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const attacks = [
  { id: 'RT-001', name: 'Port Blockade – Mundra/JNPT', vector: 'Geopolitical', severity: 'CRITICAL', resilience: 34, mitigated: false, lastRun: '2 hours ago' },
  { id: 'RT-002', name: 'Cyber Attack on SCADA Systems', vector: 'Cyber', severity: 'HIGH', resilience: 61, mitigated: true, lastRun: '1 day ago' },
  { id: 'RT-003', name: 'Pipeline Rupture – Mundra-Kandla', vector: 'Physical', severity: 'HIGH', resilience: 55, mitigated: false, lastRun: '3 days ago' },
  { id: 'RT-004', name: 'Gulf Supply Disruption +40%', vector: 'Market', severity: 'CRITICAL', resilience: 28, mitigated: false, lastRun: '6 hours ago' },
  { id: 'RT-005', name: 'Refinery Fire – Barauni', vector: 'Operational', severity: 'MEDIUM', resilience: 72, mitigated: true, lastRun: '5 days ago' },
  { id: 'RT-006', name: 'Currency Crash (INR -20%)', vector: 'Financial', severity: 'HIGH', resilience: 48, mitigated: false, lastRun: '12 hours ago' },
];

const radarData = [
  { subject: 'Geopolitical', score: 34 },
  { subject: 'Cyber', score: 61 },
  { subject: 'Physical', score: 55 },
  { subject: 'Market', score: 28 },
  { subject: 'Operational', score: 72 },
  { subject: 'Financial', score: 48 },
];

const severityColor = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#1d8cff', LOW: '#22c55e' };

export default function RedTeamValidator() {
  const [selected, setSelected] = useState(attacks[0]);
  const [running, setRunning] = useState(false);

  const runTest = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2500);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Red Team Validator" subtitle="Adversarial stress-testing of India's energy resilience across all threat vectors"
        badge={{ label: 'SIMULATION ENGINE', color: '#8b5cf6' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><RotateCcw size={13} />Run All Tests</button>
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overall Resilience', value: '48%', color: '#f59e0b', icon: Shield, sub: 'Composite score' },
          { label: 'Critical Threats', value: '2', color: '#ef4444', icon: AlertTriangle, sub: 'Needs immediate action' },
          { label: 'Mitigated', value: '2/6', color: '#22c55e', icon: CheckCircle, sub: 'Tests passed' },
          { label: 'Last Full Scan', value: '2h ago', color: '#1d8cff', icon: Target, sub: 'Automated sweep' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{item.sub}</div>
                </div>
                <div style={{ background: `${item.color}18`, borderRadius: 10, padding: 10 }}><Icon size={20} color={item.color} /></div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Attack Scenarios List */}
        <div>
          <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', fontSize: 13, fontWeight: 600 }}>Threat Scenarios</div>
            {attacks.map(attack => (
              <div key={attack.id} onClick={() => setSelected(attack)}
                style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: selected?.id === attack.id ? 'rgba(139,92,246,0.08)' : 'transparent', borderLeft: selected?.id === attack.id ? '3px solid #8b5cf6' : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8b5cf6' }}>{attack.id}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `${severityColor[attack.severity]}15`, color: severityColor[attack.severity], fontWeight: 700 }}>{attack.severity}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>{attack.vector}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{attack.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, maxWidth: 160, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                        <div style={{ width: `${attack.resilience}%`, height: '100%', background: attack.resilience < 40 ? '#ef4444' : attack.resilience < 60 ? '#f59e0b' : '#22c55e', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: attack.resilience < 40 ? '#ef4444' : attack.resilience < 60 ? '#f59e0b' : '#22c55e' }}>{attack.resilience}% resilient</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    <StatusBadge status={attack.mitigated ? 'MITIGATED' : 'ACTIVE'} />
                  </div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Radar Chart */}
          <GlassCard className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Resilience by Vector</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.18} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Selected Test Detail */}
          {selected && (
            <GlassCard className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Test Details: {selected.id}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>{selected.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Vector', value: selected.vector },
                  { label: 'Severity', value: selected.severity, color: severityColor[selected.severity] },
                  { label: 'Resilience', value: `${selected.resilience}%`, color: selected.resilience < 40 ? '#ef4444' : selected.resilience < 60 ? '#f59e0b' : '#22c55e' },
                  { label: 'Last Run', value: selected.lastRun },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.color || 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8 }}>
                <Bot size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>AI recommends activating alternate supply route via Kochi port and pre-positioning SPR reserves to reduce exposure by ~40%.</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={runTest} disabled={running}>
                {running ? <><span className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Running...</> : <><Play size={14} />Run Simulation</>}
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
