/**
 * UrjaNetra AI — API Service Layer
 * Centralised wrapper for all FastAPI backend calls.
 * Base URL defaults to localhost:8000 for local dev.
 * Uses fallback to mock data if the backend is unreachable.
 */

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

// ─── Generic fetch helper ──────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API ${res.status}: ${errorBody}`);
  }
  return res.json();
}

// ─── Health ────────────────────────────────────────────────────────────────
export const fetchHealth = () => apiFetch('/health');

// ─── Scenarios ─────────────────────────────────────────────────────────────
export const fetchScenarios = () => apiFetch('/scenarios');

export const activateScenario = (scenarioId) =>
  apiFetch(`/scenarios/${scenarioId}/activate`, { method: 'POST' });

export const fetchActiveScenario = () => apiFetch('/scenarios/active');

// ─── System State (KPIs + Incidents + Risk Signals) ───────────────────────
export const fetchState = () => apiFetch('/state');

// ─── Risk ──────────────────────────────────────────────────────────────────
export const fetchRisk = () => apiFetch('/risk');

// ─── Economic Impact ───────────────────────────────────────────────────────
export const fetchEconomicImpact = () => apiFetch('/economic-impact');

// ─── Procurement ───────────────────────────────────────────────────────────
export const optimizeProcurement = (payload = {}) =>
  apiFetch('/procurement/optimize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── SPR ───────────────────────────────────────────────────────────────────
export const planSPR = (payload = {}) =>
  apiFetch('/spr/plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Compliance ────────────────────────────────────────────────────────────
export const checkCompliance = (payload = {}) =>
  apiFetch('/compliance/check', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Red Team ──────────────────────────────────────────────────────────────
export const validateRedTeam = (payload = {}) =>
  apiFetch('/redteam/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Simulation ────────────────────────────────────────────────────────────
export const runSimulation = (payload = {}) =>
  apiFetch('/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Brief ─────────────────────────────────────────────────────────────────
export const generateBrief = (payload = {}) =>
  apiFetch('/brief/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Decisions ─────────────────────────────────────────────────────────────
export const recordDecision = (payload) =>
  apiFetch('/decisions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Notifications ─────────────────────────────────────────────────────────
export const fetchNotifications = () => apiFetch('/notifications');

// ─── Timeline ──────────────────────────────────────────────────────────────
export const fetchTimeline = () => apiFetch('/timeline');

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const fetchAuditLogs = (skip = 0, limit = 50) =>
  apiFetch(`/audit-logs?skip=${skip}&limit=${limit}`);

// ─── Settings / Thresholds ─────────────────────────────────────────────────
export const fetchThresholds = () => apiFetch('/settings/thresholds');

export const updateThresholds = (payload) =>
  apiFetch('/settings/thresholds', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

// ─── Demo ──────────────────────────────────────────────────────────────────
export const fetchDemoState = () => apiFetch('/demo');
export const advanceDemoStep = () => apiFetch('/demo/next', { method: 'POST' });
export const resetDemo = () => apiFetch('/demo/reset', { method: 'POST' });
export const triggerDemoStep = (stepIdx) => apiFetch(`/demo/step/${stepIdx}`, { method: 'POST' });

