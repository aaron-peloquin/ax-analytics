---
name: ax-analytics-curl
description: Comprehensive cURL HTTP API specification for AI agents integrating AX Analytics telemetry ingestion, A/B experiment assignment, user assignment resets, feedback, and summary endpoints.
---

# AX Analytics Telemetry Integration Skill

## System Overview
**AX Analytics** is a language-agnostic, high-throughput AI agent & web telemetry platform. It provides real-time visualization of multi-turn AI agent trajectory flows (Sankey diagrams), parameter friction heatmaps, side-by-side tool performance hubs (Sunburst charts), sticky A/B experiment resolution, and OpenTelemetry trace correlation.

### Key Operational Capabilities
- **Agent Trajectory Flows:** Maps sequential tool turns (`previousToolName -> invokedToolName`) into Directed Acyclic Graph (DAG) Sankey flows.
- **Outcome Metrics:** Measures **Seconds to Resolution** (latency in seconds) and **Cost Per Outcome** ($ expenditure per successful run).
- **Sticky A/B Experimentation:** Deterministic 0-100% variant hashing based on `hash(entity_id + experiment_id) % 100`.
- **Parameter Share Analysis:** Evaluates parameter values with an automatic **≥ 8% share threshold** grouping rule.

---

## Ingestion Payload Field Contract (`_v1`)

| Field Name | Type | Required | Category | Description & System Usage |
| :--- | :--- | :--- | :--- | :--- |
| `appKey` | `string` | **Yes** | System | Environment key identifier (e.g. `app_live_8832109`). |
| `sessionId` | `string` | **Yes** | Identity | Trace ID or session GUID. Connects multi-turn agent execution steps into Sankey flows. |
| `entityId` | `string` | **Yes** | Identity | Persistent identifier for human user (`user_4821`) or AI agent (`sales-assistant`). Used in deterministic A/B hashing `hash(entity_id + exp_id) % 100`. |
| `entityType` | `'human' \| 'agent'` | No | Dimension | Type of entity originating the event. Defaults to `'agent'`. |
| `eventType` | `string` | No | Dimension | Event type name (`'tool_call'`, `'page_view'`, `'button_click'`). Defaults to `'tool_call'`. |
| `invokedToolName` | `string` | No | Dimension | Tool invoked by the agent (`search_products`). Forms inner hub for Sunburst & target node in Sankey. |
| `previousToolName` | `string` | No | Dimension | Preceding tool invoked (`init_session`). Forms source node in Sankey trajectory flow diagrams. |
| `params` | `object` | No | Dimension | Tool JSON parameters. Evaluated in Sunburst outer ring with the **≥ 8% share threshold rule** and Parameter Heatmaps. |
| `results` | `object` | No | Payload | Tool output JSON result object. |
| `statusCode` | `Enum` | No | Dimension | Outcome status (`SUCCESS`, `PARAMETER_ERROR`, `TIMEOUT`, `AUTH_DENIED`, `MODEL_REFUSAL`, `ASSERTION_FAILED`). Feeds Successful vs Failed Sunburst hubs. |
| `executionTimeMs` | `number` | No | Metric | Turn duration in ms. Converted to **Seconds to Resolution** (ms / 1000) on outcome cards. |
| `tokenCost` | `number` | No | Metric | Turn LLM token expenditure in USD ($). Used to calculate **Cost Per Outcome** (Total Cost / Successful Runs). |
| `otelTraceId` | `string` | No | Dimension | OpenTelemetry 128-bit hex trace ID. Links telemetry grid rows directly to Opik trace logs. |
| `otelSpanId` | `string` | No | Dimension | OpenTelemetry 64-bit hex span ID. |
| `assignedVariant` | `'A' \| 'B'` | No | Dimension | Sticky A/B experiment variant assigned for the session. |

---

## API Endpoints & cURL Specifications

### 1. Ingest Telemetry Event / Tool Call (`POST /v1/telemetry/event`)

Ingest agent tool calls, web pageviews, or custom events into ClickHouse time-series tables.

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "sales-assistant",
    "entityType": "agent",
    "eventType": "tool_call",
    "invokedToolName": "search_products",
    "previousToolName": "init_session",
    "params": {
      "query": "wireless headphones",
      "filter_by_color": "blue"
    },
    "statusCode": "SUCCESS",
    "executionTimeMs": 340,
    "tokenCost": 0.0024,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7",
    "assignedVariant": "B"
  }'
```

### 2. Resolve Sticky A/B Experiment (`POST /v1/experiments/variant`)

Resolve sticky A/B variant assignment for an entity ID.

```bash
curl -X POST http://localhost:4400/v1/experiments/variant \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "app_live_8832109",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "sales-assistant"
  }'
```

### 3. Reset Sticky User ID Assignments (`POST /v1/experiments/reset-assignments`)

Clear cached sticky variant assignments for an experiment key so users receive fresh assignments on their next request.

```bash
curl -X POST http://localhost:4400/v1/experiments/reset-assignments \
  -H "Content-Type: application/json" \
  -d '{
    "experimentKey": "proactive_microcopy_tools"
  }'
```

### 4. Submit Session Feedback (`POST /v1/feedback`)

Record session thumbs-up/thumbs-down votes and comments.

```bash
curl -X POST http://localhost:4400/v1/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "sales-assistant",
    "vote": 1,
    "comment": "Resolved product inquiry in 1 turn!"
  }'
```

### 5. Fetch Analytics Summary (`GET /v1/analytics/summary`)

Retrieve high-level telemetry metrics, raw events stream, experiments rules, and feedback records.

```bash
curl -X GET http://localhost:4400/v1/analytics/summary
```
