import React, { useState } from 'react';
import { Play, BarChart2, Map, CheckCircle, X, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import IndiaMapSVG from '../../components/ui/MapPanel.jsx';
import { scenarioOptions } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';

const scenarioResults = {
  hormuz: { supplyLoss: '3.8M bbl/day', priceSurge: '+$28/bbl', gdpImpact: '-0.9%', inflationImpact: '+2.1%', duration: '45 days', severity: 'CRITICAL' },
  russia: { supplyLoss: '1.2M bbl/day', priceSurge: '+$12/bbl', gdpImpact: '-0.4%', inflationImpact: '+0.9%', duration: '90 days', severity: 'HIGH' },
  opec: { supplyLoss: '0.8M bbl/day', priceSurge: '+$8/bbl', gdpImpact: '-0.3%', inflationImpact: '+0.6%', duration: '30 days', severity: 'WARNING' },
  weather: { supplyLoss: '0.5M bbl/day', priceSurge: '+$5/bbl', gdpImpact: '-0.2%', inflationImpact: '+0.4%', duration: '14 days', severity: 'WARNING' },
};

const chartData = [
  { t: 'D+0', price: 88, supply: 100 }, { t: 'D+7', price: 96, supply: 82 },
  { t: 'D+14', price: 108, supply: 65 }, { t: 'D+21', price: 116, supply: 58 },
  { t: 'D+30', price: 112, supply: 62 }, { t: 'D+45', price: 102, supply: 74 },
  { t: 'D+60', price: 94, supply: 86 },
];

export default function ScenarioSimulator() {
  const { addToast } = useToast();
  const [selected, setSelected] = useState('hormuz');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const runScenario = async () => {
    setRunning(true);
    setRan(false);
    await new Promise(r => setTimeout(r, 2000));
    setRunning(false);
    setRan(true);
    addToast('Scenario simulation complete', 'success');
  };

  const result = scenarioResults[selected];

  return (
    <DashboardLayout>
      <PageHeader title="AI Scenario Simulator" subtitle="Geopolitical risk modeling · Economic impact projection · Strategic planning"
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('Custom scenario builder opened', 'info')}>Custom Scenario</button>
          <button className="btn btn-primary btn-sm" onClick={runScenario} disabled={running}>
            {running ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />Running...</span> : <><Play size={13} /> Run Simulation</>}
          </button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Scenario selector */}
        <GlassCard>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Select Scenario</h3>
          {scenarioOptions.map(s => (
            <div key={s.id} onClick={() => { setSelected(s.id); setRan(false); }}
              style={{ padding: '12px 14px', borderRadius: 8, marginBottom: 8, cursor: 'pointer', border: `1px solid ${selected === s.id ? 'rgba(29,140,255,0.4)' : 'var(--border-soft)'}`, background: selected === s.id ? 'rgba(29,140,255,0.1)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: selected === s.id ? '#1d8cff' : 'var(--text-main)' }}>{s.name}</span>
                <StatusBadge status={s.impact} size="sm" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ width: `${s.probability}%`, height: '100%', borderRadius: 2, background: s.impact === 'CRITICAL' ? '#ef4444' : s.impact === 'HIGH' ? '#f59e0b' : '#1d8cff' }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{s.probability}%</span>
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Simulation area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ran && result ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Supply Loss', val: result.supplyLoss, color: '#ef4444' },
                  { label: 'Price Surge', val: result.priceSurge, color: '#f59e0b' },
                  { label: 'GDP Impact', val: result.gdpImpact, color: '#ef4444' },
                  { label: 'Inflation Impact', val: result.inflationImpact, color: '#f59e0b' },
                  { label: 'Duration', val: result.duration, color: '#1d8cff' },
                  { label: 'Severity', val: result.severity, color: result.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' },
                ].map(k => (
                  <GlassCard key={k.label} style={{ textAlign: 'center', padding: '14px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{k.label}</div>
                  </GlassCard>
                ))}
              </div>

              <GlassCard>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Price & Supply Timeline</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.08)" />
                    <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.95)', border: '1px solid rgba(90,130,255,0.3)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="price" stroke="#ef4444" fill="rgba(239,68,68,0.1)" name="Oil Price ($)" />
                    <Area type="monotone" dataKey="supply" stroke="#1d8cff" fill="rgba(29,140,255,0.1)" name="Supply (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>

              <GlassCard style={{ background: 'rgba(29,140,255,0.05)', borderColor: 'rgba(29,140,255,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Bot size={16} style={{ color: '#00e5ff' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#00e5ff' }}>AI Strategic Recommendation</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 14 }}>
                  Based on the {scenarioOptions.find(s => s.id === selected)?.name} scenario, activate <b>Emergency Procurement Protocol Alpha</b>. Divert 3 pending cargo to Cape of Good Hope, initiate SPR drawdown of 8M bbl, and negotiate emergency supply agreement with Brazil (Petrobras).
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-success btn-sm" onClick={() => addToast('Action plan approved', 'success')}><CheckCircle size={13} /> Approve Plan</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast('Running alternative scenarios...', 'info')}>Modify Parameters</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => addToast('Alternative scenario running...', 'info')}>Run Alternative</button>
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {running
                  ? <span style={{ width: 28, height: 28, border: '3px solid rgba(29,140,255,0.3)', borderTopColor: '#1d8cff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'block' }} />
                  : <Play size={26} style={{ color: '#1d8cff' }} />}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{running ? 'Simulating Scenario...' : 'Ready to Simulate'}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320 }}>{running ? 'AI is running economic models, supply chain analysis, and risk projections...' : 'Select a scenario and click Run Simulation to generate projections.'}</p>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
