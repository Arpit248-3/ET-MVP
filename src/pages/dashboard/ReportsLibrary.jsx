import React, { useState } from 'react';
import { BookOpen, Download, Eye, Search, Filter, FileText, BarChart2, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const reports = [
  { id: 'RPT-2024-0912', title: 'Morning Intelligence Brief – Sept 12, 2024', type: 'Intelligence', date: 'Sep 12, 2024', author: 'UrjaNetra AI', pages: 8, status: 'PUBLISHED', priority: 'CRITICAL' },
  { id: 'RPT-2024-0911-E', title: 'Economic Impact Assessment – Q3 2024', type: 'Economic', date: 'Sep 11, 2024', author: 'Economic AI Module', pages: 24, status: 'PUBLISHED', priority: 'HIGH' },
  { id: 'RPT-2024-0910', title: 'Supply Chain Risk Report – September', type: 'Supply Chain', date: 'Sep 10, 2024', author: 'SupplyOptimizer', pages: 16, status: 'PUBLISHED', priority: 'HIGH' },
  { id: 'RPT-2024-0908', title: 'Compliance Audit – BIS Standards Q3', type: 'Compliance', date: 'Sep 8, 2024', author: 'ComplianceAI', pages: 12, status: 'PUBLISHED', priority: 'MEDIUM' },
  { id: 'RPT-2024-0905', title: 'Refinery Compatibility Matrix – September', type: 'Operations', date: 'Sep 5, 2024', author: 'Refinery AI', pages: 18, status: 'PUBLISHED', priority: 'MEDIUM' },
  { id: 'RPT-2024-0901', title: 'Monthly Procurement Optimization Report', type: 'Procurement', date: 'Sep 1, 2024', author: 'Procurement AI', pages: 22, status: 'PUBLISHED', priority: 'MEDIUM' },
  { id: 'RPT-2024-0831', title: 'SPR Drawdown Feasibility Analysis', type: 'Strategic', date: 'Aug 31, 2024', author: 'RiskNet-v4', pages: 10, status: 'REVIEW', priority: 'HIGH' },
  { id: 'RPT-2024-0828', title: 'Red Team Exercise – Hormuz Simulation', type: 'Red Team', date: 'Aug 28, 2024', author: 'RedTeamAI', pages: 30, status: 'PUBLISHED', priority: 'CRITICAL' },
];

const typeIcons = { Intelligence: FileText, Economic: BarChart2, 'Supply Chain': AlertTriangle, Compliance: FileText, Operations: BarChart2, Procurement: FileText, Strategic: AlertTriangle, 'Red Team': AlertTriangle };
const typeColors = { Intelligence: '#8b5cf6', Economic: '#1d8cff', 'Supply Chain': '#f59e0b', Compliance: '#22c55e', Operations: '#00e5ff', Procurement: '#f97316', Strategic: '#ef4444', 'Red Team': '#ef4444' };

export default function ReportsLibrary() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Intelligence', 'Economic', 'Supply Chain', 'Compliance', 'Operations', 'Procurement', 'Strategic', 'Red Team'];
  const filtered = reports
    .filter(r => filter === 'All' || r.type === filter)
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader title="Reports Library" subtitle="AI-generated intelligence reports, audits, and strategic analyses"
        badge={{ label: `${reports.length} REPORTS`, color: '#1d8cff' }}
        actions={
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <FileText size={13} />Generate Report
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Reports', value: reports.length, color: '#1d8cff' },
          { label: 'This Month', value: 8, color: '#22c55e' },
          { label: 'Critical', value: reports.filter(r => r.priority === 'CRITICAL').length, color: '#ef4444' },
          { label: 'Under Review', value: reports.filter(r => r.status === 'REVIEW').length, color: '#f59e0b' },
        ].map(stat => (
          <GlassCard key={stat.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={13} style={{ color: 'var(--text-dim)', marginTop: 6 }} />
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: filter === t ? '#1d8cff20' : 'transparent',
              borderColor: filter === t ? '#1d8cff' : 'var(--border-soft)',
              color: filter === t ? '#1d8cff' : 'var(--text-dim)',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {filtered.map(report => {
          const Icon = typeIcons[report.type] || FileText;
          const color = typeColors[report.type] || '#1d8cff';
          return (
            <GlassCard key={report.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}06`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ background: `${color}18`, borderRadius: 8, padding: 8, flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color, marginBottom: 3 }}>{report.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{report.title}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  <StatusBadge status={report.priority} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
                <span>{report.type}</span>
                <span>{report.date}</span>
                <span>By {report.author}</span>
                <span>{report.pages} pages</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '5px 10px' }}>
                  <Eye size={12} />View
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '5px 10px' }}>
                  <Download size={12} />Download PDF
                </button>
                <div style={{ marginLeft: 'auto' }}><StatusBadge status={report.status} /></div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
