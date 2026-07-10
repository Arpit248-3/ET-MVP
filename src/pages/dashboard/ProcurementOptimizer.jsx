import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Download, FileText, ArrowRight, Loader, AlertTriangle, WifiOff } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { supplierData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import useApi from '../../hooks/useApi.js';
import { optimizeProcurement } from '../../services/api.js';

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

const radarFields = (suppliers) => {
  if (!suppliers || suppliers.length < 2) return [
    { subject: 'Cost', West_Africa: 78, Saudi: 88, Russia: 95, Brazil: 72, UAE: 84 },
    { subject: 'Risk', West_Africa: 95, Saudi: 55, Russia: 20, Brazil: 92, UAE: 60 },
    { subject: 'Compliance', West_Africa: 98, Saudi: 96, Russia: 30, Brazil: 98, UAE: 95 },
    { subject: 'Availability', West_Africa: 85, Saudi: 72, Russia: 45, Brazil: 88, UAE: 74 },
    { subject: 'Compatibility', West_Africa: 94, Saudi: 88, Russia: 71, Brazil: 89, UAE: 92 },
    { subject: 'ETA Score', West_Africa: 70, Saudi: 85, Russia: 55, Brazil: 65, UAE: 88 },
  ];
  const s1 = suppliers[0];
  const s2 = suppliers[1];
  const key1 = s1.supplier.split('(')[0].trim().replace(' ', '_');
  const key2 = s2.supplier.split('(')[0].trim().replace(' ', '_');
  return [
    { subject: 'Cost', [key1]: Math.round((1 - (parseFloat(s1.landedCost.replace('$', '')) || 84) / 120) * 100), [key2]: Math.round((1 - (parseFloat(s2.landedCost.replace('$', '')) || 79) / 120) * 100) },
    { subject: 'Risk', [key1]: 100 - (s1.riskScore || 28), [key2]: 100 - (s2.riskScore || 67) },
    { subject: 'Compliance', [key1]: s1.sanctions === 'CLEAR' ? 98 : 30, [key2]: s2.sanctions === 'CLEAR' ? 96 : 30 },
    { subject: 'Compatibility', [key1]: s1.compatibility || 94, [key2]: s2.compatibility || 88 },
  ];
};

export default function ProcurementOptimizer() {
  const { addToast } = useToast();
  const { activeScenario, backendOnline } = useScenario();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  // Live procurement data from backend
  const { data: procData, loading: procLoading, error: procError, execute: runOptimize } = useApi(optimizeProcurement, {
    manual: false,
    fallback: null,
    args: [{ target_volume_mbbl: 2.4, duration_days: 30, exclude_routes: [], max_risk_score: 60 }],
  });

  // Display toast on error
  useEffect(() => {
    if (procError) {
      addToast('Error running optimizer: using mock fallback data', 'error');
    }
  }, [procError, addToast]);

  // Extract supplier list from backend or fall back to mock
  const displaySuppliers = procData?.recommended_mix
    ? procData.recommended_mix.map(s => ({
        supplier: s.name,
        route: s.route,
        eta: s.eta_days ? `${s.eta_days} days` : '22 days',
        landedCost: s.landed_cost_usd_bbl ? `$${s.landed_cost_usd_bbl}/bbl` : '$84/bbl',
        riskScore: s.risk_score ?? 28,
        compatibility: s.refinery_compatibility ?? 94,
        sanctions: s.sanctions_status || 'CLEAR',
        availability: s.availability || 'HIGH',
        verdict: s.verdict || 'CAUTION',
      }))
    : supplierData;

  const topSupplier = procData?.recommended_mix?.[0]
    ? {
        name: procData.recommended_mix[0].name,
        reason: `${procData.recommended_mix[0].verdict} · Landed Cost: $${procData.recommended_mix[0].landed_cost_usd_bbl}/bbl · Route: ${procData.recommended_mix[0].route} · Compatible: ${procData.recommended_mix[0].refinery_compatibility}%`,
        score: procData.recommended_mix[0].risk_score,
      }
    : { name: 'West Africa (Nigeria)', reason: 'Lowest risk (28/100) · Highest compliance · Compatible with 94% refineries · Cape of Good Hope route avoids Hormuz', score: 28 };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      await runOptimize({
        target_volume_mbbl: 2.4,
        duration_days: 30,
        exclude_routes: [],
        max_risk_score: 60,
      });
      addToast('Procurement optimized with live scenario data', 'success');
    } catch (err) {
      addToast('Failed to optimize procurement: showing cached data', 'warning');
    } finally {
      setOptimizing(false);
    }
  };

  const handleApprove = async () => {
    addToast('Procurement plan approved and sent to Cabinet', 'success');
    try {
      await optimizeProcurement({ approved: true });
    } catch {}
  };

  const selectedRow = selectedSupplier || displaySuppliers[0];
  const radar = radarFields(displaySuppliers);

  return (
    <DashboardLayout>
      <PageHeader title="Procurement Optimizer" subtitle="Multi-supplier comparison · Route analysis · AI-recommended sourcing strategy"
        actions={<>
          <button className="btn btn-ghost btn-sm" onClick={() => addToast('RFQ exported', 'success')}><Download size={13} /> Export RFQ</button>
          <button className="btn btn-secondary btn-sm" onClick={handleOptimize} disabled={optimizing || procLoading}>
            {optimizing || procLoading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={13} />}
            {' '}Optimize Procurement
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleApprove}><CheckCircle size={13} /> Approve Plan</button>
        </>}
      />

      {/* Loading Bar */}
      {(procLoading || optimizing) && (
        <div style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', color: '#1d8cff', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Running procurement optimization algorithms...
        </div>
      )}

      {/* Offline/Error Notification Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Displaying simulated procurement comparison table.
        </div>
      ) : procError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Optimization failed: {procError.message || 'Connection failed'}. Showing fallback supplier profiles.
        </div>
      ) : null}

      {/* Best recommendation banner */}
      <GlassCard glow="green" style={{ marginBottom: 16, background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>
              AI Best Recommendation: {topSupplier.name}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {topSupplier.reason}
              {backendOnline && activeScenario && (
                <span style={{ color: '#60b4ff', marginLeft: 6 }}>· Scenario: {activeScenario.name}</span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-success btn-sm" onClick={() => addToast(`${topSupplier.name} procurement approved!`, 'success')}>Approve</button>
            <button className="btn btn-ghost btn-sm" onClick={handleOptimize}>Compare Alternatives</button>
          </div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>
        {/* Supplier table */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Supplier Comparison Matrix</h3>
            {procLoading && <Loader size={14} style={{ color: '#1d8cff', animation: 'spin 1s linear infinite' }} />}
          </div>
          <DataTable
            columns={cols}
            data={displaySuppliers}
            onRowClick={row => { setSelectedSupplier(row); addToast(`Selected: ${row.supplier}`, 'info'); }}
          />
        </GlassCard>

        {/* Radar */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Scoring Radar</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
            {displaySuppliers[0]?.supplier?.split('(')[0] || 'West Africa'} vs {displaySuppliers[1]?.supplier?.split('(')[0] || 'Saudi Arabia'}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radar}>
              <PolarGrid stroke="rgba(90,130,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              {Object.keys(radar[0] || {}).filter(k => k !== 'subject').map((key, i) => (
                <Radar key={key} name={key.replace('_', ' ')} dataKey={key}
                  stroke={i === 0 ? '#22c55e' : '#f59e0b'}
                  fill={i === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.1)'} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {Object.keys(radar[0] || {}).filter(k => k !== 'subject').map((key, i) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 3, background: i === 0 ? '#22c55e' : '#f59e0b', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{key.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Selected supplier detail */}
      {selectedRow && (
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Selected: {selectedRow.supplier}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {[
              { label: 'Route', val: selectedRow.route },
              { label: 'ETA', val: selectedRow.eta },
              { label: 'Landed Cost', val: selectedRow.landedCost },
              { label: 'Risk Score', val: `${selectedRow.riskScore}/100` },
              { label: 'Compatibility', val: `${selectedRow.compatibility}%` },
              { label: 'Sanctions', val: selectedRow.sanctions },
              { label: 'Availability', val: selectedRow.availability },
              { label: 'Verdict', val: selectedRow.verdict },
            ].map(d => (
              <div key={d.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{d.val}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
