import React, { useState } from 'react';
import { Command, CheckCircle, X, Clock, Users, FileText, AlertTriangle, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const motions = [
  {
    id: 'MOT-2024-031',
    title: 'Authorize 3.2 MT SPR Release for Hormuz Disruption Response',
    proposedBy: 'NEMC AI Engine',
    status: 'VOTING',
    urgency: 'CRITICAL',
    votes: { for: 4, against: 1, abstain: 1 },
    quorum: 6,
    deadline: '4 hours',
    summary: 'Activate emergency drawdown of 3.2 MT from Visakhapatnam and Mangalore SPR facilities to stabilize domestic crude supply amid elevated Persian Gulf disruption risk (74% probability).',
    aiRecommendation: 'APPROVE',
    aiConfidence: 91,
    members: [
      { name: 'Arjun Mehta', role: 'Commander, NEMC', vote: 'FOR', avatar: 'AM' },
      { name: 'Priya Sharma', role: 'MoP Secretary', vote: 'FOR', avatar: 'PS' },
      { name: 'Rajiv Kumar', role: 'IOC Chairman', vote: 'FOR', avatar: 'RK' },
      { name: 'Anita Bose', role: 'Finance Ministry', vote: 'AGAINST', avatar: 'AB' },
      { name: 'Suresh Nair', role: 'HPCL Director', vote: 'FOR', avatar: 'SN' },
      { name: 'Vikram Singh', role: 'MEA Representative', vote: 'ABSTAIN', avatar: 'VS' },
    ]
  },
  {
    id: 'MOT-2024-030',
    title: 'Approve West Africa Emergency Offtake Agreement (2 VLCC)',
    proposedBy: 'Procurement AI',
    status: 'APPROVED',
    urgency: 'HIGH',
    votes: { for: 5, against: 0, abstain: 1 },
    quorum: 6,
    deadline: 'Passed',
    summary: 'Emergency procurement of 2 VLCC loads of Nigerian Bonny Light crude at spot market to diversify away from Persian Gulf exposure.',
    aiRecommendation: 'APPROVE',
    aiConfidence: 88,
    members: []
  },
];

const voteColor = { FOR: '#22c55e', AGAINST: '#ef4444', ABSTAIN: '#f59e0b', PENDING: 'var(--text-dim)' };

export default function ExecutiveDecisionBoard() {
  const [selected, setSelected] = useState(motions[0]);

  return (
    <DashboardLayout>
      <PageHeader title="Executive Decision Board" subtitle="High-stakes motions, AI-assisted voting, and quorum management"
        badge={{ label: 'LIVE SESSION', color: '#ef4444' }}
        actions={
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <FileText size={13} />Raise New Motion
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Motion List */}
        <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active Motions</div>
          {motions.map(motion => (
            <div key={motion.id} onClick={() => setSelected(motion)}
              style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: selected?.id === motion.id ? 'rgba(29,140,255,0.08)' : 'transparent', borderLeft: selected?.id === motion.id ? '3px solid #1d8cff' : '3px solid transparent', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#1d8cff' }}>{motion.id}</span>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700, background: motion.status === 'VOTING' ? '#f59e0b20' : '#22c55e20', color: motion.status === 'VOTING' ? '#f59e0b' : '#22c55e' }}>{motion.status}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{motion.title}</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--text-dim)' }}>
                <span style={{ color: '#22c55e' }}>✓ {motion.votes.for}</span>
                <span style={{ color: '#ef4444' }}>✗ {motion.votes.against}</span>
                <span style={{ color: '#f59e0b' }}>— {motion.votes.abstain}</span>
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Motion Detail */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <GlassCard className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Command size={15} color="#1d8cff" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1d8cff' }}>EXECUTIVE MOTION</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-dim)' }}>{selected.id}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', maxWidth: 560, lineHeight: 1.4 }}>{selected.title}</div>
                </div>
                <div style={{ display: 'flex', flex: 'none', gap: 8 }}>
                  {selected.status === 'VOTING' && (
                    <>
                      <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><ThumbsUp size={13} />Vote FOR</button>
                      <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><ThumbsDown size={13} />Vote AGAINST</button>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: 'rgba(29,140,255,0.06)', border: '1px solid rgba(29,140,255,0.15)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {selected.summary}
              </div>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Vote Tally */}
              <GlassCard className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Vote Tally</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'For', value: selected.votes.for, color: '#22c55e' },
                    { label: 'Against', value: selected.votes.against, color: '#ef4444' },
                    { label: 'Abstain', value: selected.votes.abstain, color: '#f59e0b' },
                  ].map(v => (
                    <div key={v.label} style={{ textAlign: 'center', background: `${v.color}10`, borderRadius: 8, padding: '10px 0', border: `1px solid ${v.color}25` }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: v.color }}>{v.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{v.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <div style={{ flex: selected.votes.for, height: 6, background: '#22c55e', borderRadius: '4px 0 0 4px' }} />
                  <div style={{ flex: selected.votes.against, height: 6, background: '#ef4444' }} />
                  <div style={{ flex: selected.votes.abstain, height: 6, background: '#f59e0b', borderRadius: '0 4px 4px 0' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>Quorum: {selected.quorum} members</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />Deadline: {selected.deadline}</span>
                </div>
              </GlassCard>

              {/* AI Recommendation */}
              <GlassCard className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Command size={14} color="#8b5cf6" />AI Recommendation
                </div>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>{selected.aiRecommendation}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>AI Confidence: {selected.aiConfidence}%</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                    <div style={{ width: `${selected.aiConfidence}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #1d8cff)', borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Based on risk models and historical precedents, immediate authorization reduces expected import cost exposure by ₹4,200 Cr over 30 days.
                </div>
              </GlassCard>
            </div>

            {/* Member Votes */}
            {selected.members.length > 0 && (
              <GlassCard className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={14} color="#1d8cff" />Board Member Votes
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {selected.members.map(member => (
                    <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${voteColor[member.vote]}20` }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${voteColor[member.vote]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: voteColor[member.vote], flexShrink: 0 }}>{member.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{member.role}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: voteColor[member.vote] }}>{member.vote}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
