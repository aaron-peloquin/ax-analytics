import { TelemetryEvent, EventStatusCode } from '../types/telemetry.js';
import { extractAttributeMap, OtlpAttribute } from './extractAttributeMap.js';
import { calculateMsDuration } from './calculateMsDuration.js';

interface OtlpSpan {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
  readonly name?: string;
  readonly startTimeUnixNano?: string | number;
  readonly endTimeUnixNano?: string | number;
  readonly startTime?: readonly [number, number] | string | number;
  readonly endTime?: readonly [number, number] | string | number;
  readonly attributes?: readonly OtlpAttribute[] | Record<string, unknown>;
  readonly status?: { readonly code?: number };
}

interface OtlpScopeSpan {
  readonly spans?: readonly OtlpSpan[];
}

interface OtlpResourceSpan {
  readonly resource?: {
    readonly attributes?: readonly OtlpAttribute[] | Record<string, unknown>;
  };
  readonly scopeSpans?: readonly OtlpScopeSpan[];
}

export interface OtlpPayload {
  readonly resourceSpans?: readonly OtlpResourceSpan[];
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
  readonly name?: string;
  readonly startTime?: readonly [number, number] | string | number;
  readonly endTime?: readonly [number, number] | string | number;
  readonly attributes?: Record<string, unknown>;
  readonly resource?: { readonly attributes?: Record<string, unknown> };
}

export function otlpToTelemetryEvents(payload: OtlpPayload): readonly TelemetryEvent[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const resourceSpans: readonly OtlpResourceSpan[] = payload.resourceSpans || (
    payload.traceId || payload.name ? [{
      resource: payload.resource,
      scopeSpans: [{
        spans: [{
          traceId: payload.traceId,
          spanId: payload.spanId,
          parentSpanId: payload.parentSpanId,
          name: payload.name,
          startTime: payload.startTime,
          endTime: payload.endTime,
          attributes: payload.attributes
        }]
      }]
    }] : []
  );

  const events: TelemetryEvent[] = [];

  for (const resourceSpan of resourceSpans) {
    const resourceAttrs = extractAttributeMap(resourceSpan.resource?.attributes);
    const scopeSpans = resourceSpan.scopeSpans || [];

    for (const scopeSpan of scopeSpans) {
      const spans = scopeSpan.spans || [];

      for (const span of spans) {
        const spanAttrs = extractAttributeMap(span.attributes);
        const combinedAttrs = { ...resourceAttrs, ...spanAttrs };

        const otelTraceId = span.traceId || (combinedAttrs['trace_id'] as string);
        const otelSpanId = span.spanId || (combinedAttrs['span_id'] as string);
        const parentSpanId = span.parentSpanId || (combinedAttrs['parent_span_id'] as string) || (combinedAttrs['parentSpanId'] as string);

        const provider = (combinedAttrs['gen_ai.system'] || combinedAttrs['provider'] || combinedAttrs['gen_ai.provider']) as string | undefined;
        const model = (combinedAttrs['gen_ai.request.model'] || combinedAttrs['model']) as string | undefined;
        const inputTokens = (combinedAttrs['gen_ai.usage.input_tokens'] ?? combinedAttrs['input_tokens'] ?? combinedAttrs['inputTokens']) as number | undefined;
        const outputTokens = (combinedAttrs['gen_ai.usage.output_tokens'] ?? combinedAttrs['output_tokens'] ?? combinedAttrs['outputTokens']) as number | undefined;
        const tokenCost = (combinedAttrs['token_cost'] ?? combinedAttrs['tokenCost']) as number | undefined;

        const executionTimeMs = calculateMsDuration(span.startTimeUnixNano, span.endTimeUnixNano, span.startTime, span.endTime);

        const entityId = (combinedAttrs['user.id'] || combinedAttrs['user_id'] || combinedAttrs['entity_id'] || combinedAttrs['entityId'] || combinedAttrs['service.name'] || 'web-user') as string;
        const appKey = (combinedAttrs['app.key'] || combinedAttrs['app_key'] || combinedAttrs['appKey'] || 'adm_live_8832109') as string;
        const sessionId = (combinedAttrs['session.id'] || combinedAttrs['session_id'] || combinedAttrs['sessionId'] || otelTraceId || `ax_sess_otlp_${Date.now()}`) as string;
        const multiagentIdentity = (combinedAttrs['multiagent_identity'] || combinedAttrs['multiagentIdentity']) as string | undefined;
        const invokedToolName = (combinedAttrs['invoked_tool_name'] || combinedAttrs['invokedToolName'] || span.name) as string | undefined;
        const previousToolName = (combinedAttrs['previous_tool_name'] || combinedAttrs['previousToolName']) as string | undefined;

        const rawUserType = (combinedAttrs['user.type'] || combinedAttrs['user_type'] || combinedAttrs['entity_type'] || combinedAttrs['entityType']) as string | undefined;
        const eventType = (combinedAttrs['app.event_type'] || combinedAttrs['event_type'] || combinedAttrs['eventType'] || (invokedToolName === 'documentLoad' ? 'page_view' : (invokedToolName ? 'tool_call' : 'llm_inference'))) as string;
        const entityType = rawUserType === 'human' || eventType === 'page_view' || invokedToolName === 'documentLoad'
          ? 'human'
          : (rawUserType === 'agent' ? 'agent' : undefined);

        let statusCode: EventStatusCode | undefined;
        if (combinedAttrs['status_code'] && typeof combinedAttrs['status_code'] === 'string') {
          statusCode = combinedAttrs['status_code'] as EventStatusCode;
        } else if (span.status?.code === 0 || span.status?.code === 1) {
          statusCode = 'SUCCESS';
        }

        const isWebEvent = eventType === 'page_view' || invokedToolName === 'documentLoad' || rawUserType === 'human';

        const urlFull = isWebEvent ? ((combinedAttrs['url.full'] || combinedAttrs['url_full'] || combinedAttrs['urlFull']) as string | undefined) : undefined;
        const urlPath = isWebEvent ? ((combinedAttrs['url.path'] || combinedAttrs['url_path'] || combinedAttrs['urlPath']) as string | undefined) : undefined;
        const urlScheme = isWebEvent ? ((combinedAttrs['url.scheme'] || combinedAttrs['url_scheme'] || combinedAttrs['urlScheme']) as string | undefined) : undefined;
        const documentTitle = isWebEvent ? ((combinedAttrs['document.title'] || combinedAttrs['document_title'] || combinedAttrs['documentTitle']) as string | undefined) : undefined;
        const documentReferrer = isWebEvent ? ((combinedAttrs['document.referrer'] || combinedAttrs['document_referrer'] || combinedAttrs['documentReferrer']) as string | undefined) : undefined;
        const documentVisibilityState = isWebEvent ? ((combinedAttrs['document.visibilityState'] || combinedAttrs['document_visibility_state'] || combinedAttrs['documentVisibilityState']) as string | undefined) : undefined;
        const userAgent = isWebEvent ? ((combinedAttrs['user_agent.original'] || combinedAttrs['user_agent'] || combinedAttrs['userAgent']) as string | undefined) : undefined;
        const browserPlatform = isWebEvent ? ((combinedAttrs['browser.platform'] || combinedAttrs['browser_platform'] || combinedAttrs['browserPlatform']) as string | undefined) : undefined;
        const browserMobile = isWebEvent ? ((combinedAttrs['browser.mobile'] ?? combinedAttrs['browser_mobile'] ?? combinedAttrs['browserMobile']) as boolean | undefined) : undefined;
        const deviceCategory: 'mobile' | 'desktop' | undefined = isWebEvent && browserMobile !== undefined ? (browserMobile ? 'mobile' : 'desktop') : undefined;
        const browserBrands = isWebEvent ? ((combinedAttrs['browser.brands'] || combinedAttrs['browser_brands'] || combinedAttrs['browserBrands']) as readonly string[] | undefined) : undefined;
        const userId = (combinedAttrs['user.id'] || combinedAttrs['user_id'] || combinedAttrs['userId']) as string | undefined;
        
        let isEntrypointPage: boolean | undefined = undefined;
        if (isWebEvent) {
          const isEntrypointPageRaw = combinedAttrs['is_entrypoint_page'] ?? combinedAttrs['isEntrypointPage'];
          isEntrypointPage = typeof isEntrypointPageRaw === 'boolean' 
            ? isEntrypointPageRaw 
            : (!documentReferrer || (!documentReferrer.includes(urlPath || '____nonexistent____') && !documentReferrer.startsWith('http://localhost') && !documentReferrer.startsWith('https://example.com')));
        }

        const previousUrlPath = isWebEvent ? ((combinedAttrs['previous_url_path'] || combinedAttrs['previousUrlPath']) as string | undefined) : undefined;

        const event: TelemetryEvent = {
          timestamp: new Date().toISOString(),
          appKey,
          sessionId,
          entityId,
          entityType,
          eventType,
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
          otelSpanId,
          parentSpanId,
          urlFull,
          urlPath,
          urlScheme,
          documentTitle,
          documentReferrer,
          documentVisibilityState,
          userAgent,
          browserPlatform,
          browserMobile,
          deviceCategory,
          browserBrands,
          userId,
          isEntrypointPage,
          previousUrlPath
        };

        events.push(event);
      }
    }
  }

  return events;
}
