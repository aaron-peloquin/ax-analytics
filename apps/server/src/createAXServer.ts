import express, { Express } from 'express';
import cors from 'cors';
import { initPostgres } from './db/initPostgres.js';
import { initClickhouse } from './db/initClickhouse.js';
import { handleTelemetryEvent } from './routes/handleTelemetryEvent.js';
import { handleExperimentVariant } from './routes/handleExperimentVariant.js';
import { handleResetExperimentAssignments } from './routes/handleResetExperimentAssignments.js';
import { handleFeedback } from './routes/handleFeedback.js';
import { handleAnalyticsSummary } from './routes/handleAnalyticsSummary.js';
import { handleResetDatabase } from './routes/handleResetDatabase.js';

export interface AXServerConfig {
  readonly configPath?: string;
  readonly port?: number;
}

export function createAXServer(config: AXServerConfig = {}): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const postgresStore = initPostgres(process.env.POSTGRES_URL);
  const clickhouseStore = initClickhouse(process.env.CLICKHOUSE_HOST, process.env.CLICKHOUSE_DB);

  app.post('/v1/telemetry/event', handleTelemetryEvent(clickhouseStore));
  app.post('/v1/experiments/variant', handleExperimentVariant(postgresStore));
  app.post('/v1/experiments/reset-assignments', handleResetExperimentAssignments(postgresStore));
  app.post('/v1/feedback', handleFeedback(postgresStore));
  app.post('/v1/admin/reset-db', handleResetDatabase(clickhouseStore, postgresStore));
  app.get('/v1/analytics/summary', handleAnalyticsSummary(clickhouseStore, postgresStore));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'AX Analytics Server' });
  });

  return app;
}
