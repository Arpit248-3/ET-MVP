import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Ship, Zap, Globe, Filter, Loader, WifiOff } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { riskSignals } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import useApi from '../../hooks/useApi.js';
import { fetchRisk } from '../../services/api.js';

const newsFeed = [
  { source: 'Reuters', headline: 'Iran military exercises near Hormuz Strait raise shipping alarm', time: '12 min', risk: 'CRITICAL' },
  { source: 'Bloomberg', headline: 'OPEC+ emergency meeting called — production cut of 1.2M bbl expected', time: '28 min', risk: 'WARNING' },
  { source: "S&P Platts", headline: 'Bonny Light crude premium narrows as Nigeria boosts output', time: '1 hr', risk: 'INFO' },
  { source: "Lloyd's", headline: 'War risk insurance rates for Red Sea routes up 35% this week', time: '2 hr', risk: 'WARNING' },
  { source: 'OPEC', headline: 'Saudi Arabia signals willingness for deeper cuts if market weakens', time: '3 hr', risk: 'WARNING' },
];

const signalCols = [
  { key: 'source', label: 'Source' },
  { key: 'category', label: 'Category', render: v => <span className="badge badge-blue" style={{fontSize:10}}>{v}</span> },
  { key: 'signal', label: 'Signal' },
  { key: 'score', label: 'Risk Score', render: v => <span style={{ color: v > 75 ? '#ef4444' : v > 55 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>{v}</span> },
  { key: 'confidence', label: 'Confidence', render: v => <span style={{ color: '#94a3b8' }}>{v}%</span> },
  { key: 'trend', label: 'Trend', render: v => <span style={{ color: v === 'up' ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{v === 'up' ? '↑ Rising' : '→ Stable'}</span> },
];

export default function RiskIntelligence() {
  const { addToast } = useToast();
  const { systemState, activeScenario, backendOnline } = useScenario();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const filters = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];

  // Live risk data from backend
  const { data: riskData, loading: riskLoading, error: riskError, refetch } = useApi(fetchRisk, {
    fallback: null,
  });

  // Display toast on error
  useEffect(() => {
    if (riskError) {
      addToast('Error fetching live risk: using mock fallback data', 'error');
    }
  }, [riskError, addToast]);

  // Derive KPIs from live data or use defaults
  const overallScore = riskData?.overall_score ?? systemState?.kpi?.risk_score ?? 74;
  const crisisLevel = riskData?.crisis_level ?? systemState?.kpi?.crisis_level ?? 'ELEVATED';

  // Helper to extract component value by name or use fallback
  const getComponentVal = (name, fallbackVal) => {
    if (!riskData || !Array.isArray(riskData.components)) return fallbackVal;
    const comp = riskData.components.find(c => c.name === name);
    return comp ? Math.round(comp.value) : fallbackVal;
  };

  const maritime = getComponentVal('maritime_delay', 87);
  const sanctions = getComponentVal('sanctions_exposure', 72);
  const opec = getComponentVal('supplier_reliability', 78);
  const weather = getComponentVal('spr_coverage', 65);
  const market = getComponentVal('crude_price_spike', 55);
  const geopolitical = getComponentVal('geopolitical_risk', 80);

  const radarData = [
    { subject: 'Maritime', A: maritime },
    { subject: 'Sanctions', A: sanctions },
    { subject: 'OPEC', A: opec },
    { subject: 'Weather', A: weather },
    { subject: 'Market', A: market },
    { subject: 'Geopolitical', A: geopolitical },
  ];

  // Live signals from backend or fallback to mock
  const displaySignals = riskData?.signals ?? riskSignals;

  const handleRefresh = async () => {
    try {
      await refetch();
      addToast('Risk assessment updated from backend', 'success');
    } catch (err) {
      addToast('Failed to refresh risk assessment from backend', 'error');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Risk Intelligence" subtitle="Multi-source threat monitoring · AI-synthesized signals · Real-time analysis"
        badge={<StatusBadge status={crisisLevel} />}
        actions={<>
          <button className="btn btn-secondary btn-sm"><Filter size={13} /> Filters</button>
          <button className="btn btn-primary btn-sm" onClick={handleRefresh} disabled={riskLoading}>
            {riskLoading && <Loader size={13} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />}
            Run Assessment
          </button>
        </>}
      />

      {/* Loading indicator bar */}
      {riskLoading && (
        <div style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', color: '#1d8cff', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Loading risk assessment from backend...
        </div>
      )}

      {/* Error / Offline Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Displaying simulated fallback risk data.
        </div>
      ) : riskError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Error loading risk data: {riskError.message || 'Connection failed'}. Showing fallback metrics.
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overall Threat Score', val: `${overallScore}/100`, color: overallScore >= 80 ? '#ef4444' : overallScore >= 60 ? '#f59e0b' : '#22c55e' },
          { label: 'Maritime Risk', val: `${maritime}/100`, color: maritime >= 80 ? '#ef4444' : '#f59e0b' },
          { label: 'Sanctions Exposure', val: `${sanctions}/100`, color: sanctions >= 80 ? '#ef4444' : '#f59e0b' },
          { label: 'OPEC Risk', val: `${opec}/100`, color: opec >= 80 ? '#ef4444' : '#f59e0b' },
          { label: 'Weather Disruption', val: `${weather}/100`, color: '#1d8cff' },
          { label: 'Active Signals', val: String(displaySignals.length), color: '#8b5cf6' },
        ].map(k => (
          <GlassCard key={k.label} hover style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{k.label}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
        {/* News Feed */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Intelligence Feed</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {filters.map(f => (
                <button key={f} className={`btn ${activeFilter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {newsFeed.filter(n => activeFilter === 'ALL' || n.risk === activeFilter).map((news, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-soft)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#1d8cff', fontWeight: 700 }}>{news.source}</span>
                    <StatusBadge status={news.risk} size="sm" />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>{news.headline}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0, marginTop: 2 }}>{news.time} ago</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Risk Radar</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>Threat category heatmap</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(90,130,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Risk" dataKey="A" stroke="#1d8cff" fill="rgba(29,140,255,0.15)" fillOpacity={1} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {radarData.map(d => (
              <div key={d.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{d.subject}</span>
                <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ width: `${d.A}%`, height: '100%', borderRadius: 2, background: d.A > 80 ? '#ef4444' : d.A > 65 ? '#f59e0b' : '#1d8cff' }} />
                </div>
                <span style={{ fontSize: 11, color: d.A > 80 ? '#ef4444' : d.A > 65 ? '#f59e0b' : '#1d8cff', fontWeight: 700, width: 28, textAlign: 'right' }}>{d.A}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Signal Table */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Active Risk Signals</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{displaySignals.length} active signals{backendOnline ? ' · Live' : ' · Mock'}</span>
        </div>
        <DataTable columns={signalCols} data={displaySignals} onRowClick={row => addToast(`Viewing signal: ${row.signal}`, 'info')} />
      </GlassCard>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
