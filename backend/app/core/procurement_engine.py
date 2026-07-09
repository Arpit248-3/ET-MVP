"""
Procurement Optimizer — scores and ranks suppliers for a given scenario.
Deterministic composite scoring. No randomness.
"""
from typing import Dict, List, Optional
from app.core.scenario_engine import get_scenario, get_suppliers

ROUTE_RISK_MAP = {
    "Strait of Hormuz": 85,
    "Persian Gulf": 82,
    "Red Sea": 70,
    "Cape of Good Hope": 18,
    "Atlantic": 15,
    "Pacific": 12,
    "Arctic / Cape": 38,
    "Arctic": 45,
}

SANCTIONS_PENALTY = {"FLAGGED": 50, "CLEAR": 0, "RESTRICTED": 40}
INSURANCE_PENALTY = {"RESTRICTED": 35, "VALID": 0}
AVAILABILITY_SCORE = {"HIGH": 100, "MEDIUM": 70, "LOW": 30}


def optimize_procurement(
    scenario_id: Optional[str],
    target_volume: float = 2.4,
    duration_days: int = 30,
    exclude_routes: List[str] = None,
    max_risk_score: int = 60,
) -> Dict:
    """
    Score all suppliers and return ranked procurement mix.
    Composite score = weighted sum of cost, route safety, sanctions, insurance,
                      ETA, refinery compatibility, availability, reliability.
    """
    if exclude_routes is None:
        exclude_routes = []

    suppliers = get_suppliers()
    scenario = get_scenario(scenario_id) if scenario_id else None

    # Determine which routes are dangerous from scenario
    if scenario:
        high_risk_routes = scenario.get("affected_routes", [])
        exclude_routes = list(set(exclude_routes + high_risk_routes))

    scored = []
    for sup in suppliers:
        score_data = _score_supplier(sup, exclude_routes, scenario, max_risk_score)
        scored.append(score_data)

    # Sort by composite score descending
    scored.sort(key=lambda x: x["composite_score"], reverse=True)

    # Assign recommended volumes (greedy — fill from top scorers, CLEAR suppliers only)
    remaining = target_volume
    for sup in scored:
        if sup["sanctions_status"] == "FLAGGED" or sup["insurance_status"] == "RESTRICTED":
            sup["recommended_volume_mbbl"] = 0.0
            continue
        if remaining <= 0:
            sup["recommended_volume_mbbl"] = 0.0
            continue
        alloc = min(sup.get("max_supply_mbbl_day", 0.8), remaining * 0.5)  # max 50% from one supplier
        alloc = max(0.0, alloc)
        sup["recommended_volume_mbbl"] = round(alloc, 2)
        remaining = round(remaining - alloc, 3)

    # Total cost estimate
    total_cost_cr = sum(
        s["landed_cost_usd_bbl"] * s["recommended_volume_mbbl"] * 1e6 * 84 / 1e7  # USD to INR Cr approx
        for s in scored
    )

    # Coverage days from recommended cargo
    avg_eta = min((s["eta_days"] for s in scored if s["recommended_volume_mbbl"] > 0), default=22)

    return {
        "recommended_mix": scored,
        "total_cost_estimate_cr": round(total_cost_cr, 0),
        "coverage_days": duration_days,
        "risk_summary": _risk_summary(scored),
        "optimized_for": f"{duration_days}-day supply with risk score ≤ {max_risk_score}",
    }


def _score_supplier(sup: Dict, exclude_routes: List[str], scenario: Optional[Dict], max_risk: int) -> Dict:
    route = sup["route"]
    route_risk = ROUTE_RISK_MAP.get(route, 40)

    # Escalate route risk if scenario affects it
    if scenario:
        affected = scenario.get("affected_routes", [])
        if any(r.lower() in route.lower() for r in affected):
            route_risk = min(route_risk + 35, 100)

    sanctions_pen = SANCTIONS_PENALTY.get(sup["sanctions_status"], 0)
    insurance_pen = INSURANCE_PENALTY.get(sup["insurance_status"], 0)

    # Normalize components (0-100, higher = better)
    route_safety = 100 - route_risk
    cost_score = max(0, 100 - ((sup["landed_cost_usd_bbl"] - 70) / 30) * 100)
    eta_score = max(0, 100 - (sup["eta_days"] - 14) * 2.5)
    sanctions_score = 100 - sanctions_pen
    insurance_score = 100 - insurance_pen
    avail_score = AVAILABILITY_SCORE.get(sup["availability"], 50)
    compat_score = sup["refinery_compatibility"]
    reliability = sup["reliability_score"]

    # Weighted composite
    weights = {
        "route_safety": 0.22,
        "sanctions": 0.18,
        "insurance": 0.12,
        "reliability": 0.15,
        "compatibility": 0.13,
        "cost": 0.10,
        "availability": 0.06,
        "eta": 0.04,
    }

    composite = (
        route_safety * weights["route_safety"]
        + sanctions_score * weights["sanctions"]
        + insurance_score * weights["insurance"]
        + reliability * weights["reliability"]
        + compat_score * weights["compatibility"]
        + cost_score * weights["cost"]
        + avail_score * weights["availability"]
        + eta_score * weights["eta"]
    )

    # Overall risk score (lower is better)
    risk_score = int(
        route_risk * 0.40
        + sanctions_pen * 0.30
        + insurance_pen * 0.20
        + (100 - reliability) * 0.10
    )

    # Verdict
    if risk_score <= 30 and sup["sanctions_status"] == "CLEAR":
        verdict = "RECOMMENDED"
    elif risk_score <= 50 and sup["sanctions_status"] == "CLEAR":
        verdict = "VIABLE"
    elif sup["sanctions_status"] == "FLAGGED":
        verdict = "HIGH RISK"
    else:
        verdict = "CAUTION"

    return {
        "supplier_id": sup["id"],
        "name": sup["name"],
        "country": sup["country"],
        "crude_type": sup["crude_type"],
        "route": route,
        "landed_cost_usd_bbl": sup["landed_cost_usd_bbl"],
        "eta_days": sup["eta_days"],
        "risk_score": risk_score,
        "composite_score": round(composite, 2),
        "sanctions_status": sup["sanctions_status"],
        "insurance_status": sup["insurance_status"],
        "availability": sup["availability"],
        "refinery_compatibility": compat_score,
        "reliability_score": reliability,
        "verdict": verdict,
        "recommended_volume_mbbl": 0.0,
        "max_supply_mbbl_day": sup.get("max_supply_mbbl_day", 0.8),
        "score_breakdown": {
            "route_safety": round(route_safety, 1),
            "sanctions_score": round(sanctions_score, 1),
            "insurance_score": round(insurance_score, 1),
            "reliability": round(reliability, 1),
            "refinery_compatibility": round(compat_score, 1),
            "cost_score": round(cost_score, 1),
            "availability": round(avail_score, 1),
            "eta_score": round(eta_score, 1),
        },
    }


def _risk_summary(scored: List[Dict]) -> str:
    recommended = [s for s in scored if s["verdict"] == "RECOMMENDED"]
    flagged = [s for s in scored if s["verdict"] == "HIGH RISK"]
    if flagged:
        flagged_names = ", ".join(f["name"] for f in flagged)
        return f"{len(recommended)} supplier(s) recommended. {len(flagged)} flagged ({flagged_names}) — avoid immediately."
    return f"{len(recommended)} supplier(s) recommended. Procurement mix is compliant and operationally viable."
