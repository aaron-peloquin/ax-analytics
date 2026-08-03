import { Request, Response } from 'express';
import { ClickhouseStore } from '../db/initClickhouse.js';
import { PostgresStore } from '../db/initPostgres.js';

export function handleAnalyticsSummary(clickhouseStore: ClickhouseStore, postgresStore: PostgresStore) {
  return (_req: Request, res: Response): void => {
    const events = clickhouseStore.telemetryEvents;
    const feedback = postgresStore.feedbackRecords;

    const transitionCounts: Record<string, number> = {};
    const paramKeyCounts: Record<string, number> = {};
    let totalCost = 0;

    for (const evt of events) {
      if (evt.tokenCost) totalCost += evt.tokenCost;

      if (evt.invokedToolName && evt.previousToolName) {
        const key = `${evt.previousToolName} -> ${evt.invokedToolName}`;
        transitionCounts[key] = (transitionCounts[key] || 0) + 1;
      }

      if (evt.params) {
        for (const k of Object.keys(evt.params)) {
          paramKeyCounts[k] = (paramKeyCounts[k] || 0) + 1;
        }
      }
    }

    res.status(200).json({
      totalEvents: events.length,
      totalCost,
      transitions: transitionCounts,
      parameterFrequency: paramKeyCounts,
      rawEvents: events,
      feedback
    });
  };
}
