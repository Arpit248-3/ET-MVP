import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, ArrowLeft, AlertTriangle, Sparkles, Navigation, Monitor, Radio, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const STEPS = [
  { time: '09:00', label: 'Normal Operations', status: 'ACTIVE', risk: 24, route: '/command-center', ai: 'Monitoring baseline energy routes across India refinery network.', confidence: 96, module: 'Command Center', next: 'Continue monitoring Hormuz shipping lanes' },
  { time: '09:15', label: 'Hormuz Risk Signal Detected', status: 'MONITOR', risk: 41, route: '/risk-intelligence', ai: 'Geopolitical feeds detect abnormal escalation near Strait of Hormuz.', confidence: 81, module: 'Risk Intelligence', next: 'Correlate maritime and insurance data' },
  { time: '09:30', label: 'Risk Score Rises', status: 'ELEVATED', risk: 62, route: '/risk-intelligence', ai: 'Risk Intelligence correlates maritime delays and insurance spikes.', confidence: 78, module: 'Risk Intelligence', next: 'Estimate economic exposure' },
  { time: '10:00', label: 'Crude Price Shock Begins', status: 'HIGH', risk: 74, route: '/economic-impact', ai: 'Economic Impact Engine estimates fuel-price and fiscal exposure at Rs 2.4L Cr.', confidence: 74, module: 'Economic Impact', next: 'Run disruption scenario' },
  { time: '10:15', label: '30-Day Disruption Scenario', status: 'CRITICAL', risk: 83, route: '/scenario-simulator', ai: 'Scenario Simulator models Hormuz closure - 2.4M bbl/day supply gap for India.', confidence: 71, module: 'Scenario Simulator', next: 'Select alternate procurement route' },
  { time: '10:30', label: 'West Africa Procurement Selected', status: 'ACTIVE', risk: 79, route: '/procurement-optimizer', ai: 'Procurement Optimizer selects West Africa route due to lower sanctions exposure.', confidence: 83, module: 'Procurement Optimizer', next: 'Generate SPR bridge plan' },
  { time: '10:45', label: 'SPR Bridge Plan Generated', status: 'ACTIVE', risk: 72, route: '/spr-planner', ai: 'SPR Planner recommends calibrated 5M bbl strategic petroleum reserve drawdown.', confidence: 87, module: 'SPR Planner', next: 'Clear compliance and legal checks' },
  { time: '11:00', label: 'Compliance Clears Route', status: 'COMPLIANT', risk: 66, route: '/compliance-shield', ai: 'Compliance Shield clears legal, sanctions, and policy checks for West Africa.', confidence: 92, module: 'Compliance Shield', next: 'Red Team challenge' },
  { time: '11:15', label: 'Red Team Validation Complete', status: 'VALID', risk: 61, route: '/red-team-validator', ai: 'Red Team Validator challenges assumptions and confirms revised response plan.', confidence: 87, module: 'Red Team Validator', next: 'Generate minister brief' },
  { time: '11:30', label: 'Minister Brief Generated', status: 'APPROVED', risk: 55, route: '/action-brief', ai: 'AI Action Brief generates official PMO-style response brief with 4 actions.', confidence: 91, module: 'AI Action Brief', next: 'Executive approval' },
  { time: '11:45', label: 'Executive Approval', status: 'APPROVED', risk: 48, route: '/executive-decision-board', ai: 'Executive Decision Board approves procurement reroute and SPR plan.', confidence: 95, module: 'Executive Board', next: 'Monitor implementation' },
];

const riskChartData = STEPS.map(s => ({ time: s.time, risk: s.risk }));

const actionFeed = [
  { time: '09:15', module: 'Risk Intelligence', action: 'Hormuz threat signal confirmed via 14 data feeds', status: 'ACTIVE' },
  { time: '09:30', module: 'Risk Intelligence', action: 'Maritime delay and insurance premium correlation complete', status: 'ACTIVE' },
  { time: '10:00', module: 'Economic Impact', action: 'Fiscal exposure estimated: Rs 2.4L Cr over 30 days', status: 'ACTIVE' },
  { time: '10:15', module: 'Scenario Simulator', action: '30-day Hormuz disruption simulation completed', status: 'ACTIVE' },
  { time: '10:30', module: 'Procurement', action: 'West Africa route selected - 3 alternatives evaluated', status: 'ACTIVE' },
  { time: '10:45', module: 'SPR Planner', action: 'Strategic reserve drawdown plan: 5M bbl bridge', status: 'ACTIVE' },
  { time: '11:00', module: 'Compliance Shield', action: 'Route cleared - 8 compliance checks passed', status: 'COMPLIANT' },
  { time: '11:15', module: 'Red Team', action: 'Assumptions challenged - plan revised and confirmed', status: 'VALID' },
  { time: '11:30', module: 'AI Action Brief', action: 'PMO-ready brief generated with 4 action points', status: 'APPROVED' },
  { time: '11:45', module: 'Executive Board', action: 'Crisis resolution approved by Executive Board', status: 'APPROVED' },
];

const jumpLinks = [
  { label: 'Risk Intelligence', route: '/risk-intelligence', color: '#ef4444' },
  { label: 'Scenario Simulator', route: '/scenario-simulator', color: '#f59e0b' },
  { label: 'Economic Impact', route: '/economic-impact', color: '#f97316' },
  { label: 'Procurement', route: '/procurement-optimizer', color: '#8b5cf6' },
  { label: 'SPR Planner', route: '/spr-planner', color: '#1d8cff' },
  { label: 'Compliance Shield', route: '/compliance-shield', color: '#22c55e' },
  { label: 'Red Team', route: '/red-team-validator', color: '#f87171' },
  { label: 'AI Action Brief', route: '/action-brief', color: '#00e5ff' },
  { label: 'Executive Board', route: '/executive-decision-board', color: '#8b5cf6' },
  { label: 'Timeline Replay', route: '/timeline-replay', color: '#60b4ff' },
];

function getRiskColor(risk) {
  if (risk >= 80) return '#ef4444';
  if (risk >= 60) return '#f97316';
  if (risk >= 40) return '#f59e0b';
  return '#22c55e';
}

export default function DemoMode() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // States
  const [tourType, setTourType] = useState('sandbox'); // 'live' or 'sandbox'
  const [stepIdx, setStepIdx] = useState(0);
  const [localPlaying, setLocalPlaying] = useState(false);
  const localIntervalRef = useRef(null);

  // Sync initial state from localStorage if active
  useEffect(() => {
    const isLiveActive = localStorage.getItem('urja_demo_active') === 'true';
    if (isLiveActive) {
      setTourType('live');
      const savedStep = parseInt(localStorage.getItem('urja_demo_step') || '0', 10);
      setStepIdx(savedStep);
    }
  }, []);

  // Timer specifically for local Sandbox Mode playback (no routing redirects)
  useEffect(() => {
    if (localPlaying && tourType === 'sandbox') {
      localIntervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= STEPS.length - 1) {
            setLocalPlaying(false);
            addToast('Sandbox preview simulation complete.', 'success');
            return prev;
          }
          const nextStep = prev + 1;
          localStorage.setItem('urja_demo_step', String(nextStep));
          return nextStep;
        });
      }, 3500); // 3.5 seconds per step locally
    } else {
      clearInterval(localIntervalRef.current);
    }
    return () => clearInterval(localIntervalRef.current);
  }, [localPlaying, tourType]);

  const handleStartWalkthrough = () => {
    if (tourType === 'live') {
      // Start Live tour (redirects page by page with auto-clicks and auto-scrolling)
      localStorage.setItem('urja_demo_active', 'true');
      localStorage.setItem('urja_demo_step', '0');
      addToast('Starting Live Tour Autopilot. First stop: Command Center...', 'success');
      setTimeout(() => {
        navigate(STEPS[0].route);
      }, 1000);
    } else {
      // Start Local Sandbox Mode
      setLocalPlaying(true);
      setStepIdx(0);
      localStorage.setItem('urja_demo_step', '0');
      addToast('Starting Sandbox Timeline Preview.', 'info');
    }
  };

  const handlePauseWalkthrough = () => {
    if (tourType === 'live') {
      localStorage.setItem('urja_demo_active', 'false');
      addToast('Live Autopilot Tour paused.', 'info');
    } else {
      setLocalPlaying(false);
      addToast('Sandbox preview paused.', 'info');
    }
  };

  const handleResetWalkthrough = () => {
    localStorage.setItem('urja_demo_active', 'false');
    localStorage.setItem('urja_demo_step', '0');
    setLocalPlaying(false);
    setStepIdx(0);
    addToast('Demo state reset to 09:00 baseline.', 'info');
  };

  const handleSelectStep = (index) => {
    setStepIdx(index);
    localStorage.setItem('urja_demo_step', String(index));
    
    // In live mode, selection triggers direct navigation
    if (tourType === 'live' && localStorage.getItem('urja_demo_active') === 'true') {
      navigate(STEPS[index].route);
    }
  };

  const step = STEPS[stepIdx];
  const isCritical = step.risk >= 80;
  const rc = getRiskColor(step.risk);

  return (
    <DashboardLayout>
      <PageHeader
        title="Crisis Story Mode"
        subtitle="Experience a fully automated, cinematic tour of the UrjaNetra AI platform during a national energy emergency."
        badge={{ label: 'PILOT MODULE', color: '#8b5cf6' }}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={handleResetWalkthrough}>
              <RotateCcw size={12} /> Reset
            </button>
            <button 
              className={(tourType === 'live' ? (localStorage.getItem('urja_demo_active') === 'true') : localPlaying) ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'} 
              onClick={(tourType === 'live' ? (localStorage.getItem('urja_demo_active') === 'true') : localPlaying) ? handlePauseWalkthrough : handleStartWalkthrough}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {((tourType === 'live' ? (localStorage.getItem('urja_demo_active') === 'true') : localPlaying)) ? (
                <><Pause size={12} /> Pause Walkthrough</>
              ) : (
                <><Play size={12} /> Start Walkthrough</>
              )}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/command-center')}>
              <ArrowLeft size={12} /> Command Center
            </button>
          </>
        }
      />

      {/* Mode Selector Jumbotron */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <GlassCard 
          onClick={() => {
            if (localPlaying) setLocalPlaying(false);
            setTourType('sandbox');
          }}
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: `1px solid ${tourType === 'sandbox' ? 'rgba(0, 229, 255, 0.45)' : 'var(--border-soft)'}`,
            background: tourType === 'sandbox' ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(0, 229, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e5ff'
            }}><Monitor size={16} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Sandbox Timeline Previewer</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Animate steps locally on this page. No routing changes or page loading.</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard 
          onClick={() => {
            setTourType('live');
          }}
          style={{ 
            padding: '16px 20px', 
            cursor: 'pointer',
            border: `1px solid ${tourType === 'live' ? 'rgba(139, 92, 246, 0.45)' : 'var(--border-soft)'}`,
            background: tourType === 'live' ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}><Navigation size={16} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Live Autopilot Tour (Recommended)</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Auto-navigates page-by-page with automated scrolling &amp; smart button clicks.</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {isCritical && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: 13 }}>
            CRITICAL SYSTEM TRIGGER DETECTED (Risk Score: {step.risk}/100) — Escalation Plan Active
          </span>
        </div>
      )}

      {/* Timeline Controls Banner */}
      {tourType === 'sandbox' && localPlaying && (
        <div style={{ 
          background: 'rgba(0, 229, 255, 0.05)', 
          border: '1px solid rgba(0, 229, 255, 0.2)', 
          borderRadius: 10, 
          padding: '12px 20px', 
          marginBottom: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={16} color="#00e5ff" style={{ animation: 'pulse 1.5s infinite ease-in-out' }} />
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
              Sandbox Preview active. Timeline is changing locally. Monitor widgets below.
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handlePauseWalkthrough} style={{ padding: '4px 12px', fontSize: 11 }}>
            Pause Sandbox
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>
        {/* Left: Step Info/Details */}
        <GlassCard style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Crisis Timeline Sequence
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 95, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.06)' }} />
            {STEPS.map((s, i) => {
              const isActive = i === stepIdx;
              const isPast = i < stepIdx;
              const src = getRiskColor(s.risk);
              return (
                <div key={i} onClick={() => handleSelectStep(i)} style={{ display: 'flex', gap: 12, marginBottom: 8, cursor: 'pointer', opacity: isPast && !localPlaying ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <div style={{ width: 96, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 11, color: isActive ? '#00e5ff' : 'var(--text-dim)', fontWeight: isActive ? 700 : 500 }}>{s.time}</span>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: isActive ? src : isPast ? '#334155' : 'rgba(255,255,255,0.1)', border: `2px solid ${isActive ? src : 'rgba(255,255,255,0.1)'}`, boxShadow: isActive ? `0 0 8px ${src}` : 'none', flexShrink: 0, zIndex: 1, position: 'relative', transition: 'all 0.2s' }} />
                  </div>
                  <div style={{ flex: 1, background: isActive ? 'rgba(29,140,255,0.07)' : 'transparent', border: isActive ? '1px solid rgba(29,140,255,0.2)' : '1px solid transparent', borderRadius: 8, padding: '8px 12px', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActive ? 4 : 0 }}>
                      <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: src }}>{s.risk}</span>
                    </div>
                    {isActive && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{s.ai}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Right: Interactive Sandbox Timeline Widget Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GlassCard glow={isCritical ? 'red' : step.risk >= 60 ? 'amber' : 'blue'} style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Sandbox Step Telemetry</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: rc, lineHeight: 1 }}>{step.risk}<span style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 500 }}>/100</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>Risk Score</div>
            <StatusBadge status={step.status} />
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: '#00e5ff', marginBottom: 3 }}>Active Module</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{step.module}</div>
            </div>
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>AI Context</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{step.ai}</p>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-dim)' }}>Confidence Level</span>
              <span style={{ fontWeight: 700, color: '#4ade80' }}>{step.confidence}%</span>
            </div>
            <div style={{ marginTop: 8, padding: '7px 10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 2 }}>Next Escalation</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.next}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ flex: 1 }} 
                onClick={() => handleSelectStep((stepIdx + 1) % STEPS.length)}
              >
                Next Step
              </button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={handleResetWalkthrough}>Reset</button>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, marginBottom: 5 }}>LOCAL SIMULATION PREVIEW</div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Select "Sandbox Timeline Previewer" above and click Play to preview the response feed, risk score evolution, and map vectors locally inside this tab.
            </p>
          </GlassCard>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Risk Score Evolution</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={riskChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,130,255,0.07)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(8,18,35,0.97)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ fill: '#ef4444', r: 3 }} name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Mini Crisis Map</div>
          <div style={{ position: 'relative', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,30,60,0.9) 0%, rgba(2,10,26,1) 100%)', borderRadius: 10, overflow: 'hidden', height: 160 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 180" style={{ position: 'absolute', inset: 0 }}>
              {[0,1,2,3].map(i => <line key={'h'+i} x1="0" y1={i*50} x2="500" y2={i*50} stroke="rgba(29,140,255,0.06)" strokeWidth="1" />)}
              {[0,1,2,3,4,5,6,7,8].map(i => <line key={'v'+i} x1={i*60} y1="0" x2={i*60} y2="180" stroke="rgba(29,140,255,0.06)" strokeWidth="1" />)}
              <line x1="320" y1="75" x2="195" y2="105" stroke="rgba(239,68,68,0.5)" strokeWidth="2" strokeDasharray="6,4" />
              <line x1="55" y1="125" x2="195" y2="105" stroke="rgba(34,197,94,0.6)" strokeWidth="2.5" strokeDasharray="5,3" />
              <ellipse cx="195" cy="105" rx="20" ry="15" fill="rgba(0,229,255,0.08)" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" />
              <circle cx="195" cy="105" r="5" fill="#00e5ff" />
              <circle cx="195" cy="105" r="5" fill="rgba(0,229,255,0.3)"><animate attributeName="r" from="5" to="14" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" /></circle>
              <circle cx="320" cy="75" r="7" fill="#ef4444" />
              <circle cx="320" cy="75" r="7" fill="rgba(239,68,68,0.3)"><animate attributeName="r" from="7" to="18" dur="1.2s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite" /></circle>
              <circle cx="55" cy="125" r="5" fill="#22c55e" />
              <circle cx="55" cy="125" r="5" fill="rgba(34,197,94,0.3)"><animate attributeName="r" from="5" to="12" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" /></circle>
              <text x="320" y="65" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700">Hormuz Risk Zone</text>
              <text x="55" y="145" textAnchor="middle" fill="#86efac" fontSize="8" fontWeight="700">West Africa Route</text>
              <text x="195" y="128" textAnchor="middle" fill="#67e8f9" fontSize="8">India Refineries</text>
            </svg>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>AI Action Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {actionFeed.slice(0, stepIdx + 1).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 10, color: '#00e5ff', flexShrink: 0, width: 36 }}>{item.time}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>{item.module}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{item.action}</div>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Direct Module Shortcuts</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {jumpLinks.map(link => (
              <button key={link.route} onClick={() => navigate(link.route)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, background: `${link.color}0e`, border: `1px solid ${link.color}25`, cursor: 'pointer', color: link.color, fontSize: 11, fontWeight: 600, transition: 'all 0.15s', fontFamily: 'inherit', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = `${link.color}1a`}
                onMouseLeave={e => e.currentTarget.style.background = `${link.color}0e`}>
                {link.label}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
