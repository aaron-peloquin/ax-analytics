import { TelemetryEvent, EventStatusCode } from '../types/telemetry.js';

interface OtlpAnyValue {
  readonly stringValue?: string;
  readonly intValue?: number | string;
  readonly doubleValue?: number;
  readonly boolValue?: boolean;
}

interface OtlpAttribute {
  readonly key: string;
  readonly value?: OtlpAnyValue | unknown;
}

interface OtlpSpan {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly name?: string;
  readonly startTimeUnixNano?: string | number;
  readonly endTimeUnixNano?: string | number;
  readonly attributes?: readonly OtlpAttribute[];
  readonly status?: { readonly code?: number };
}

interface OtlpScopeSpan {
  readonly spans?: readonly OtlpSpan[];
}

interface OtlpResourceSpan {
  readonly resource?: {
    readonly attributes?: readonly OtlpAttribute[];
  };
  readonly scopeSpans?: readonly OtlpScopeSpan[];
}

export interface OtlpPayload {
  readonly resourceSpans?: readonly OtlpResourceSpan[];
}

function parseAttributeValue(val: unknown): unknown {
  if (val === null || val === undefined) return undefined;
  if (typeof val !== 'object') return val;
  const anyVal = val as OtlpAnyValue;
  if (anyVal.stringValue !== undefined) return anyVal.stringValue;
  if (anyVal.intValue !== undefined) return Number(anyVal.intValue);
  if (anyVal.doubleValue !== undefined) return Number(anyVal.doubleValue);
  if (anyVal.boolValue !== undefined) return anyVal.boolValue;
  return val;
}

function extractAttributeMap(attrs?: readonly OtlpAttribute[]): Record<string, unknown> {
  if (!attrs || !Array.isArray(attrs)) return {};
  const map: Record<string, unknown> = {};
  for (const attr of attrs) {
    if (attr && typeof attr.key === 'string') {
      map[attr.key] = parseAttributeValue(attr.value);
    }
  }
  return map;
}

export function otlpToTelemetryEvents(payload: OtlpPayload): readonly TelemetryEvent[] {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.resourceSpans)) {
    return [];
  }

  const events: TelemetryEvent[] = [];

  for (const resourceSpan of payload.resourceSpans) {
    const resourceAttrs = extractAttributeMap(resourceSpan.resource?.attributes);
    const scopeSpans = resourceSpan.scopeSpans || [];

    for (const scopeSpan of scopeSpans) {
      const spans = scopeSpan.spans || [];

      for (const span of spans) {
        const spanAttrs = extractAttributeMap(span.attributes);
        const combinedAttrs = { ...resourceAttrs, ...spanAttrs };

        const otelTraceId = span.traceId || (combinedAttrs['trace_id'] as string);
        const otelSpanId = span.spanId || (combinedAttrs['span_id'] as string);

        const provider = (combinedAttrs['gen_ai.system'] || combinedAttrs['provider'] || combinedAttrs['gen_ai.provider']) as string | undefined;
        const model = (combinedAttrs['gen_ai.request.model'] || combinedAttrs['model']) as string | undefined;
        const inputTokens = (combinedAttrs['gen_ai.usage.input_tokens'] ?? combinedAttrs['input_tokens'] ?? combinedAttrs['inputTokens']) as number | undefined;
        const outputTokens = (combinedAttrs['gen_ai.usage.output_tokens'] ?? combinedAttrs['output_tokens'] ?? combinedAttrs['outputTokens']) as number | undefined;
        const tokenCost = (combinedAttrs['token_cost'] ?? combinedAttrs['tokenCost']) as number | undefined;

        let executionTimeMs: number | undefined;
        if (span.startTimeUnixNano && span.endTimeUnixNano) {
          const start = BigInt(span.startTimeUnixNano);
          const end = BigInt(span.endTimeUnixNano);
          const nanoDiff = Number(end - start);
          if (!isNaN(nanoDiff) && nanoDiff >= 0) {
            executionTimeMs = Math.round(nanoDiff / 1_000_000);
          }
        }

        const entityId = (combinedAttrs['entity_id'] || combinedAttrs['entityId'] || combinedAttrs['service.name'] || 'agent-service') as string;
        const appKey = (combinedAttrs['app_key'] || combinedAttrs['appKey'] || 'adm_live_8832109') as string;
        const sessionId = (combinedAttrs['session_id'] || combinedAttrs['sessionId'] || otelTraceId || `ax_sess_otlp_${Date.now()}`) as string;
        const multiagentIdentity = (combinedAttrs['multiagent_identity'] || combinedAttrs['multiagentIdentity']) as string | undefined;
        const invokedToolName = (combinedAttrs['invoked_tool_name'] || combinedAttrs['invokedToolName'] || span.name) as string | undefined;
        const previousToolName = (combinedAttrs['previous_tool_name'] || combinedAttrs['previousToolName']) as string | undefined;

        let statusCode: EventStatusCode | undefined;
        if (combinedAttrs['status_code'] && typeof combinedAttrs['status_code'] === 'string') {
          statusCode = combinedAttrs['status_code'] as EventStatusCode;
        } else if (span.status?.code === 1) {
          statusCode = 'SUCCESS';
        }

        const event: TelemetryEvent = {
          timestamp: new Date().toISOString(),
          appKey,
          sessionId,
          entityId,
          entityType: (combinedAttrs['entity_type'] as 'human' | 'agent') || 'agent',
          eventType: (combinedAttrs['event_type'] as string) || (invokedToolName ? 'tool_call' : 'llm_inference'),
          multiagentIdentity,
          invokedToolName,
          previousToolName,
          provider,
          model,
          inputTokens: inputTokens !== undefined ? Number(inputTokens) : undefined,
          outputTokens: outputTokens !== undefined ? Number(outputTokens) : undefined,
          tokenCost: tokenCost !== undefined ? Number(tokenCost) : undefined,
          executionTimeMs,
          statusCode,
          otelTraceId,
          otelSpanId
        };

        events.push(event);
      }
    }
  }

  return events;
}
