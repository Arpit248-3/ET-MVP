"""
Risk Engine — calculates composite risk score deterministically from scenario data.
No random values. Score is fully derived from scenario weights and parameters.
"""
from typing import Dict, List, Optional
from app.core.scenario_engine import get_scenario, get_thresholds

BASELINE_RISK = {
    "geopolitical_risk": 20,
    "maritime_delay": 5,
    "crude_price_spike": 10,
    "insurance_premium": 8,
    "supplier_reliability": 15,
    "sanctions_exposure": 5,
    "spr_coverage": 64,
}

BASELINE_SIGNALS = [
    {"id": 1, "source": "Maritime Intelligence", "signal": "Normal tanker traffic — all lanes clear", "score": 18, "confidence": 95, "trend": "stable", "category": "Shipping"},
    {"id": 2, "source": "OPEC Monitor", "signal": "Production stable — no emergency signals", "score": 14, "confidence": 92, "trend": "stable", "category": "OPEC"},
    {"id": 3, "source": "Sanctions Tracker", "signal": "No new designations in past 30 days", "score": 10, "confidence": 98, "trend": "stable", "category": "Sanctions"},
    {"id": 4, "source": "Weather Intelligence", "signal": "No major weather events forecast", "score": 8, "confidence": 88, "trend": "stable", "category": "Weather"},
    {"id": 5, "source": "Market Signals", "signal": "Brent-WTI spread within normal range $2.1", "score": 12, "confidence": 94, "trend": "stable", "category": "Market"},
    {"id": 6, "source": "Satellite Analytics", "signal": "Normal tanker activity across all corridors", "score": 16, "confidence": 91, "trend": "stable", "category": "Shipping"},
]

SCENARIO_SIGNALS = {
    "hormuz_closure": [
        {"id": 1, "source": "Maritime Intelligence", "signal": "Hormuz shipping lane congestion +34%", "score": 87, "confidence": 92, "trend": "up", "category": "Shipping"},
        {"id": 2, "source": "OPEC Monitor", "signal": "Emergency production cut deliberations", "score": 78, "confidence": 85, "trend": "up", "category": "OPEC"},
        {"id": 3, "source": "Sanctions Tracker", "signal": "3 new Russia oil tanker designations", "score": 72, "confidence": 94, "trend": "stable", "category": "Sanctions"},
        {"id": 4, "source": "Weather Intelligence", "signal": "Category 4 cyclone approaching Gulf ports", "score": 65, "confidence": 78, "trend": "up", "category": "Weather"},
        {"id": 5, "source": "Market Signals", "signal": "Brent-WTI spread widening to $8.4", "score": 55, "confidence": 88, "trend": "up", "category": "Market"},
        {"id": 6, "source": "Satellite Analytics", "signal": "Reduced tanker activity Red Sea corridor", "score": 81, "confidence": 90, "trend": "up", "category": "Shipping"},
    ],
    "opec_cut": [
        {"id": 1, "source": "OPEC Monitor", "signal": "2M bbl/day cut confirmed — 90-day duration", "score": 82, "confidence": 98, "trend": "up", "category": "OPEC"},
        {"id": 2, "source": "Market Signals", "signal": "Brent surges to $94.2 — demand shock pricing", "score": 74, "confidence": 96, "trend": "up", "category": "Market"},
        {"id": 3, "source": "Maritime Intelligence", "signal": "Fewer charters from Gulf nations", "score": 42, "confidence": 80, "trend": "up", "category": "Shipping"},
        {"id": 4, "source": "Satellite Analytics", "signal": "Saudi Aramco loading terminals at reduced throughput", "score": 68, "confidence": 88, "trend": "up", "category": "Shipping"},
        {"id": 5, "source": "Sanctions Tracker", "signal": "No new sanctions — OPEC action is legal", "score": 12, "confidence": 98, "trend": "stable", "category": "Sanctions"},
        {"id": 6, "source": "Weather Intelligence", "signal": "Weather not a factor in this scenario", "score": 8, "confidence": 95, "trend": "stable", "category": "Weather"},
    ],
    "russia_sanctions": [
        {"id": 1, "source": "Sanctions Tracker", "signal": "14 Russian VLCCs added to OFAC SDN List", "score": 91, "confidence": 99, "trend": "up", "category": "Sanctions"},
        {"id": 2, "source": "Maritime Intelligence", "signal": "Arctic tanker routes flagged — insurance withdrawn", "score": 78, "confidence": 94, "trend": "up", "category": "Shipping"},
        {"id": 3, "source": "Market Signals", "signal": "Urals discount widens to $12/bbl vs Brent", "score": 64, "confidence": 90, "trend": "up", "category": "Market"},
        {"id": 4, "source": "OPEC Monitor", "signal": "Non-OPEC Russia volume displaced — rebalancing", "score": 55, "confidence": 78, "trend": "up", "category": "OPEC"},
        {"id": 5, "source": "Satellite Analytics", "signal": "22 shadow fleet tankers detected — identity unclear", "score": 72, "confidence": 82, "trend": "up", "category": "Shipping"},
        {"id": 6, "source": "Weather Intelligence", "signal": "Baltic Sea storms delaying Arctic alternatives", "score": 38, "confidence": 75, "trend": "stable", "category": "Weather"},
    ],
    "port_disruption": [
        {"id": 1, "source": "Weather Intelligence", "signal": "Category 4 cyclone — Vadinar direct hit expected", "score": 88, "confidence": 91, "trend": "up", "category": "Weather"},
        {"id": 2, "source": "Maritime Intelligence", "signal": "3 VLCCs diverted — Vizag and Ennore overflow", "score": 62, "confidence": 88, "trend": "up", "category": "Shipping"},
        {"id": 3, "source": "Market Signals", "signal": "Inland fuel prices up 4.2% — refinery throughput drop", "score": 44, "confidence": 84, "trend": "up", "category": "Market"},
        {"id": 4, "source": "OPEC Monitor", "signal": "OPEC supply unaffected — domestic logistics issue", "score": 12, "confidence": 96, "trend": "stable", "category": "OPEC"},
        {"id": 5, "source": "Sanctions Tracker", "signal": "No sanctions exposure in this scenario", "score": 5, "confidence": 99, "trend": "stable", "category": "Sanctions"},
        {"id": 6, "source": "Satellite Analytics", "signal": "Paradip strike action confirmed — 48hr shutdown", "score": 58, "confidence": 85, "trend": "up", "category": "Shipping"},
    ],
}


def calculate_risk(scenario_id: Optional[str], demo_step: int = 0) -> Dict:
    """
    Deterministic risk calculation based on active scenario and demo step.
    Returns full risk breakdown with components and composite score.
    """
    thresholds = get_thresholds()

    if not scenario_id:
        # Baseline / no scenario
        overall = 32
        signals = BASELINE_SIGNALS
        crisis_level = "NORMAL"
        trend = "stable"
        recommendation = "No active crisis. Monitor standard signals. Maintain SPR levels above 60%."
        components = _build_baseline_components()
    else:
        scenario = get_scenario(scenario_id)
        if not scenario:
            return _default_risk_response()

        # Use timeline risk for current step
        timeline = scenario.get("timeline", [])
        step_data = timeline[min(demo_step, len(timeline) - 1)] if timeline else {}
        base_risk = step_data.get("risk", scenario["kpi"]["risk_score"])

        components = _build_scenario_components(scenario, base_risk, demo_step)
        overall = min(100, int(sum(c["weighted_score"] for c in components)))

        signals = SCENARIO_SIGNALS.get(scenario_id, BASELINE_SIGNALS)

        # Determine crisis level
        crit = thresholds["risk"]["critical_threshold"]
        elev = thresholds["risk"]["elevated_threshold"]
        mod = thresholds["risk"]["moderate_threshold"]

        if overall >= crit:
            crisis_level = "CRITICAL"
        elif overall >= elev:
            crisis_level = "ELEVATED"
        elif overall >= mod:
            crisis_level = "MODERATE"
        else:
            crisis_level = "NORMAL"

        trend = "up" if demo_step < len(timeline) // 2 else "stabilizing"
        recommendation = _get_recommendation(scenario_id, overall)

    return {
        "overall_score": overall,
        "crisis_level": crisis_level,
        "components": components,
        "trend": trend,
        "signals": signals,
        "recommendation": recommendation,
    }


def _build_baseline_components() -> List[Dict]:
    weights = {
        "geopolitical_risk": ("Geopolitical Risk", 0.25, 20),
        "maritime_delay": ("Maritime Delay", 0.20, 5),
        "crude_price_spike": ("Crude Price Spike", 0.15, 10),
        "insurance_premium": ("Insurance Premium", 0.10, 8),
        "supplier_reliability": ("Supplier Reliability", 0.15, 15),
        "sanctions_exposure": ("Sanctions Exposure", 0.10, 5),
        "spr_coverage": ("SPR Coverage Risk", 0.05, 36),
    }
    return [
        {
            "name": k,
            "label": v[0],
            "value": v[2],
            "weight": v[1],
            "weighted_score": round(v[2] * v[1], 2),
        }
        for k, v in weights.items()
    ]


def _build_scenario_components(scenario: Dict, base_risk: int, step: int) -> List[Dict]:
    weights = scenario.get("risk_weights", {})
    timeline = scenario.get("timeline", [])
    step_fraction = min(step / max(len(timeline) - 1, 1), 1.0)

    raw = {
        "geopolitical_risk": scenario.get("geopolitical_risk", 20) * step_fraction + 20 * (1 - step_fraction),
        "maritime_delay": min(scenario.get("maritime_delay_pct", 5) * 3.5, 100) * step_fraction + 15 * (1 - step_fraction),
        "crude_price_spike": min(scenario.get("crude_price_spike_usd", 0) * 6, 100),
        "insurance_premium": min(scenario.get("insurance_premium_spike_pct", 0) * 1.2, 100),
        "supplier_reliability": 65 * step_fraction + 20 * (1 - step_fraction),
        "sanctions_exposure": 70 * step_fraction if scenario.get("id") == "russia_sanctions" else 25 * step_fraction + 5,
        "spr_coverage": max(100 - scenario["kpi"]["spr_coverage"], 20),
    }

    labels = {
        "geopolitical_risk": "Geopolitical Risk",
        "maritime_delay": "Maritime Delay Risk",
        "crude_price_spike": "Crude Price Spike",
        "insurance_premium": "Insurance Premium Spike",
        "supplier_reliability": "Supplier Reliability Risk",
        "sanctions_exposure": "Sanctions Exposure",
        "spr_coverage": "SPR Coverage Risk",
    }

    return [
        {
            "name": k,
            "label": labels[k],
            "value": round(raw[k], 1),
            "weight": weights.get(k, 0.14),
            "weighted_score": round(raw[k] * weights.get(k, 0.14), 2),
        }
        for k in raw
    ]


def _get_recommendation(scenario_id: str, score: int) -> str:
    recs = {
        "hormuz_closure": "Activate West Africa procurement corridor immediately. Begin SPR drawdown authorization. Monitor Iranian naval exercises hourly.",
        "opec_cut": "Diversify to Brazil and USA supply. Extend SPR drawdown timeline. Negotiate emergency bilateral with non-OPEC producers.",
        "russia_sanctions": "Immediately suspend all Russia-origin crude shipments. Pivot 100% to West Africa + Saudi Arabia mix. Compliance audit required.",
        "port_disruption": "Reroute all inbound VLCCs to Vizag/Ennore/Kochi. Activate SPR Padur site for western grid supply. Resolve Paradip labour dispute.",
    }
    return recs.get(scenario_id, "Monitor situation. No immediate action required.")


def _default_risk_response() -> Dict:
    return {
        "overall_score": 32,
        "crisis_level": "NORMAL",
        "components": _build_baseline_components(),
        "trend": "stable",
        "signals": BASELINE_SIGNALS,
        "recommendation": "System operating normally.",
    }
