"""
Economic Impact Engine — derives economic metrics deterministically from scenario data.
"""
from typing import Dict, Optional
from app.core.scenario_engine import get_scenario

TIME_SERIES_BASE = [
    {"month": "Jan", "brent": 78, "indianBasket": 75, "wti": 73, "import": 4.2},
    {"month": "Feb", "brent": 82, "indianBasket": 79, "wti": 77, "import": 4.0},
    {"month": "Mar", "brent": 79, "indianBasket": 76, "wti": 74, "import": 4.3},
    {"month": "Apr", "brent": 85, "indianBasket": 82, "wti": 80, "import": 4.1},
    {"month": "May", "brent": 88, "indianBasket": 85, "wti": 83, "import": 3.9},
    {"month": "Jun", "brent": 91, "indianBasket": 88, "wti": 86, "import": 4.4},
    {"month": "Jul", "brent": 94, "indianBasket": 91, "wti": 89, "import": 4.6},
]

STATE_IMPACT_BASE = [
    {"state": "Uttar Pradesh", "impact": 91, "population": 240, "gdp_exposure": "CRITICAL"},
    {"state": "Maharashtra", "impact": 85, "population": 112, "gdp_exposure": "HIGH"},
    {"state": "Gujarat", "impact": 78, "population": 63, "gdp_exposure": "HIGH"},
    {"state": "Rajasthan", "impact": 72, "population": 78, "gdp_exposure": "MEDIUM"},
    {"state": "Tamil Nadu", "impact": 68, "population": 77, "gdp_exposure": "HIGH"},
    {"state": "Punjab", "impact": 65, "population": 30, "gdp_exposure": "MEDIUM"},
    {"state": "Haryana", "impact": 61, "population": 28, "gdp_exposure": "MEDIUM"},
    {"state": "West Bengal", "impact": 58, "population": 91, "gdp_exposure": "MEDIUM"},
]

SECTOR_IMPACT_BASE = [
    {"sector": "Transport", "impact": 92, "fill": "#ef4444"},
    {"sector": "Aviation", "impact": 88, "fill": "#ef4444"},
    {"sector": "Manufacturing", "impact": 74, "fill": "#f59e0b"},
    {"sector": "Agriculture", "impact": 68, "fill": "#f59e0b"},
    {"sector": "Chemicals", "impact": 61, "fill": "#1d8cff"},
    {"sector": "Power Gen", "impact": 55, "fill": "#1d8cff"},
]


def get_economic_impact(scenario_id: Optional[str], demo_step: int = 0) -> Dict:
    """
    Returns economic impact data for the active scenario.
    All values are deterministic — derived from scenario economic block.
    """
    if not scenario_id:
        return _baseline_economic()

    scenario = get_scenario(scenario_id)
    if not scenario:
        return _baseline_economic()

    econ = scenario.get("economic", {})
    timeline = scenario.get("timeline", [])
    step_fraction = min(demo_step / max(len(timeline) - 1, 1), 1.0)

    # Scale economic impact based on demo progression
    scale = 0.4 + 0.6 * step_fraction

    metrics = {
        "inflation": {
            "value": round(econ.get("inflation_pct", 0) * scale, 2),
            "unit": "%",
            "trend": "up",
            "label": "CPI Impact",
        },
        "gdp": {
            "value": round(econ.get("gdp_impact_pct", 0) * scale, 2),
            "unit": "%",
            "trend": "down",
            "label": "GDP Impact",
        },
        "fuelPrice": {
            "value": round(econ.get("fuel_price_rise_inr", 0) * scale, 1),
            "unit": "₹/L",
            "trend": "up",
            "label": "Petrol Price Rise",
        },
        "fiscal": {
            "value": int(econ.get("fiscal_cost_cr", 0) * scale),
            "unit": "Cr",
            "trend": "up",
            "label": "Fiscal Cost",
        },
        "currentAccount": {
            "value": round(econ.get("current_account_deficit_pct_gdp", 0) * scale, 2),
            "unit": "% GDP",
            "trend": "down",
            "label": "CAD Widening",
        },
        "tradeDeficit": {
            "value": int(econ.get("trade_deficit_cr", 0) * scale),
            "unit": "Cr",
            "trend": "up",
            "label": "Trade Deficit",
        },
    }

    # Apply scenario severity to state and sector impacts
    severity_mult = {"CRITICAL": 1.0, "HIGH": 0.82, "MEDIUM": 0.62, "LOW": 0.40}.get(scenario.get("severity", "HIGH"), 0.82)
    state_impact = [
        {**s, "impact": min(100, int(s["impact"] * severity_mult * scale + s["impact"] * (1 - scale)))}
        for s in STATE_IMPACT_BASE
    ]
    sector_impact = [
        {**s, "impact": min(100, int(s["impact"] * severity_mult * scale + s["impact"] * (1 - scale)))}
        for s in SECTOR_IMPACT_BASE
    ]

    # Enrich time series with scenario shock for last 2 months
    shock = scenario.get("crude_price_spike_usd", 0) * scale
    ts = [dict(m) for m in TIME_SERIES_BASE]
    for i in range(max(0, len(ts) - 2), len(ts)):
        ts[i]["brent"] = round(ts[i]["brent"] + shock, 1)
        ts[i]["indianBasket"] = round(ts[i]["indianBasket"] + shock * 0.95, 1)
        ts[i]["wti"] = round(ts[i]["wti"] + shock * 0.88, 1)

    return {
        "metrics": metrics,
        "state_impact": state_impact,
        "sector_impact": sector_impact,
        "time_series": ts,
        "scenario_id": scenario_id,
    }


def _baseline_economic() -> Dict:
    return {
        "metrics": {
            "inflation": {"value": 0.0, "unit": "%", "trend": "stable", "label": "CPI Impact"},
            "gdp": {"value": 0.0, "unit": "%", "trend": "stable", "label": "GDP Impact"},
            "fuelPrice": {"value": 0.0, "unit": "₹/L", "trend": "stable", "label": "Petrol Price Rise"},
            "fiscal": {"value": 0, "unit": "Cr", "trend": "stable", "label": "Fiscal Cost"},
            "currentAccount": {"value": 0.0, "unit": "% GDP", "trend": "stable", "label": "CAD Widening"},
            "tradeDeficit": {"value": 0, "unit": "Cr", "trend": "stable", "label": "Trade Deficit"},
        },
        "state_impact": STATE_IMPACT_BASE,
        "sector_impact": SECTOR_IMPACT_BASE,
        "time_series": TIME_SERIES_BASE,
        "scenario_id": None,
    }
