---
name: ax-analytics-telemetry
description: Comprehensive language-agnostic HTTP API specification and SDK integration manual for AX Analytics telemetry ingestion, prescriptive agent entity naming, automated trajectory flow tracking, sticky A/B experiment assignment, assignment resets, session feedback, and OpenTelemetry trace correlation. Activate this skill whenever implementing or querying AX Analytics, logging agent tool calls, tracking Sankey trajectory flows, resolving experiment variants, or configuring agent telemetry.
---

# AX Analytics Telemetry Integration Skill

## System Overview

AX Analytics is a high-throughput, language-agnostic AI agent and web telemetry platform. It provides real-time visualization of multi-turn AI agent trajectory flows (Sankey diagrams), parameter friction heatmaps, side-by-side tool performance hubs (Sunburst charts), sticky A/B experiment resolution, and OpenTelemetry / Opik trace correlation.

### Key Operational Capabilities

- **Agent Trajectory Flows**: Maps sequential tool turns (`previousToolName` -> `invokedToolName`) into Directed Acyclic Graph (DAG) Sankey flows.
- **Outcome Metrics**: Measures Seconds to Resolution (`executionTimeMs / 1000`) and Cost Per Outcome ($ expenditure per successful run).
- **Sticky A/B Experimentation**: Deterministic 0-100% variant hashing based on `hash(entity_id + experiment_id) % 100`.
- **Parameter Share Analysis**: Evaluates parameter values with an automatic ≥ 8% share threshold grouping rule.
- **OpenTelemetry Correlation**: Direct trace/span mapping via W3C `traceparent` headers (`otelTraceId`, `otelSpanId`).

---

## Language-Agnostic Context & Accompanying Type Definitions

This skill defines language-agnostic HTTP API contracts and architectural patterns. Integration code SHOULD consume or reference accompanying target language type definitions (e.g. `TelemetryEvent_v1`, `EventStatusCode_v1`, `EntityType_v1`, `ExperimentVariantRequest_v1`, `SessionFeedback_v1`). If target language definitions are missing in your environment, request or generate matching structural models (TypeScript types, Python Pydantic models, Go structs, Rust structs, etc.).

---

## Prescriptive Agent Entity Naming Standard (`entityId`)

To ensure accurate aggregation across Sankey flow diagrams and Sunburst hubs, callers MUST adhere to prescriptive entity naming conventions for `entityId`:

1. **Agent Personas**: Use clean, descriptive hyphenated or colon-scoped names representing the specific AI persona or agent role (e.g. `dm-persona`, `bookkeeper-agent`, `sales-assistant`).
2. **System & Route Endpoints**: When telemetry originates from internal service routes or MCP servers, set `entityId` to the endpoint path (e.g. `/api/admin/campaign-chat`, `/api/mcp`).
3. **Stage-Aware Execution Contexts**: Append execution stages for fine-grained trajectory tracking when an agent transitions through phases (e.g. `"livekit agent: bootup"` during initial tool warming vs `"livekit-agent"` during live interaction).
4. **Deterministic Fallback Cascade**: When `entityId` is omitted, SDKs and clients MUST evaluate fallbacks in order of specificity:
   `entityId` -> `persona` -> service route path -> `"agent-service"`.

---

## Automated Session Trajectory Flow Tracking

To eliminate manual caller overhead when recording sequential tool invocations, SDKs and clients SHOULD maintain an in-memory session registry (`sessionLastToolMap`):

- **Automatic Preceding Tool Lookup**: When an event with `eventType: "tool_call"` is logged without an explicit `previousToolName`, retrieve the preceding tool from `sessionLastToolMap.get(sessionId)`.
- **Bootstrap Initialization**: If no preceding tool exists for `sessionId`, default `previousToolName` to `"init_session"`.
- **Registry Update**: Immediately update the session registry with `sessionLastToolMap.set(sessionId, invokedToolName)`.

---

## Dynamic Endpoint & Environment Configuration

Client integrations SHOULD dynamically resolve host and app key configurations based on runtime environment context:

- **Browser Environments**: Proxy ingestion requests through `/api/ax-analytics` (via Next.js rewrite or equivalent web server proxy) to avoid CORS issues and expose a unified endpoint.
- **Server Environments**: Read environment variables `AX_ANALYTICS_HOST` or `NEXT_PUBLIC_AX_ANALYTICS_HOST`, falling back to `http://localhost:4400`.
- **App Key Resolution**: Read `AX_ANALYTICS_APP_KEY` or `NEXT_PUBLIC_AX_ANALYTICS_APP_KEY`, falling back to default application keys (e.g. `adm_live_8832109`).

---

## Ingestion Payload Field Contract (`_v1`)

| Field Name         | Type                   | Required | Category  | Description & System Usage                                                                                                                                                                                |
| :----------------- | :--------------------- | :------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appKey`           | string                 | Yes      | System    | Environment key identifier (e.g. `adm_live_8832109`).                                                                                                                                                     |
| `sessionId`        | string                 | Yes      | Identity  | Trace ID or session GUID. Connects multi-turn agent execution steps into Sankey flows. Defaults to `otelTraceId` when available.                                                                          |
| `entityId`         | string                 | Yes      | Identity  | Persistent identifier for human user (`user_4821`), agent persona (`dm-persona`), endpoint (`/api/mcp`), or stage (`livekit agent: bootup`). Used in sticky A/B hashing `hash(entity_id + exp_id) % 100`. |
| `entityType`       | `'human'` \| `'agent'` | No       | Dimension | Type of entity originating the event. Defaults to `'agent'`. Use `'human'` for frontend web events.                                                                                                       |
| `eventType`        | string                 | No       | Dimension | Event type identifier (`'tool_call'`, `'llm_inference'`, `'page_view'`, `'button_click'`). Defaults to `'tool_call'`.                                                                                     |
| `invokedToolName`  | string                 | No       | Dimension | Tool invoked by the agent (`search_products`). Forms inner hub for Sunburst & target node in Sankey.                                                                                                      |
| `previousToolName` | string                 | No       | Dimension | Preceding tool invoked (`init_session`). Forms source node in Sankey trajectory flow diagrams. Automatically populated if omitted.                                                                        |
| `params`           | object                 | No       | Dimension | Tool JSON parameters. Evaluated in Sunburst outer ring with the ≥ 8% share threshold rule and Parameter Heatmaps.                                                                                         |
| `results`          | object                 | No       | Payload   | Output JSON result object or LLM output content.                                                                                                                                                          |
| `statusCode`       | Enum                   | No       | Dimension | Outcome status (`SUCCESS`, `PARAMETER_ERROR`, `TIMEOUT`, `AUTH_DENIED`, `MODEL_REFUSAL`, `ASSERTION_FAILED`). Feeds Successful vs Failed Sunburst hubs.                                                   |
| `executionTimeMs`  | number                 | No       | Metric    | Turn duration in milliseconds. Converted to Seconds to Resolution (`executionTimeMs / 1000`) on outcome cards.                                                                                            |
| `tokenCost`        | number                 | No       | Metric    | Turn LLM token expenditure in USD ($). Used to calculate Cost Per Outcome (Total Cost / Successful Runs).                                                                                                 |
| `otelTraceId`      | string                 | No       | Dimension | OpenTelemetry 128-bit hex trace ID extracted from W3C `traceparent`. Links telemetry rows directly to Opik trace logs.                                                                                    |
| `otelSpanId`       | string                 | No       | Dimension | OpenTelemetry 64-bit hex span ID.                                                                                                                                                                         |
| `assignedVariant`  | string                 | No       | Dimension | Sticky A/B experiment variant assigned for the session (`'A'`, `'B'`).                                                                                                                                    |

---

## Sequential Integration Workflow

1. **Initialize Session Context**: Extract W3C `traceparent` (`00-<traceId>-<spanId>-01`) or generate a unique `sessionId`.
2. **Resolve Experiment Variant (Optional)**: Query `POST /v1/experiments/variant` with `experimentKey` and prescriptive `entityId`.
3. **Execute Tool / LLM Inference**: Record turn start time and execute the requested agent tool or inference.
4. **Emit Telemetry Event**: Call `POST /v1/telemetry/event` (or helper function `trackAgentToolCall`) with execution time, token cost, parameters, results, and trace IDs.
5. **Submit User Feedback**: Send thumbs up/down votes and comments via `POST /v1/feedback` at session completion.

---

## API Endpoints & cURL Specifications

### 1. Ingest Telemetry Event / Tool Call (`POST /v1/telemetry/event`)

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "adm_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "dm-persona",
    "entityType": "agent",
    "eventType": "tool_call",
    "invokedToolName": "get_session_overview",
    "previousToolName": "init_session",
    "params": { "campaignId": "cmp_90210" },
    "results": { "status": "active", "playersCount": 4 },
    "statusCode": "SUCCESS",
    "executionTimeMs": 240,
    "tokenCost": 0.0018,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
```

### 2. Ingest Non-Tool LLM Inference (`POST /v1/telemetry/event`)

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "adm_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "bookkeeper-agent",
    "entityType": "agent",
    "eventType": "llm_inference",
    "results": { "response": "Player updated HP by -5 points." },
    "statusCode": "SUCCESS",
    "executionTimeMs": 450,
    "tokenCost": 0.0032
  }'
```

### 3. Resolve Sticky A/B Experiment (`POST /v1/experiments/variant`)

```bash
curl -X POST http://localhost:4400/v1/experiments/variant \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "adm_live_8832109",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "dm-persona"
  }'
```

### 4. Reset Sticky User/Agent Assignments (`POST /v1/experiments/reset-assignments`)

```bash
curl -X POST http://localhost:4400/v1/experiments/reset-assignments \
  -H "Content-Type: application/json" \
  -d '{
    "experimentKey": "proactive_microcopy_tools"
  }'
```

### 5. Submit Session Feedback (`POST /v1/feedback`)

```bash
curl -X POST http://localhost:4400/v1/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "adm_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "dm-persona",
    "vote": 1,
    "comment": "Resolved session query smoothly!"
  }'
```

---

## Structural Scaffolding & Formatting

<examples>
<example>
<input>
Log an agent tool invocation for the DM persona executing get_attending_players during bootup.
</input>
<output>
```json
{
  "appKey": "adm_live_8832109",
  "sessionId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "entityId": "livekit agent: bootup",
  "entityType": "agent",
  "eventType": "tool_call",
  "invokedToolName": "get_attending_players",
  "previousToolName": "init_session",
  "params": {
    "campaignId": "cmp_12345"
  },
  "results": {
    "players": ["Thorin", "Gandalf"]
  },
  "statusCode": "SUCCESS",
  "executionTimeMs": 180,
  "tokenCost": 0.0012,
  "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "otelSpanId": "00f067aa0ba902b7"
}
```
</output>
</example>

<example>
<input>
Submit negative session feedback for a failed agent interaction.
</input>
<output>
```json
{
  "appKey": "adm_live_8832109",
  "sessionId": "opik_trace_883a92",
  "entityId": "bookkeeper-agent",
  "vote": -1,
  "comment": "Tool call failed to update inventory item."
}
```
</output>
</example>
</examples>
