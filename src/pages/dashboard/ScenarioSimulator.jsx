import React, { useState } from 'react';
import { Play, BarChart2, Map, CheckCircle, X, Bot, Loader, AlertTriangle, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { scenarioOptions } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import { runSimulation } from '../../services/api.js';

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
  const { activeScenario, scenarios, backendOnline } = useScenario();
  const [selected, setSelected] = useState(activeScenario?.id || 'hormuz_closure');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveChart, setLiveChart] = useState(null);
  const [aiRec, setAiRec] = useState(null);
  const [simulationError, setSimulationError] = useState(null);

  // Use backend scenarios if available, else fall back to mock
  const displayScenarios = scenarios.length > 0
    ? scenarios.map(s => ({ id: s.id, name: s.name, impact: s.severity || 'HIGH', probability: s.probability || 50 }))
    : scenarioOptions;

  const handleRunScenario = async () => {
    setRunning(true);
    setRan(false);
    setLiveResult(null);
    setLiveChart(null);
    setAiRec(null);
    setSimulationError(null);

    if (!backendOnline) {
      // Simulate backend delay and load local fallback/mock
      await new Promise(r => setTimeout(r, 1200));
      addToast('Backend offline — using simulated fallback projections', 'warning');
      setRunning(false);
      setRan(true);
      return;
    }

    try {
      const res = await runSimulation({ scenario_id: selected, duration_days: 30 });
      setLiveResult(res.summary || null);
      setLiveChart(res.daily_projection || null);
      setAiRec(res.recommended_action || null);
      addToast('Scenario simulation complete — live data loaded', 'success');
      setRan(true);
    } catch (err) {
      console.error(err);
      setSimulationError(err.message || 'Simulation failed');
      addToast('Failed to run simulation: showing local mock data', 'error');
      // Show mock as fallback
      setRan(true);
    } finally {
      setRunning(false);
    }
  };

  // Translate selected ID to mock keys if selected isn't a mock key directly
  const mockKey = selected.includes('russia') ? 'russia' : selected.includes('opec') ? 'opec' : selected.includes('port') ? 'weather' : 'hormuz';

  // Derived display data
  const result = liveResult
    ? {
        supplyLoss: liveResult.total_supply_gap_mbbl ? `${liveResult.total_supply_gap_mbbl}M bbl` : scenarioResults[mockKey]?.supplyLoss,
        priceSurge: liveResult.peak_brent ? `$${liveResult.peak_brent}` : scenarioResults[mockKey]?.priceSurge,
        gdpImpact: scenarioResults[mockKey]?.gdpImpact || '-0.9%',
        inflationImpact: scenarioResults[mockKey]?.inflationImpact || '+2.1%',
        duration: '30 days',
        severity: liveResult.severity || scenarioResults[mockKey]?.severity || 'CRITICAL',
      }
    : scenarioResults[mockKey];

  const displayChart = liveChart
    ? liveChart.map((d, i) => ({ t: `D+${d.day || i}`, price: d.brent_price || d.price || 88, supply: d.spr_level_pct || d.supply || 100 }))
    : chartData;

  const displayRecommendation = aiRec || 
    `Based on the ${displayScenarios.find(s => s.id === selected)?.name || 'selected'} scenario, activate Emergency Procurement Protocol Alpha. Divert pending cargo to Cape of Good Hope, initiate SPR drawdown of 8M bbl, and negotiate emergency supply agreements.`;

  return (
    <DashboardLayout>
      <PageHeader title="AI Scenario Simulator" subtitle="Geopolitical risk modeling · Economic impact projection · Strategic planning"
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('Custom scenario builder opened', 'info')}>Custom Scenario</button>
          <button className="btn btn-primary btn-sm" onClick={handleRunScenario} disabled={running}>
            {running ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />Running...</span> : <><Play size={13} /> Run Simulation</>}
          </button>
        </>}
      />

      {/* Offline/Error Notification Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Running local simulation sandbox with mock projections.
        </div>
      ) : simulationError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Simulation failed: {simulationError}. Showing default mock projections.
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Scenario selector */}
        <GlassCard>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Select Scenario</h3>
          {displayScenarios.map(s => (
            <div key={s.id} onClick={() => { setSelected(s.id); setRan(false); setSimulationError(null); }}
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
                  <AreaChart data={displayChart}>
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
                  {displayRecommendation}
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
