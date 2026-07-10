import React, { useState, useEffect } from 'react';
import { Database, TrendingDown, CheckCircle, ArrowRight, Bot, Loader, AlertTriangle, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import { sprData } from '../../data/mockData.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useScenario } from '../../context/ScenarioContext.jsx';
import useApi from '../../hooks/useApi.js';
import { planSPR } from '../../services/api.js';

const depletionData = [
  { day: 'D+0', level: 64 }, { day: 'D+7', level: 58 }, { day: 'D+14', level: 51 },
  { day: 'D+21', level: 43 }, { day: 'D+28', level: 35 }, { day: 'D+34', level: 28 },
  { day: 'D+40', level: 20 }, { day: 'D+45', level: 14 },
];

const withSPRData = [
  { day: 'D+0', without: 64, with: 64 }, { day: 'D+7', without: 58, with: 61 },
  { day: 'D+14', without: 51, with: 58 }, { day: 'D+21', without: 43, with: 55 },
  { day: 'D+28', without: 35, with: 51 }, { day: 'D+34', without: 28, with: 46 },
  { day: 'D+40', without: 20, with: 41 }, { day: 'D+45', without: 14, with: 38 },
];

export default function SPRPlanner() {
  const { addToast } = useToast();
  const { activeScenario, backendOnline } = useScenario();
  const [optimizing, setOptimizing] = useState(false);

  // Live SPR plan from backend
  const { data: sprPlan, loading: sprLoading, error: sprError, execute: runPlan } = useApi(planSPR, {
    manual: false,
    fallback: null,
    args: [{ daily_gap_mbbl: 2.4, days_until_cargo: 22, target_coverage_days: 30 }],
  });

  // Display toast on error
  useEffect(() => {
    if (sprError) {
      addToast('Error fetching SPR plan: using mock fallback data', 'error');
    }
  }, [sprError, addToast]);

  const handleOptimizeDrawdown = async () => {
    setOptimizing(true);
    try {
      await runPlan({
        daily_gap_mbbl: 2.4,
        days_until_cargo: 22,
        target_coverage_days: 30,
      });
      addToast('SPR drawdown plan optimized successfully', 'success');
    } catch (err) {
      addToast('Failed to optimize SPR drawdown: using cached plan', 'warning');
    } finally {
      setOptimizing(false);
    }
  };

  // Derived values — prefer live then mock
  const coverageDays = sprPlan?.coverage_days ?? sprData.coverageDays;
  const currentStock = sprPlan
    ? (sprPlan.reserve_after_action_mbbl + sprPlan.total_drawdown_required_mbbl).toFixed(1)
    : sprData.currentStock;
  const recommendedDrawdown = sprPlan?.total_drawdown_required_mbbl ?? sprData.recommendedDrawdown;
  const reserveAfterAction = sprPlan?.reserve_after_action_mbbl ?? sprData.reserveAfterAction;
  const cargoBuffer = sprPlan?.days_until_cargo_arrival
    ? `${sprPlan.days_until_cargo_arrival} days`
    : sprData.cargoBuffer;

  const sites = sprPlan?.sites
    ? sprPlan.sites.map(s => ({
        name: s.name,
        capacity: s.capacity_mbbl,
        current: s.current_stock_mbbl,
        drawdown: s.drawdown_allocated_mbbl,
        status: s.status || 'OPERATIONAL',
      }))
    : sprData.sites;

  const aiRec = sprPlan?.warning
    ? `SPR Warning: ${sprPlan.warning}. Recommend staged drawdown: Vizag (${sites[0]?.drawdown || 3.5} MMT), Mangaluru (${sites[1]?.drawdown || 3.0} MMT).`
    : 'Recommend staged drawdown of 8.5 MMT over 21 days: Phase 1 (Vizag, 3.5 MMT), Phase 2 (Mangaluru, 3.0 MMT), Phase 3 (Padur on maintenance resume, 2.0 MMT).';

  return (
    <DashboardLayout>
      <PageHeader title="SPR Planner" subtitle="Strategic Petroleum Reserve management · Drawdown optimization · Crisis buffer planning"
        actions={<>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast('SPR analysis exported', 'success')}><ArrowRight size={13} /> Send to Brief</button>
          <button className="btn btn-primary btn-sm" onClick={handleOptimizeDrawdown} disabled={optimizing || sprLoading}>
            {optimizing || sprLoading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            Optimize Drawdown
          </button>
        </>}
      />

      {/* Loading overlay bar */}
      {(sprLoading || optimizing) && (
        <div style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', color: '#1d8cff', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Calculating optimal Strategic Petroleum Reserve drawdown allocations...
        </div>
      )}

      {/* Offline/Error Notification Banner */}
      {!backendOnline ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <WifiOff size={14} />
          Backend Offline. Displaying local SPR baseline stocks and forecasts.
        </div>
      ) : sprError ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={14} />
          Planning failed: {sprError.message || 'Connection failed'}. Showing fallback reserves.
        </div>
      ) : null}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard label="Current SPR Coverage" value={String(coverageDays)} unit="days" color="blue" icon={Database} subtitle="At current consumption" />
        <MetricCard label="Current Stock" value={String(currentStock)} unit="MMT" color="cyan" icon={Database} />
        <MetricCard label="Predicted Depletion" value={sprData.predictedDepletion} color="amber" icon={TrendingDown} subtitle="Without drawdown" />
        <MetricCard label="Recommended Drawdown" value={String(recommendedDrawdown)} unit="MMT" color="green" icon={CheckCircle} subtitle="AI recommended" />
        <MetricCard label="Reserve After Action" value={String(reserveAfterAction)} unit="MMT" color="blue" subtitle="Post drawdown" />
        <MetricCard label="Cargo Buffer" value={cargoBuffer} color="purple" subtitle="Until next arrival" />
      </div>

      {/* Tank visualization */}
      <GlassCard style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>SPR Storage Sites — Visual Level Indicator</h3>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-end', padding: '20px 0' }}>
          {sites.map(site => {
            const pct = site.capacity > 0 ? (site.current / site.capacity) * 100 : 0;
            return (
              <div key={site.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* Tank */}
                <div style={{ position: 'relative', width: 80, height: 160, borderRadius: '4px 4px 12px 12px', border: '2px solid rgba(29,140,255,0.3)', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: `linear-gradient(to top, rgba(29,140,255,0.6), rgba(0,229,255,0.3))`, transition: 'height 1s ease', borderTop: '2px solid rgba(0,229,255,0.5)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(0,229,255,0.8)', animation: 'pulse-glow 2s infinite' }} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{Math.round(pct)}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>{site.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{site.current}/{site.capacity} MMT</div>
                  <StatusBadge status={site.status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Depletion chart */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>SPR Depletion Forecast</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>Without drawdown action (% remaining)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={depletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 80]} />
              <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.95)', border: '1px solid rgba(90,130,255,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="level" stroke="#ef4444" fill="rgba(239,68,68,0.15)" name="SPR Level %" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* With/Without comparison */}
        <GlassCard>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>SPR Action vs No-Action</h3>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>Drawdown impact on reserves</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={withSPRData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.08)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.95)', border: '1px solid rgba(90,130,255,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="without" stroke="#ef4444" fill="rgba(239,68,68,0.1)" name="No SPR Action" />
              <Area type="monotone" dataKey="with" stroke="#22c55e" fill="rgba(34,197,94,0.1)" name="With SPR Drawdown" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* AI Recommendation */}
      <GlassCard style={{ background: 'rgba(29,140,255,0.05)', borderColor: 'rgba(29,140,255,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Bot size={16} style={{ color: '#00e5ff' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff' }}>AI Drawdown Recommendation</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 14 }}>
          {aiRec}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-success btn-sm" onClick={() => addToast('SPR drawdown plan approved and execution initiated', 'success')}><CheckCircle size={13} /> Approve Drawdown</button>
          <button className="btn btn-secondary btn-sm" onClick={handleOptimizeDrawdown}>Compare Alternatives</button>
          <button className="btn btn-ghost btn-sm" onClick={() => addToast('SPR plan added to AI Action Brief', 'success')}><ArrowRight size={13} /> Send to Action Brief</button>
        </div>
      </GlassCard>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
