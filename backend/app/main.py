"""
UrjaNetra AI — National Energy Resilience Command Platform
FastAPI Backend — main.py

Run with:
    uvicorn app.main:app --reload --port 8000

API base: http://localhost:8000/api
Docs:     http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from app.database import engine
from app import models

# Import all routers
from app.routers import (
    state, scenarios, demo, risk, simulation,
    economic, procurement, spr, compliance,
    redteam, brief, decisions, timeline,
    notifications, audit, settings,
)

# Create DB tables on startup
models.Base.metadata.create_all(bind=engine)

# Run seeder on startup
from app.seed import seed
seed()

app = FastAPI(
    title="UrjaNetra AI — National Energy Resilience Platform",
    description=(
        "Scenario-driven decision intelligence backend for India's national energy resilience system. "
        "Powers real-time risk assessment, procurement optimization, SPR planning, compliance checks, "
        "red-team validation, and executive action briefs."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    from app.database import SessionLocal
    from app.models import ScenarioState
    db = SessionLocal()
    try:
        state = db.query(ScenarioState).filter(ScenarioState.id == 1).first()
        active_scenario = state.active_scenario_id if state else None
        demo_step = state.demo_step if state else 0
    finally:
        db.close()

    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_scenario": active_scenario,
        "demo_step": demo_step,
        "engines": {
            "scenario_engine": "ready",
            "risk_engine": "ready",
            "economic_engine": "ready",
            "procurement_engine": "ready",
            "spr_engine": "ready",
            "compliance_engine": "ready",
            "redteam_engine": "ready",
            "brief_engine": "ready",
        },
    }


# ─── Register Routers ─────────────────────────────────────────────────────────
app.include_router(state.router, prefix="/api", tags=["State"])
app.include_router(scenarios.router, prefix="/api", tags=["Scenarios"])
app.include_router(demo.router, prefix="/api", tags=["Demo"])
app.include_router(risk.router, prefix="/api", tags=["Risk"])
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(economic.router, prefix="/api", tags=["Economic"])
app.include_router(procurement.router, prefix="/api", tags=["Procurement"])
app.include_router(spr.router, prefix="/api", tags=["SPR"])
app.include_router(compliance.router, prefix="/api", tags=["Compliance"])
app.include_router(redteam.router, prefix="/api", tags=["Red Team"])
app.include_router(brief.router, prefix="/api", tags=["Brief"])
app.include_router(decisions.router, prefix="/api", tags=["Decisions"])
app.include_router(timeline.router, prefix="/api", tags=["Timeline"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])
app.include_router(settings.router, prefix="/api", tags=["Settings"])
