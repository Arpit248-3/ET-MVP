import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Download, User, Shield, Loader, WifiOff, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import useApi from '../../hooks/useApi.js';
import { fetchAuditLogs } from '../../services/api.js';
import { useScenario } from '../../context/ScenarioContext.jsx';

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
const actionColor = { APPROVED: '#22c55e', GENERATED: '#8b5cf6', VOTED: '#1d8cff', EXPORTED: '#f59e0b', TRIGGERED: '#ef4444', ACCESSED: '#00e5ff', LOGIN: '#22c55e', LOGGED: '#94a3b8' };

export default function AuditLogs() {
  const { backendOnline } = useScenario();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Decision', 'AI', 'Data Access', 'System', 'Auth'];

  // Live audit logs from backend
  const { data: liveLogsData, loading: logsLoading, error: logsError } = useApi(fetchAuditLogs, { fallback: null, args: [0, 50] });

  // Normalize live logs to match the display format
  const liveLogs = liveLogsData?.logs
    ? liveLogsData.logs.map(l => {
        let sev = 'INFO';
        if (l.type === 'CRITICAL' || l.type === 'HIGH') sev = 'HIGH';
        else if (l.type === 'WARNING' || l.type === 'MEDIUM') sev = 'MEDIUM';
        else if (l.type === 'LOW') sev = 'LOW';

        return {
          id: l.id || `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          user: l.user || 'System',
          role: l.module === 'AI' || l.user?.toLowerCase().includes('ai') ? 'AI Engine' : 'Operator',
          action: l.action || 'LOGGED',
          resource: l.details?.resource || l.module || 'Platform',
          ip: 'internal',
          time: l.time ? new Date(l.time).toLocaleTimeString() : '00:00:00',
          date: l.time ? new Date(l.time).toLocaleDateString() : 'Today',
          severity: sev,
          category: l.module || 'System',
        };
      })
    : null;

  const displayLogs = liveLogs || logs;
  const filtered = displayLogs
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

      {/* Offline/Error Notification Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Displaying local cache of administrative logs.
        </div>
      ) : logsLoading ? (
        <div style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', color: '#1d8cff', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Loading audit trails from DB ledger...
        </div>
      ) : logsError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Failed to fetch audit log trail: {logsError.message || 'Connection failed'}. Showing cached log entries.
        </div>
      ) : null}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Log Entries", value: displayLogs.length, color: '#1d8cff' },
          { label: 'High Severity', value: displayLogs.filter(l => l.severity === 'HIGH').length, color: '#ef4444' },
          { label: 'User Actions', value: displayLogs.filter(l => l.role !== 'Auto' && l.role !== 'AI Engine').length, color: '#8b5cf6' },
          { label: 'AI Events', value: displayLogs.filter(l => l.role === 'AI Engine' || l.role === 'Auto').length, color: '#22c55e' },
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No audit logs match criteria.</td>
              </tr>
            ) : (
              filtered.map((log, i) => (
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
                    <span style={{ fontSize: 10, fontWeight: 700, color: severityColor[log.severity] || '#fff', padding: '2px 8px', borderRadius: 4, background: `${severityColor[log.severity] || '#fff'}15` }}>{log.severity}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
