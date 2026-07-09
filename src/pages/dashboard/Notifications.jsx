import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Filter, Settings } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const notifications = [
  { id: 1, type: 'CRITICAL', title: 'Hormuz Disruption Risk Elevated to 74%', body: 'AI Risk Engine has flagged an elevated probability of Persian Gulf supply disruption based on naval exercise intelligence and tanker route anomalies.', time: '2 min ago', read: false, category: 'Risk' },
  { id: 2, type: 'HIGH', title: 'SPR Level Below 30-Day Threshold', body: 'Strategic Petroleum Reserves at Visakhapatnam have dropped to 28.4 days of cover. IEA mandate requires 90-day minimum.', time: '18 min ago', read: false, category: 'Operations' },
  { id: 3, type: 'HIGH', title: 'Currency Alert: INR/USD at 84.3', body: 'INR has depreciated past the ₹84 threshold. This increases monthly crude import costs by approximately ₹2,400 Cr.', time: '1 hour ago', read: false, category: 'Finance' },
  { id: 4, type: 'INFO', title: 'New Procurement Deal Approved: Nigeria', body: 'Emergency offtake agreement for 2 VLCC loads of Bonny Light crude approved by Executive Board (MOT-2024-030).', time: '3 hours ago', read: true, category: 'Procurement' },
  { id: 5, type: 'SUCCESS', title: 'Compliance Report Submitted – Q3 2024', body: 'IEA quarterly compliance report successfully filed. Overall compliance score: 89%. Next deadline: Q4 2024.', time: '5 hours ago', read: true, category: 'Compliance' },
  { id: 6, type: 'INFO', title: 'AI Copilot Session Summary Ready', body: '14 queries processed in today\'s session. 3 action items generated. Full session transcript available in Reports.', time: '6 hours ago', read: true, category: 'AI' },
  { id: 7, type: 'HIGH', title: 'Refinery Alert: Barauni Unit-2 Shutdown', body: 'Unplanned shutdown of Barauni refinery Unit-2 reduces processing capacity by 40 kBPD. Rerouting orders initiated.', time: '8 hours ago', read: true, category: 'Operations' },
  { id: 8, type: 'INFO', title: 'New Intelligence Brief Available', body: 'Morning intelligence brief AB-2024-0912 generated. 5 action items require immediate attention.', time: '12 hours ago', read: true, category: 'Intelligence' },
];

const typeConfig = {
  CRITICAL: { color: '#ef4444', icon: AlertTriangle, bg: '#ef444415' },
  HIGH: { color: '#f59e0b', icon: AlertTriangle, bg: '#f59e0b15' },
  INFO: { color: '#1d8cff', icon: Info, bg: '#1d8cff15' },
  SUCCESS: { color: '#22c55e', icon: CheckCircle, bg: '#22c55e15' },
};

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState(notifications);
  const categories = ['All', 'Risk', 'Operations', 'Finance', 'Procurement', 'Compliance', 'AI', 'Intelligence'];
  const unread = items.filter(n => !n.read).length;
  const filtered = filter === 'All' ? items : items.filter(n => n.category === filter);

  const markRead = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <DashboardLayout>
      <PageHeader title="Notifications" subtitle="System alerts, AI signals, and operational updates"
        badge={{ label: `${unread} UNREAD`, color: unread > 0 ? '#ef4444' : '#22c55e' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={markAllRead}>Mark All Read</button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Settings size={13} />Preferences</button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Unread', value: unread, color: '#ef4444' },
          { label: 'Critical', value: items.filter(n => n.type === 'CRITICAL').length, color: '#ef4444' },
          { label: 'High Priority', value: items.filter(n => n.type === 'HIGH').length, color: '#f59e0b' },
          { label: 'Total Today', value: items.length, color: '#1d8cff' },
        ].map(stat => (
          <GlassCard key={stat.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={13} style={{ color: 'var(--text-dim)' }} />
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid',
            background: filter === cat ? '#1d8cff20' : 'transparent',
            borderColor: filter === cat ? '#1d8cff' : 'var(--border-soft)',
            color: filter === cat ? '#1d8cff' : 'var(--text-dim)',
          }}>{cat}</button>
        ))}
      </div>

      {/* Notification List */}
      <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.map((notif, i) => {
          const cfg = typeConfig[notif.type];
          const Icon = cfg.icon;
          return (
            <div key={notif.id}
              style={{ padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: notif.read ? 'transparent' : 'rgba(29,140,255,0.03)', display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s' }}
              onClick={() => markRead(notif.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(29,140,255,0.03)'}>
              {!notif.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1d8cff', flexShrink: 0, marginTop: 6 }} />}
              {notif.read && <div style={{ width: 6, flexShrink: 0 }} />}
              <div style={{ width: 34, height: 34, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: cfg.bg, color: cfg.color, fontWeight: 700 }}>{notif.type}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '1px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>{notif.category}</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>{notif.time}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 4 }}>{notif.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{notif.body}</div>
              </div>
            </div>
          );
        })}
      </GlassCard>
    </DashboardLayout>
  );
}
