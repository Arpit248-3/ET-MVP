"""
Compliance Engine — validates suppliers against sanctions, legal status, 
insurance, policy alignment, and route restrictions.
"""
from typing import Dict, List, Optional
from app.core.scenario_engine import get_suppliers, get_scenario


SANCTIONS_DB = {
    "sup-003": {"status": "FLAGGED", "authority": "OFAC / EU", "reason": "Russia — G7 price cap restrictions apply. 14 VLCCs on SDN list."},
}

INSURANCE_DB = {
    "sup-003": {"status": "RESTRICTED", "reason": "P&I Club coverage withdrawn for Russia-flag vessels post-G7 directive."},
}

ROUTE_RESTRICTIONS = {
    "Strait of Hormuz": {"restriction": "HIGH ALERT", "reason": "Iranian naval exercises active — heightened risk zone."},
    "Persian Gulf": {"restriction": "HIGH ALERT", "reason": "Proximity to Iranian naval activity."},
    "Red Sea": {"restriction": "CAUTION", "reason": "Houthi threat level: elevated."},
    "Arctic": {"restriction": "CAUTION", "reason": "Limited P&I coverage in Arctic corridors for sanctioned vessels."},
}


def check_compliance(supplier_ids: List[str], route: Optional[str], scenario_id: Optional[str]) -> Dict:
    """
    Run compliance check for given supplier IDs.
    Returns per-supplier results and an aggregate all_clear flag.
    """
    suppliers = get_suppliers()
    sup_map = {s["id"]: s for s in suppliers}
    scenario = get_scenario(scenario_id) if scenario_id else None

    results = []
    for sid in supplier_ids:
        sup = sup_map.get(sid)
        if not sup:
            continue
        result = _check_single(sup, route, scenario)
        results.append(result)

    flagged = [r for r in results if r["overall"] in ("RED", "AMBER")]

    return {
        "results": results,
        "all_clear": len(flagged) == 0,
        "flagged_count": len(flagged),
    }


def _check_single(sup: Dict, route: Optional[str], scenario: Optional[Dict]) -> Dict:
    sid = sup["id"]
    flags = []

    # Sanctions check
    if sid in SANCTIONS_DB:
        sanctions = "FLAGGED"
        flags.append(f"Sanctions: {SANCTIONS_DB[sid]['reason']}")
    else:
        sanctions = "CLEAR"

    # Insurance check
    if sid in INSURANCE_DB:
        insurance = "RESTRICTED"
        flags.append(f"Insurance: {INSURANCE_DB[sid]['reason']}")
    else:
        insurance = "VALID"

    # Legal status
    legal = "COMPLIANT" if sanctions == "CLEAR" else "REVIEW REQUIRED"

    # Policy alignment
    policy_flag = None
    if sup.get("country") == "UAE" and scenario and "hormuz" in (scenario.get("id", "")):
        policy = "MINOR FLAG"
        policy_flag = "UAE route transits Hormuz — conflict zone premium applies."
        flags.append(policy_flag)
    else:
        policy = "ALIGNED"

    # Route restriction
    route_restriction = "CLEAR"
    if route:
        for restricted_route, detail in ROUTE_RESTRICTIONS.items():
            if restricted_route.lower() in route.lower():
                route_restriction = detail["restriction"]
                flags.append(f"Route: {detail['reason']}")
                break
    # Also check from supplier's default route
    for restricted_route, detail in ROUTE_RESTRICTIONS.items():
        if restricted_route.lower() in sup.get("route", "").lower():
            if route_restriction == "CLEAR":
                route_restriction = detail["restriction"]
                flags.append(f"Route ({sup['route']}): {detail['reason']}")
            break

    # Overall
    if sanctions == "FLAGGED" or insurance == "RESTRICTED":
        overall = "RED"
    elif policy == "MINOR FLAG" or route_restriction in ("HIGH ALERT", "CAUTION"):
        overall = "AMBER"
    else:
        overall = "GREEN"

    return {
        "supplier_id": sid,
        "supplier_name": sup["name"],
        "sanctions": sanctions,
        "insurance": insurance,
        "legal_status": legal,
        "policy_alignment": policy,
        "route_restriction": route_restriction,
        "overall": overall,
        "flags": flags,
    }
