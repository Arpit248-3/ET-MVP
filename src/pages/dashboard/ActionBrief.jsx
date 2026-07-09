import React, { useState } from 'react';
import { FileText, Bot, Clock, AlertTriangle, CheckCircle, Download, RefreshCw, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const briefs = [
  {
    id: 'AB-2024-0912',
    title: 'Morning Intelligence Brief – Sept 12, 2024',
    time: '06:00 IST',
    priority: 'CRITICAL',
    summary: 'Strait of Hormuz naval exercises have elevated disruption probability to 74%. Gulf imports account for 62% of India\'s crude basket. Immediate diversification to West African sources recommended.',
    actions: [
      { priority: 'P1', action: 'Activate SPR drawdown authorization for 3.2 MT emergency release', owner: 'Cabinet', deadline: '24 hours', status: 'PENDING' },
      { priority: 'P1', action: 'Negotiate emergency crude offtake from Saudi Aramco (backup clause)', owner: 'MoP', deadline: '48 hours', status: 'IN PROGRESS' },
      { priority: 'P2', action: 'Redirect 4 VLCC tankers from Persian Gulf to Nigeria route', owner: 'IOC', deadline: '72 hours', status: 'PENDING' },
      { priority: 'P2', action: 'Alert all coastal refineries for reduced throughput scenario', owner: 'HPCL/BPCL', deadline: '12 hours', status: 'DONE' },
      { priority: 'P3', action: 'Convene emergency NEMC session with state energy secretaries', owner: 'NEMC', deadline: '6 hours', status: 'DONE' },
    ],
    insights: [
      'Crude oil price forecast: +$18-24/bbl over 14 days if disruption persists',
      'India can sustain 26 days at current consumption from strategic + commercial stocks',
      'Kochi and Paradip refineries can absorb alternative crude with <3% yield loss',
    ]
  },
  {
    id: 'AB-2024-0911',
    title: 'Evening Brief – Sept 11, 2024',
    time: 'Yesterday 18:00',
    priority: 'HIGH',
    summary: 'Currency depreciation risk elevated following Fed rate decision. INR at 84.3 per USD increases crude import cost by ₹2,400 Cr/month. Hedging strategy update required.',
    actions: [
      { priority: 'P1', action: 'Review currency hedging contracts with RBI', owner: 'Finance', deadline: '48 hours', status: 'IN PROGRESS' },
      { priority: 'P2', action: 'Accelerate rupee-trade negotiations with UAE, Russia', owner: 'MoP', deadline: '7 days', status: 'PENDING' },
    ],
    insights: [
      'Every 1% INR depreciation increases annual oil import bill by ₹6,200 Cr',
      'Russia trade at 30% discount partially offsets currency risk',
    ]
  },
];

const priorityColor = { P1: '#ef4444', P2: '#f59e0b', P3: '#1d8cff' };
const statusColor = { 'PENDING': '#f59e0b', 'IN PROGRESS': '#1d8cff', 'DONE': '#22c55e' };

export default function ActionBrief() {
  const [selected, setSelected] = useState(briefs[0]);
  const [generating, setGenerating] = useState(false);

  const generateBrief = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <DashboardLayout>
      <PageHeader title="AI Action Brief" subtitle="Auto-generated executive intelligence briefs with prioritized action items"
        badge={{ label: 'AI GENERATED', color: '#8b5cf6' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Download size={13} />Export PDF</button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} onClick={generateBrief} disabled={generating}>
              {generating ? <RefreshCw size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Bot size={13} />}
              {generating ? 'Generating...' : 'Generate New Brief'}
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 'calc(100vh - 180px)' }}>
        {/* Brief List */}
        <GlassCard className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent Briefs</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {briefs.map(brief => (
              <div key={brief.id} onClick={() => setSelected(brief)}
                style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.id === brief.id ? 'rgba(139,92,246,0.1)' : 'transparent', borderLeft: selected?.id === brief.id ? '3px solid #8b5cf6' : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8b5cf6' }}>{brief.id}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: brief.priority === 'CRITICAL' ? '#ef444420' : '#f59e0b20', color: brief.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{brief.priority}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{brief.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-dim)' }}>
                  <Clock size={10} />{brief.time}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Brief Detail */}
        {selected && (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header */}
            <GlassCard className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Bot size={16} color="#8b5cf6" />
                    <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>AI INTELLIGENCE BRIEF</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-dim)' }}>{selected.id}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                    <Clock size={11} />{selected.time}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: selected.priority === 'CRITICAL' ? '#ef444420' : '#f59e0b20', color: selected.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b', border: `1px solid ${selected.priority === 'CRITICAL' ? '#ef444440' : '#f59e0b40'}` }}>{selected.priority}</span>
              </div>
              <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {selected.summary}
              </div>
            </GlassCard>

            {/* Key Insights */}
            <GlassCard className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={14} color="#00e5ff" />AI Key Insights
              </div>
              {selected.insights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < selected.insights.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <ChevronRight size={14} color="#00e5ff" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insight}</span>
                </div>
              ))}
            </GlassCard>

            {/* Action Items */}
            <GlassCard className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={14} color="#22c55e" />Prioritized Action Items
              </div>
              {selected.actions.map((action, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < selected.actions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${priorityColor[action.priority]}18`, color: priorityColor[action.priority], flexShrink: 0 }}>{action.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>{action.action}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-dim)' }}>
                      <span>Owner: <span style={{ color: 'var(--text-secondary)' }}>{action.owner}</span></span>
                      <span>Deadline: <span style={{ color: 'var(--text-secondary)' }}>{action.deadline}</span></span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[action.status], padding: '2px 8px', borderRadius: 4, background: `${statusColor[action.status]}15`, flexShrink: 0 }}>{action.status}</span>
                </div>
              ))}
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
