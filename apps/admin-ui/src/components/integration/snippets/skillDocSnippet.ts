export const curlSkillMarkdown = `---
name: ax-analytics-telemetry
description: Comprehensive language-agnostic HTTP API specification and SDK integration manual for AX Analytics telemetry ingestion, prescriptive agent entity naming, 3-tier metadata grouping (sessionId, multiagentIdentity, agentIdentity), OpenTelemetry GenAI attributes, automated trajectory flow tracking, sticky A/B experiment assignment, assignment resets, session feedback, and OTEL trace correlation. Activate this skill whenever implementing or querying AX Analytics, logging agent tool calls, tracking Sankey trajectory flows, resolving experiment variants, or configuring agent telemetry.
---

# AX Analytics Telemetry Integration Skill

## System Overview

AX Analytics is a high-throughput, language-agnostic AI agent and web telemetry platform. It provides real-time visualization of multi-turn AI agent trajectory flows (Sankey diagrams), side-by-side tool performance hubs (Sunburst charts), sticky A/B experiment resolution, and OpenTelemetry trace correlation.

### Key Operational Capabilities

- **Agent Trajectory Flows**: Maps sequential tool turns (previousToolName -> invokedToolName) into Directed Acyclic Graph (DAG) Sankey flows.
- **Outcome Metrics**: Measures Seconds to Resolution (executionTimeMs / 1000) and Cost Per Outcome ($ expenditure per successful run).
- **Sticky A/B Experimentation**: Deterministic 0-100% variant hashing based on hash(entity_id + experiment_id) % 100.
- **Parameter Share Analysis**: Evaluates parameter values with an automatic >= 8% share threshold grouping rule.
- **OpenTelemetry Correlation**: Direct trace/span mapping via W3C traceparent headers (otelTraceId, otelSpanId).

---

## Telemetry Semantics & OpenTelemetry Boundary Guidelines

### 1. Agent Tool Calls vs. Internal Code Execution (Temporal Activities, DB, STT/TTS)
- **Strictly Agentic**: \`eventType: "tool_call"\` (and \`invokedToolName\`) is strictly reserved for Agentic Tool Invocations - specifically when an AI agent reasons and autonomously decides to call an external tool (e.g., an MCP server tool).
- **No Synthetic Tool Calls for Background Code**: Standard code-level tasks or background workflow activities MUST NOT emit synthetic \`tool_call\` events to AX Analytics.
- **OTel Span Correlation**: Low-level execution timing and error traces belong in OpenTelemetry spans, correlated via \`otelTraceId\` and \`otelSpanId\`.

### 2. Entity Type (\`entityType\`) Semantics
- \`entityType: "agent"\`: Attached when an AI persona or agent entity explicitly takes an autonomous action.
- \`entityType: "human"\`: Used for real human user interactions (e.g. UI clicks, frontend page views).
- **Deterministic System Workers**: If deterministic backend code is running a routine function, \`entityType\` MUST be left undefined.

---

## 3-Tier Identity Taxonomy & Metadata Groupings

| Scope Level | Field Name | Architectural Purpose & Definition | Concrete Example |
| :--- | :--- | :--- | :--- |
| **1. User Journey Scope** | \`sessionId\` | Binds the user request journey across multi-turn interactions over time. | \`"sess_usr_98124_chat"\` |
| **2. Multi-Agent System Scope** | \`multiagentIdentity\` | System-wide multi-agent grouping identifier stamped across participating agents. | \`"customer-triage-system"\` |
| **3. Individual Agent Scope** | \`entityId\` | Identifies the specific AI agent persona executing that turn. | \`"retrieval-agent"\` |

---

## Endpoints Quick Reference

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
    "params": { "prompt": "Summarize customer refund conversation." },
    "results": { "response": "Refund resolution issued under policy #402." },
    "statusCode": "SUCCESS",
    "executionTimeMs": 450,
    "tokenCost": 0.0032
  }'
\`\`\`
`;
