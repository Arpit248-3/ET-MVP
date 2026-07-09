"""
POST /api/redteam/validate — Red team validation of AI recommendation
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ScenarioState
from app.schemas import RedTeamRequest, RedTeamResponse
from app.core.redteam_engine import validate_recommendation
from app.routers.audit import create_audit_entry

router = APIRouter()


@router.post("/redteam/validate", response_model=RedTeamResponse)
def red_team_validate(request: RedTeamRequest, db: Session = Depends(get_db)):
    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    scenario_id = request.scenario_id or (state.active_scenario_id if state else None)

    result = validate_recommendation(
        recommendation=request.recommendation,
        scenario_id=scenario_id,
        confidence=request.confidence,
    )

    create_audit_entry(
        db=db,
        user="Red Team AI",
        action=f"Red Team Validation — confidence adjusted from {request.confidence:.0%} to {result['confidence_adjusted']:.0%}",
        module="Red Team Validator",
        event_type="AI",
        details={"confidence_original": request.confidence, "confidence_adjusted": result["confidence_adjusted"]},
    )

    return RedTeamResponse(
        original_recommendation=result["original_recommendation"],
        critique=result["critique"],
        weak_assumptions=result["weak_assumptions"],
        ignored_risks=result["ignored_risks"],
        findings=result["findings"],
        confidence_original=result["confidence_original"],
        confidence_adjusted=result["confidence_adjusted"],
        final_recommendation=result["final_recommendation"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
