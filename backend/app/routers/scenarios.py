"""
GET /api/scenarios — List all available scenarios
POST /api/scenarios/{scenario_id}/activate — Activate a scenario
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ScenarioState, AuditLog
from app.schemas import ScenarioSummary, ScenarioActivateResponse
from app.core.scenario_engine import get_all_scenarios, get_scenario
from app.routers.audit import create_audit_entry

router = APIRouter()


@router.get("/scenarios", response_model=list[ScenarioSummary])
def list_scenarios(db: Session = Depends(get_db)):
    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    active_id = state.active_scenario_id if state else None

    scenarios = get_all_scenarios()
    return [
        ScenarioSummary(
            id=s["id"],
            name=s["name"],
            description=s["description"],
            severity=s["severity"],
            probability=s["probability"],
            region=s["region"],
            is_active=(s["id"] == active_id),
        )
        for s in scenarios
    ]


@router.post("/scenarios/{scenario_id}/activate", response_model=ScenarioActivateResponse)
def activate_scenario(scenario_id: str, db: Session = Depends(get_db)):
    scenario = get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    if not state:
        state = ScenarioState(id=1)
        db.add(state)

    state.active_scenario_id = scenario_id
    state.demo_step = 0
    state.activated_at = datetime.now(timezone.utc)
    db.commit()

    create_audit_entry(
        db=db,
        user="Operator",
        action=f"Scenario Activated: {scenario['name']}",
        module="Scenario Simulator",
        event_type="USER",
        details={"scenario_id": scenario_id, "severity": scenario["severity"]},
    )

    return ScenarioActivateResponse(
        success=True,
        scenario_id=scenario_id,
        message=f"Scenario '{scenario['name']}' activated. Demo reset to step 0.",
        activated_at=datetime.now(timezone.utc).isoformat(),
    )
