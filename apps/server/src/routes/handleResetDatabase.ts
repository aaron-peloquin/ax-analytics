import { Request, Response } from 'express';
import { PostgresStore } from '../db/initPostgres.js';
import { ClickhouseStore } from '../db/initClickhouse.js';

export function handleResetDatabase(clickhouseStore: ClickhouseStore, postgresStore: PostgresStore) {
  return (_req: Request, res: Response): void => {
    // Purge ClickHouse time-series telemetry events
    clickhouseStore.telemetryEvents.length = 0;

    // Purge PostgreSQL feedback records and sticky A/B experiment assignments
    postgresStore.feedbackRecords.length = 0;
    postgresStore.abAssignments.clear();

    res.status(200).json({
      status: 'success',
      message: 'All database telemetry events, feedback records, and sticky assignments wiped clean.'
    });
  };
}
