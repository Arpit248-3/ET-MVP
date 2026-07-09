import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Ship, Zap, Globe, Filter } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import RiskGauge from '../../components/ui/RiskGauge.jsx';
import { riskSignals } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';

const radarData = [
  { subject: 'Maritime', A: 87 }, { subject: 'Sanctions', A: 72 }, { subject: 'OPEC', A: 78 },
  { subject: 'Weather', A: 65 }, { subject: 'Market', A: 55 }, { subject: 'Geopolitical', A: 80 },
];

const newsFeed = [
  { source: 'Reuters', headline: 'Iran military exercises near Hormuz Strait raise shipping alarm', time: '12 min', risk: 'CRITICAL' },
  { source: 'Bloomberg', headline: 'OPEC+ emergency meeting called — production cut of 1.2M bbl expected', time: '28 min', risk: 'WARNING' },
  { source: 'S&P Platts', headline: 'Bonny Light crude premium narrows as Nigeria boosts output', time: '1 hr', risk: 'INFO' },
  { source: 'Lloyd\'s', headline: 'War risk insurance rates for Red Sea routes up 35% this week', time: '2 hr', risk: 'WARNING' },
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
  const [activeFilter, setActiveFilter] = useState('ALL');
  const filters = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];

  return (
    <DashboardLayout>
      <PageHeader title="Risk Intelligence" subtitle="Multi-source threat monitoring · AI-synthesized signals · Real-time analysis"
        badge={<StatusBadge status="ELEVATED" />}
        actions={<>
          <button className="btn btn-secondary btn-sm"><Filter size={13} /> Filters</button>
          <button className="btn btn-primary btn-sm" onClick={() => addToast('Risk assessment updated', 'success')}>Run Assessment</button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overall Threat Score', val: '74/100', color: '#f59e0b' },
          { label: 'Maritime Risk', val: '87/100', color: '#ef4444' },
          { label: 'Sanctions Exposure', val: '72/100', color: '#f59e0b' },
          { label: 'OPEC Risk', val: '78/100', color: '#f59e0b' },
          { label: 'Weather Disruption', val: '65/100', color: '#1d8cff' },
          { label: 'Active Signals', val: '24', color: '#8b5cf6' },
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
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{riskSignals.length} active signals</span>
        </div>
        <DataTable columns={signalCols} data={riskSignals} onRowClick={row => addToast(`Viewing signal: ${row.signal}`, 'info')} />
      </GlassCard>
    </DashboardLayout>
  );
}
