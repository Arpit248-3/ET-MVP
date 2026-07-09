import React, { useState } from 'react';
import { Brain, GitBranch, BarChart2, ChevronRight, Info, Eye, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const decisions = [
  { id: 'DEC-001', title: 'SPR Drawdown Recommendation', confidence: 87, model: 'RiskNet-v4', timestamp: '2 hours ago', verdict: 'ACTIVATE' },
  { id: 'DEC-002', title: 'Procurement Source Switch to West Africa', confidence: 92, model: 'SupplyOptimizer', timestamp: '5 hours ago', verdict: 'RECOMMENDED' },
  { id: 'DEC-003', title: 'Refinery Load Reduction Alert', confidence: 74, model: 'OperationsAI', timestamp: '1 day ago', verdict: 'CONSIDER' },
  { id: 'DEC-004', title: 'Currency Hedge Trigger', confidence: 68, model: 'FinanceAI', timestamp: '2 days ago', verdict: 'MONITOR' },
];

const featureImportance = [
  { feature: 'Tanker AIS Data', weight: 94, color: '#1d8cff' },
  { feature: 'Geopolitical Index', weight: 87, color: '#8b5cf6' },
  { feature: 'Crude Price Delta', weight: 82, color: '#f59e0b' },
  { feature: 'SPR Reserve Level', weight: 79, color: '#22c55e' },
  { feature: 'Refinery Throughput', weight: 71, color: '#00e5ff' },
  { feature: 'Currency (INR/USD)', weight: 65, color: '#ef4444' },
  { feature: 'Demand Forecast', weight: 58, color: '#a78bfa' },
];

const decisionTree = [
  { level: 0, label: 'Disruption Probability > 70%?', result: null, children: ['YES → High Risk', 'NO → Moderate Risk'] },
  { level: 1, label: 'SPR Cover < 30 days?', result: null, children: ['YES → Activate SPR', 'NO → Monitor'] },
  { level: 2, label: 'Alt. Supply Available?', result: 'ACTIVATE DRAWDOWN', children: [] },
];

export default function ExplainableAI() {
  const [selected, setSelected] = useState(decisions[0]);

  return (
    <DashboardLayout>
      <PageHeader title="Explainable AI" subtitle="Understand AI decision logic, model confidence, and feature attribution"
        badge={{ label: 'XAI ENABLED', color: '#8b5cf6' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Decision List */}
        <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Decisions</div>
          {decisions.map(dec => (
            <div key={dec.id} onClick={() => setSelected(dec)}
              style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: selected?.id === dec.id ? 'rgba(139,92,246,0.1)' : 'transparent', borderLeft: selected?.id === dec.id ? '3px solid #8b5cf6' : '3px solid transparent', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8b5cf6' }}>{dec.id}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: dec.confidence >= 85 ? '#22c55e' : dec.confidence >= 70 ? '#f59e0b' : '#ef4444' }}>{dec.confidence}%</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{dec.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{dec.model} · {dec.timestamp}</div>
            </div>
          ))}
        </GlassCard>

        {/* Explanation Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected && (
            <>
              {/* Decision Summary */}
              <GlassCard className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Brain size={16} color="#8b5cf6" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>AI DECISION EXPLANATION</span>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: selected.confidence >= 85 ? '#22c55e' : selected.confidence >= 70 ? '#f59e0b' : '#ef4444' }}>{selected.confidence}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Model Confidence</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.model}</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verdict</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{selected.verdict}</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.timestamp}</div>
                  </div>
                </div>
              </GlassCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Feature Importance */}
                <GlassCard className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart2 size={14} color="#1d8cff" />Feature Importance (SHAP)
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 10, left: 90, bottom: 0 }}>
                      <XAxis type="number" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <YAxis dataKey="feature" type="category" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} axisLine={false} tickLine={false} width={88} />
                      <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                        {featureImportance.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Decision Tree */}
                <GlassCard className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GitBranch size={14} color="#8b5cf6" />Decision Logic Tree
                  </div>
                  {decisionTree.map((node, i) => (
                    <div key={i} style={{ marginLeft: node.level * 20, marginBottom: 12 }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 12px', marginBottom: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: node.result ? 4 : 0 }}>
                          <Eye size={11} color="#8b5cf6" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                          {node.label}
                        </div>
                        {node.result && <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>→ {node.result}</div>}
                      </div>
                      {node.children.map((child, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16, marginBottom: 2 }}>
                          <ChevronRight size={11} color="var(--text-dim)" />
                          <span style={{ fontSize: 10, color: child.startsWith('YES') ? '#22c55e' : 'var(--text-dim)' }}>{child}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#22c55e' }}>
                      <Zap size={13} />FINAL DECISION: ACTIVATE DRAWDOWN
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Confidence breakdown */}
              <GlassCard className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Info size={14} color="#00e5ff" />Confidence Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Data Quality', value: 94, color: '#22c55e' },
                    { label: 'Model Accuracy', value: 91, color: '#1d8cff' },
                    { label: 'Historical Match', value: 83, color: '#8b5cf6' },
                    { label: 'Consensus Score', value: selected.confidence, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.value}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{item.label}</div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
