"""
SPR (Strategic Petroleum Reserve) Planner.
Calculates drawdown requirements, site allocations, and coverage feasibility.
"""
from typing import Dict, List, Optional
from app.core.scenario_engine import get_spr_sites


def plan_spr(
    daily_gap_mbbl: float = 2.4,
    days_until_cargo: int = 22,
    target_coverage_days: int = 30,
) -> Dict:
    """
    Given a daily supply gap and days until alternate cargo, compute:
    - Total drawdown needed
    - Per-site allocation
    - Remaining reserve
    - Coverage days and feasibility
    """
    sites = get_spr_sites()

    total_drawdown_needed = round(daily_gap_mbbl * days_until_cargo, 2)
    total_available = sum(s["current_stock_mbbl"] for s in sites if s["status"] == "OPERATIONAL")
    total_capacity = sum(s["capacity_mbbl"] for s in sites)

    # Allocate drawdown from operational sites proportionally
    operational = [s for s in sites if s["status"] == "OPERATIONAL"]
    op_total = sum(s["current_stock_mbbl"] for s in operational)

    allocated_sites = []
    total_allocated = 0.0

    for site in sites:
        if site["status"] != "OPERATIONAL":
            drawdown = 0.0
        else:
            if op_total > 0:
                fraction = site["current_stock_mbbl"] / op_total
                drawdown = min(
                    round(total_drawdown_needed * fraction, 2),
                    site["current_stock_mbbl"] * 0.60,  # max 60% from single site
                )
            else:
                drawdown = 0.0
        total_allocated += drawdown
        allocated_sites.append({
            "name": site["name"],
            "capacity_mbbl": site["capacity_mbbl"],
            "current_stock_mbbl": site["current_stock_mbbl"],
            "drawdown_allocated_mbbl": round(drawdown, 2),
            "status": site["status"],
        })

    total_allocated = round(total_allocated, 2)
    reserve_after = round(total_capacity - (sum(s["current_stock_mbbl"] for s in sites) - total_allocated + (sum(s["capacity_mbbl"] for s in sites if s["status"] == "MAINTENANCE") * 0)), 2)

    # Simpler: current stock - drawdown
    current_total = sum(s["current_stock_mbbl"] for s in sites)
    reserve_after_action = round(current_total - total_allocated, 2)
    reserve_after_pct = round((reserve_after_action / total_capacity) * 100, 1) if total_capacity > 0 else 0.0

    # Coverage days: how many days the SPR alone can bridge at daily_gap rate
    coverage_days = int(total_allocated / daily_gap_mbbl) if daily_gap_mbbl > 0 else 0

    feasible = total_allocated >= total_drawdown_needed * 0.80  # feasible if can cover 80%+
    warning = None
    if not feasible:
        warning = f"SPR can only cover {coverage_days} days of gap. Emergency bilateral procurement required."
    if reserve_after_pct < 30:
        warning = (warning or "") + " Post-drawdown SPR level critically low (<30%). Replenishment required."

    return {
        "daily_supply_gap_mbbl": daily_gap_mbbl,
        "days_until_cargo_arrival": days_until_cargo,
        "total_drawdown_required_mbbl": total_drawdown_needed,
        "reserve_after_action_mbbl": reserve_after_action,
        "reserve_after_action_pct": reserve_after_pct,
        "coverage_days": coverage_days,
        "sites": allocated_sites,
        "feasible": feasible,
        "warning": warning,
    }
