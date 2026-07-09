import React, { useState } from 'react';
import { Layers, Ship, Factory, Database, GitBranch, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import IndiaMapSVG from '../../components/ui/MapPanel.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const nodes = [
  { id: 'jamnagar', x: 135, y: 228, label: 'Jamnagar', type: 'refinery', status: 'OPERATIONAL', capacity: '1.24M bbl/day', risk: 22 },
  { id: 'paradip', x: 438, y: 268, label: 'Paradip Port', type: 'port', status: 'OPERATIONAL', capacity: '18M MT/year', risk: 18 },
  { id: 'vizag', x: 437, y: 318, label: 'Vizag SPR', type: 'spr', status: 'OPERATIONAL', capacity: '13.3 MMT', risk: 15 },
  { id: 'mangaluru', x: 285, y: 398, label: 'Mangaluru', type: 'spr', status: 'OPERATIONAL', capacity: '11.5 MMT', risk: 20 },
  { id: 'kochi', x: 268, y: 438, label: 'Kochi Refinery', type: 'refinery', status: 'OPERATIONAL', capacity: '0.31M bbl/day', risk: 25 },
  { id: 'mumbai', x: 208, y: 298, label: 'Mumbai Port', type: 'port', status: 'OPERATIONAL', capacity: '62M MT/year', risk: 30 },
  { id: 'chennai', x: 367, y: 418, label: 'Chennai', type: 'refinery', status: 'OPERATIONAL', capacity: '0.21M bbl/day', risk: 18 },
  { id: 'haldia', x: 476, y: 228, label: 'Haldia Port', type: 'port', status: 'OPERATIONAL', capacity: '45M MT/year', risk: 22 },
];

export default function SupplyChainTwin() {
  const { addToast } = useToast();
  const [activeNode, setActiveNode] = useState(null);
  const [activeLayers, setActiveLayers] = useState({ refineries: true, ports: true, spr: true, pipelines: true, ships: true });

  const toggleLayer = (layer) => setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  return (
    <DashboardLayout>
      <PageHeader title="Supply Chain Digital Twin" subtitle="Live India energy network · Interactive node visualization"
        badge={<StatusBadge status="LIVE" />}
        actions={<>
          <button className="btn btn-secondary btn-sm"><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => addToast('Network analysis started', 'info')}>Analyze Network</button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 14, height: 'calc(100vh - 200px)' }}>
        {/* Layers panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GlassCard style={{ padding: '16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Map Layers</h3>
            {[
              { key: 'refineries', label: 'Refineries', icon: Factory, color: '#1d8cff' },
              { key: 'ports', label: 'Ports', icon: Ship, color: '#00e5ff' },
              { key: 'spr', label: 'SPR Sites', icon: Database, color: '#8b5cf6' },
              { key: 'pipelines', label: 'Pipelines', icon: GitBranch, color: '#22c55e' },
              { key: 'ships', label: 'Live Ships', icon: Ship, color: '#f59e0b' },
            ].map(l => (
              <label key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: activeLayers[l.key] ? l.color : 'rgba(255,255,255,0.1)', transition: 'background 0.2s', position: 'relative' }} onClick={() => toggleLayer(l.key)}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: activeLayers[l.key] ? 19 : 3, transition: 'left 0.2s' }} />
                </div>
                <l.icon size={13} style={{ color: activeLayers[l.key] ? l.color : 'var(--text-dim)' }} />
                <span style={{ fontSize: 12, color: activeLayers[l.key] ? 'var(--text-main)' : 'var(--text-dim)' }}>{l.label}</span>
              </label>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: '14px' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Risk Legend</h3>
            {[{ color: '#22c55e', label: 'Low Risk (< 30)' }, { color: '#f59e0b', label: 'Medium (30-65)' }, { color: '#ef4444', label: 'High Risk (> 65)' }].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: '14px' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live Ships</h3>
            {[
              { name: 'MV Bharat Star', status: 'IN TRANSIT', route: 'Nigeria → Paradip' },
              { name: 'MT Indian Pride', status: 'AT PORT', route: 'Vizag' },
              { name: 'VLCC Kaveri', status: 'IN TRANSIT', route: 'Basrah → Kochi' },
            ].map(s => (
              <div key={s.name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                  <span style={{ fontSize: 10, color: s.status === 'AT PORT' ? '#22c55e' : '#1d8cff' }}>{s.status}</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{s.route}</p>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Map */}
        <GlassCard style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-icon" style={{ background: 'rgba(8,18,35,0.9)' }}><ZoomIn size={16} /></button>
            <button className="btn btn-ghost btn-icon" style={{ background: 'rgba(8,18,35,0.9)' }}><ZoomOut size={16} /></button>
          </div>
          <IndiaMapSVG nodes={activeLayers.refineries || activeLayers.ports ? nodes : []} style={{ height: '100%' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', background: 'rgba(8,18,35,0.8)', padding: '4px 10px', borderRadius: 6 }}>Click nodes for details</span>
            <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(8,18,35,0.8)', padding: '4px 10px', borderRadius: 6 }}>⬤ 14 nodes live</span>
          </div>
        </GlassCard>

        {/* Details panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <GlassCard>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Network Nodes</h3>
            {nodes.map(node => (
              <div key={node.id} onClick={() => { setActiveNode(node); addToast(`Viewing: ${node.label}`, 'info'); }}
                style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: node.type === 'refinery' ? '#1d8cff' : node.type === 'port' ? '#00e5ff' : '#8b5cf6', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{node.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{node.capacity}</div>
                </div>
                <StatusBadge status={node.status} size="sm" />
              </div>
            ))}
          </GlassCard>

          {activeNode && (
            <GlassCard style={{ background: 'rgba(29,140,255,0.05)', borderColor: 'rgba(29,140,255,0.3)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1d8cff' }}>{activeNode.label}</h3>
              {[
                { label: 'Type', value: activeNode.type.toUpperCase() },
                { label: 'Status', value: activeNode.status },
                { label: 'Capacity', value: activeNode.capacity },
                { label: 'Risk Score', value: `${activeNode.risk}/100` },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{d.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{d.value}</span>
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
