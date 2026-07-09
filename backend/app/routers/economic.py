"""
GET /api/economic-impact — Returns economic impact metrics for active scenario
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ScenarioState
from app.schemas import EconomicResponse
from app.core.economic_engine import get_economic_impact

router = APIRouter()


@router.get("/economic-impact", response_model=EconomicResponse)
def get_economic(db: Session = Depends(get_db)):
    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    scenario_id = state.active_scenario_id if state else None
    demo_step = state.demo_step if state else 0

    data = get_economic_impact(scenario_id, demo_step)

    return EconomicResponse(
        metrics=data["metrics"],
        state_impact=data["state_impact"],
        sector_impact=data["sector_impact"],
        time_series=data["time_series"],
        scenario_id=data["scenario_id"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
