import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, X, FileText, Clock, Filter, BarChart2, LineChart as LineIcon, PieChart as PieIcon, Activity } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Sector, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const regulations = [
  { id: 'IEA-001', name: 'IEA Emergency Reserves Protocol', authority: 'IEA', status: 'COMPLIANT', score: 98, dueDate: '2024-Q4', category: 'International' },
  { id: 'MoP-2024', name: 'MoP Strategic Storage Directive', authority: 'Ministry of Petroleum', status: 'COMPLIANT', score: 95, dueDate: '2024-Q3', category: 'National' },
  { id: 'PESO-R45', name: 'PESO Safety Regulations R-45', authority: 'PESO', status: 'REVIEW', score: 78, dueDate: '2024-Q2', category: 'Safety' },
  { id: 'ENV-NGT-7', name: 'NGT Environmental Compliance', authority: 'NGT', status: 'COMPLIANT', score: 91, dueDate: '2024-Q4', category: 'Environment' },
  { id: 'OISD-116', name: 'OISD Standard 116 – Refineries', authority: 'OISD', status: 'COMPLIANT', score: 96, dueDate: '2024-Q3', category: 'Safety' },
  { id: 'BIS-14846', name: 'BIS Quality Standard IS 14846', authority: 'BIS', status: 'NON-COMPLIANT', score: 62, dueDate: '2024-Q1', category: 'Quality' },
  { id: 'TRAI-CYB', name: 'TRAI Cybersecurity Mandate', authority: 'TRAI', status: 'REVIEW', score: 71, dueDate: '2024-Q2', category: 'Cybersecurity' },
  { id: 'GST-ENE', name: 'GST Energy Sector Reporting', authority: 'CBIC', status: 'COMPLIANT', score: 99, dueDate: '2024-Q4', category: 'Financial' },
];

const radarData = [
  { area: 'Intl', score: 97 }, { area: 'National', score: 94 }, { area: 'Safety', score: 87 },
  { area: 'Env', score: 91 }, { area: 'Quality', score: 68 }, { area: 'Cyber', score: 75 }, { area: 'Finance', score: 99 },
];

const trendData = [
  { month: 'Jan', score: 82, prev: 78 }, { month: 'Feb', score: 85, prev: 80 },
  { month: 'Mar', score: 87, prev: 83 }, { month: 'Apr', score: 84, prev: 82 },
  { month: 'May', score: 89, prev: 85 }, { month: 'Jun', score: 91, prev: 87 },
  { month: 'Jul', score: 88, prev: 86 }, { month: 'Aug', score: 92, prev: 88 },
  { month: 'Sep', score: 90, prev: 89 },
];

const pieData = [
  { name: 'Compliant', value: 5, color: '#22c55e' },
  { name: 'Under Review', value: 2, color: '#f59e0b' },
  { name: 'Non-Compliant', value: 1, color: '#ef4444' },
];

// Color per bar based on score
const getBarColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#1d8cff';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  return (
    <div className="custom-tooltip">
      <p style={{ color: 'var(--text-muted)', fontSize: 10.5, marginBottom: 4 }}>{label}</p>
      <p style={{ color: getBarColor(score), fontWeight: 700, fontSize: 13 }}>Score: {score}%</p>
      {payload[1] && <p style={{ color: '#64748b', fontSize: 11 }}>Prev: {payload[1].value}%</p>}
    </div>
  );
};

const CustomPieLabelLine = () => null;
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const chartTypes = [
  { id: 'bar', label: 'Bar', icon: BarChart2 },
  { id: 'line', label: 'Line', icon: LineIcon },
  { id: 'area', label: 'Area', icon: Activity },
  { id: 'pie', label: 'Pie', icon: PieIcon },
];

export default function ComplianceShield() {
  const [filter, setFilter] = useState('All');
  const [chartType, setChartType] = useState('bar');
  const categories = ['All', 'International', 'National', 'Safety', 'Environment', 'Quality', 'Cybersecurity', 'Financial'];
  const filtered = filter === 'All' ? regulations : regulations.filter(r => r.category === filter);
  const compliant = regulations.filter(r => r.status === 'COMPLIANT').length;
  const overallScore = Math.round(regulations.reduce((a, b) => a + b.score, 0) / regulations.length);

  const renderChart = () => {
    const tooltipStyle = { background: 'rgba(6,15,32,0.97)', border: '1px solid rgba(90,130,255,0.25)', borderRadius: 10, fontSize: 11 };
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={trendData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} domain={[55, 100]} />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="score" radius={[5, 5, 0, 0]} name="Score">
              {trendData.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.score)} opacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="prev" radius={[4, 4, 0, 0]} name="Previous" fill="rgba(148,163,184,0.15)" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={trendData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} domain={[55, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} name="Score 2024" />
            <Line type="monotone" dataKey="prev" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Prev Year" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d8cff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1d8cff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10.5 }} axisLine={false} tickLine={false} domain={[55, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#scoreGrad)" name="Score 2024" />
            <Area type="monotone" dataKey="prev" stroke="#1d8cff" strokeWidth={1.5} fill="url(#prevGrad)" name="Prev Year" />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35}
              dataKey="value" labelLine={<CustomPieLabelLine />} label={<CustomPieLabel />}
              strokeWidth={0} paddingAngle={3}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}: {entry.payload.value}</span>
              )}
            />
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Compliance Shield"
        subtitle="Regulatory tracking and audit readiness across all energy mandates"
        badge={{ label: 'AUTO-MONITORING', color: '#22c55e' }}
        actions={
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={12} /> Export Report
          </button>
        }
      />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overall Score', value: `${overallScore}%`, color: '#4ade80', icon: Shield, bg: 'rgba(34,197,94,0.1)' },
          { label: 'Compliant', value: `${compliant}/${regulations.length}`, color: '#60b4ff', icon: CheckCircle, bg: 'rgba(29,140,255,0.1)' },
          { label: 'Under Review', value: '2', color: '#fbbf24', icon: Clock, bg: 'rgba(245,158,11,0.1)' },
          { label: 'Non-Compliant', value: '1', color: '#f87171', icon: X, bg: 'rgba(239,68,68,0.1)' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.label} style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${item.color} 0%, transparent 70%)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                </div>
                <div style={{ background: item.bg, borderRadius: 10, padding: 9, border: `1px solid ${item.color}25` }}>
                  <Icon size={18} color={item.color} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
        {/* Main trend chart with switcher */}
        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div className="card-title">Compliance Score Trend (2024)</div>
              <div className="card-subtitle" style={{ marginBottom: 0 }}>Monthly scores vs prior year · Color = performance band</div>
            </div>
            {/* Chart type switcher */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, border: '1px solid var(--border-soft)' }}>
              {chartTypes.map(ct => {
                const Icon = ct.icon;
                return (
                  <button
                    key={ct.id}
                    onClick={() => setChartType(ct.id)}
                    title={ct.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                      background: chartType === ct.id ? 'rgba(29,140,255,0.2)' : 'transparent',
                      color: chartType === ct.id ? '#60b4ff' : '#64748b',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={12} /> {ct.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color legend for bar chart */}
          {chartType === 'bar' && (
            <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
              {[['≥90 Excellent', '#22c55e'], ['≥80 Good', '#1d8cff'], ['≥70 Fair', '#f59e0b'], ['<70 At Risk', '#ef4444']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 9.5, color: '#64748b' }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <ResponsiveContainer width="100%" height={170}>
            {renderChart()}
          </ResponsiveContainer>
        </GlassCard>

        {/* Radar */}
        <GlassCard style={{ padding: '16px 20px' }}>
          <div className="card-title">Coverage by Category</div>
          <div className="card-subtitle">Radar of compliance across domains</div>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="score" stroke="#1d8cff" fill="#1d8cff" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar dataKey="score" stroke="#22c55e" fill="none" strokeWidth={0.5} strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: 'rgba(6,15,32,0.97)', border: '1px solid rgba(90,130,255,0.25)', borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Filter + Table */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={12} style={{ color: 'var(--text-dim)' }} />
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: '1px solid', fontFamily: 'inherit',
            background: filter === cat ? 'rgba(29,140,255,0.15)' : 'transparent',
            borderColor: filter === cat ? '#60b4ff' : 'var(--border-soft)',
            color: filter === cat ? '#60b4ff' : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{cat}</button>
        ))}
      </div>

      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['ID', 'Regulation Name', 'Authority', 'Category', 'Score', 'Due', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(reg => (
              <tr key={reg.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,140,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '11px 16px', fontSize: 11, fontFamily: 'monospace', color: '#60b4ff' }}>{reg.id}</td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>{reg.name}</td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: 'var(--text-muted)' }}>{reg.authority}</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontWeight: 600 }}>{reg.category}</span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 56, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
                      <div style={{ width: `${reg.score}%`, height: '100%', background: getBarColor(reg.score), borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: getBarColor(reg.score) }}>{reg.score}%</span>
                  </div>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: 'var(--text-dim)' }}>{reg.dueDate}</td>
                <td style={{ padding: '11px 16px' }}><StatusBadge status={reg.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </DashboardLayout>
  );
}
