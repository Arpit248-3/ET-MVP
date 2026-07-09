import React, { useState } from 'react';
import { Factory, CheckCircle, AlertTriangle, X, Bot, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import RiskGauge from '../../components/ui/RiskGauge.jsx';
import { refineryData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';

const crudeOptions = ['Bonny Light (Nigeria)', 'Arab Light (Saudi)', 'Basrah Light (Iraq)', 'Urals (Russia)', 'Marlim (Brazil)', 'Murban (UAE)'];

export default function RefineryCompatibility() {
  const { addToast } = useToast();
  const [selectedCrude, setSelectedCrude] = useState('Bonny Light (Nigeria)');
  const [selectedRefinery, setSelectedRefinery] = useState(refineryData[0]);

  const getStatusColor = (s) => s === 'COMPATIBLE' ? '#22c55e' : s === 'PARTIAL' ? '#f59e0b' : '#ef4444';

  return (
    <DashboardLayout>
      <PageHeader title="Refinery Compatibility" subtitle="Crude oil compatibility matrix · Refinery fit analysis · Blend advisory"
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('Sent to procurement optimizer', 'success')}><ArrowRight size={13} /> Send to Procurement</button>
          <button className="btn btn-primary btn-sm" onClick={() => addToast('Compatibility match approved', 'success')}><CheckCircle size={13} /> Approve Match</button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 14, marginBottom: 16 }}>
        {/* Crude selector */}
        <GlassCard>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Select Crude</h3>
          {crudeOptions.map(c => (
            <div key={c} onClick={() => setSelectedCrude(c)}
              style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 8, cursor: 'pointer', border: `1px solid ${selectedCrude === c ? 'rgba(29,140,255,0.4)' : 'var(--border-soft)'}`, background: selectedCrude === c ? 'rgba(29,140,255,0.1)' : 'rgba(255,255,255,0.02)', fontSize: 13, color: selectedCrude === c ? '#1d8cff' : 'var(--text-main)', fontWeight: selectedCrude === c ? 600 : 400, transition: 'all 0.2s' }}>
              {c}
            </div>
          ))}
        </GlassCard>

        {/* Compatibility matrix */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>India Refinery Compatibility Map</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>Crude: <span style={{ color: '#1d8cff' }}>{selectedCrude}</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {refineryData.map(refinery => (
              <div key={refinery.name} onClick={() => { setSelectedRefinery(refinery); addToast(`Selected: ${refinery.name}`, 'info'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: `1px solid rgba(${refinery.status === 'COMPATIBLE' ? '34,197,94' : refinery.status === 'PARTIAL' ? '245,158,11' : '239,68,68'},0.3)`, background: `rgba(${refinery.status === 'COMPATIBLE' ? '34,197,94' : refinery.status === 'PARTIAL' ? '245,158,11' : '239,68,68'},0.05)`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${refinery.status === 'COMPATIBLE' ? '34,197,94' : refinery.status === 'PARTIAL' ? '245,158,11' : '239,68,68'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Factory size={18} style={{ color: getStatusColor(refinery.status) }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{refinery.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{refinery.location} · {refinery.capacity}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: getStatusColor(refinery.status) }}>{refinery.compatibility}%</div>
                  <StatusBadge status={refinery.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Selected refinery detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GlassCard>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Compatibility Score</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <RiskGauge value={selectedRefinery.compatibility} size={130} label="Compatibility" />
            </div>
            <StatusBadge status={selectedRefinery.status} />
          </GlassCard>

          <GlassCard style={{ background: 'rgba(29,140,255,0.05)', borderColor: 'rgba(29,140,255,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Bot size={15} style={{ color: '#00e5ff' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00e5ff' }}>AI Blend Advisory</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 12 }}>
              {selectedCrude.includes('Bonny') ? 'Bonny Light is optimal for Jamnagar and Paradip. For Kochi, blend 70% Bonny Light + 30% Arab Light for best yield.' : 'Selected crude requires API gravity adjustment. Consider 15% blend with compatible crude for optimal refinery output.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => addToast('Blend advisory applied', 'success')}>Apply Advisory</button>
              <button className="btn btn-ghost btn-sm" onClick={() => addToast('Alternative blend calculated', 'info')}>Alternatives</button>
            </div>
          </GlassCard>

          {/* Legend */}
          <GlassCard style={{ padding: '14px' }}>
            {[{ color: '#22c55e', label: 'Compatible (80–100%)' }, { color: '#f59e0b', label: 'Partial Fit (50–79%)' }, { color: '#ef4444', label: 'Incompatible (< 50%)' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
