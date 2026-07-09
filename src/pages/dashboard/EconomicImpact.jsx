import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import { economicImpact, stateImpactData, timeSeriesData, sectorImpactData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';

export default function EconomicImpact() {
  const { addToast } = useToast();

  return (
    <DashboardLayout>
      <PageHeader title="Economic Impact Dashboard" subtitle="Macro-economic projections · State-level analysis · Sector impact modeling"
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('Generating economic report...', 'info')}>Export Report</button>
          <button className="btn btn-primary btn-sm" onClick={() => addToast('Model recalculated', 'success')}>Recalculate</button>
        </>}
      />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard label="CPI / Inflation Impact" value="+1.8" unit="%" color="red" icon={TrendingUp} delta={0.3} />
        <MetricCard label="GDP Impact" value="-0.4" unit="%" color="red" icon={TrendingDown} delta={-0.1} />
        <MetricCard label="Fuel Price Rise" value="+₹12.4" unit="/L" color="amber" icon={DollarSign} delta={4.2} />
        <MetricCard label="Fiscal Cost" value="₹28,000" unit="Cr" color="amber" icon={BarChart2} delta={12} />
        <MetricCard label="CAD Widening" value="-1.2" unit="% GDP" color="red" icon={TrendingDown} delta={-0.4} />
        <MetricCard label="Trade Deficit" value="₹18,500" unit="Cr" color="amber" icon={TrendingUp} delta={8} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Price trend */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Oil Price Trend</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>Monthly Brent Crude & Indian Basket ($USD/bbl)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[70, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.95)', border: '1px solid rgba(90,130,255,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="brent" stroke="#ef4444" strokeWidth={2} dot={false} name="Brent" />
              <Line type="monotone" dataKey="indianBasket" stroke="#1d8cff" strokeWidth={2} dot={false} name="Indian Basket" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Sector impact */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Sector Impact Analysis</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>Impact score by sector (0–100)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectorImpactData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
              <YAxis dataKey="sector" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.95)', border: '1px solid rgba(90,130,255,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {sectorImpactData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* State ranking */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>State Impact Ranking</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...stateImpactData].sort((a, b) => b.impact - a.impact).map((state, i) => (
              <div key={state.state} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', width: 20, textAlign: 'right' }}>#{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', width: 120 }}>{state.state}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ width: `${state.impact}%`, height: '100%', borderRadius: 3, background: state.impact > 80 ? '#ef4444' : state.impact > 65 ? '#f59e0b' : '#1d8cff', transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: state.impact > 80 ? '#ef4444' : state.impact > 65 ? '#f59e0b' : '#1d8cff', fontWeight: 700, width: 28 }}>{state.impact}</span>
                <span className={`badge ${state.gdpExposure === 'CRITICAL' ? 'badge-red' : state.gdpExposure === 'HIGH' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: 9 }}>{state.gdpExposure}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Key insights */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Key Insights</h3>
          {[
            { icon: '🔴', title: 'UP faces highest exposure', detail: 'Uttar Pradesh (pop. 240M) has 91/100 impact score — critical food & transport dependency.' },
            { icon: '🟡', title: 'Aviation sector critical', detail: 'ATF prices up 28% — airline sector faces ₹8,400 Cr additional cost burden.' },
            { icon: '🔵', title: 'West Africa saves ₹4,200 Cr', detail: 'Rerouting via Cape avoids premium price zone, saving estimated ₹4,200 Cr/month.' },
            { icon: '🟢', title: 'SPR activation buffers GDP', detail: 'SPR drawdown of 8M bbl reduces GDP impact from -0.9% to -0.4%.' },
          ].map(insight => (
            <div key={insight.title} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{insight.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{insight.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{insight.detail}</p>
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => addToast('Full economic analysis report generated', 'success')}>Generate Full Report</button>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
