import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { TelemetryEvent, validateTelemetryPayload } from '@ax-analytics/shared';
import { ClickhouseStore } from '../db/initClickhouse.js';

export function handleTelemetryEvent(clickhouseStore: ClickhouseStore) {
  return (req: Request, res: Response): void => {
    const payload = req.body as unknown;
    if (!validateTelemetryPayload(payload)) {
      res.status(400).json({ error: 'Invalid telemetry event payload structure: missing required entityId' });
      return;
    }

    const raw = payload as Record<string, unknown>;
    const rawSessId = raw.sessionId || raw.session_id || raw.otelTraceId || raw.otel_trace_id;
    const sessionId = (typeof rawSessId === 'string' && String(rawSessId).trim().length > 0)
      ? String(rawSessId)
      : `ax_sess_${randomUUID()}`;

    const entityId = (raw.entityId || raw.entity_id) as string;
    const appKey = (raw.appKey || raw.app_key) as string || 'adm_live_8832109';
    const eventType = (raw.eventType || raw.event_type || 'tool_call') as string;
    const isWebEvent = eventType === 'page_view' || raw.invokedToolName === 'documentLoad';

    const event: TelemetryEvent = {
      ...(raw as unknown as TelemetryEvent),
      sessionId,
      entityId,
      appKey,
      eventType,
      entityType: (raw.entityType as 'human' | 'agent' | undefined) || (isWebEvent ? 'human' : undefined),
      timestamp: (raw.timestamp as string) || new Date().toISOString(),
      ...(isWebEvent ? {} : {
        isEntrypointPage: undefined,
        urlFull: undefined,
        urlPath: undefined,
        urlScheme: undefined,
        documentTitle: undefined,
        documentReferrer: undefined,
        documentVisibilityState: undefined,
        browserPlatform: undefined,
        browserMobile: undefined,
        browserBrands: undefined,
        deviceCategory: undefined,
        previousUrlPath: undefined
      })
    };

    clickhouseStore.pushEvent(event);
    res.status(202).json({ status: 'queued', sessionId: event.sessionId });
  };
}


