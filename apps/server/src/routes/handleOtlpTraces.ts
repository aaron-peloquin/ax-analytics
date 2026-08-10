import { Request, Response } from 'express';
import { otlpToTelemetryEvents, OtlpPayload } from '@ax-analytics/shared';
import { ClickhouseStore } from '../db/initClickhouse.js';

export function handleOtlpTraces(clickhouseStore: ClickhouseStore) {
  return (req: Request, res: Response): void => {
    const payload = req.body as OtlpPayload;

    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Invalid OTLP trace payload' });
      return;
    }

    const events = otlpToTelemetryEvents(payload);

    for (const event of events) {
      clickhouseStore.pushEvent(event);
    }

    res.status(202).json({
      status: 'queued',
      ingestedCount: events.length,
      partialSuccess: {}
    });
  };
}
