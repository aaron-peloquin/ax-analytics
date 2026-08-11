import { Request, Response } from 'express';
import { ClickhouseStore } from '../db/initClickhouse.js';

export interface DeleteOtelLogsPayload {
  readonly sessionIds?: readonly string[];
  readonly otelTraceIds?: readonly string[];
  readonly purgeAll?: boolean;
}

export function handleDeleteOtelLogs(clickhouseStore: ClickhouseStore) {
  return (req: Request, res: Response): void => {
    const payload = (req.body || {}) as DeleteOtelLogsPayload;
    const sessionIds = payload.sessionIds || [];
    const otelTraceIds = payload.otelTraceIds || [];
    const purgeAll = Boolean(payload.purgeAll);

    const initialLength = clickhouseStore.telemetryEvents.length;

    if (purgeAll || (sessionIds.length === 0 && otelTraceIds.length === 0)) {
      clickhouseStore.telemetryEvents.length = 0;
    } else {
      const sessionIdSet = new Set(sessionIds);
      const otelTraceIdSet = new Set(otelTraceIds);

      const remaining = clickhouseStore.telemetryEvents.filter((evt) => {
        const matchesSession = evt.sessionId ? sessionIdSet.has(evt.sessionId) : false;
        const matchesTrace = evt.otelTraceId ? otelTraceIdSet.has(evt.otelTraceId) : false;
        return !matchesSession && !matchesTrace;
      });

      clickhouseStore.telemetryEvents.length = 0;
      clickhouseStore.telemetryEvents.push(...remaining);
    }

    const deletedCount = initialLength - clickhouseStore.telemetryEvents.length;
    clickhouseStore.save();

    res.status(200).json({
      status: 'success',
      deletedCount,
      remainingCount: clickhouseStore.telemetryEvents.length,
      message: `Deleted ${deletedCount} OTEL telemetry log event(s).`
    });
  };
}
