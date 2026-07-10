/**
 * ScenarioContext — Global scenario state.
 *
 * Provides:
 *   - scenarios          : list of all available scenarios from backend
 *   - activeScenario     : currently active scenario object (or null for baseline)
 *   - systemState        : live KPIs from /api/state (risk score, incidents, etc.)
 *   - activateScenario   : fn(scenarioId) to switch scenarios
 *   - refreshState       : fn() to re-poll /api/state
 *   - backendOnline      : boolean — whether the backend is reachable
 *   - loading            : boolean
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  fetchScenarios,
  fetchState,
  activateScenario as apiActivateScenario,
} from '../services/api.js';

const ScenarioContext = createContext(null);

export function ScenarioProvider({ children }) {
  const [scenarios, setScenarios] = useState([]);
  const [systemState, setSystemState] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  const activeScenarioId = systemState?.active_scenario;
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || null;

  // ── Load scenarios on mount ──────────────────────────────────────────────
  const loadScenarios = useCallback(async () => {
    try {
      const data = await fetchScenarios();
      setScenarios(data);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ── Refresh /api/state ───────────────────────────────────────────────────
  const refreshState = useCallback(async () => {
    try {
      const state = await fetchState();
      setSystemState(state);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ── Activate a scenario ──────────────────────────────────────────────────
  const activateScenario = useCallback(async (scenarioId) => {
    try {
      const result = await apiActivateScenario(scenarioId);
      // After activation, pull fresh state immediately
      await refreshState();
      return result;
    } catch (err) {
      console.error('Failed to activate scenario:', err);
      throw err;
    }
  }, [refreshState]);

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      await loadScenarios();
      await refreshState();
      setLoading(false);
    };
    boot();
  }, [loadScenarios, refreshState]);

  // ── Polling every 30 seconds ──────────────────────────────────────────────
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      refreshState();
    }, 30_000);
    return () => clearInterval(pollingRef.current);
  }, [refreshState]);

  const value = {
    scenarios,
    activeScenario,
    systemState,
    backendOnline,
    loading,
    activateScenario,
    refreshState,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider');
  return ctx;
}
