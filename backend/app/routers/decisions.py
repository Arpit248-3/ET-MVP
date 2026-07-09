"""
POST /api/decisions — Record a decision made by an operator
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import Decision, ScenarioState
from app.schemas import DecisionRequest, DecisionResponse
from app.routers.audit import create_audit_entry

router = APIRouter()


@router.post("/decisions", response_model=DecisionResponse)
def record_decision(request: DecisionRequest, db: Session = Depends(get_db)):
    decision_id = f"DEC-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
    scenario_id = request.scenario_id or (state.active_scenario_id if state else "unknown")

    decision = Decision(
        decision_id=decision_id,
        scenario_id=scenario_id,
        action_type=request.action_type,
        approved_by=request.approved_by,
        details=request.details,
        status="APPROVED",
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)

    create_audit_entry(
        db=db,
        user=request.approved_by,
        action=f"Decision Approved: {request.action_type}",
        module="Executive Decision Board",
        event_type="USER",
        details={"decision_id": decision_id, "action_type": request.action_type},
    )

    return DecisionResponse(
        decision_id=decision_id,
        action_type=request.action_type,
        approved_by=request.approved_by,
        scenario_id=scenario_id,
        status="APPROVED",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
