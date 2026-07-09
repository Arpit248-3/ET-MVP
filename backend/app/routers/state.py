"""
GET /api/state — Returns current system KPIs, incident feed, and risk signals
based on the active scenario and demo step.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ScenarioState
from app.schemas import StateResponse
from app.core.scenario_engine import get_scenario
from app.core.risk_engine import calculate_risk

router = APIRouter()

INCIDENT_FEEDS = {
    "hormuz_closure": [
        {"id": 1, "time": "09:15", "type": "CRITICAL", "title": "Strait of Hormuz tension escalates", "detail": "Iranian naval exercises causing 18% shipping delay", "region": "Middle East", "color": "red"},
        {"id": 2, "time": "09:30", "type": "WARNING", "title": "OPEC+ emergency meeting called", "detail": "Production cut of 1.2M bbl/day expected announcement", "region": "Vienna", "color": "amber"},
        {"id": 3, "time": "10:00", "type": "INFO", "title": "West Africa cargo rerouted", "detail": "VLCC MV Bharat Star rerouted via Cape of Good Hope", "region": "West Africa", "color": "blue"},
        {"id": 4, "time": "10:30", "type": "WARNING", "title": "Brent crude +$8.4 surge", "detail": "Geopolitical risk premium driving price spike to $96.4/bbl", "region": "Global", "color": "amber"},
        {"id": 5, "time": "10:45", "type": "INFO", "title": "SPR drawdown initiated", "detail": "Emergency release of 8.5M bbl authorized pending Cabinet", "region": "India", "color": "green"},
    ],
    "opec_cut": [
        {"id": 1, "time": "08:00", "type": "CRITICAL", "title": "OPEC+ emergency cut confirmed", "detail": "2M bbl/day cut — Saudi and UAE leading reduction", "region": "Vienna", "color": "red"},
        {"id": 2, "time": "09:00", "type": "WARNING", "title": "Brent surges to $94.2/bbl", "detail": "Commodity markets reacting to supply reduction announcement", "region": "Global", "color": "amber"},
        {"id": 3, "time": "10:00", "type": "INFO", "title": "Brazil LOI under discussion", "detail": "Petrobras contacted for emergency term supply", "region": "Brazil", "color": "blue"},
    ],
    "russia_sanctions": [
        {"id": 1, "time": "06:00", "type": "CRITICAL", "title": "14 Russian VLCCs sanctioned", "detail": "OFAC SDN list expanded — P&I coverage withdrawn", "region": "Global", "color": "red"},
        {"id": 2, "time": "08:00", "type": "CRITICAL", "title": "India Russia crude exposure flagged", "detail": "22% of India imports affected — compliance review required", "region": "India", "color": "red"},
        {"id": 3, "time": "09:00", "type": "WARNING", "title": "4 shipments blocked by compliance", "detail": "Compliance engine halted 4 active Russia-origin shipments", "region": "Indian Ocean", "color": "amber"},
    ],
    "port_disruption": [
        {"id": 1, "time": "06:00", "type": "CRITICAL", "title": "Category 4 cyclone hits Vadinar", "detail": "Port closed — 3 VLCCs anchored offshore", "region": "Gujarat", "color": "red"},
        {"id": 2, "time": "09:00", "type": "WARNING", "title": "Paradip dock workers on strike", "detail": "48-hour work stoppage — 2 cargoes delayed", "region": "Odisha", "color": "amber"},
        {"id": 3, "time": "14:00", "type": "INFO", "title": "VLCCs rerouted to Vizag", "detail": "3 tankers successfully redirected to Visakhapatnam", "region": "Andhra Pradesh", "color": "blue"},
    ],
}

DEFAULT_INCIDENTS = [
    {"id": 1, "time": "09:00", "type": "INFO", "title": "All supply chains nominal", "detail": "No disruptions reported across monitored corridors", "region": "Global", "color": "green"},
    {"id": 2, "time": "08:30", "type": "INFO", "title": "SPR levels above target", "detail": "Strategic reserve at 64% — above 60% minimum threshold", "region": "India", "color": "green"},
    {"id": 3, "time": "08:00", "type": "INFO", "title": "Brent crude stable at $88/bbl", "detail": "No significant price movement in past 24 hours", "region": "Global", "color": "blue"},
]


@router.get("/state", response_model=StateResponse)
def get_state(db: Session = Depends(get_db)):
    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    if not state:
        state = ScenarioState(id=1)
        db.add(state)
        db.commit()
        db.refresh(state)

    scenario_id = state.active_scenario_id
    demo_step = state.demo_step or 0

    # Get KPI from scenario
    scenario = get_scenario(scenario_id) if scenario_id else None
    if scenario:
        timeline = scenario.get("timeline", [])
        step_data = timeline[min(demo_step, len(timeline) - 1)] if timeline else {}
        risk_score = step_data.get("risk", scenario["kpi"]["risk_score"])
        kpi = {**scenario["kpi"], "risk_score": risk_score}
    else:
        kpi = {
            "risk_score": 32,
            "crisis_level": "NORMAL",
            "active_incidents": 0,
            "supply_gap": "0M bbl/day",
            "spr_coverage": 64,
            "active_sanctions": 0,
        }

    # Determine crisis level from risk score
    rs = kpi["risk_score"]
    if rs >= 75:
        kpi["crisis_level"] = "CRITICAL"
    elif rs >= 60:
        kpi["crisis_level"] = "ELEVATED"
    elif rs >= 40:
        kpi["crisis_level"] = "MODERATE"
    else:
        kpi["crisis_level"] = "NORMAL"

    incidents = INCIDENT_FEEDS.get(scenario_id, DEFAULT_INCIDENTS)
    risk_data = calculate_risk(scenario_id, demo_step)

    brent = 88.0
    if scenario:
        fraction = min(demo_step / max(len(scenario.get("timeline", [1])) - 1, 1), 1.0)
        shock = scenario.get("crude_price_spike_usd", 0)
        brent = round(scenario.get("brent_baseline_usd", 88.0) + shock * fraction, 1)

    return StateResponse(
        kpi=kpi,
        incident_feed=incidents,
        risk_signals=risk_data["signals"],
        active_scenario=scenario_id,
        demo_step=demo_step,
        brent_price=brent,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
