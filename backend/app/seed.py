"""
Database seeder -- populates initial ScenarioState and audit log entries.
Run: python -m app.seed
"""
from app.database import engine, SessionLocal
from app import models
from app.models import ScenarioState, AuditLog
from datetime import datetime, timezone
import uuid


def seed():
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create singleton state if not exists
        existing = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
        if not existing:
            state = ScenarioState(id=1, active_scenario_id=None, demo_step=0)
            db.add(state)
            db.commit()
            print("[OK] ScenarioState initialized")
        else:
            print("[OK] ScenarioState already exists")

        # Seed initial audit log entries (system boot entries)
        existing_logs = db.query(AuditLog).count()
        if existing_logs == 0:
            seed_entries = [
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="UrjaNetra AI Backend Started", module="System", status="COMPLETED", event_type="SYSTEM", details={"version": "1.0.0"}),
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="Scenario Engine Initialized - 4 scenarios loaded", module="Scenario Simulator", status="COMPLETED", event_type="SYSTEM"),
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="Reference data loaded - suppliers, refineries, SPR sites", module="System", status="COMPLETED", event_type="SYSTEM"),
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="Risk Engine calibrated - baseline risk: 32/100", module="Risk Intelligence", status="COMPLETED", event_type="AI"),
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="Compliance Engine ready - OFAC/EU sanctions DB loaded", module="Compliance Shield", status="COMPLETED", event_type="SYSTEM"),
                AuditLog(event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}", user="System", action="SPR Sites loaded - Visakhapatnam, Mangaluru, Padur", module="SPR Planner", status="COMPLETED", event_type="SYSTEM"),
            ]
            for entry in seed_entries:
                db.add(entry)
            db.commit()
            print(f"[OK] {len(seed_entries)} audit seed entries created")
        else:
            print(f"[OK] Audit logs already seeded ({existing_logs} entries)")

        print("[READY] Seed complete. UrjaNetra AI backend is ready.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
