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
    const sessionId = (typeof raw.sessionId === 'string' && raw.sessionId.trim().length > 0)
      ? raw.sessionId
      : `ax_sess_${randomUUID()}`;

    const event: TelemetryEvent = {
      ...(raw as unknown as TelemetryEvent),
      sessionId,
      entityId: raw.entityId as string,
      appKey: (raw.appKey as string) || 'adm_live_8832109',
      entityType: (raw.entityType as 'human' | 'agent') || 'agent',
      timestamp: (raw.timestamp as string) || new Date().toISOString()
    };

    clickhouseStore.pushEvent(event);
    res.status(202).json({ status: 'queued', sessionId: event.sessionId });
  };
}

