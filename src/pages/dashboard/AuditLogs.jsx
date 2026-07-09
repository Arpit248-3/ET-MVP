import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Download, User, Shield } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const logs = [
  { id: 'AUD-7821', user: 'Arjun Mehta', role: 'Commander', action: 'APPROVED', resource: 'SPR Drawdown MOT-2024-031', ip: '10.0.1.4', time: '09:12:34', date: 'Sep 12, 2024', severity: 'HIGH', category: 'Decision' },
  { id: 'AUD-7820', user: 'UrjaNetra AI', role: 'AI Engine', action: 'GENERATED', resource: 'Intelligence Brief AB-2024-0912', ip: 'internal', time: '06:00:01', date: 'Sep 12, 2024', severity: 'INFO', category: 'AI' },
  { id: 'AUD-7819', user: 'Priya Sharma', role: 'MoP Secretary', action: 'VOTED', resource: 'Motion MOT-2024-031 (FOR)', ip: '10.0.2.8', time: '08:45:12', date: 'Sep 12, 2024', severity: 'MEDIUM', category: 'Decision' },
  { id: 'AUD-7818', user: 'Anita Bose', role: 'Finance Ministry', action: 'VOTED', resource: 'Motion MOT-2024-031 (AGAINST)', ip: '10.0.3.2', time: '08:30:05', date: 'Sep 12, 2024', severity: 'MEDIUM', category: 'Decision' },
  { id: 'AUD-7817', user: 'Rajiv Kumar', role: 'IOC Chairman', action: 'EXPORTED', resource: 'Procurement Report RPT-2024-0901', ip: '10.0.4.7', time: '07:55:22', date: 'Sep 12, 2024', severity: 'LOW', category: 'Data Access' },
  { id: 'AUD-7816', user: 'System', role: 'Auto', action: 'TRIGGERED', resource: 'Risk Alert: Hormuz Disruption Score +18', ip: 'internal', time: '05:30:00', date: 'Sep 12, 2024', severity: 'HIGH', category: 'System' },
  { id: 'AUD-7815', user: 'Suresh Nair', role: 'HPCL Director', action: 'ACCESSED', resource: 'Supply Chain Twin – Jamnagar Node', ip: '10.0.5.1', time: '04:12:50', date: 'Sep 12, 2024', severity: 'LOW', category: 'Data Access' },
  { id: 'AUD-7814', user: 'Arjun Mehta', role: 'Commander', action: 'LOGIN', resource: 'Platform – Session started', ip: '10.0.1.4', time: '04:00:00', date: 'Sep 12, 2024', severity: 'INFO', category: 'Auth' },
];

const severityColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#1d8cff', INFO: '#22c55e' };
const actionColor = { APPROVED: '#22c55e', GENERATED: '#8b5cf6', VOTED: '#1d8cff', EXPORTED: '#f59e0b', TRIGGERED: '#ef4444', ACCESSED: '#00e5ff', LOGIN: '#22c55e' };

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Decision', 'AI', 'Data Access', 'System', 'Auth'];
  const filtered = logs
    .filter(l => filter === 'All' || l.category === filter)
    .filter(l => !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader title="Audit Logs" subtitle="Immutable record of all platform actions, AI decisions, and user access events"
        badge={{ label: 'TAMPER-PROOF', color: '#22c55e' }}
        actions={
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Download size={13} />Export Logs
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: "Today's Events", value: logs.length, color: '#1d8cff' },
          { label: 'High Severity', value: logs.filter(l => l.severity === 'HIGH').length, color: '#ef4444' },
          { label: 'User Actions', value: logs.filter(l => l.role !== 'Auto' && l.role !== 'AI Engine').length, color: '#8b5cf6' },
          { label: 'AI Events', value: logs.filter(l => l.role === 'AI Engine' || l.role === 'Auto').length, color: '#22c55e' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, action, or resource..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 12px 8px 32px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Filter size={13} style={{ color: 'var(--text-dim)', marginTop: 6 }} />
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: filter === cat ? '#1d8cff20' : 'transparent',
              borderColor: filter === cat ? '#1d8cff' : 'var(--border-soft)',
              color: filter === cat ? '#1d8cff' : 'var(--text-dim)',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['Log ID', 'User', 'Action', 'Resource', 'Category', 'IP Address', 'Time', 'Severity'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontSize: 10, fontFamily: 'monospace', color: '#1d8cff' }}>{log.id}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {log.role === 'AI Engine' || log.role === 'Auto' ? <Shield size={11} color="#8b5cf6" /> : <User size={11} color="#8b5cf6" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{log.user}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{log.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${actionColor[log.action] || '#fff'}18`, color: actionColor[log.action] || 'var(--text-secondary)' }}>{log.action}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.resource}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>{log.category}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 10, fontFamily: 'monospace', color: 'var(--text-dim)' }}>{log.ip}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{log.time}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{log.date}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: severityColor[log.severity], padding: '2px 8px', borderRadius: 4, background: `${severityColor[log.severity]}15` }}>{log.severity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </DashboardLayout>
  );
}
