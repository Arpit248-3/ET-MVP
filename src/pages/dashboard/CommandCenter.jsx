import React, { useState } from 'react';
import { AlertTriangle, Zap, Activity, TrendingUp, Shield, CheckCircle, ArrowRight, Radio, Bot, Droplets, Loader, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import RiskGauge from '../../components/ui/RiskGauge.jsx';
import IndiaMapSVG from '../../components/ui/MapPanel.jsx';
import { kpiData, incidentFeed, timeSeriesData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import useApi from '../../hooks/useApi.js';
import { fetchState, fetchEconomicImpact, recordDecision } from '../../services/api.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ color: 'var(--text-muted)', marginBottom: 5, fontSize: 10.5 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 12, fontWeight: 600 }}>
          {p.name}: <b>${p.value}</b>
        </p>
      ))}
    </div>
  );
};

const incidentColorMap = {
  red: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.18)' },
  amber: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)' },
  blue: { bg: 'rgba(29,140,255,0.07)', border: 'rgba(29,140,255,0.18)' },
  green: { bg: 'rgba(34,197,94,0.07)', border: 'rgba(34,197,94,0.18)' },
};

export default function CommandCenter() {
  const { addToast } = useToast();
  const { systemState, activeScenario, backendOnline } = useScenario();
  const [mapFilter, setMapFilter] = useState('All');

  // Live state from backend — falls back to mock data if offline
  const liveKPIs = systemState?.kpi || null;
  const liveIncidents = systemState?.incident_feed || null;
  const liveTimeSeries = systemState?.time_series || null;
  const liveRisk = systemState?.kpi?.risk_score ?? kpiData.riskScore;
  const liveCrisisLevel = systemState?.kpi?.crisis_level ?? kpiData.crisisLevel;

  // Economic impact for chart time series
  const { data: economicData } = useApi(fetchEconomicImpact, {
    fallback: null,
    manual: !backendOnline,
  });

  const { execute: doDecision } = useApi(recordDecision, { manual: true });

  const handleAction = async (action) => {
    addToast(`${action} initiated — AI processing...`, 'success');
    try {
      await doDecision({
        action_type: action,
        approved_by: 'Commander Arjun Mehta',
        details: { source: 'CommandCenter', scenario: activeScenario?.id },
      });
    } catch {
      // Non-blocking — action already toasted
    }
  };

  // Use live data if available, else fall back to mock
  const displayIncidents = liveIncidents || incidentFeed;
  const displayTimeSeries = (liveTimeSeries && liveTimeSeries.length > 0)
    ? liveTimeSeries
    : (economicData?.time_series || timeSeriesData);
  const displayRisk = liveRisk;
  const displayCrisisLevel = liveCrisisLevel;
  const displaySPR = liveKPIs?.spr_coverage ?? kpiData.spr_coverage;
  const displayActiveIncidents = liveKPIs?.active_incidents ?? kpiData.activeIncidents;
  const displaySupplyGap = liveKPIs?.supply_gap ?? kpiData.supplyGap;
  const displaySanctions = liveKPIs?.active_sanctions ?? kpiData.activeSanctions;

  const crisisColor = displayRisk >= 80 ? '#ef4444' : displayRisk >= 60 ? '#f59e0b' : '#22c55e';
  const aiRec = systemState?.ai_recommendation
    || (activeScenario?.kpis?.ai_recommendation)
    || 'Reroute 2 cargo via Cape of Good Hope. Initiate West Africa negotiations. Draw SPR 5M bbl.';

  return (
    <DashboardLayout>
      <PageHeader
        title="Command Center"
        subtitle="National Energy Resilience — Real-time Situational Awareness"
        badge={{ label: displayCrisisLevel, color: crisisColor }}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => { addToast('Dashboard refreshed', 'info'); }}>
              <Radio size={12} /> Live Feed
            </button>
            {backendOnline && (
              <span style={{ fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                Live
              </span>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => handleAction('Emergency Protocol')}>
              <AlertTriangle size={12} /> Emergency
            </button>
          </>
        }
      />

      {/* KPI Row — 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 20 }}>
        <MetricCard label="National Risk Score" value={String(displayRisk)} unit="/100" color={displayRisk >= 80 ? 'red' : displayRisk >= 60 ? 'amber' : 'blue'} icon={AlertTriangle} delta={8} deltaLabel="vs yesterday" />
        <MetricCard label="Crisis Level" value={displayCrisisLevel} color={displayRisk >= 80 ? 'red' : 'amber'} icon={Activity} subtitle={activeScenario?.name?.slice(0, 20) || 'Hormuz + OPEC'} valueSm />
        <MetricCard label="Active Incidents" value={String(displayActiveIncidents)} color="red" icon={Zap} delta={2} deltaLabel="new today" />
        <MetricCard label="Supply Gap" value={displaySupplyGap} unit="bbl/day" color="red" icon={TrendingUp} delta={-12} deltaLabel="vs capacity" />
        <MetricCard label="SPR Coverage" value={String(displaySPR)} unit="days" color="blue" icon={Shield} delta={-4} />
        <MetricCard label="Active Sanctions" value={String(displaySanctions)} color="purple" icon={Droplets} subtitle="On 4 suppliers" />
      </div>

      {/* Map + Right panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>
        {/* India Map */}
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border-soft)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 className="card-title">India Energy Risk Map</h3>
              <p className="card-subtitle" style={{ marginBottom: 0 }}>Live node status · Supply chain visualization</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Refinery', 'Port', 'SPR', 'Pipeline'].map(f => (
                <button key={f} onClick={() => setMapFilter(f)} style={{
                  padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em',
                  background: mapFilter === f ? 'rgba(29,140,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: mapFilter === f ? '#60b4ff' : '#64748b',
                  border: `1px solid ${mapFilter === f ? 'rgba(29,140,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.15s',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 340 }}>
            <IndiaMapSVG filterType={mapFilter} />
          </div>
        </GlassCard>

        {/* Risk gauge + AI rec */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GlassCard glow={displayRisk >= 80 ? 'red' : 'amber'} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <RiskGauge value={displayRisk} size={130} label="Risk Score" />
            </div>
            <StatusBadge status={displayCrisisLevel} />
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
              {activeScenario?.description?.slice(0, 60) || 'Hormuz tension · OPEC cut risk'}
            </p>
          </GlassCard>

          <GlassCard style={{
            background: 'rgba(29,140,255,0.05)',
            borderColor: 'rgba(29,140,255,0.22)',
            flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} style={{ color: '#00e5ff' }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#00e5ff' }}>AI Recommendation</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-main)', lineHeight: 1.65, marginBottom: 12 }}>
              {aiRec}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => handleAction('AI Recommendation')}>Approve</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleAction('Alternative analysis')}>Alternatives</button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Chart + Incident feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 16 }}>
        {/* Price chart */}
        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h3 className="card-title">Oil Price Trend</h3>
              <p className="card-subtitle" style={{ marginBottom: 0 }}>
                {backendOnline ? 'Live scenario data' : 'Historical baseline'} · 7-month trend · $USD/bbl
              </p>
            </div>
            {/* Live price tickers */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Brent', price: `$${(systemState?.brent_price ?? 92.4).toFixed(1)}`, change: '+1.8%', color: '#1d8cff', up: true },
                { label: 'Indian Basket', price: '$89.1', change: '+1.4%', color: '#00e5ff', up: true },
                { label: 'WTI', price: '$87.6', change: '+0.9%', color: '#8b5cf6', up: true },
              ].map(t => (
                <div key={t.label} style={{
                  background: `${t.color}10`, border: `1px solid ${t.color}25`,
                  borderRadius: 8, padding: '6px 10px', textAlign: 'right', minWidth: 82,
                }}>
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.color, lineHeight: 1 }}>{t.price}</div>
                  <div style={{ fontSize: 10, color: t.up ? '#4ade80' : '#f87171', fontWeight: 600, marginTop: 2 }}>{t.change}</div>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={displayTimeSeries} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d8cff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1d8cff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="indianGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.07)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10.5 }} domain={[70, 100]} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="brent" stroke="#1d8cff" strokeWidth={2.5} fill="url(#brentGrad)" dot={false} name="Brent" activeDot={{ r: 5, fill: '#1d8cff', strokeWidth: 2, stroke: '#fff' }} />
              <Area type="monotone" dataKey="indianBasket" stroke="#00e5ff" strokeWidth={2} fill="url(#indianGrad)" dot={false} name="Indian Basket" activeDot={{ r: 5, fill: '#00e5ff', strokeWidth: 2, stroke: '#fff' }} />
              <Area type="monotone" dataKey="wti" stroke="#8b5cf6" strokeWidth={1.8} fill="url(#wtiGrad)" dot={false} name="WTI" activeDot={{ r: 4, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Bottom info strip */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
            {[
              { event: '🔴 OPEC Cut', date: 'Mar 2024', impact: '-0.8M bbl/day', color: '#ef4444' },
              { event: '⚠️ Hormuz Tension', date: 'May 2024', impact: '+$6.2/bbl spike', color: '#f59e0b' },
              { event: '📈 India Demand Peak', date: 'Jun 2024', impact: '+4.2M bbl/day', color: '#22c55e' },
              { event: '🛢️ SPR Release', date: 'Jul 2024', impact: '-$2.1/bbl relief', color: '#1d8cff' },
            ].map(e => (
              <div key={e.event} style={{ flex: 1, borderLeft: `2px solid ${e.color}40`, paddingLeft: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: e.color, marginBottom: 1 }}>{e.event}</div>
                <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginBottom: 1 }}>{e.date}</div>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600 }}>{e.impact}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Live incident feed */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="card-title">Live Incident Feed</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="status-dot live" />
              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
                {backendOnline ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayIncidents.map((incident, idx) => {
              const cols = incidentColorMap[incident.color] || incidentColorMap.blue;
              return (
                <div key={incident.id ?? idx} style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  borderRadius: 9, background: cols.bg, border: `1px solid ${cols.border}`,
                }}>
                  <div style={{ flexShrink: 0, paddingTop: 1 }}>
                    <StatusBadge status={incident.type || incident.severity} size="sm" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{incident.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{incident.detail || incident.description}</p>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>{incident.time}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Immediate actions */}
      <GlassCard>
        <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Immediate Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Approve Procurement Plan', variant: 'primary', icon: CheckCircle },
            { label: 'Initiate SPR Drawdown', variant: 'secondary', icon: Shield },
            { label: 'Run Crisis Simulation', variant: 'secondary', icon: Activity },
            { label: 'Generate AI Brief', variant: 'secondary', icon: Bot },
            { label: 'Alert Cabinet', variant: 'danger', icon: AlertTriangle },
            { label: 'View Full Report', variant: 'ghost', icon: ArrowRight },
          ].map(a => (
            <button key={a.label} className={`btn btn-${a.variant} btn-sm`} onClick={() => handleAction(a.label)}>
              <a.icon size={12} />{a.label}
            </button>
          ))}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
