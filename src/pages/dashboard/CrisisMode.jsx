import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Phone, Radio, Shield, Activity, X, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';

const crisisAlerts = [
  { id: 'CA-001', title: 'Hormuz Strait – Naval Exercise Active', type: 'GEOPOLITICAL', severity: 'CRITICAL', impact: 'Supply disruption imminent', time: '09:12' },
  { id: 'CA-002', title: 'Jamnagar Refinery – Unit 3 Shutdown', type: 'OPERATIONAL', severity: 'HIGH', impact: '80 kBPD capacity loss', time: '08:45' },
  { id: 'CA-003', title: 'INR/USD at 84.5 – Import Cost Alert', type: 'FINANCIAL', severity: 'HIGH', impact: '+₹2,600 Cr/month', time: '07:30' },
];

const responseActions = [
  { id: 'ACT-001', title: 'Activate SPR Emergency Release (3.2 MT)', status: 'PENDING', priority: 'P1', owner: 'Cabinet' },
  { id: 'ACT-002', title: 'Reroute 4 VLCCs – Persian Gulf to Nigeria', status: 'IN PROGRESS', priority: 'P1', owner: 'IOC' },
  { id: 'ACT-003', title: 'Alert Coastal Refineries – Reduced Throughput', status: 'DONE', priority: 'P2', owner: 'HPCL/BPCL' },
  { id: 'ACT-004', title: 'Emergency NEMC Plenary Session', status: 'DONE', priority: 'P2', owner: 'NEMC' },
  { id: 'ACT-005', title: 'Negotiate Saudi Aramco Backup Clause', status: 'PENDING', priority: 'P1', owner: 'MoP' },
];

const contacts = [
  { name: 'MoP Secretary', avatar: 'PS', online: true },
  { name: 'IOC Chairman', avatar: 'RK', online: true },
  { name: 'PMO Office', avatar: 'PM', online: false },
  { name: 'HPCL Director', avatar: 'SN', online: true },
];

const statusColor = { PENDING: '#f59e0b', 'IN PROGRESS': '#1d8cff', DONE: '#22c55e' };

export default function CrisisMode() {
  const [tick, setTick] = useState(0);
  const [timer, setTimer] = useState({ h: 0, m: 47, s: 22 });
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        let { h, m, s } = prev;
        s++; if (s >= 60) { s = 0; m++; } if (m >= 60) { m = 0; h++; }
        return { h, m, s };
      });
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <DashboardLayout crisisMode>
      {/* Crisis Banner */}
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse-glow 1s infinite', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>⚠ CRISIS MODE ACTIVE — NATIONAL ENERGY EMERGENCY</div>
            <div style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', marginTop: 2 }}>All systems in emergency response protocol · Authorized: Commander Arjun Mehta</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}</div>
            <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.6)', letterSpacing: '0.08em' }}>CRISIS DURATION</div>
          </div>
          <button onClick={() => navigate('/command-center')} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
            Deactivate Crisis Mode
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 14, marginBottom: 14 }}>
        {/* KPIs */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { label: 'Risk Index', value: '82', unit: '/100', color: '#ef4444', blink: true },
            { label: 'Supply Cover', value: '26', unit: ' days', color: '#f59e0b' },
            { label: 'Crude Price', value: '$101', unit: '/bbl', color: '#ef4444' },
            { label: 'Active Alerts', value: '3', unit: ' critical', color: '#ef4444', blink: true },
            { label: 'Actions Pending', value: '3', unit: ' of 5', color: '#f59e0b' },
          ].map(kpi => (
            <GlassCard key={kpi.label} className="card" style={{ padding: '14px 18px', borderColor: `${kpi.color}30`, background: `${kpi.color}06` }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 700 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color, animation: kpi.blink && tick % 2 === 0 ? 'none' : undefined }}>
                {kpi.value}<span style={{ fontSize: 12, fontWeight: 400 }}>{kpi.unit}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Active Alerts */}
        <GlassCard className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />Active Crisis Alerts
          </div>
          {crisisAlerts.map(alert => (
            <div key={alert.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#ef4444' }}>{alert.id}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}><Clock size={9} style={{ marginRight: 3, verticalAlign: 'middle' }} />{alert.time}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{alert.title}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
                <span style={{ color: '#ef4444', padding: '1px 6px', background: 'rgba(239,68,68,0.1)', borderRadius: 4 }}>{alert.severity}</span>
                <span style={{ color: 'var(--text-dim)' }}>{alert.impact}</span>
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Response Actions */}
        <GlassCard className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="#f59e0b" />Emergency Response Actions
          </div>
          {responseActions.map(action => (
            <div key={action.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', flexShrink: 0, marginTop: 1 }}>{action.priority}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>{action.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-dim)' }}>
                  <span>{action.owner}</span>
                  <span style={{ fontWeight: 700, color: statusColor[action.status] }}>{action.status}</span>
                </div>
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Emergency Contacts */}
        <GlassCard className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={14} color="#1d8cff" />Emergency Contacts
          </div>
          {contacts.map(c => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{c.avatar}</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: c.online ? '#22c55e' : '#666', border: '1.5px solid var(--bg-panel)' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              </div>
              <button style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#1d8cff', fontSize: 10 }}>Call</button>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quick Actions</div>
            {[
              { label: 'Broadcast Alert to All Users', icon: Radio, color: '#ef4444' },
              { label: 'Open War Room Channel', icon: Shield, color: '#8b5cf6' },
              { label: 'Escalate to PMO', icon: Zap, color: '#f59e0b' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: `${action.color}10`, border: `1px solid ${action.color}30`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: action.color, fontSize: 11, fontWeight: 600, marginBottom: 6, textAlign: 'left' }}>
                  <Icon size={12} />{action.label}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
