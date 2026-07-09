import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Download, FileText, ArrowRight } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { supplierData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';

const radarData = [
  { subject: 'Cost', West_Africa: 78, Saudi: 88, Russia: 95, Brazil: 72, UAE: 84 },
  { subject: 'Risk', West_Africa: 95, Saudi: 55, Russia: 20, Brazil: 92, UAE: 60 },
  { subject: 'Compliance', West_Africa: 98, Saudi: 96, Russia: 30, Brazil: 98, UAE: 95 },
  { subject: 'Availability', West_Africa: 85, Saudi: 72, Russia: 45, Brazil: 88, UAE: 74 },
  { subject: 'Compatibility', West_Africa: 94, Saudi: 88, Russia: 71, Brazil: 89, UAE: 92 },
  { subject: 'ETA Score', West_Africa: 70, Saudi: 85, Russia: 55, Brazil: 65, UAE: 88 },
];

const cols = [
  { key: 'supplier', label: 'Supplier' },
  { key: 'route', label: 'Route' },
  { key: 'eta', label: 'ETA' },
  { key: 'landedCost', label: 'Landed Cost' },
  { key: 'riskScore', label: 'Risk', render: v => <span style={{ color: v < 35 ? '#22c55e' : v < 65 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{v}/100</span> },
  { key: 'compatibility', label: 'Compat.', render: v => <span style={{ color: '#22c55e', fontWeight: 700 }}>{v}%</span> },
  { key: 'sanctions', label: 'Sanctions', badge: true },
  { key: 'verdict', label: 'Verdict', render: v => <StatusBadge status={v} size="sm" /> },
];

export default function ProcurementOptimizer() {
  const { addToast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState(supplierData[0]);

  return (
    <DashboardLayout>
      <PageHeader title="Procurement Optimizer" subtitle="Multi-supplier comparison · Route analysis · AI-recommended sourcing strategy"
        actions={<>
          <button className="btn btn-ghost btn-sm" onClick={() => addToast('RFQ exported', 'success')}><Download size={13} /> Export RFQ</button>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('Procurement note generated', 'info')}><FileText size={13} /> Generate Note</button>
          <button className="btn btn-primary btn-sm" onClick={() => addToast('Procurement plan approved and sent to Cabinet', 'success')}><CheckCircle size={13} /> Approve Plan</button>
        </>}
      />

      {/* Best recommendation banner */}
      <GlassCard glow="green" style={{ marginBottom: 16, background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>AI Best Recommendation: West Africa (Nigeria)</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lowest risk (28/100) · Highest compliance · Compatible with 94% refineries · Cape of Good Hope route avoids Hormuz</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-success btn-sm" onClick={() => addToast('West Africa procurement approved!', 'success')}>Approve</button>
            <button className="btn btn-ghost btn-sm" onClick={() => addToast('Comparing alternatives...', 'info')}>Compare Alternatives</button>
          </div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>
        {/* Supplier table */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Supplier Comparison Matrix</h3>
          <DataTable columns={cols} data={supplierData} onRowClick={row => { setSelectedSupplier(row); addToast(`Selected: ${row.supplier}`, 'info'); }} />
        </GlassCard>

        {/* Radar */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Scoring Radar</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>West Africa vs Saudi Arabia</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(90,130,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="West Africa" dataKey="West_Africa" stroke="#22c55e" fill="rgba(34,197,94,0.15)" />
              <Radar name="Saudi Arabia" dataKey="Saudi" stroke="#f59e0b" fill="rgba(245,158,11,0.1)" />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 3, background: '#22c55e', borderRadius: 2 }} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>West Africa</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 3, background: '#f59e0b', borderRadius: 2 }} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Saudi Arabia</span></div>
          </div>
        </GlassCard>
      </div>

      {/* Selected supplier detail */}
      {selectedSupplier && (
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Selected: {selectedSupplier.supplier}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {[
              { label: 'Route', val: selectedSupplier.route },
              { label: 'ETA', val: selectedSupplier.eta },
              { label: 'Landed Cost', val: selectedSupplier.landedCost },
              { label: 'Risk Score', val: `${selectedSupplier.riskScore}/100` },
              { label: 'Compatibility', val: `${selectedSupplier.compatibility}%` },
              { label: 'Sanctions', val: selectedSupplier.sanctions },
              { label: 'Availability', val: selectedSupplier.availability },
              { label: 'Verdict', val: selectedSupplier.verdict },
            ].map(d => (
              <div key={d.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{d.val}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
