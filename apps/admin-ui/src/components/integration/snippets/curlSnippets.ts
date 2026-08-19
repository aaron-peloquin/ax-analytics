export const curlLlmInferenceCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
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

export const curlSpanCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
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

export const curlCustomEventCode = `curl -X POST http://localhost:4400/v1/telemetry/event \\
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

export const curlPageViewCode = `curl -X POST http://localhost:4400/v1/traces \\
  -H "Content-Type: application/json" \\
  -d '{
    "resourceSpans": [
      {
        "resource": {
          "attributes": [
            { "key": "service.name", "value": { "stringValue": "web-frontend" } },
            { "key": "app_key", "value": { "stringValue": "customer_support_prod" } }
          ]
        },
        "scopeSpans": [
          {
            "spans": [
              {
                "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
                "spanId": "00f067aa0ba902b7",
                "name": "documentLoad",
                "attributes": [
                  { "key": "url.path", "value": { "stringValue": "/products/headphones" } },
                  { "key": "document.title", "value": { "stringValue": "Wireless Headphones" } },
                  { "key": "user.type", "value": { "stringValue": "human" } },
                  { "key": "session.id", "value": { "stringValue": "web_sess_99201" } }
                ]
              }
            ]
          }
        ]
      }
    ]
  }'`;

export const curlABCode = `curl -X POST http://localhost:4400/v1/experiments/variant \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "experimentKey": "proactive_microcopy_tools",
    "entityId": "retrieval-agent"
  }'`;

export const curlFeedbackCode = `curl -X POST http://localhost:4400/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{
    "appKey": "customer_support_prod",
    "sessionId": "sess_usr_98124_chat",
    "entityId": "retrieval-agent",
    "vote": 1,
    "comment": "Resolved inquiry in 1 turn with accurate RAG context!"
  }'`;
