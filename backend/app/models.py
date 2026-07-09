from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class ScenarioState(Base):
    """Tracks which scenario is currently active and demo step."""
    __tablename__ = "scenario_state"

    id = Column(Integer, primary_key=True, index=True, default=1)
    active_scenario_id = Column(String, nullable=True, default=None)
    demo_step = Column(Integer, default=0)
    demo_running = Column(Boolean, default=False)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuditLog(Base):
    """Immutable audit trail for all major actions."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user = Column(String, nullable=False)
    action = Column(String, nullable=False)
    module = Column(String, nullable=False)
    status = Column(String, nullable=False, default="COMPLETED")
    event_type = Column(String, nullable=False)  # AI, USER, SYSTEM, SECURITY
    details = Column(JSON, nullable=True)


class Decision(Base):
    """Records decisions made by operators."""
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(String, unique=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    scenario_id = Column(String, nullable=False)
    action_type = Column(String, nullable=False)
    approved_by = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    status = Column(String, default="APPROVED")


class ThresholdConfig(Base):
    """Operator-configurable alert thresholds."""
    __tablename__ = "threshold_config"

    id = Column(Integer, primary_key=True, index=True, default=1)
    config = Column(JSON, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(String, default="System")
