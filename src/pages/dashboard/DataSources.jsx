import React, { useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, RefreshCw, Plus, Zap, Globe, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const sources = [
  { id: 'DS-001', name: 'Reuters Energy Feed', type: 'Market Data', provider: 'Reuters', status: 'LIVE', latency: '120ms', records: '14,220', lastSync: '30s ago', icon: Globe, color: '#1d8cff' },
  { id: 'DS-002', name: 'IEA Statistical Database', type: 'Government', provider: 'IEA', status: 'LIVE', latency: '2.1s', records: '8,490', lastSync: '5min ago', icon: Database, color: '#22c55e' },
  { id: 'DS-003', name: 'AIS Tanker Tracker', type: 'Ship Tracking', provider: 'MarineTraffic', status: 'LIVE', latency: '450ms', records: '2,184', lastSync: '1min ago', icon: Globe, color: '#00e5ff' },
  { id: 'DS-004', name: 'PPAC Daily Bulletin', type: 'Government', provider: 'PPAC/MoP', status: 'LIVE', latency: '3.2s', records: '540', lastSync: '4h ago', icon: Database, color: '#8b5cf6' },
  { id: 'DS-005', name: 'Bloomberg Commodity', type: 'Market Data', provider: 'Bloomberg', status: 'LIVE', latency: '85ms', records: '22,110', lastSync: '15s ago', icon: Zap, color: '#f59e0b' },
  { id: 'DS-006', name: 'SCADA Refinery Systems', type: 'Industrial IoT', provider: 'Internal', status: 'LIVE', latency: '200ms', records: '6,780', lastSync: '10s ago', icon: Layers, color: '#22c55e' },
  { id: 'DS-007', name: 'PESO Safety Reports', type: 'Regulatory', provider: 'PESO', status: 'DEGRADED', latency: '8.4s', records: '320', lastSync: '1h ago', icon: AlertTriangle, color: '#f59e0b' },
  { id: 'DS-008', name: 'Satellite Imagery Feed', type: 'Geospatial', provider: 'ISRO', status: 'OFFLINE', latency: '—', records: '0', lastSync: '3h ago', icon: Globe, color: '#ef4444' },
];

export default function DataSources() {
  const [syncing, setSyncing] = useState(null);

  const syncAll = () => {
    sources.forEach((s, i) => {
      setTimeout(() => setSyncing(s.id), i * 200);
      setTimeout(() => setSyncing(null), i * 200 + 1200);
    });
  };

  const live = sources.filter(s => s.status === 'LIVE').length;
  const totalRecords = sources.filter(s => s.status === 'LIVE').reduce((a, b) => a + parseInt(b.records.replace(',', '')), 0);

  return (
    <DashboardLayout>
      <PageHeader title="Data Sources" subtitle="Live integration status for all 14 external and internal data feeds"
        badge={{ label: `${live}/8 LIVE`, color: live >= 6 ? '#22c55e' : '#f59e0b' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} onClick={syncAll}><RefreshCw size={13} />Sync All</button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Plus size={13} />Add Source</button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Live Sources', value: `${live}/8`, color: '#22c55e' },
          { label: 'Total Records', value: `${(totalRecords / 1000).toFixed(1)}K`, color: '#1d8cff' },
          { label: 'Avg Latency', value: '890ms', color: '#f59e0b' },
          { label: 'Degraded', value: sources.filter(s => s.status === 'DEGRADED' || s.status === 'OFFLINE').length, color: '#ef4444' },
        ].map(stat => (
          <GlassCard key={stat.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Source Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {sources.map(source => {
          const Icon = source.icon;
          const isSyncing = syncing === source.id;
          return (
            <GlassCard key={source.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', borderColor: source.status === 'OFFLINE' ? 'rgba(239,68,68,0.2)' : source.status === 'DEGRADED' ? 'rgba(245,158,11,0.2)' : 'var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ background: `${source.color}18`, borderRadius: 10, padding: 10, flexShrink: 0 }}><Icon size={18} color={source.color} /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{source.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{source.id} · {source.provider}</div>
                  </div>
                </div>
                <StatusBadge status={source.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Type', value: source.type },
                  { label: 'Latency', value: source.latency },
                  { label: 'Records', value: source.records },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 10px' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Last sync: {source.lastSync}</span>
                <button onClick={() => { setSyncing(source.id); setTimeout(() => setSyncing(null), 1500); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                  <RefreshCw size={11} style={isSyncing ? { animation: 'spin 0.7s linear infinite' } : {}} />
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
