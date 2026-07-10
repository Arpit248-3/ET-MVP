import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, Shield, CheckCircle, Play, RotateCcw, Bot, Loader, ChevronRight, WifiOff } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import useApi from '../../hooks/useApi.js';
import { validateRedTeam } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

const defaultAttacks = [
  { id: 'RT-001', name: 'Port Blockade – Mundra/JNPT', vector: 'Geopolitical', severity: 'CRITICAL', resilience: 34, mitigated: false, lastRun: '2 hours ago' },
  { id: 'RT-002', name: 'Cyber Attack on SCADA Systems', vector: 'Cyber', severity: 'HIGH', resilience: 61, mitigated: true, lastRun: '1 day ago' },
  { id: 'RT-003', name: 'Pipeline Rupture – Mundra-Kandla', vector: 'Physical', severity: 'HIGH', resilience: 55, mitigated: false, lastRun: '3 days ago' },
  { id: 'RT-004', name: 'Gulf Supply Disruption +40%', vector: 'Market', severity: 'CRITICAL', resilience: 28, mitigated: false, lastRun: '6 hours ago' },
  { id: 'RT-005', name: 'Refinery Fire – Barauni', vector: 'Operational', severity: 'MEDIUM', resilience: 72, mitigated: true, lastRun: '5 days ago' },
  { id: 'RT-006', name: 'Currency Crash (INR -20%)', vector: 'Financial', severity: 'HIGH', resilience: 48, mitigated: false, lastRun: '12 hours ago' },
];

const defaultRadarData = [
  { subject: 'Geopolitical', score: 34 },
  { subject: 'Cyber', score: 61 },
  { subject: 'Physical', score: 55 },
  { subject: 'Market', score: 28 },
  { subject: 'Operational', score: 72 },
  { subject: 'Financial', score: 48 },
];

const mockRtData = {
  original_recommendation: "Execute 8.5 MMT drawdown of SPR and route 4 VLCCs via West Africa",
  critique: "The recommended procurement plan has a high vulnerability to physical blockades at key Indian ports. Specifically, Mundra and JNPT are operating at critical capacity, and a SCADA cyber disruption could paralyze cargo discharge.",
  weak_assumptions: [
    "Refinery compatibility for West African crudes assumes 94% compatibility, but actual light sweet limits at Kochi are lower.",
    "Cape of Good Hope route transit times are assumed at 22 days, ignoring weather-induced delay vectors."
  ],
  ignored_risks: [
    "No mitigation strategy provided for sudden pipeline failures on the Mundra-Kandla segment.",
    "Insurance clubs have flagged double-hull requirements for G7-restricted vessels."
  ],
  findings: [
    { category: "Geopolitical", finding: "High exposure to Mundra port blockade", severity: "CRITICAL" },
    { category: "Cyber", finding: "SCADA cyber attack vulnerabilities on pipelines", severity: "HIGH" },
    { category: "Market", finding: "Price spikes in local heavy crude spot markets", severity: "CRITICAL" }
  ],
  confidence_original: 0.85,
  confidence_adjusted: 0.48,
  final_recommendation: "Re-route 2 VLCCs to Kochi/Mangaluru instead of Mundra. Initiate local heavy crude swapping. Deploy secondary SCADA isolation protocols.",
};

const severityColor = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#1d8cff', LOW: '#22c55e' };

export default function RedTeamValidator() {
  const { addToast } = useToast();
  const { activeScenario, backendOnline } = useScenario();
  const [selected, setSelected] = useState(defaultAttacks[0]);

  // Hook for live Red Team Validation API
  const { data: rtData, loading: running, error: rtError, execute: runVal } = useApi(validateRedTeam, {
    manual: true,
    fallback: null,
  });

  const handleValidate = async (recommendationText) => {
    if (!backendOnline) {
      addToast('Backend offline — displaying simulated stress-test parameters', 'warning');
      return;
    }
    try {
      await runVal({
        recommendation: recommendationText || selected.name,
        scenario_id: activeScenario?.id || 'hormuz_closure',
        confidence: 0.85,
      });
      addToast('Red Team validation completed successfully', 'success');
    } catch (err) {
      addToast('Failed to validate recommendation: showing cached profile', 'error');
    }
  };

  useEffect(() => {
    if (backendOnline) {
      handleValidate(selected.name);
    }
  }, [backendOnline, selected, activeScenario]);

  // Derive findings from live validation or use fallback
  const activeRtData = rtData || mockRtData;
  const compositeResilience = Math.round(activeRtData.confidence_adjusted * 100);

  const radarData = activeRtData.findings
    ? activeRtData.findings.map(f => ({
        subject: f.category,
        score: f.severity === 'CRITICAL' ? 30 : f.severity === 'HIGH' ? 50 : 80,
      }))
    : defaultRadarData;

  return (
    <DashboardLayout>
      <PageHeader title="Red Team Validator" subtitle="Adversarial stress-testing of India's energy resilience across all threat vectors"
        badge={{ label: backendOnline ? 'AI RED TEAM' : 'DEMO MODE', color: '#ef4444' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => handleValidate(selected.name)} disabled={running}>
              {running ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={13} />}
              {' '}Validate Strategy
            </button>
          </div>
        }
      />

      {/* Loading overlay bar */}
      {running && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Simulating adversarial attacks and checking strategy vulnerabilities...
        </div>
      )}

      {/* Offline/Error Notification Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Displaying local stress-testing matrices.
        </div>
      ) : rtError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Stress test simulation failed: {rtError.message || 'Connection failed'}. Showing default critique.
        </div>
      ) : null}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overall Resilience', value: `${compositeResilience}%`, color: compositeResilience < 40 ? '#ef4444' : compositeResilience < 60 ? '#f59e0b' : '#22c55e', icon: Shield, sub: 'Adjusted Confidence' },
          { label: 'Critical Threat findings', value: String(activeRtData.findings?.filter(f => f.severity === 'CRITICAL').length || 2), color: '#ef4444', icon: AlertTriangle, sub: 'Needs mitigation' },
          { label: 'Original Confidence', value: `${Math.round(activeRtData.confidence_original * 100)}%`, color: '#1d8cff', icon: CheckCircle, sub: 'AI recommendation' },
          { label: 'Last Validation Run', value: rtData ? 'Just now' : '2h ago', color: '#8b5cf6', icon: Target, sub: 'Automated scan' },
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
        {/* Threat Scenarios List */}
        <div>
          <GlassCard className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', fontSize: 13, fontWeight: 600 }}>Threat Vector Stress-Testing</div>
            {defaultAttacks.map(attack => (
              <div key={attack.id} onClick={() => { setSelected(attack); if (backendOnline) handleValidate(attack.name); }}
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

          {/* Live critique output from backend */}
          {activeRtData && (
            <GlassCard style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={16} /> Adversarial Critique & Risk Mitigation Plan
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                {activeRtData.critique}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>Weak Assumptions</div>
                  {activeRtData.weak_assumptions?.map((wa, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <ChevronRight size={13} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                      <span>{wa}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>Ignored Threat Vectors</div>
                  {activeRtData.ignored_risks?.map((ir, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <ChevronRight size={13} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                      <span>{ir}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase' }}>Final Adjusted Strategy</div>
                <div style={{ fontSize: 12.5, color: '#22c55e', fontWeight: 600, lineHeight: 1.5 }}>
                  {activeRtData.final_recommendation}
                </div>
              </div>
            </GlassCard>
          )}
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
                <Radar dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.18} strokeWidth={1.5} />
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
              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => handleValidate(selected.name)} disabled={running}>
                {running ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />Running...</> : <><Play size={14} />Run Simulation</>}
              </button>
            </GlassCard>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
