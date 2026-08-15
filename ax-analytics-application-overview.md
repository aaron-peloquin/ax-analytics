# Software Design Document: AX Analytics System (`ax-analytics`)

**Author:** Aaron Peloquin
**Status:** Approved for Implementation  
**Target Release:** Q3 2026  
**Repository Architecture:** [Nx Monorepo](https://nx.dev)
**Publishing Targets:** [npm](https://www.npmjs.com) (`@ax-analytics/shared`)

---

## 1. Executive Summary

`ax-analytics` is an open-source, hybrid telemetry, A/B experimentation, and behavioral intelligence platform engineered for modern web applications running integrated AI Agent workflows.

Traditional software logging tools (e.g., standard [OpenTelemetry](https://opentelemetry.io)) record microscopic execution traces and latency spans, but fail to aggregate macro-level non-human behavioral patterns or evaluate prompt/tool experiments across multi-turn sessions. `ax-analytics` bridges traditional product web analytics (pageviews, button clicks, form submits) with Agent Experience (AX) metrics (tool call transition maps, loop eddies, sub-agent handoffs, semantic drift, and feedback loops).

### Key Architectural Characteristics

* **Nx Monorepo Architecture:** Monorepo package layout exposing shared types (`@ax-analytics/shared`), Express HTTP server (`apps/server`), and React dashboard (`apps/admin-ui`).
* **Dual-Engine Storage:** [PostgreSQL](https://www.postgresql.org) with [pgvector](https://github.com/pgvector/pgvector) for metadata, A/B split rules, vector embeddings, and explicit feedback; [ClickHouse](https://clickhouse.com) for high-volume time-series telemetry ingestion and trajectory pathing.
* **OTel Dual-Track Pipeline:** Consumes and emits native OpenTelemetry spans, providing anonymized group aggregate analytics alongside raw trace feeds for step-by-step debugging.
* **Hybrid Identity & Sticky Experiments:** Automatic A/B variant assignment across both human `user_id`s and dynamic `agent_identity`s (e.g., `inventory-agent-02JULY2026-tools`).
* **Explicit User Feedback Loops:** Session-level thumbs up/down (`+1`/`-1`) voting linked directly to vector embeddings and session trajectories.

---

## 2. Core Dependencies & Technology Stack

* **Monorepo Build System:** [Nx Workspace (v19+)](https://nx.dev)
* **Language/Runtime:** [TypeScript (v5.4+)](https://www.typescriptlang.org) / [Node.js (v20+ LTS)](https://nodejs.org)
* **High-Throughput Analytical Database:** [ClickHouse (v24.3+ LTS)](https://clickhouse.com)
* **Relational & Vector Database:** [PostgreSQL (v16+)](https://www.postgresql.org) + [pgvector Extension](https://github.com/pgvector/pgvector)
* **Telemetry Framework:** [OpenTelemetry JS SDK](https://opentelemetry.io/docs/languages/js/)
* **ORM & Query Builders:** [Prisma](https://www.prisma.io) / [Kysely](https://kysely.dev) & [@clickhouse/client](https://www.npmjs.com/package/@clickhouse/client)
* **Dashboard Frontend:** [React (v18+)](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) + [Recharts](https://recharts.org)

---

## 3. System Architecture & Diagram

```
+-----------------------------------------------------------------------------------+
|                            Client Application Layer                               |
|                                                                                   |
|  [ Web Application UI (Human) ]         [ AI Agent Harness / Orchestrator (AX) ]   |
|   - Pageviews & Clicks                   - Tool Calls & SubAgent Handoffs         |
|   - Form Submits & Errors                - Parameter Payloads & Results           |
|   - User Feedback (+1 / -1)              - Sticky A/B Variant Consumption        |
+-----------------------------------------------------------------------------------+
|
HTTP API Telemetry Ingestion (POST /v1/telemetry/event)
v
+-----------------------------------------------------------------------------------+
|                         AX Analytics Ingestion Server                             |
|                        (npm package: ax-analytics/server)                        |
|                                                                                   |
|   - Custom OAuth AD Group Verifier        - OpenTelemetry Dual-Track Pipeline     |
|   - Sticky A/B Experiment Evaluator       - Vector Embedding Engine (pgvector)    |
+-----------------------------------------------------------------------------------+
/

/

v                                       v
+-------------------------------------+   +-------------------------------------+
|        PostgreSQL + pgvector        |   |             ClickHouse              |
|                                     |   |                                     |
|  - Registered Applications          |   |  - High-Volume Telemetry Spans      |
|  - Sticky A/B Assignment Rules      |   |  - Time-Series Event Ingestion      |
|  - Session Feedback (+1 / -1)       |   |  - Aggregated Tool Transition Maps  |
|  - Reasoning Vector Embeddings      |   |  - Trajectory Flow Analysis         |
+-------------------------------------+   +-------------------------------------+
```

---

## 4. Storage Architecture & Schemas

### 4.1 PostgreSQL + pgvector Schema

PostgreSQL handles application metadata, sticky experiment assignments, explicit feedback votes, and vector embeddings for semantic drift tracking.

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A/B Experiments Rule Table
CREATE TABLE ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    experiment_key VARCHAR(128) NOT NULL,
    variant_a_name VARCHAR(64) DEFAULT 'A',
    variant_b_name VARCHAR(64) DEFAULT 'B',
    split_percentage INT CHECK (split_percentage BETWEEN 0 AND 100), -- % routed to Variant B
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, experiment_key)
);

-- Sticky A/B Variant Assignments Table
CREATE TABLE ab_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,
    entity_id VARCHAR(255) NOT NULL, -- human user_id or agent_identity
    assigned_variant VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, entity_id)
);

-- Session User Feedback Table
CREATE TABLE session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL, -- human user_id or agent_identity
    vote INT NOT NULL CHECK (vote IN (-1, 1)), -- +1 (Positive) / -1 (Negative)
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reasoning Vector Embeddings (Semantic Drift Tracking)
CREATE TABLE reasoning_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    turn_index INT NOT NULL,
    agent_identity VARCHAR(255) NOT NULL,
    reasoning_text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI / Cohere / Local embedding dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reasoning_embeddings_session ON reasoning_embeddings(session_id);
```

### 4.2 ClickHouse Time-Series Telemetry Schema

ClickHouse stores high-volume, real-time time-series telemetry events emitted from client applications.

```sql
CREATE TABLE telemetry_events
(
    timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    app_key String,
    session_id String,
    entity_id String,              -- human user_id or agent_identity
    entity_type Enum8('human' = 1, 'agent' = 2),
    client_string String,           -- browser string or custom set
    event_type String,              -- "page_view", "button_click", "tool_call", "error"
    invoked_tool_name String,      -- Tool name (if event_type == 'tool_call')
    previous_tool_name String,     -- Prior tool called in session (Transition Maps)
    params String,                  -- Stringified JSON blob
    results String,                 -- Stringified JSON blob
    status_code String,             -- "SUCCESS", "PARAMETER_ERROR", "TIMEOUT", "AUTH_DENIED"
    token_cost Float64,             -- Financial cost of inference turn
    execution_time_ms UInt32,
    otel_trace_id String,           -- Native OpenTelemetry trace linkage
    otel_span_id String
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (app_key, event_type, timestamp, session_id);
```

## 5. Key Features & Hybrid Telemetry Specifications

### 5.1 Hybrid Identity & Sticky A/B Experimentation

* **Human App Scope:** Bucket assigned based on human `user_id`.

* **Agent Scope:** Bucket assigned based on `agent_identity` (e.g., `inventory-agent-02JULY2026-tools`) or `user_id`.

* **Resolution Rule:** When requesting a variant, the server checks `ab_assignments` in PostgreSQL. If no record exists, it calculates a deterministic hash (`hash(entity_id + experiment_id) % 100`), compares it against `split_percentage`, writes the assignment to PostgreSQL, and returns the assigned variant (`"A"` or `"B"`).

### 5.2 OTel Dual-Track Telemetry Pipeline

1. **Aggregated Group Views:** High-volume time-series metrics stream into ClickHouse to calculate transition maps, loop eddies, and financial conversion velocity.

2. **Raw Span Feed:** Full OpenTelemetry traces are stored with matching `otel_trace_id` and `otel_span_id`. Administrators can toggle the Web UI between anonymized group aggregate charts and raw, unredacted span feeds for manual trace inspection and step-by-step debugging.

### 5.3 AX Analytics Visual Modules (Admin Web UI)

* **Tool Call Transition Maps:** Node graph displaying transition percentages, loop eddies (repetitive calls), and dead ends.

* **SubAgent Delegation Telemetry:** Tracks supervisor-to-worker handoffs, measuring context loss, duplicate queries, and worker completion rates.

* **Cost-per-Resolved-Outcome:** Calculates total token expenditure divided by completed business outcomes:

    Cost per Resolved Outcome = Successfully Completed Business Tasks / Total Session Token Cost

* **Semantic Drift Tracking:** Measures vector cosine distance across consecutive turns in `reasoning_embeddings` using pgvector to catch reasoning spirals early.

* **Session Feedback Loop:** Displays aggregated thumbs up/down (`+1` / `-1`) votes attached to `session_id` and correlates satisfaction scores against execution paths.

## 6. API Contracts

### POST `/v1/telemetry/event`

Injects a structured event payload into the ClickHouse pipeline.

* **Request Headers:** `x-app-key: <APP_KEY>`

* **Request Body:**

```json
{
  "session_id": "sess_987654321",
  "entity_id": "inventory-agent-02JULY2026-tools",
  "entity_type": "agent",
  "client_string": "AX-Agent-Harness/2.1.0 (Node.js v20.11.0)",
  "event_type": "tool_call",
  "invoked_tool_name": "edit_product",
  "previous_tool_name": "search_products",
  "params": { "product_id": "PROD-1024", "color": "blue" },
  "results": { "status": "updated", "revision": 3 },
  "status_code": "SUCCESS",
  "token_cost": 0.0042,
  "execution_time_ms": 340,
  "otel_trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "otel_span_id": "00f067aa0ba902b7"
}
```

**Response:** `202 Accepted` → `{"status": "queued"}`

### POST `/v1/experiments/variant`

Fetches or generates a sticky A/B variant for a given human user or agent.

* **Request Body:**

```json
{
  "app_key": "app_live_8832109",
  "experiment_key": "new_inventory_schema_v2",
  "entity_id": "inventory-agent-02JULY2026-tools"
}
```

* **Response:** `200 OK`

```json
{
  "experiment_key": "new_inventory_schema_v2",
  "entity_id": "inventory-agent-02JULY2026-tools",
  "assigned_variant": "B"
}
```

### POST `/v1/feedback`

Records session feedback (`+1` / `-1`).

* **Request Body:**

```json
{
  "app_key": "app_live_8832109",
  "session_id": "sess_987654321",
  "entity_id": "user_44912",
  "vote": 1,
  "comment": "Agent resolved order update perfectly!"
}
```

**Response:** `201 Created` → `{"status": "recorded"}`

## 7. HTTP API Telemetry Integration & Skill Specification

Telemetry ingestion, A/B variant resolution, and session feedback are performed via pure HTTP endpoints and TypeScript contracts from `@ax-analytics/shared` (or guided via `.agents/skills/ax-analytics-telemetry/SKILL.md`):

### 1. Ingest Agent Tool Call Telemetry

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "multiagentIdentity": "customer-triage-system",
    "entityId": "retrieval-agent",
    "entityType": "agent",
    "eventType": "tool_call",
    "invokedToolName": "search_knowledge_base",
    "previousToolName": "init_session",
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 850,
    "outputTokens": 120,
    "params": { "query": "order refund status", "topK": 3 },
    "results": { "status": "active", "docsFound": 3 },
    "statusCode": "SUCCESS",
    "tokenCost": 0.0018,
    "executionTimeMs": 240,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
```

### 2. Ingest Non-Tool GenAI LLM Inference (Prompt & Response)

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "multiagentIdentity": "customer-triage-system",
    "entityId": "summarization-worker",
    "entityType": "agent",
    "eventType": "llm_inference",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet",
    "inputTokens": 1200,
    "outputTokens": 350,
    "params": {
      "prompt": "Summarize customer refund conversation.",
      "temperature": 0.3
    },
    "results": {
      "response": "Customer requested a refund due to delayed shipment. Resolution issued under policy #402."
    },
    "statusCode": "SUCCESS",
    "tokenCost": 0.0032,
    "executionTimeMs": 450,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
```

### 3. Resolve Sticky A/B Experiment Variant

```bash
curl -X POST http://localhost:4400/v1/experiments/variant \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "customer_support_prod",
    "experimentKey": "proactive_rag_retrieval_v2",
    "entityId": "retrieval-agent"
  }'
```

### 4. Submit Session Feedback

```bash
curl -X POST http://localhost:4400/v1/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "entityId": "retrieval-agent",
    "vote": 1,
    "comment": "Resolved user query accurately with RAG context."
  }'
```

## 8. Admin Web UI & Custom OAuth Integration

### 8.1 Active Directory OAuth Authentication Flow

1. User navigates to `/admin` dashboard.

2. Server redirects to the custom AD OAuth Provider service endpoint.

3. Provider redirects back to `/v1/auth/callback` with an authorization code.

4. Server exchanges code for user profile data and an array of AD Group memberships.

5. Server verifies presence of authorized AD Group (e.g., `CN=AX-Analytics-Admins,OU=Groups,DC=company,DC=com`).

6. Upon validation, an encrypted HTTP-only session cookie is issued.

### 8.2 Dashboard Views

* **Time-Series Traffic Overview:** Aggregate traffic over configurable date ranges (pageviews, clicks, tool calls, errors).

* **Transition Trajectory Maps:** Interactive node flow graph visualizing tool transitions, backtracks, and loop eddies.

* **Cost-Per-Resolved-Outcome:** Plots financial token velocity against completed business tasks.

* **A/B Experiment Manager:** Interface to create experiments, toggle active status, and adjust A/B split percentages.

    HTML\+ 1

* **Raw OTel Stream & Feedback Feed:** Inspection table listing raw spans and user feedback votes with search/filter capabilities.

    HTML\+ 4

## 9\. Monorepo Directory Structure (Nx)

Configured as an Nx Monorepo published under package name `ax-analytics`:

```plaintext
ax-analytics/
├── .env.example
├── ax-analytics-config.json
├── nx.json
├── package.json
├── apps/
│   ├── server/                   # Express / Fastify Server & Admin API
│   │   ├── src/
│   │   │   ├── auth/             # Custom AD OAuth Strategy
│   │   │   ├── db/               # Postgres (Prisma/Kysely) & ClickHouse Drivers
│   │   │   ├── otel/             # OpenTelemetry Collector & Exporter Pipeline
│   │   │   └── routes/           # Telemetry, Experiments, Feedback Endpoints
│   │   └── main.ts
│   └── admin-ui/                 # React Dashboard Web UI
│       ├── src/
│       │   ├── components/       # Trajectory Maps, Flow Graphs, Charts
│       │   └── pages/            # Traffic, Experiments, OTel Trace Inspector
│       └── main.tsx
└── packages/
    └── shared/                   # Shared TypeScript Types & Schemas
        └── src/
            └── types.ts
```

## 10\. Developer Quickstart Guide

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Environment Variables (`.env`)

```
# PostgreSQL + pgvector
POSTGRES_URL="postgresql://ax_user:password@localhost:5432/ax_analytics_db?sslmode=disable"

# ClickHouse Engine
CLICKHOUSE_HOST="http://localhost:8123"
CLICKHOUSE_DB="ax_telemetry"
CLICKHOUSE_USER="default"
CLICKHOUSE_PASSWORD="clickhouse_secret"

# Custom OAuth AD Settings
OAUTH_PROVIDER_URL="https://auth.company.com/oauth2/authorize"
OAUTH_CLIENT_ID="ax_analytics_server_id"
OAUTH_CLIENT_SECRET="oauth_secret_key"
REQUIRED_AD_GROUP="CN=AX-Analytics-Admins,OU=Groups,DC=company,DC=com"
```

### Step 3: Create Configuration File (`ax-analytics-config.json`)

```json
{
  "server": {
    "port": 4400,
    "enableOtelExporter": true,
    "batchIngestIntervalMs": 1000
  }
}
```

### Step 4: Run Telemetry Server & Ingest Telemetry

* **Start Server (`pnpm dev`):**

```bash
pnpm dev
```

* **Ingest Telemetry via HTTP API:**

```bash
curl -X POST http://localhost:4400/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "multiagentIdentity": "customer-triage-system",
    "entityId": "retrieval-agent",
    "entityType": "agent",
    "eventType": "tool_call",
    "invokedToolName": "search_knowledge_base",
    "previousToolName": "init_session",
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 850,
    "outputTokens": 120,
    "params": { "query": "order refund status", "topK": 3 },
    "results": { "status": "active", "docsFound": 3 },
    "statusCode": "SUCCESS",
    "tokenCost": 0.0018,
    "executionTimeMs": 240,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
```
