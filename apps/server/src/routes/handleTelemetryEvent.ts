import { Request, Response } from 'express';
import { TelemetryEvent, validateTelemetryPayload } from '@ax-analytics/shared';
import { ClickhouseStore } from '../db/initClickhouse.js';

export function handleTelemetryEvent(clickhouseStore: ClickhouseStore) {
  return (req: Request, res: Response): void => {
    const payload = req.body as unknown;
    if (!validateTelemetryPayload(payload)) {
      res.status(400).json({ error: 'Invalid telemetry event payload structure' });
      return;
    }

    const event: TelemetryEvent = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    clickhouseStore.pushEvent(event);
    res.status(202).json({ status: 'queued' });
  };
}
