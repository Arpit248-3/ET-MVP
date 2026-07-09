"""
POST /api/brief/generate — Generate executive decision brief
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import ScenarioState
from app.schemas import BriefRequest, BriefResponse
from app.core.brief_engine import generate_brief
from app.routers.audit import create_audit_entry

router = APIRouter()


@router.post("/brief/generate", response_model=BriefResponse)
def create_brief(request: BriefRequest, db: Session = Depends(get_db)):
    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    scenario_id = request.scenario_id or (state.active_scenario_id if state else None)

    result = generate_brief(
        scenario_id=scenario_id,
        classification=request.classification,
        prepared_for=request.prepared_for,
    )

    create_audit_entry(
        db=db,
        user="AI Agent",
        action=f"Executive Brief Generated: {result['brief_id']}",
        module="Action Brief",
        event_type="AI",
        details={"brief_id": result["brief_id"], "classification": request.classification},
    )

    return BriefResponse(
        brief_id=result["brief_id"],
        classification=result["classification"],
        prepared_for=result["prepared_for"],
        prepared_by=result["prepared_by"],
        date=result["date"],
        subject=result["subject"],
        sections=result["sections"],
        decision_required=result["decision_required"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
