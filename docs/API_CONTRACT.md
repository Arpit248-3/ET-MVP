# UrjaNetra AI — API Contract Specification

This document details each backend endpoint exposed by the FastAPI server and consumed by the React dashboard frontend. Every endpoint supports an offline fallback state to ensure the platform remains fully functional when the backend is unreachable.

---

## 1. Core Health & System State

### `GET /api/health`
* **Method:** `GET`
* **Frontend Page:** Global Context (`ScenarioContext.jsx`)
* **Expected Response Fields:**
  * None (checked for `res.ok`)
* **Fallback Behavior:** Sets `backendOnline` context flag to `false`, causing all consumer components to activate fallback warning banners and display local mock data.

### `GET /api/state`
* **Method:** `GET`
* **Frontend Page:** Command Center (`CommandCenter.jsx`)
* **Expected Response Fields:**
  * `active_scenario_id` (str)
  * `overall_risk_score` (int)
  * `crisis_level` (str)
  * `kpis`: Dictionary containing:
    * `brent_crude_usd` (float)
    * `domestic_crude_inr` (float)
    * `spr_coverage_days` (float)
    * `supply_gap_mbpd` (float)
    * `refinery_utilization_pct` (float)
    * `disrupted_routes_count` (int)
  * `active_incidents` (list of incident objects)
  * `recent_signals` (list of signal items)
* **Fallback Behavior:** Restores fallback KPI indices and static incident maps from local mock state.

---

## 2. Scenario Workspaces

### `GET /api/scenarios`
* **Method:** `GET`
* **Frontend Page:** Scenarios Catalog (`Scenarios.jsx`), Demo Mode Controller (`DemoMode.jsx`)
* **Expected Response Fields:**
  * Array of scenario objects, each containing `id`, `name`, `description`, `threat_level`, and `status`.
* **Fallback Behavior:** Loads local mock scenarios catalog.

### `POST /api/scenarios/{scenario_id}/activate`
* **Method:** `POST`
* **Frontend Page:** Scenarios Catalog (`Scenarios.jsx`), Demo Mode Controller (`DemoMode.jsx`)
* **Expected Response Fields:**
  * `success` (bool)
  * `scenario_id` (str)
  * `state` (object)
* **Fallback Behavior:** Activates and stores the chosen scenario ID in the React global state context locally.

### `GET /api/scenarios/active`
* **Method:** `GET`
* **Frontend Page:** Global Context (`ScenarioContext.jsx`)
* **Expected Response Fields:**
  * `id` (str)
  * `name` (str)
  * `threat_level` (str)
  * `status` (str)
* **Fallback Behavior:** Defaults to baseline scenario state.

---

## 3. Operational Workspaces

### `GET /api/risk`
* **Method:** `GET`
* **Frontend Page:** Risk Intelligence (`RiskIntelligence.jsx`)
* **Expected Response Fields:**
  * `overall_score` (int)
  * `crisis_level` (str)
  * `components` (array of weights and scores)
  * `trend` (str)
  * `signals` (array of security alerts)
  * `recommendation` (str)
* **Fallback Behavior:** Renders local static risk cards and baseline recommendations.

### `POST /api/simulate`
* **Method:** `POST`
* **Frontend Page:** Scenario Simulator (`ScenarioSimulator.jsx`)
* **Expected Response Fields:**
  * `scenario_id` (str)
  * `duration_days` (int)
  * `summary` (dict)
  * `daily_projection` (array of objects containing `day`, `brent_price`, `risk_score`, `spr_level_pct`, and `supply_gap_mbbl`)
  * `recommended_action` (str)
* **Fallback Behavior:** Renders static projection lines mapping Brent price hikes and SPR drawdowns.

### `GET /api/economic-impact`
* **Method:** `GET`
* **Frontend Page:** Economic Impact (`EconomicImpact.jsx`)
* **Expected Response Fields:**
  * `inflation_increase_pct` (float)
  * `gdp_impact_pct` (float)
  * `subsidy_burden_cr` (float)
  * `forex_depreciation_pct` (float)
  * `price_projection` (array of daily price projections)
  * `sector_impacts` (array of objects with `sector`, `risk_level`, `impact_summary`, and `growth_delta_pct`)
* **Fallback Behavior:** Renders fallback economic risk metrics.

### `POST /api/procurement/optimize`
* **Method:** `POST`
* **Frontend Page:** Procurement Optimizer (`Procurement.jsx`)
* **Expected Response Fields:**
  * `optimized_suppliers` (array of objects detailing `supplier_id`, `allocated_pct`, `landed_cost_usd_bbl`, and `compatibility_score`)
  * `total_cost_usd` (float)
  * `supply_security_index` (float)
  * `saving_vs_baseline_usd` (float)
* **Fallback Behavior:** Uses local mock procurement logs and allows manual optimizations.

### `POST /api/spr/plan`
* **Method:** `POST`
* **Frontend Page:** SPR Planner (`SprPlanner.jsx`)
* **Expected Response Fields:**
  * `drawdown_rate_mbpd` (float)
  * `days_of_coverage` (float)
  * `remaining_reserves_pct` (float)
  * `facilities_status` (array of SPR facility logs)
* **Fallback Behavior:** Displays default coverage estimations and lists national caverns.

### `POST /api/compliance/check`
* **Method:** `POST`
* **Frontend Page:** Compliance Shield (`ComplianceShield.jsx`)
* **Expected Response Fields:**
  * `results` (array of objects detailing `supplier_id`, `sanctions`, `insurance`, and `overall` clearance status)
  * `all_clear` (bool)
  * `flagged_count` (int)
* **Fallback Behavior:** Restores baseline safety matrix checking.

---

## 4. Adversarial & Decision Board

### `POST /api/redteam/validate`
* **Method:** `POST`
* **Frontend Page:** Red Team Validator (`RedTeamValidator.jsx`)
* **Expected Response Fields:**
  * `original_recommendation` (str)
  * `critique` (str)
  * `weak_assumptions` (array of strings)
  * `ignored_risks` (array of strings)
  * `findings` (array of threat objects)
  * `confidence_original` (float)
  * `confidence_adjusted` (float)
  * `final_recommendation` (str)
* **Fallback Behavior:** Employs local rule-based critical assessment generator.

### `POST /api/brief/generate`
* **Method:** `POST`
* **Frontend Page:** AI Action Brief (`ActionBrief.jsx`)
* **Expected Response Fields:**
  * `brief_id` (str)
  * `classification` (str)
  * `prepared_for` (str)
  * `prepared_by` (str)
  * `date` (str)
  * `subject` (str)
  * `sections` (array of objects with `heading` and `content`)
  * `decision_required` (str)
* **Fallback Behavior:** Renders local top-secret memo text.

### `POST /api/decisions`
* **Method:** `POST`
* **Frontend Page:** Executive Decision Board (`ExecutiveDecisionBoard.jsx`), Crisis Mode Overlay (`CrisisMode.jsx`)
* **Expected Response Fields:**
  * `decision_id` (str)
  * `action_type` (str)
  * `approved_by` (str)
  * `scenario_id` (str)
  * `status` (str)
  * `timestamp` (str)
* **Fallback Behavior:** Applies the choice (Approve, Reject, or Request Simulation) directly to the local UI state with a fallback toast success banner.

---

## 5. Support & Administrative Pages

### `GET /api/timeline`
* **Method:** `GET`
* **Frontend Page:** Timeline Replay (`TimelineReplay.jsx`)
* **Expected Response Fields:**
  * `scenario_id` (str)
  * `scenario_name` (str)
  * `events` (array of timeline milestone entries with `time`, `event`, `type`, `risk`, and `step`)
  * `current_step` (int)
* **Fallback Behavior:** Renders the static historical incident timeline.

### `GET /api/notifications`
* **Method:** `GET`
* **Frontend Page:** Notifications Center (`Notifications.jsx`)
* **Expected Response Fields:**
  * `notifications` (array of alert records with `id`, `time`, `type`, `title`, `detail`, and `read` boolean flags)
  * `unread_count` (int)
* **Fallback Behavior:** Defaults to the standard set of local notifications.

### `GET /api/audit-logs`
* **Method:** `GET`
* **Frontend Page:** Audit Logs (`AuditLogs.jsx`)
* **Expected Response/Query Params:**
  * Params: `skip` (int), `limit` (int)
  * Response:
    * `logs` (array of audit entries detailing `id`, `time`, `user`, `action`, `module`, and `severity`)
    * `total` (int)
* **Fallback Behavior:** Displays offline audit trails.

### `GET /api/settings/thresholds`
* **Method:** `GET`
* **Frontend Page:** Thresholds & Alerts (`ThresholdsAlerts.jsx`)
* **Expected Response Fields:**
  * `thresholds`: Dictionary mapping config groups:
    * `risk`: `critical_threshold` (int)
    * `spr`: `minimum_coverage_days` (int), `target_coverage_days` (int)
    * `procurement`: `max_single_supplier_pct` (int), `max_route_risk_score` (int)
    * `economic`: `fuel_price_alert_inr` (float)
* **Fallback Behavior:** Populates default thresholds configuration settings locally.

### `PUT /api/settings/thresholds`
* **Method:** `PUT`
* **Frontend Page:** Thresholds & Alerts (`ThresholdsAlerts.jsx`)
* **Expected Request Payload:**
  * `thresholds` (dict)
  * `updated_by` (str)
* **Expected Response Fields:**
  * `success` (bool)
  * `thresholds` (dict)
* **Fallback Behavior:** Displays a local success toast and maintains configurations in the react state.

---

## 6. Live Simulation Step Controls (Demo Mode)

### `GET /api/demo`
* **Method:** `GET`
* **Frontend Page:** Crisis Mode (`CrisisMode.jsx`), Demo Controller Dashboard (`DemoMode.jsx`)
* **Expected Response Fields:**
  * `current_step` (int)
  * `total_steps` (int)
  * `is_complete` (bool)
  * `scenario_name` (str)
  * `elapsed_time` (str)

### `POST /api/demo/next`
* **Method:** `POST`
* **Frontend Page:** Demo Controller Dashboard (`DemoMode.jsx`)
* **Expected Response Fields:**
  * `success` (bool)
  * `current_step` (int)
  * `is_complete` (bool)

### `POST /api/demo/reset`
* **Method:** `POST`
* **Frontend Page:** Demo Controller Dashboard (`DemoMode.jsx`)
* **Expected Response Fields:**
  * `success` (bool)

### `POST /api/demo/step/{stepIdx}`
* **Method:** `POST`
* **Frontend Page:** Timeline Replay (`TimelineReplay.jsx`)
* **Expected Response Fields:**
  * `success` (bool)
