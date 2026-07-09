import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronRight, BookOpen, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const faqs = [
  { q: 'How does the AI Risk Score get calculated?', a: 'The risk score is computed by RiskNet-v4 using a weighted ensemble of 14 data feeds including AIS tanker routes, geopolitical indices, SCADA operational data, and historical price patterns. The model outputs a 0-100 score updated every 30 seconds.' },
  { q: 'What does the SPR Planner recommend vs authorize?', a: 'The AI Planner recommends drawdown levels based on supply-demand modeling, but all authorizations require human approval through the Executive Decision Board. The AI cannot independently release reserves.' },
  { q: 'How is Scenario Simulator different from Timeline Replay?', a: 'Scenario Simulator runs forward-looking what-if models (future scenarios), while Timeline Replay reconstructs historical crisis events with AI annotations for learning and training purposes.' },
  { q: 'What clearance level is needed for Crisis Mode?', a: 'Crisis Mode access requires SECRET clearance or above, and must be activated by the Commander or authorized MoP Secretary. All actions in Crisis Mode are recorded in the immutable audit log.' },
  { q: 'How often does data refresh across dashboards?', a: 'Live data feeds (AIS, Bloomberg, SCADA) refresh every 15-30 seconds. Government databases (IEA, PPAC) update every 4-12 hours. You can configure refresh intervals in Settings.' },
  { q: 'Can I export reports for offline review?', a: 'Yes. All reports in the Reports Library support PDF export. Audit logs can be exported as CSV. Data tables across all dashboards support Excel export.' },
];

const guides = [
  { title: 'Getting Started with UrjaNetra AI', desc: 'Platform overview and first-time setup guide', icon: BookOpen, color: '#1d8cff' },
  { title: 'Understanding the Risk Intelligence Engine', desc: 'How AI processes signals and generates alerts', icon: HelpCircle, color: '#8b5cf6' },
  { title: 'Crisis Response Playbook', desc: 'Step-by-step guide for energy crisis scenarios', icon: BookOpen, color: '#ef4444' },
  { title: 'Data Sources Integration Manual', desc: 'Connecting new feeds and managing API keys', icon: ExternalLink, color: '#22c55e' },
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const filtered = faqs.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader title="Help Center" subtitle="Documentation, FAQs, and support resources for UrjaNetra AI platform"
        badge={{ label: 'SUPPORT', color: '#1d8cff' }}
      />

      {/* Search */}
      <GlassCard className="card" style={{ padding: '24px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>How can we help you?</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>Search documentation, FAQs, and guides</div>
        <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for help..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '12px 14px 12px 40px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* FAQs */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Frequently Asked Questions</div>
          <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, paddingRight: 12 }}>{faq.q}</span>
                  {openFaq === i ? <ChevronDown size={15} color="var(--text-dim)" /> : <ChevronRight size={15} color="var(--text-dim)" />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ paddingTop: 12 }}>{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No results found for "{search}"</div>
            )}
          </GlassCard>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Guides */}
          <GlassCard className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Documentation</div>
            {guides.map(guide => {
              const Icon = guide.icon;
              return (
                <div key={guide.title} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{ background: `${guide.color}18`, borderRadius: 8, padding: 8, flexShrink: 0 }}><Icon size={14} color={guide.color} /></div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{guide.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{guide.desc}</div>
                  </div>
                </div>
              );
            })}
          </GlassCard>

          {/* Contact Support */}
          <GlassCard className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Contact Support</div>
            {[
              { icon: MessageSquare, label: 'Live Chat', desc: 'Available 24/7', color: '#22c55e', action: 'Chat Now' },
              { icon: Mail, label: 'Email Support', desc: 'support@nemc.gov.in', color: '#1d8cff', action: 'Send Email' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Icon size={14} color={item.color} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{item.desc}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>{item.action}</button>
                </div>
              );
            })}
          </GlassCard>

          {/* System Status */}
          <GlassCard className="card" style={{ padding: '16px 18px', background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>System Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#22c55e', fontWeight: 700 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite' }} />All Systems Operational
              </div>
            </div>
            {['AI Engine', 'Data Feeds', 'Risk Engine', 'Auth Service', 'Database'].map(svc => (
              <div key={svc} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                <span style={{ color: 'var(--text-dim)' }}>{svc}</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Online</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
