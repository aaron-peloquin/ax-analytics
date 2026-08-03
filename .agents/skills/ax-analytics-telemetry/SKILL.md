---
name: ax-analytics-telemetry
description: Comprehensive guidelines for AI coding agents to integrate AX Analytics telemetry, track tool calls, log web pageviews, resolve sticky A/B experiment variants, and send feedback using the TypeScript SDK or raw cURL.
---

# AX Analytics Telemetry Integration Skill

This skill provides step-by-step instructions for AI agents implementing AX Analytics telemetry tracking and sticky A/B experimentation.

## 1. Core Architecture Concepts
- **user_id / entityId**: Persistent identifier for a human user (`user_4821`) or AI agent (`sales-assistant`).
- **Tool Calls**: AI agent function execution turns (`invokedToolName` and `previousToolName`).
- **Sticky A/B Experimentation**: Deterministic variant resolution via `hash(entity_id + experiment_id) % 100`.

## 2. Integration via TypeScript Client SDK (`ax-analytics`)

### Step A: Installation & Setup
```typescript
import { createAXClient } from 'ax-analytics';

const ax = createAXClient({
  endpoint: 'http://localhost:4000',
  appKey: 'app_live_8832109'
});
```

### Step B: Tracking Agent Tool Calls & OTel Spans
```typescript
await ax.trackAgentToolCall({
  sessionId: 'opik_trace_883a92',
  agentIdentity: 'sales-assistant',
  toolName: 'search_products',
  previousToolName: 'init_session',
  params: { query: 'wireless headphones', filter_by_color: 'blue' },
  results: { count: 4 },
  statusCode: 'SUCCESS', // 'SUCCESS' | 'PARAMETER_ERROR' | 'TIMEOUT' | 'MODEL_REFUSAL'
  executionTimeMs: 340,
  tokenCost: 0.0024,
  otelTraceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  otelSpanId: '00f067aa0ba902b7',
  assignedVariant: 'B'
});
```

### Step C: Resolving Sticky A/B Experiment Variants
```typescript
const variant = await ax.getExperimentVariant({
  experimentKey: 'proactive_microcopy_tools',
  entityId: 'sales-assistant'
});
```

### Step D: Ingesting Web Page Views
```typescript
await ax.trackPageView({
  sessionId: 'web_sess_99201',
  userId: 'user_4821',
  pageUrl: '/products/headphones',
  pageTitle: 'Wireless Headphones'
});
```

## 3. Integration via Raw cURL HTTP Calls

### Ingest Telemetry Event / Tool Call (`POST /v1/telemetry/event`)
```bash
curl -X POST http://localhost:4000/v1/telemetry/event \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "app_live_8832109",
    "sessionId": "opik_trace_883a92",
    "entityId": "sales-assistant",
    "entityType": "agent",
    "eventType": "tool_call",
    "invokedToolName": "search_products",
    "previousToolName": "init_session",
    "params": { "query": "wireless headphones" },
    "statusCode": "SUCCESS",
    "executionTimeMs": 340,
    "tokenCost": 0.0024
  }'
```

### Resolve Sticky A/B Experiment (`POST /v1/experiments/variant`)
```bash
curl -X POST http://localhost:4000/v1/experiments/variant \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "app_live_8832109",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "sales-assistant"
  }'
```
