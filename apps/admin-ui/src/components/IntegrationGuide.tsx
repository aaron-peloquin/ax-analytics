import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Terminal, 
  BookOpen, 
  Layers, 
  Globe, 
  User, 
  Wrench, 
  Activity, 
  Bot, 
  Code2, 
  FileCode, 
  Zap, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  Cpu, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export function IntegrationGuide(): React.ReactElement {
  const [viewMode, setViewMode] = useState<'api' | 'skill'>('api');
  const [typeLanguage, setTypeLanguage] = useState<'ts' | 'python' | 'kotlin' | 'go'>('ts');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // cURL Code Snippets
  const curlLlmInferenceCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
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
    "tokenCost": 0.0032,
    "executionTimeMs": 450,
    "statusCode": "SUCCESS",
    "params": {
      "prompt": "Summarize customer refund conversation.",
      "temperature": 0.3
    },
    "results": {
      "response": "Customer requested a refund due to delayed shipment. Resolution issued under policy #402."
    },
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'`;

  const curlSpanCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
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
    "tokenCost": 0.0018,
    "executionTimeMs": 240,
    "statusCode": "SUCCESS",
    "params": {
      "query": "order refund status",
      "topK": 3
    },
    "results": {
      "status": "active",
      "docsFound": 3
    },
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7",
    "assignedVariant": "B"
  }'`;

  const curlCustomEventCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "web_sess_99201",
    "entityId": "user_4821",
    "entityType": "human",
    "eventType": "button_click",
    "params": {
      "buttonId": "checkout_btn",
      "cartValue": 149.99
    }
  }'`;

  const curlPageViewCode = `curl -X POST http://localhost:4400/v1/telemetry/otlp/v1/traces \\
  -H "Content-Type: application/json" \\
  -d '{
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "spanId": "00f067aa0ba902b7",
    "parentSpanId": "5e1074e531853683",
    "name": "documentLoad",
    "startTime": [1700000000, 100000000],
    "endTime": [1700000000, 850000000],
    "attributes": {
      "url.full": "https://example.com/products/headphones",
      "url.scheme": "https",
      "url.path": "/products/headphones",
      "user_agent.original": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0 Safari/537.36",
      "document.title": "Wireless Headphones - Shop",
      "document.referrer": "https://google.com",
      "document.visibilityState": "visible",
      "app.key": "customer_support_prod",
      "app.event_type": "page_view",
      "session.id": "web_sess_99201",
      "user.id": "user_4821",
      "user.type": "human"
    },
    "resource": {
      "attributes": {
        "service.name": "web-frontend",
        "browser.platform": "macOS",
        "browser.mobile": false,
        "browser.brands": ["Google Chrome 122", "Chromium 122"]
      }
    }
  }'`;

  const curlABCode = `curl -X POST http://localhost:4400/v1/experiments/variant \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "retrieval-agent"
  }'`;

  const curlFeedbackCode = `curl -X POST http://localhost:4400/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "entityId": "retrieval-agent",
    "vote": 1,
    "comment": "Resolved inquiry in 1 turn with accurate RAG context!"
  }'`;

  // TypeScript Types (_v1)
  const tsTypesCode = `export type EventStatusCode_v1 = 
  | 'SUCCESS' 
  | 'PARAMETER_ERROR' 
  | 'TIMEOUT' 
  | 'AUTH_DENIED' 
  | 'MODEL_REFUSAL' 
  | 'ASSERTION_FAILED';

export type EntityType_v1 = 'human' | 'agent';

export interface TelemetryEvent_v1 {
  readonly timestamp?: string;
  readonly appKey: string;
  readonly sessionId: string;
  readonly entityId: string;
  /** Set to 'agent' for autonomous AI personas, 'human' for user UI actions. Leave undefined for deterministic system workers. */
  readonly entityType?: EntityType_v1;
  readonly eventType: string;
  readonly multiagentIdentity?: string;
  /** Strictly reserved for autonomous agent tool invocations (e.g. MCP tools). Do not emit for background tasks or Temporal activities. */
  readonly invokedToolName?: string;
  readonly previousToolName?: string;
  readonly provider?: string;
  readonly model?: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly params?: Record<string, unknown>;
  readonly results?: Record<string, unknown>;
  readonly statusCode?: EventStatusCode_v1;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  /** Correlates event with OpenTelemetry spans for low-level execution timing and stack traces. */
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly assignedVariant?: string;
}

export interface ExperimentVariantRequest_v1 {
  readonly appKey: string;
  readonly experimentKey: string;
  readonly entityId: string;
}

export interface SessionFeedback_v1 {
  readonly appKey: string;
  readonly sessionId: string;
  readonly entityId: string;
  readonly vote: 1 | -1;
  readonly comment?: string;
}`;

  // Python Pydantic Types (_v1)
  const pythonTypesCode = `from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

EventStatusCode_v1 = Literal[
    "SUCCESS", 
    "PARAMETER_ERROR", 
    "TIMEOUT", 
    "AUTH_DENIED", 
    "MODEL_REFUSAL", 
    "ASSERTION_FAILED"
]

EntityType_v1 = Literal["human", "agent"]

class TelemetryEvent_v1(BaseModel):
    appKey: str = Field(..., description="Application key identifier")
    sessionId: str = Field(..., description="Trace or session ID")
    entityId: str = Field(..., description="User ID, Agent persona ID, or system endpoint")
    entityType: Optional[EntityType_v1] = Field(
        None, 
        description="Set to 'agent' for autonomous AI personas, 'human' for user UI actions. Leave None for deterministic backend code or system workers."
    )
    eventType: str = Field(
        default="tool_call", 
        description="Event type ('tool_call' for autonomous agent tools, 'llm_inference', 'page_view', 'button_click')"
    )
    multiagentIdentity: Optional[str] = Field(None, description="System-wide multi-agent grouping identifier")
    invokedToolName: Optional[str] = Field(
        None, 
        description="Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for Temporal activities or routine DB queries."
    )
    previousToolName: Optional[str] = None
    provider: Optional[str] = Field(None, description="LLM vendor, e.g. 'openai', 'anthropic', 'google'")
    model: Optional[str] = Field(None, description="LLM model string, e.g. 'gpt-4o', 'claude-3-5-sonnet'")
    inputTokens: Optional[int] = Field(None, description="Prompt token count")
    outputTokens: Optional[int] = Field(None, description="Completion token count")
    params: Optional[Dict[str, Any]] = Field(None, description="Tool JSON parameters or LLM prompt payload")
    results: Optional[Dict[str, Any]] = Field(None, description="Tool return payload or LLM completion response")
    statusCode: Optional[EventStatusCode_v1] = Field(default="SUCCESS")
    tokenCost: Optional[float] = Field(None, description="Token expenditure in USD ($)")
    executionTimeMs: Optional[int] = Field(None, description="Turn execution duration in milliseconds")
    otelTraceId: Optional[str] = Field(None, description="W3C OTel 128-bit hex trace ID for OpenTelemetry correlation")
    otelSpanId: Optional[str] = Field(None, description="OTel 64-bit hex span ID")
    assignedVariant: Optional[str] = None

class ExperimentVariantRequest_v1(BaseModel):
    appKey: str
    experimentKey: str
    entityId: str

class SessionFeedback_v1(BaseModel):
    appKey: str
    sessionId: str
    entityId: str
    vote: Literal[1, -1]
    comment: Optional[str] = None`;

  // Kotlin Data Classes (_v1)
  const kotlinTypesCode = `import kotlinx.serialization.Serializable

@Serializable
enum class EventStatusCode_v1 {
    SUCCESS,
    PARAMETER_ERROR,
    TIMEOUT,
    AUTH_DENIED,
    MODEL_REFUSAL,
    ASSERTION_FAILED
}

@Serializable
enum class EntityType_v1 {
    human,
    agent
}

@Serializable
data class TelemetryEvent_v1(
    val appKey: String,
    val sessionId: String,
    val entityId: String,
    /** Set to EntityType_v1.agent for autonomous AI personas, EntityType_v1.human for user actions. Leave null for deterministic workers. */
    val entityType: EntityType_v1? = null,
    val eventType: String = "tool_call",
    val multiagentIdentity: String? = null,
    /** Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for routine background activities. */
    val invokedToolName: String? = null,
    val previousToolName: String? = null,
    val provider: String? = null,
    val model: String? = null,
    val inputTokens: Long? = null,
    val outputTokens: Long? = null,
    val params: Map<String, String>? = null,
    val results: Map<String, String>? = null,
    val statusCode: EventStatusCode_v1? = EventStatusCode_v1.SUCCESS,
    val tokenCost: Double? = null,
    val executionTimeMs: Long? = null,
    val otelTraceId: String? = null,
    val otelSpanId: String? = null,
    val assignedVariant: String? = null,
    val timestamp: String? = null
)

@Serializable
data class ExperimentVariantRequest_v1(
    val appKey: String,
    val experimentKey: String,
    val entityId: String
)

@Serializable
data class SessionFeedback_v1(
    val appKey: String,
    val sessionId: String,
    val entityId: String,
    val vote: Int,
    val comment: String? = null
)`;

// Go Structs (_v1)
  const goTypesCode = `package telemetry

type EventStatusCode string

const (
    StatusSuccess         EventStatusCode = "SUCCESS"
    StatusParameterError  EventStatusCode = "PARAMETER_ERROR"
    StatusTimeout         EventStatusCode = "TIMEOUT"
    StatusAuthDenied      EventStatusCode = "AUTH_DENIED"
    StatusModelRefusal    EventStatusCode = "MODEL_REFUSAL"
    StatusAssertionFailed EventStatusCode = "ASSERTION_FAILED"
)

type EntityType string

const (
    EntityHuman EntityType = "human"
    EntityAgent EntityType = "agent"
)

type TelemetryEvent_v1 struct {
    AppKey             string                 \`json:"appKey"\`
    SessionID          string                 \`json:"sessionId"\`
    EntityID           string                 \`json:"entityId"\`
    // Set to EntityAgent for autonomous AI personas, EntityHuman for user actions. Nil for deterministic routines.
    EntityType         *EntityType            \`json:"entityType,omitempty"\`
    EventType          string                 \`json:"eventType"\`            // "tool_call", "llm_inference", "page_view", "button_click"
    MultiagentIdentity *string                \`json:"multiagentIdentity,omitempty"\`
    // Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for Temporal activities or DB queries.
    InvokedToolName    *string                \`json:"invokedToolName,omitempty"\`
    PreviousToolName   *string                \`json:"previousToolName,omitempty"\`
    Provider           *string                \`json:"provider,omitempty"\`
    Model              *string                \`json:"model,omitempty"\`
    InputTokens        *int64                 \`json:"inputTokens,omitempty"\`
    OutputTokens       *int64                 \`json:"outputTokens,omitempty"\`
    Params             map[string]interface{} \`json:"params,omitempty"\`
    Results            map[string]interface{} \`json:"results,omitempty"\`
    StatusCode         *EventStatusCode       \`json:"statusCode,omitempty"\`
    TokenCost          *float64               \`json:"tokenCost,omitempty"\`
    ExecutionTimeMs    *int64                 \`json:"executionTimeMs,omitempty"\`
    OtelTraceID        *string                \`json:"otelTraceId,omitempty"\`
    OtelSpanID         *string                \`json:"otelSpanId,omitempty"\`
    AssignedVariant    *string                \`json:"assignedVariant,omitempty"\`
    Timestamp          *string                \`json:"timestamp,omitempty"\`
}

type ExperimentVariantRequest_v1 struct {
    AppKey        string \`json:"appKey"\`
    ExperimentKey string \`json:"experimentKey"\`
    EntityID      string \`json:"entityId"\`
}

type SessionFeedback_v1 struct {
    AppKey    string  \`json:"appKey"\`
    SessionID string  \`json:"sessionId"\`
    EntityID  string  \`json:"entityId"\`
    Vote      int     \`json:"vote"\` // 1 or -1
    Comment   *string \`json:"comment,omitempty"\`
}`;

  // cURL SKILL.md Markdown
  const curlSkillMarkdown = `---
name: ax-analytics-telemetry
description: Comprehensive language-agnostic HTTP API specification and SDK integration manual for AX Analytics telemetry ingestion, prescriptive agent entity naming, 3-tier metadata grouping (sessionId, multiagentIdentity, agentIdentity), OpenTelemetry GenAI attributes, automated trajectory flow tracking, sticky A/B experiment assignment, assignment resets, session feedback, and OTEL trace correlation. Activate this skill whenever implementing or querying AX Analytics, logging agent tool calls, tracking Sankey trajectory flows, resolving experiment variants, or configuring agent telemetry.
---

# AX Analytics Telemetry Integration Skill

## System Overview

AX Analytics is a high-throughput, language-agnostic AI agent and web telemetry platform. It provides real-time visualization of multi-turn AI agent trajectory flows (Sankey diagrams), side-by-side tool performance hubs (Sunburst charts), sticky A/B experiment resolution, and OpenTelemetry / Opik trace correlation.

### Key Operational Capabilities

- **Agent Trajectory Flows**: Maps sequential tool turns (previousToolName -> invokedToolName) into Directed Acyclic Graph (DAG) Sankey flows.
- **Outcome Metrics**: Measures Seconds to Resolution (executionTimeMs / 1000) and Cost Per Outcome ($ expenditure per successful run).
- **Sticky A/B Experimentation**: Deterministic 0-100% variant hashing based on hash(entity_id + experiment_id) % 100.
- **Parameter Share Analysis**: Evaluates parameter values with an automatic ≥ 8% share threshold grouping rule.
- **OpenTelemetry Correlation**: Direct trace/span mapping via W3C traceparent headers (otelTraceId, otelSpanId).

---

## Telemetry Semantics & OpenTelemetry Boundary Guidelines

To ensure clean Sankey trajectory flows and accurate Sunburst performance hubs, callers MUST adhere to the following telemetry boundaries:

### 1. Agent Tool Calls vs. Internal Code Execution (Temporal Activities, DB, STT/TTS)
- **Strictly Agentic**: \`eventType: "tool_call"\` (and \`invokedToolName\`) is **strictly reserved for Agentic Tool Invocations**—specifically when an AI agent reasons and autonomously decides to call an external tool (e.g., an MCP server tool like \`get_campaign_plan\` or \`search_lore\`).
- **No Synthetic Tool Calls for Background Code**: Standard code-level tasks or background workflow activities (e.g., Temporal activities, PostgreSQL queries, speech-to-text transcriptions, text-to-speech audio synthesis, or vector indexing) **MUST NOT** emit synthetic \`tool_call\` or custom \`temporal_activity\` events to AX Analytics. Doing so pollutes the Sankey trajectory flow diagrams and Sunburst hubs.
- **OTel Span Correlation**: Low-level execution timing, input/output dumps, and error traces for routine backend activities belong in **OpenTelemetry / Opik spans**, correlated via \`otelTraceId\` and \`otelSpanId\`.

### 2. Entity Type (\`entityType\`) Semantics
- \`entityType: "agent"\`: MUST only be attached when an AI persona or agent entity explicitly takes an autonomous action (e.g. \`dm-persona\`, \`bookkeeper-agent\`).
- \`entityType: "human"\`: Used for real human user interactions (e.g. UI clicks, form submissions, frontend page views).
- **Deterministic System Workers**: If deterministic backend code or a background system worker is running a routine function, \`entityType\` MUST be left **undefined / null** (omitted) rather than defaulting to \`"agent"\`.

---

## 3-Tier Identity Taxonomy & Metadata Groupings

To ensure accurate aggregation across analytics dashboards, trajectory flows, and cost models, telemetry callers MUST categorize metadata across three distinct hierarchical scopes:

| Scope Level | Field Name | Architectural Purpose & Definition | Concrete Example |
| :--- | :--- | :--- | :--- |
| **1. User Journey Scope** | \`sessionId\` | Binds the user request journey across multi-turn interactions over time. Auto-generated by server if omitted. | \`"sess_usr_98124_chat"\` or W3C Trace GUID |
| **2. Multi-Agent System Scope** | \`multiagentIdentity\` | **System-wide multi-agent grouping identifier.** Stamped on EVERY event emitted by ALL participating agents across the entire execution chain (entrypoint, primary worker, intermediate helper, or tertiary sub-agent). | \`"customer-triage-system"\`, \`"code-review-pipeline"\`, \`"campaign-generation-workflow"\` |
| **3. Individual Agent Scope** | \`entityId\` (or \`agentIdentity\`) | Identifies the specific AI agent persona, worker loop, or MCP tool worker executing that particular turn/step. | \`"retrieval-agent"\`, \`"sql-generator"\`, \`"summarization-worker"\` |

---

## Prescriptive Agent Entity Naming Standard (\`entityId\`)

To ensure accurate aggregation across Sankey flow diagrams and Sunburst hubs, callers MUST adhere to prescriptive entity naming conventions for \`entityId\`:

1. **Agent Personas**: Clean hyphenated/scoped names (e.g. \`retrieval-agent\`, \`sql-generator\`, \`sales-assistant\`).
2. **System Endpoints**: Endpoint paths when originating from MCP/services (e.g. \`/api/v1/chat\`, \`/api/mcp\`).
3. **Stage Contexts**: Execution stages for fine-grained trajectory tracking (e.g. \`"rag-agent: warming"\`).
4. **Deterministic Fallback Cascade**: When \`entityId\` is omitted, telemetry integrations MUST evaluate fallbacks in order of specificity: \`entityId\` -> \`agentIdentity\` -> service route path -> \`"agent-service"\`.

---

## Automated Session Trajectory Flow Tracking

To eliminate manual caller overhead when recording sequential tool invocations, telemetry integrations SHOULD maintain an in-memory session registry (\`sessionLastToolMap\`):

- **Automatic Preceding Tool Lookup**: When an event with \`eventType: "tool_call"\` is logged without an explicit \`previousToolName\`, retrieve the preceding tool from \`sessionLastToolMap.get(sessionId)\`.
- **Bootstrap Initialization**: If no preceding tool exists for \`sessionId\`, default \`previousToolName\` to \`"init_session"\`.
- **Registry Update**: Immediately update the session registry with \`sessionLastToolMap.set(sessionId, invokedToolName)\`.

---

## Dynamic Endpoint & Environment Configuration

- **Browser Environments**: Proxy ingestion requests through \`/api/ax-analytics\` (via Next.js rewrite or equivalent web server proxy) to avoid CORS issues and expose a unified endpoint.
- **Server Environments**: Read environment variables \`AX_ANALYTICS_HOST\` or \`NEXT_PUBLIC_AX_ANALYTICS_HOST\`, falling back to \`http://localhost:4400\`.
- **App Key Resolution**: Read \`AX_ANALYTICS_APP_KEY\` or \`NEXT_PUBLIC_AX_ANALYTICS_APP_KEY\`, specifying the target application/tenant scope (e.g. \`customer_support_prod\`).

---

## Ingestion Payload Field Contract (\`_v1\`)

| Field Name | Type | Required | Category | Description & System Usage |
| :--- | :--- | :--- | :--- | :--- |
| \`appKey\` | string | Yes | System | Application key identifier (e.g. \`customer_support_prod\`). Scopes events to application/tenant. |
| \`sessionId\` | string | No | Identity | User session GUID or trace ID root. Connects multi-turn agent execution steps into Sankey flows. Auto-generated by server if omitted. |
| \`multiagentIdentity\` | string | No | Identity | System-wide multi-agent grouping identifier stamped across ALL agents in the execution chain (e.g. \`customer-triage-system\`, \`code-review-pipeline\`). |
| \`entityId\` | string | Yes | Identity | Persistent identifier for human user (\`user_4821\`), agent persona (\`sales-assistant\`), worker loop (\`sql-generator\`), or stage (\`rag-agent: warming\`). Used in deterministic A/B hashing \`hash(entity_id + exp_id) % 100\`. |
| \`entityType\` | \`'human'\` \\| \`'agent'\` | No | Dimension | Type of entity originating the event ('agent' for autonomous AI personas, 'human' for user actions). Leave undefined / omitted for deterministic system workers. |
| \`eventType\` | string | No | Dimension | Event type identifier (\`'tool_call'\`, \`'llm_inference'\`, \`'page_view'\`, \`'button_click'\`). |
| \`invokedToolName\` | string | No | Dimension | Tool invoked by the agent (\`execute_sql_query\`). Strictly for autonomous agent tool calls (e.g. MCP tools). Forms inner hub for Sunburst & target node in Sankey. |
| \`previousToolName\` | string | No | Dimension | Preceding tool invoked (\`parse_user_prompt\`). Forms source node in Sankey trajectory flow diagrams. Automatically populated if omitted. |
| \`provider\` | string | No | OTEL GenAI | LLM Vendor / System provider (\`gen_ai.system\`, e.g., \`'openai'\`, \`'anthropic'\`, \`'google'\`, \`'ollama'\`). |
| \`model\` | string | No | OTEL GenAI | LLM Model string (\`gen_ai.request.model\`, e.g., \`'gpt-4o'\`, \`'claude-3-5-sonnet'\`). |
| \`inputTokens\` | number | No | OTEL GenAI | Prompt / Input token count (\`gen_ai.usage.input_tokens\`). |
| \`outputTokens\` | number | No | OTEL GenAI | Completion / Output token count (\`gen_ai.usage.output_tokens\`). |
| \`params\` | object | No | Dimension | Tool JSON parameters. Evaluated in Sunburst outer ring with the ≥ 8% share threshold rule. |
| \`results\` | object | No | Payload | Output JSON result object or LLM output content. |
| \`statusCode\` | Enum | No | Dimension | Outcome status (\`SUCCESS\`, \`PARAMETER_ERROR\`, \`TIMEOUT\`, \`AUTH_DENIED\`, \`MODEL_REFUSAL\`, \`ASSERTION_FAILED\`). Feeds Successful vs Failed Sunburst hubs. |
| \`executionTimeMs\` | number | No | Metric | Turn duration in milliseconds. Converted to Seconds to Resolution (\`executionTimeMs / 1000\`) on outcome cards. |
| \`tokenCost\` | number | No | Metric | Turn LLM token expenditure in USD ($). Used to calculate Cost Per Outcome (Total Cost / Successful Runs). |
| \`otelTraceId\` | string | No | Dimension | OpenTelemetry 128-bit hex trace ID extracted from W3C \`traceparent\`. Links telemetry rows directly to Opik trace logs. |
| \`otelSpanId\` | string | No | Dimension | OpenTelemetry 64-bit hex span ID. |
| \`assignedVariant\` | string | No | Dimension | Sticky A/B experiment variant assigned for the session (\`'A'\`, \`'B'\`, defaulting to \`'Standard'\`). |

---

## API Endpoints & cURL Specifications

### 1. Ingest Telemetry Event / Tool Call (\`POST /v1/telemetry/event\`)
\`\`\`bash
curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
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
    "executionTimeMs": 240,
    "tokenCost": 0.0018,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
\`\`\`

### 2. Ingest Non-Tool LLM Inference (\`POST /v1/telemetry/event\`)
\`\`\`bash
curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
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
    "executionTimeMs": 450,
    "tokenCost": 0.0032,
    "otelTraceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "otelSpanId": "00f067aa0ba902b7"
  }'
\`\`\``;

  // Language mapping helper
  const getLanguageSnippet = () => {
    switch (typeLanguage) {
      case 'ts':
        return {
          code: tsTypesCode,
          name: 'TypeScript (_v1)',
          file: 'telemetry.ts',
          badge: 'bg-purple-950 text-fuchsia-300 border-purple-800',
          copyId: 'ts-types',
          description: 'Copy and paste these TypeScript _v1 type definitions into your client or server codebase.'
        };
      case 'python':
        return {
          code: pythonTypesCode,
          name: 'Python Pydantic (_v1)',
          file: 'models.py',
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          copyId: 'python-types',
          description: 'Copy and paste these Pydantic v2 _v1 model definitions into your Python AI services.'
        };
      case 'kotlin':
        return {
          code: kotlinTypesCode,
          name: 'Kotlin Serialization (_v1)',
          file: 'TelemetryContracts.kt',
          badge: 'bg-sky-950 text-sky-300 border-sky-800',
          copyId: 'kotlin-types',
          description: 'Copy and paste these Kotlin _v1 kotlinx.serialization data classes into your Kotlin / Android applications.'
        };
      case 'go':
        return {
          code: goTypesCode,
          name: 'Go Structs (_v1)',
          file: 'telemetry.go',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          copyId: 'go-types',
          description: 'Copy and paste these Go _v1 struct definitions into your backend microservices.'
        };
    }
  };

  const selectedSnippet = getLanguageSnippet();

  return (
    <div className="space-y-6">
      {/* Top Header Banner & View Switcher */}
      <div className="neon-panel p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-900/50 text-fuchsia-300 border border-purple-500/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                {viewMode === 'api' 
                  ? 'Language-Agnostic cURL HTTP API & Telemetry Contracts' 
                  : 'AI Agent SKILL.md Telemetry Specification'}
              </h2>
              <p className="text-xs text-purple-200 font-medium mt-1">
                {viewMode === 'api'
                  ? 'Direct cURL HTTP endpoints, parameter schemas, payload examples, and deep architectural guidance.'
                  : 'Complete language-agnostic agent skill file for autonomous subagents and pair-programming LLMs.'}
              </p>
            </div>
          </div>

          {/* Primary View Switcher (HTTP API vs SKILL.md) */}
          <div className="flex p-1 bg-[#0f071e] rounded-xl border border-purple-900/60 w-full md:w-auto">
            <button
              onClick={() => setViewMode('api')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'api'
                  ? 'bg-purple-900/80 text-fuchsia-200 border border-purple-500/60 shadow-lg shadow-purple-950/50'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              cURL HTTP API Guide
            </button>

            <button
              onClick={() => setViewMode('skill')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'skill'
                  ? 'bg-fuchsia-900/80 text-fuchsia-200 border border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/50'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-fuchsia-400" />
              AI Agent SKILL.md
            </button>
          </div>
        </div>
      </div>

      {/* CRITICAL ARCHITECTURAL GUIDANCE CALLOUT (Addresses Pilot Team Feedback) */}
      <div className="neon-panel p-6 border-purple-500/50 bg-gradient-to-r from-[#130a24] via-[#170a2c] to-[#0e071c] relative overflow-hidden">
        <div className="flex items-center gap-2 text-fuchsia-300 mb-3">
          <ShieldCheck className="w-5 h-5 text-fuchsia-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
            Crucial Telemetry Boundaries & Semantic Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Boundary 1: Tool Calls vs Internal Code Execution */}
          <div className="p-4 rounded-xl bg-[#090412]/80 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2 text-fuchsia-300 font-semibold text-xs">
              <Wrench className="w-4 h-4 text-fuchsia-400" />
              <span>Agent Tool Calls vs. Internal Code Execution</span>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed font-normal">
              <strong className="text-fuchsia-300 font-mono">eventType: "tool_call"</strong> (and <code className="text-fuchsia-300 font-mono">invokedToolName</code>) is <strong className="text-white">strictly reserved for Agentic Tool Invocations</strong>—specifically when an AI agent autonomously reasons and decides to call an external tool (e.g. MCP tools like <code className="text-purple-100 font-mono">get_campaign_plan</code> or <code className="text-purple-100 font-mono">search_lore</code>).
            </p>
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-200 leading-normal">
              <strong className="text-rose-300">Do NOT emit synthetic tool calls:</strong> Background workflow activities (e.g. <em>Temporal activities</em>, PostgreSQL queries, STT/TTS synthesis, or vector indexing) must <strong>not</strong> emit synthetic <code className="font-mono">tool_call</code> events, as doing so pollutes the Sankey trajectory flow diagrams and Sunburst hubs. Low-level traces belong in standard OpenTelemetry spans via <code className="font-mono">otelTraceId</code> / <code className="font-mono">otelSpanId</code>.
            </div>
          </div>

          {/* Boundary 2: Entity Type Semantics */}
          <div className="p-4 rounded-xl bg-[#090412]/80 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Entity Type (entityType) Semantics</span>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed font-normal">
              <strong className="text-cyan-300 font-mono">entityType: "agent"</strong> should <strong className="text-white">only</strong> be attached when an AI persona or agent entity explicitly takes an autonomous action (e.g. <code className="text-purple-100 font-mono">dm-persona</code>, <code className="text-purple-100 font-mono">bookkeeper-agent</code>).
            </p>
            <ul className="text-xs text-purple-200 space-y-1 list-disc list-inside">
              <li><strong className="text-cyan-300 font-mono">"human"</strong>: Real human user actions (e.g. UI clicks, form submissions, page views).</li>
              <li><strong className="text-purple-300 font-mono">undefined / null</strong>: If deterministic backend code or a system worker is running a routine function, leave <code className="text-purple-200 font-mono">entityType</code> omitted rather than defaulting to <code className="text-purple-200 font-mono">"agent"</code>.</li>
            </ul>
            <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
              Preserves purity across Trajectory Sankey flows and User vs Agent analytics filters.
            </div>
          </div>
        </div>

        {/* Telemetry Destination Decision Matrix */}
        <div className="mt-5 pt-4 border-t border-purple-900/60">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-fuchsia-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 font-heading">
              Telemetry Destination Decision Matrix (When to emit to AX Analytics vs. OpenTelemetry)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/60 text-purple-300 font-mono uppercase text-[11px]">
                  <th className="py-2.5 px-3">Execution Task / Scenario</th>
                  <th className="py-2.5 px-3">Target Telemetry System</th>
                  <th className="py-2.5 px-3">eventType</th>
                  <th className="py-2.5 px-3">entityType</th>
                  <th className="py-2.5 px-3">invokedToolName</th>
                  <th className="py-2.5 px-3">Architectural Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">AI Agent calls MCP Tool (e.g. <code className="text-fuchsia-300">get_campaign_plan</code>)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 font-bold border border-fuchsia-800">AX Analytics</span></td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">"tool_call"</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">"agent"</td>
                  <td className="py-2.5 px-3 font-mono text-fuchsia-300">"get_campaign_plan"</td>
                  <td className="py-2.5 px-3 text-purple-200">Autonomous reasoning step; feeds Sankey trajectory flows & Sunburst hubs.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Temporal Workflow Activity (e.g. STT/TTS synthesis)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">OpenTelemetry Span</span></td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A (OTel span)</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A</td>
                  <td className="py-2.5 px-3 text-purple-200">Deterministic workflow task; synthetic tool calls pollute agent decision flows.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">PostgreSQL / Vector DB Query</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">OpenTelemetry DB Span</span></td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A (OTel span)</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A</td>
                  <td className="py-2.5 px-3 text-purple-200">Database latency and execution traces correlate via <code className="text-cyan-300 font-mono">otelTraceId</code>.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">GenAI LLM Prompt / Completion Turn</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 font-bold border border-fuchsia-800">AX Analytics</span></td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">"llm_inference"</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">"agent"</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">omitted / null</td>
                  <td className="py-2.5 px-3 text-purple-200">Tracks token costs, model performance, and seconds to resolution.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Human User UI Click or Form Submit</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">AX Analytics</span></td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">"button_click"</td>
                  <td className="py-2.5 px-3 font-mono text-fuchsia-300">"human"</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">omitted / null</td>
                  <td className="py-2.5 px-3 text-purple-200">Captures user frontend journey and conversion metrics.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Deterministic Backend Worker / Cron Job</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">OpenTelemetry Span</span></td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">custom or N/A</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">undefined / omitted</td>
                  <td className="py-2.5 px-3 font-mono text-purple-400">N/A</td>
                  <td className="py-2.5 px-3 text-purple-200">Non-autonomous code; leave entityType empty if emitting custom AX metric.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CORE CONCEPTS BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="neon-panel p-5 border-purple-500/40">
          <div className="flex justify-between items-center text-purple-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">1. Identity & Naming</span>
            <User className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            <strong className="text-fuchsia-300 font-mono font-bold">entityId</strong> identifies a human user (e.g. <code className="text-purple-100 font-mono font-bold">user_4821</code>) or agent persona (e.g. <code className="text-purple-100 font-mono font-bold">retrieval-agent</code>).
          </p>
          <span className="text-xs text-purple-200 font-medium mt-3 block">
            Used in deterministic sticky A/B hashing: <code className="text-fuchsia-300 font-mono font-bold">hash(entity_id + exp_id) % 100</code>
          </span>
        </div>

        <div className="neon-panel p-5 border-fuchsia-500/40">
          <div className="flex justify-between items-center text-fuchsia-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">2. Trajectory Flows</span>
            <Wrench className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            A <strong className="text-fuchsia-300 font-mono font-bold">Tool Call</strong> represents an autonomous execution turn by an AI agent (<code className="text-purple-100 font-mono font-bold">previousToolName</code> &rarr; <code className="text-purple-100 font-mono font-bold">invokedToolName</code>).
          </p>
          <span className="text-xs text-fuchsia-300 font-medium mt-3 block">
            Feeds Trajectory Sankey Flow maps and side-by-side Sunburst hubs.
          </span>
        </div>

        <div className="neon-panel p-5 border-cyan-500/40">
          <div className="flex justify-between items-center text-cyan-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">3. System Grouping</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            <strong className="text-cyan-300 font-mono font-bold">multiagentIdentity</strong> groups all events across participating agents in the execution chain (e.g. <code className="text-cyan-200 font-mono">customer-triage-system</code>).
          </p>
          <span className="text-xs text-cyan-300 font-medium mt-3 block">
            Enables whole-chain cost tracking and cross-agent trajectory mapping.
          </span>
        </div>
      </div>

      {/* DEDICATED TYPE DEFINITIONS CONTRACT SECTION WITH LANGUAGE DROPDOWN */}
      <div className="neon-panel p-6 space-y-4 border-purple-500/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Code2 className="w-4 h-4 text-fuchsia-400" />
              Target Language Type Contracts (_v1)
            </h3>
            <p className="text-xs text-purple-200 font-medium mt-0.5">
              {selectedSnippet.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Language Selector Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={typeLanguage}
                onChange={(e) => setTypeLanguage(e.target.value as 'ts' | 'python' | 'kotlin' | 'go')}
                className="w-full sm:w-auto appearance-none bg-[#0a0414] text-xs font-bold text-fuchsia-200 border border-purple-700/60 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-fuchsia-500 cursor-pointer"
              >
                <option value="ts">TypeScript (_v1)</option>
                <option value="python">Python / Pydantic (_v1)</option>
                <option value="kotlin">Kotlin / Serialization (_v1)</option>
                <option value="go">Go / Structs (_v1)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.copyId)}
              className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50 whitespace-nowrap"
            >
              {copiedSection === selectedSnippet.copyId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === selectedSnippet.copyId ? 'Copied Types!' : `Copy ${selectedSnippet.name}`}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-purple-300 pb-1">
          <span className="font-mono text-[11px] text-purple-400">File: <span className="text-fuchsia-300">{selectedSnippet.file}</span></span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedSnippet.badge}`}>
            {selectedSnippet.name}
          </span>
        </div>

        <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-96">
          {selectedSnippet.code}
        </pre>
      </div>

      {/* BODY VIEW 1: HTTP API ENDPOINTS (when viewMode === 'api') */}
      {viewMode === 'api' && (
        <div className="space-y-6">
          {/* Section Heading */}
          <div className="flex items-center space-x-2 text-white">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold font-heading">cURL HTTP Telemetry Endpoints & Payload Specifications</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* GenAI LLM Inference Ingestion Box */}
            <div className="neon-panel p-6 space-y-4 border-cyan-500/40">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  1. Ingesting GenAI LLM Inference & Request/Response Messages (POST /v1/telemetry/event)
                </h3>
                <button
                  onClick={() => copyToClipboard(curlLlmInferenceCode, 'llm-inference')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 text-xs font-bold text-cyan-200 hover:text-white flex items-center gap-1.5 transition-all border border-cyan-800/50"
                >
                  {copiedSection === 'llm-inference' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'llm-inference' ? 'Copied LLM cURL!' : 'Copy cURL'}
                </button>
              </div>
              <p className="text-xs text-purple-200 font-medium">
                Log GenAI requests and responses via <code className="text-cyan-300 font-mono font-bold">eventType: "llm_inference"</code> with input prompt parameters (<code className="text-cyan-300 font-mono font-bold">params</code>), completion output (<code className="text-cyan-300 font-mono font-bold">results</code>), token counts, provider, and model.
              </p>
              <pre className="p-4 rounded-xl bg-[#0a0414] border border-cyan-900/50 text-xs text-cyan-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                {curlLlmInferenceCode}
              </pre>
            </div>

            {/* Agent Tool Call & OTel Span Box */}
            <div className="neon-panel p-6 space-y-4 border-fuchsia-500/40">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-fuchsia-400" />
                  2. Ingesting Autonomous Agent Tool Calls (POST /v1/telemetry/event)
                </h3>
                <button
                  onClick={() => copyToClipboard(curlSpanCode, 'span-ingest')}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50"
                >
                  {copiedSection === 'span-ingest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'span-ingest' ? 'Copied Tool cURL!' : 'Copy cURL'}
                </button>
              </div>
              <p className="text-xs text-purple-200 font-medium">
                Tool turns map sequential DAG trajectories (<code className="text-fuchsia-300 font-mono font-bold">previousToolName</code> &rarr; <code className="text-fuchsia-300 font-mono font-bold">invokedToolName</code>) with input parameters and execution outputs. <strong className="text-white">Strictly for autonomous agent tool reasoning turns.</strong>
              </p>
              <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                {curlSpanCode}
              </pre>
            </div>

            {/* Custom Events Box */}
            <div className="neon-panel p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  3. Ingesting Custom Analytic Events (POST /v1/telemetry/event)
                </h3>
                <button
                  onClick={() => copyToClipboard(curlCustomEventCode, 'custom-event')}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50"
                >
                  {copiedSection === 'custom-event' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'custom-event' ? 'Copied!' : 'Copy cURL'}
                </button>
              </div>
              <p className="text-xs text-purple-200 font-medium">
                Log custom user or agent telemetry events (e.g. <code className="text-amber-300 font-mono font-bold">button_click</code>, <code className="text-amber-300 font-mono font-bold">modal_open</code>, <code className="text-amber-300 font-mono font-bold">checkout_completed</code>) with arbitrary JSON parameters.
              </p>
              <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                {curlCustomEventCode}
              </pre>
            </div>

            {/* Page Views Ingestion Box */}
            <div className="neon-panel p-6 space-y-4 border-sky-500/40">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  4. Ingesting Web Page Views (POST /v1/telemetry/otlp/v1/traces)
                </h3>
                <button
                  onClick={() => copyToClipboard(curlPageViewCode, 'page-view')}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50"
                >
                  {copiedSection === 'page-view' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'page-view' ? 'Copied!' : 'Copy cURL'}
                </button>
              </div>
              <p className="text-xs text-purple-200 font-medium">
                Page views log human entity navigation via <code className="text-sky-300 font-mono font-bold">eventType: "page_view"</code> using standard OTLP trace payload.
              </p>
              <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                {curlPageViewCode}
              </pre>
            </div>

            {/* A/B Testing & Feedback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neon-panel p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white font-heading">5. Resolve Sticky A/B Experiments</h3>
                  <button
                    onClick={() => copyToClipboard(curlABCode, 'ab-test')}
                    className="px-2.5 py-1 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1 border border-purple-800/50"
                  >
                    {copiedSection === 'ab-test' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                  {curlABCode}
                </pre>
              </div>

              <div className="neon-panel p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white font-heading">6. Submit Session Feedback</h3>
                  <button
                    onClick={() => copyToClipboard(curlFeedbackCode, 'feedback')}
                    className="px-2.5 py-1 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1 border border-purple-800/50"
                  >
                    {copiedSection === 'feedback' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
                  {curlFeedbackCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BODY VIEW 2: AI AGENT SKILL.MD (when viewMode === 'skill') */}
      {viewMode === 'skill' && (
        <div className="space-y-6">
          {/* Section Heading */}
          <div className="flex items-center space-x-2 text-white">
            <Bot className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-base font-bold font-heading">AI Agent SKILL.md — Complete Agent Prompt Context</h3>
          </div>

          <div className="neon-panel p-6 space-y-4 border-fuchsia-500/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Bot className="w-4 h-4 text-fuchsia-400" />
                  ax-analytics-telemetry SKILL.md
                </h3>
                <p className="text-xs text-purple-200 font-medium mt-1">
                  Saved locally to <code className="text-fuchsia-300 font-mono font-bold">.agents/skills/ax-analytics-telemetry/SKILL.md</code>.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(curlSkillMarkdown, 'skill-curl-md')}
                className="px-3.5 py-2 rounded-lg bg-fuchsia-950 text-xs font-bold text-fuchsia-200 hover:text-white flex items-center gap-2 transition-all border border-fuchsia-800/60 shadow-lg shadow-fuchsia-950/40"
              >
                {copiedSection === 'skill-curl-md' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedSection === 'skill-curl-md' ? 'Copied Full SKILL.md!' : 'Copy Full SKILL.md'}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#090412] border border-purple-900/60 text-xs text-purple-200 space-y-1.5">
              <div className="flex items-center gap-2 text-fuchsia-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Agent Capability Guide</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Provide this skill file to autonomous agents or pair-programming LLMs. It equips them with the complete HTTP API contracts, prescriptive entity naming rules, automated preceding tool resolution logic (<code className="text-purple-100 font-mono">sessionLastToolMap</code>), and the strict boundaries preventing synthetic tool calls.
              </p>
            </div>

            <pre className="p-4 rounded-xl bg-[#0a0414] border border-fuchsia-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-[500px]">
              {curlSkillMarkdown}
            </pre>
          </div>
        </div>
      )}

      {/* METADATA DIMENSIONS & METRICS REFERENCE TABLE (Shown in both modes) */}
      <div className="neon-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Standard Telemetry Custom Metadata Dimensions & Metrics Contract (_v1)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-900/50 text-fuchsia-300 font-mono uppercase">
                <th className="py-2.5 px-3">Field Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description & System Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-purple-100">
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">entityType</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">'human' | 'agent' | optional</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Type of entity originating the event. Use <code className="text-cyan-300 font-bold">"agent"</code> for autonomous AI personas, <code className="text-cyan-300 font-bold">"human"</code> for user UI actions. <strong>Leave undefined / null</strong> for deterministic system workers or background routines.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">multiagentIdentity</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 font-semibold border border-fuchsia-800">Identity</span></td>
                <td className="py-2.5 px-3">System-wide multi-agent grouping identifier stamped on <strong>every event</strong> across the entire execution chain (e.g. <code className="text-fuchsia-300 font-mono">customer-triage-system</code>).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">invokedToolName</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Name of tool called. <strong>Strictly for autonomous agent tool invocations</strong> (e.g. MCP tools). Forms inner hub for Sunburst and target node in Trajectory Sankey diagrams.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">previousToolName</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Preceding tool invoked. Forms source node in multi-step Agent Trajectory diagrams. Auto-resolved via session registry if omitted.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">statusCode</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">Enum</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Status code (<code className="text-emerald-300 font-bold">SUCCESS</code>, <code className="text-rose-300 font-bold">PARAMETER_ERROR</code>, <code className="text-rose-300 font-bold">TIMEOUT</code>, <code className="text-rose-300 font-bold">MODEL_REFUSAL</code>). Feeds Successful vs Failed Sunburst hubs.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">provider</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">OTEL GenAI</span></td>
                <td className="py-2.5 px-3">LLM provider vendor (<code className="text-cyan-300">openai</code>, <code className="text-cyan-300">anthropic</code>, <code className="text-cyan-300">google</code>, <code className="text-cyan-300">ollama</code>).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">model</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">OTEL GenAI</span></td>
                <td className="py-2.5 px-3">LLM model string (<code className="text-cyan-300">gpt-4o</code>, <code className="text-cyan-300">claude-3-5-sonnet</code>).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">inputTokens</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">Number</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">OTEL GenAI</span></td>
                <td className="py-2.5 px-3">Prompt / Input token count (<code className="text-cyan-300 font-mono">gen_ai.usage.input_tokens</code>).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">outputTokens</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">Number</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">OTEL GenAI</span></td>
                <td className="py-2.5 px-3">Completion / Output token count (<code className="text-cyan-300 font-mono">gen_ai.usage.output_tokens</code>).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">params</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">JSON Object</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Tool JSON arguments or GenAI prompt request payload. Evaluated in Sunburst outer ring with the <strong className="text-fuchsia-300 font-bold">≥ 8% share threshold rule</strong>.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">results</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">JSON Object</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Payload</span></td>
                <td className="py-2.5 px-3">Output JSON return payload or GenAI LLM completion response content.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">executionTimeMs</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">Number (ms)</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">Metric</span></td>
                <td className="py-2.5 px-3">Turn duration in ms. Converted to <strong className="text-cyan-300 font-bold">Seconds to Resolution</strong> (ms / 1000) on dashboard cards.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">tokenCost</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">Number ($)</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">Metric</span></td>
                <td className="py-2.5 px-3">LLM token cost. Calculates <strong className="text-pink-300 font-bold">Cost Per Outcome</strong> (Total Cost / Successful Runs).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">otelTraceId</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Standard OTel 128-bit hex trace ID. Connects AX data grid rows back to Opik trace logs.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">assignedVariant</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String ('A'|'B')</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Sticky A/B experiment variant assigned for the session.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
