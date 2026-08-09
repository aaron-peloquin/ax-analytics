import React, { useState } from 'react';
import { Copy, Check, Terminal, BookOpen, Layers, Globe, User, Wrench, Activity, Bot, Code2, FileCode, Zap, Eye } from 'lucide-react';

export function IntegrationGuide(): React.ReactElement {
  const [activeFormat, setActiveFormat] = useState<'curl' | 'ts' | 'python' | 'kotlin' | 'skill'>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // cURL Code Snippets
  const curlCustomEventCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "web_sess_99201",
    "entityId": "user_4821",
    "entityType": "human",
    "eventType": "button_click",
    "params": {
      "buttonId": "checkout_btn",
      "cartValue": 149.99
    }
  }'`;

  const curlPageViewCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "web_sess_99201",
    "entityId": "user_4821",
    "entityType": "human",
    "eventType": "page_view",
    "params": {
      "pageUrl": "/products/headphones",
      "pageTitle": "Wireless Headphones - Shop",
      "referrer": "https://google.com"
    }
  }'`;

  const curlSpanCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
  -H "Content-Type: application/json" \\
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
  }'`;

  const curlABCode = `curl -X POST http://localhost:4400/v1/experiments/variant \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "app_live_8832109",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "sales-assistant"
  }'`;

  const curlFeedbackCode = `curl -X POST http://localhost:4400/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "sales-assistant",
    "vote": 1,
    "comment": "Resolved product inquiry in 1 turn!"
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
  readonly entityType: EntityType_v1;
  readonly eventType: string;
  readonly invokedToolName?: string;
  readonly previousToolName?: string;
  readonly params?: Record<string, unknown>;
  readonly results?: Record<string, unknown>;
  readonly statusCode?: EventStatusCode_v1;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
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
    entityId: str = Field(..., description="User or Agent identity ID")
    entityType: EntityType_v1 = Field(default="agent")
    eventType: str = Field(default="tool_call")
    invokedToolName: Optional[str] = None
    previousToolName: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    statusCode: Optional[EventStatusCode_v1] = Field(default="SUCCESS")
    tokenCost: Optional[float] = None
    executionTimeMs: Optional[int] = None
    otelTraceId: Optional[str] = None
    otelSpanId: Optional[str] = None
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
    val entityType: EntityType_v1 = EntityType_v1.agent,
    val eventType: String = "tool_call",
    val invokedToolName: String? = null,
    val previousToolName: String? = null,
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

  // cURL SKILL.md Markdown
  const curlSkillMarkdown = `---
name: ax-analytics-telemetry
description: Comprehensive language-agnostic HTTP API specification and SDK integration manual for AX Analytics telemetry ingestion, prescriptive agent entity naming, automated trajectory flow tracking, sticky A/B experiment assignment, assignment resets, session feedback, and OpenTelemetry trace correlation. Activate this skill whenever implementing or querying AX Analytics, logging agent tool calls, tracking Sankey trajectory flows, resolving experiment variants, or configuring agent telemetry.
---

# AX Analytics Telemetry Integration Skill

## System Overview

AX Analytics is a high-throughput, language-agnostic AI agent and web telemetry platform. It provides real-time visualization of multi-turn AI agent trajectory flows (Sankey diagrams), parameter friction heatmaps, side-by-side tool performance hubs (Sunburst charts), sticky A/B experiment resolution, and OpenTelemetry / Opik trace correlation.

### Key Operational Capabilities

- **Agent Trajectory Flows**: Maps sequential tool turns (previousToolName -> invokedToolName) into Directed Acyclic Graph (DAG) Sankey flows.
- **Outcome Metrics**: Measures Seconds to Resolution (executionTimeMs / 1000) and Cost Per Outcome ($ expenditure per successful run).
- **Sticky A/B Experimentation**: Deterministic 0-100% variant hashing based on hash(entity_id + experiment_id) % 100.
- **Parameter Share Analysis**: Evaluates parameter values with an automatic ≥ 8% share threshold grouping rule.
- **OpenTelemetry Correlation**: Direct trace/span mapping via W3C traceparent headers (otelTraceId, otelSpanId).

---

## Language-Agnostic Context & Accompanying Type Definitions

This skill defines language-agnostic HTTP API contracts and architectural patterns. Integration code SHOULD consume or reference accompanying target language type definitions (e.g. TelemetryEvent_v1, EventStatusCode_v1, EntityType_v1, ExperimentVariantRequest_v1, SessionFeedback_v1). If target language definitions are missing in your environment, request or generate matching structural models (TypeScript types, Python Pydantic models, Go structs, Rust structs, etc.).

---

## Prescriptive Agent Entity Naming Standard (entityId)

To ensure accurate aggregation across Sankey flow diagrams and Sunburst hubs, callers MUST adhere to prescriptive entity naming conventions for entityId:

1. **Agent Personas**: Use clean, descriptive hyphenated or colon-scoped names representing the specific AI persona or agent role (e.g. dm-persona, bookkeeper-agent, sales-assistant).
2. **System & Route Endpoints**: When telemetry originates from internal service routes or MCP servers, set entityId to the endpoint path (e.g. /api/appin/campaign-chat, /api/mcp).
3. **Stage-Aware Execution Contexts**: Append execution stages for fine-grained trajectory tracking when an agent transitions through phases (e.g. "livekit agent: bootup" during initial tool warming vs "livekit-agent" during live interaction).
4. **Deterministic Fallback Cascade**: When entityId is omitted, SDKs and clients MUST evaluate fallbacks in order of specificity:
   entityId -> persona -> service route path -> "agent-service".

---

## Automated Session Trajectory Flow Tracking

To eliminate manual caller overhead when recording sequential tool invocations, SDKs and clients SHOULD maintain an in-memory session registry (sessionLastToolMap):

- **Automatic Preceding Tool Lookup**: When an event with eventType: "tool_call" is logged without an explicit previousToolName, retrieve the preceding tool from sessionLastToolMap.get(sessionId).
- **Bootstrap Initialization**: If no preceding tool exists for sessionId, default previousToolName to "init_session".
- **Registry Update**: Immediately update the session registry with sessionLastToolMap.set(sessionId, invokedToolName).

---

## Dynamic Endpoint & Environment Configuration

Client integrations SHOULD dynamically resolve host and app key configurations based on runtime environment context:

- **Browser Environments**: Proxy ingestion requests through /api/ax-analytics (via Next.js rewrite or equivalent web server proxy) to avoid CORS issues and expose a unified endpoint.
- **Server Environments**: Read environment variables AX_ANALYTICS_HOST or NEXT_PUBLIC_AX_ANALYTICS_HOST, falling back to http://localhost:4400.
- **App Key Resolution**: Read AX_ANALYTICS_APP_KEY or NEXT_PUBLIC_AX_ANALYTICS_APP_KEY, falling back to default application keys (e.g. app_live_8832109).

---

## Ingestion Payload Field Contract (_v1)

| Field Name | Type | Required | Category | Description & System Usage |
| :--- | :--- | :--- | :--- | :--- |
| appKey | string | Yes | System | Environment key identifier (e.g. customer_support_prod). Used to scope analytics to an app/tenant environment. |
| sessionId | string | No | Identity | Trace ID or session GUID. Connects multi-turn agent execution steps into Sankey flows. Auto-generated by server if omitted. |
| multiagentIdentity | string | No | Identity | System-wide multi-agent grouping identifier stamped across ALL events emitted by any participating agent in the execution chain (e.g. customer-triage-system, code-review-pipeline). |
| entityId | string | Yes | Identity | Persistent identifier for human user (user_4821), agent persona (sales-assistant), endpoint (/api/mcp), or stage (rag-agent: warming). Used in sticky A/B hashing hash(entity_id + exp_id) % 100. |
| entityType | 'human' \| 'agent' | No | Dimension | Type of entity originating the event. Defaults to 'agent'. Use 'human' for frontend web events. |
| eventType | string | No | Dimension | Event type identifier ('tool_call', 'llm_inference', 'page_view', 'button_click'). Defaults to 'tool_call'. |
| invokedToolName | string | No | Dimension | Tool invoked by the agent (search_products). Forms inner hub for Sunburst & target node in Sankey. |
| previousToolName | string | No | Dimension | Preceding tool invoked (init_session). Forms source node in Sankey trajectory flow diagrams. Automatically populated if omitted. |
| provider | string | No | OTEL GenAI | LLM Vendor / System provider (gen_ai.system, e.g., 'openai', 'anthropic', 'google', 'ollama'). |
| model | string | No | OTEL GenAI | LLM Model string (gen_ai.request.model, e.g., 'gpt-4o', 'claude-3-5-sonnet'). |
| inputTokens | number | No | OTEL GenAI | Prompt / Input token count (gen_ai.usage.input_tokens). |
| outputTokens | number | No | OTEL GenAI | Completion / Output token count (gen_ai.usage.output_tokens). |
| params | object | No | Dimension | Tool JSON parameters. Evaluated in Sunburst outer ring with the ≥ 8% share threshold rule and Parameter Heatmaps. |
| results | object | No | Payload | Output JSON result object or LLM output content. |
| statusCode | Enum | No | Dimension | Outcome status (SUCCESS, PARAMETER_ERROR, TIMEOUT, AUTH_DENIED, MODEL_REFUSAL, ASSERTION_FAILED). Feeds Successful vs Failed Sunburst hubs. |
| executionTimeMs | number | No | Metric | Turn duration in milliseconds. Converted to Seconds to Resolution (executionTimeMs / 1000) on outcome cards. |
| tokenCost | number | No | Metric | Turn LLM token expenditure in USD ($). Used to calculate Cost Per Outcome (Total Cost / Successful Runs). |
| otelTraceId | string | No | Dimension | OpenTelemetry 128-bit hex trace ID extracted from W3C traceparent. Links telemetry rows directly to Opik trace logs. |
| otelSpanId | string | No | Dimension | OpenTelemetry 64-bit hex span ID. |
| assignedVariant | string | No | Dimension | Sticky A/B experiment variant assigned for the session ('A', 'B', defaulting to 'Standard'). |

---

## Sequential Integration Workflow

1. **Initialize Session Context**: Extract W3C traceparent (00-<traceId>-<spanId>-01) or provide a unique sessionId (or let server auto-generate).
2. **Resolve Experiment Variant (Optional)**: Query POST /v1/experiments/variant with experimentKey and prescriptive entityId.
3. **Execute Tool / LLM Inference**: Record turn start time and execute the requested agent tool or inference.
4. **Emit Telemetry Event**: Call POST /v1/telemetry/event (or helper function trackAgentToolCall) with execution time, token cost, input/output tokens, provider, model, parameters, results, and trace IDs.
5. **Submit User Feedback**: Send thumbs up/down votes and comments via POST /v1/feedback at session completion.

---

## API Endpoints & cURL Specifications

> [!TIP]
> Before making new network requests, search for an reuse any existing helpers that previous engineers may have already setup for your project.

### 1. Ingest Telemetry Event / Tool Call (POST /v1/telemetry/event)
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

### 2. Ingest Non-Tool LLM Inference (POST /v1/telemetry/event)
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
    "results": { "response": "Summary generated for user query." },
    "statusCode": "SUCCESS",
    "executionTimeMs": 450,
    "tokenCost": 0.0032
  }'
\`\`\`

### 3. Resolve Sticky A/B Experiment (POST /v1/experiments/variant)
\`\`\`bash
curl -X POST http://localhost:4400/v1/experiments/variant \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "experimentKey": "proactive_rag_retrieval_v2",
    "entityId": "retrieval-agent"
  }'
\`\`\`

### 4. Reset Sticky User/Agent Assignments (POST /v1/experiments/reset-assignments)
\`\`\`bash
curl -X POST http://localhost:4400/v1/experiments/reset-assignments \\
  -H "Content-Type: application/json" \\
  -d '{
    "experimentKey": "proactive_rag_retrieval_v2"
  }'
\`\`\`

### 5. Submit Session Feedback (POST /v1/feedback)
\`\`\`bash
curl -X POST http://localhost:4400/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "entityId": "retrieval-agent",
    "vote": 1,
    "comment": "Resolved user query accurately with RAG context."
  }'
\`\`\``;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="neon-panel p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-900/50 text-fuchsia-300 border border-purple-500/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Language-Agnostic cURL HTTP API & Type Contracts (_v1)</h2>
              <p className="text-xs text-purple-200 font-medium mt-1">
                cURL HTTP endpoints, type definitions for TypeScript, Python (Pydantic), and Kotlin, plus AI Agent SKILL.md instructions.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-[#0f071e] rounded-xl border border-purple-900/60 flex-wrap gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveFormat('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'curl'
                  ? 'bg-purple-900/70 text-fuchsia-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              cURL HTTP API
            </button>

            <button
              onClick={() => setActiveFormat('ts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'ts'
                  ? 'bg-purple-900/70 text-fuchsia-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              TypeScript (_v1)
            </button>

            <button
              onClick={() => setActiveFormat('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'python'
                  ? 'bg-amber-900/70 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              Pydantic (_v1)
            </button>

            <button
              onClick={() => setActiveFormat('kotlin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'kotlin'
                  ? 'bg-sky-900/70 text-sky-200 border border-sky-500/50 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              Kotlin (_v1)
            </button>

            <button
              onClick={() => setActiveFormat('skill')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFormat === 'skill'
                  ? 'bg-fuchsia-900/70 text-fuchsia-200 border border-fuchsia-500/50 shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
              cURL SKILL.md
            </button>
          </div>
        </div>
      </div>

      {/* Core Concepts Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="neon-panel p-5 border-purple-500/40">
          <div className="flex justify-between items-center text-purple-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">What is a user_id?</span>
            <User className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            A <strong className="text-fuchsia-300 font-mono font-bold">user_id</strong> (or <code className="text-fuchsia-300 font-mono font-bold">entityId</code>) is a persistent identifier for a human user (e.g. <code className="text-purple-100 font-mono font-bold">user_4821</code>) or an AI agent entity (e.g. <code className="text-purple-100 font-mono font-bold">sales-assistant</code>).
          </p>
          <span className="text-xs text-purple-200 font-medium mt-3 block">
            Used in deterministic sticky A/B hashing: <code className="text-fuchsia-300 font-mono font-bold">hash(entity_id + experiment_id) % 100</code>
          </span>
        </div>

        <div className="neon-panel p-5 border-fuchsia-500/40">
          <div className="flex justify-between items-center text-fuchsia-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">What is a Tool Call?</span>
            <Wrench className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            A <strong className="text-fuchsia-300 font-mono font-bold">Tool Call</strong> represents an execution turn by an AI agent invoking a function (e.g. <code className="text-purple-100 font-mono font-bold">search_products</code>) with JSON parameters and output results.
          </p>
          <span className="text-xs text-fuchsia-300 font-medium mt-3 block">
            Feeds Trajectory Sankey Flow maps and side-by-side Sunburst hubs.
          </span>
        </div>

        <div className="neon-panel p-5 border-cyan-500/40">
          <div className="flex justify-between items-center text-cyan-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">What are Analytic Events?</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-purple-100 font-normal leading-relaxed">
            <strong className="text-cyan-300 font-mono font-bold">Analytic Events</strong> are high-throughput telemetry records capturing page views, button clicks, tool turns, latency duration, token costs, and OpenTelemetry trace/span IDs.
          </p>
          <span className="text-xs text-cyan-300 font-medium mt-3 block">
            Ingested in real time and stored in time-series MergeTree tables.
          </span>
        </div>
      </div>

      {/* Language Type Contracts & cURL Views */}
      {activeFormat === 'ts' && (
        <div className="neon-panel p-6 space-y-4 border-purple-500/50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Code2 className="w-4 h-4 text-fuchsia-400" />
              TypeScript Telemetry Type Contracts (_v1)
            </h3>
            <button
              onClick={() => copyToClipboard(tsTypesCode, 'ts-types')}
              className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50"
            >
              {copiedSection === 'ts-types' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'ts-types' ? 'Copied Types!' : 'Copy TypeScript _v1 Types'}
            </button>
          </div>
          <p className="text-xs text-purple-200 font-medium">
            Copy and paste these TypeScript <code className="text-fuchsia-300 font-mono font-bold">_v1</code> type definitions into your client codebase.
          </p>
          <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-96">
            {tsTypesCode}
          </pre>
        </div>
      )}

      {activeFormat === 'python' && (
        <div className="neon-panel p-6 space-y-4 border-amber-500/50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              Python Pydantic Telemetry Type Contracts (_v1)
            </h3>
            <button
              onClick={() => copyToClipboard(pythonTypesCode, 'python-types')}
              className="px-3 py-1.5 rounded-lg bg-amber-950 text-xs font-bold text-amber-200 hover:text-white flex items-center gap-1.5 transition-all border border-amber-800/50"
            >
              {copiedSection === 'python-types' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'python-types' ? 'Copied Pydantic!' : 'Copy Pydantic _v1 Models'}
            </button>
          </div>
          <p className="text-xs text-purple-200 font-medium">
            Copy and paste these Pydantic v2 <code className="text-amber-300 font-mono font-bold">_v1</code> model definitions into your Python services.
          </p>
          <pre className="p-4 rounded-xl bg-[#0a0414] border border-amber-900/50 text-xs text-amber-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-96">
            {pythonTypesCode}
          </pre>
        </div>
      )}

      {activeFormat === 'kotlin' && (
        <div className="neon-panel p-6 space-y-4 border-sky-500/50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              Kotlin Serializable Data Class Contracts (_v1)
            </h3>
            <button
              onClick={() => copyToClipboard(kotlinTypesCode, 'kotlin-types')}
              className="px-3 py-1.5 rounded-lg bg-sky-950 text-xs font-bold text-sky-200 hover:text-white flex items-center gap-1.5 transition-all border border-sky-800/50"
            >
              {copiedSection === 'kotlin-types' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'kotlin-types' ? 'Copied Kotlin!' : 'Copy Kotlin _v1 Classes'}
            </button>
          </div>
          <p className="text-xs text-purple-200 font-medium">
            Copy and paste these Kotlin <code className="text-sky-300 font-mono font-bold">_v1</code> kotlinx.serialization data classes into your Kotlin/JVM applications.
          </p>
          <pre className="p-4 rounded-xl bg-[#0a0414] border border-sky-900/50 text-xs text-sky-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-96">
            {kotlinTypesCode}
          </pre>
        </div>
      )}

      {activeFormat === 'skill' && (
        <div className="neon-panel p-6 space-y-4 border-fuchsia-500/50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Bot className="w-4 h-4 text-fuchsia-400" />
              AI Agent SKILL.md — Language-Agnostic cURL Skill File & Input Contract
            </h3>
            <button
              onClick={() => copyToClipboard(curlSkillMarkdown, 'skill-curl-md')}
              className="px-3 py-1.5 rounded-lg bg-fuchsia-950 text-xs font-bold text-fuchsia-200 hover:text-white flex items-center gap-1.5 transition-all border border-fuchsia-800/50"
            >
              {copiedSection === 'skill-curl-md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'skill-curl-md' ? 'Copied cURL SKILL.md!' : 'Copy cURL SKILL.md'}
            </button>
          </div>
          <p className="text-xs text-purple-200 font-medium">
            Saved to <code className="text-fuchsia-300 font-mono font-bold">.agents/skills/ax-analytics-telemetry/SKILL.md</code>. Gives AI agents complete system context, operational purpose, entity naming rules, and input field contract details.
          </p>
          <pre className="p-4 rounded-xl bg-[#0a0414] border border-fuchsia-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words max-h-96">
            {curlSkillMarkdown}
          </pre>
        </div>
      )}

      {activeFormat === 'curl' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Custom Events Box */}
          <div className="neon-panel p-6 space-y-4 border-fuchsia-500/40">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <Zap className="w-4 h-4 text-fuchsia-400" />
                1. Ingesting Custom Analytic Events (cURL HTTP Command)
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
              Log custom user or agent telemetry events (e.g. <code className="text-fuchsia-300 font-mono font-bold">button_click</code>, <code className="text-fuchsia-300 font-mono font-bold">modal_open</code>, <code className="text-fuchsia-300 font-mono font-bold">checkout_completed</code>) with arbitrary JSON parameters.
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
                2. Ingesting Web Page Views (cURL HTTP Command)
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
              Page views log human entity navigation via <code className="text-sky-300 font-mono font-bold">eventType: "page_view"</code>.
            </p>
            <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
              {curlPageViewCode}
            </pre>
          </div>

          {/* Agent Tool Call & OTel Span Box */}
          <div className="neon-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <Terminal className="w-4 h-4 text-fuchsia-400" />
                3. Ingesting Agent Tool Calls & OTel Spans (cURL HTTP Command)
              </h3>
              <button
                onClick={() => copyToClipboard(curlSpanCode, 'span-ingest')}
                className="px-3 py-1.5 rounded-lg bg-purple-950 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all border border-purple-800/50"
              >
                {copiedSection === 'span-ingest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'span-ingest' ? 'Copied!' : 'Copy cURL'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#0a0414] border border-purple-900/50 text-xs text-fuchsia-200 font-mono max-w-full overflow-x-auto whitespace-pre-wrap sm:whitespace-pre break-words">
              {curlSpanCode}
            </pre>
          </div>

          {/* A/B Testing & Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="neon-panel p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-heading">4. Resolve Sticky A/B Experiments</h3>
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
                <h3 className="text-sm font-bold text-white font-heading">5. Submit Session Feedback</h3>
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
      )}

      {/* Metadata Dimensions & Metrics Reference Table */}
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
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">statusCode</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">Enum</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Status code (<code className="text-emerald-300 font-bold">SUCCESS</code>, <code className="text-rose-300 font-bold">PARAMETER_ERROR</code>, <code className="text-rose-300 font-bold">TIMEOUT</code>, <code className="text-rose-300 font-bold">MODEL_REFUSAL</code>). Feeds Successful vs Failed Sunburst hubs.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">invokedToolName</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Name of tool called. Forms inner hub for Sunburst and target node in Trajectory Sankey diagrams.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">previousToolName</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">String</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Preceding tool invoked. Forms source node in multi-step Agent Trajectory diagrams.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-fuchsia-300 font-bold">params</td>
                <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">JSON Object</td>
                <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 font-semibold border border-purple-800">Dimension</span></td>
                <td className="py-2.5 px-3">Tool JSON arguments. Evaluated in Sunburst outer ring with the <strong className="text-fuchsia-300 font-bold">≥ 8% share threshold rule</strong>.</td>
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
