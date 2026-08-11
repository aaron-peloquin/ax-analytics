import fs from 'fs';
import { fileURLToPath } from 'url';
import { TelemetryEvent } from '@ax-analytics/shared';

export interface FeedbackRecord {
  readonly id: string;
  readonly sessionId: string;
  readonly entityId: string;
  readonly vote: number;
  readonly comment?: string;
  readonly createdAt: string;
}

export interface SerializedDbStore {
  readonly telemetryEvents?: readonly TelemetryEvent[];
  readonly abAssignments?: readonly [string, string][];
  readonly feedbackRecords?: readonly FeedbackRecord[];
}

export function loadDbStore(storagePath?: string): SerializedDbStore {
  const filePath = storagePath || fileURLToPath(new URL('../../data/db-store.json', import.meta.url));
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as SerializedDbStore;
    }
  } catch (err) {
    console.warn(`[Persistence] Could not load DB store from ${filePath}:`, err);
  }
  return {};
}
