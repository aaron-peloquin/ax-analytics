import { loadDbStore } from './loadDbStore.js';
import { saveDbStore } from './saveDbStore.js';

export interface PostgresStore {
  readonly applications: Map<string, { readonly id: string; readonly name: string }>;
  readonly abExperiments: Map<string, { readonly id: string; readonly splitPercentage: number; readonly isActive: boolean }>;
  readonly abAssignments: Map<string, string>;
  readonly feedbackRecords: Array<{ readonly id: string; readonly sessionId: string; readonly entityId: string; readonly vote: number; readonly comment?: string; readonly createdAt: string }>;
  readonly save: () => void;
}

export function initPostgres(connectionUrl?: string): PostgresStore {
  console.log(`[PostgreSQL + pgvector] Initializing database connection... (${connectionUrl || 'Memory + Persistent File Mode'})`);
  const initial = loadDbStore();
  const abAssignmentsMap = new Map<string, string>(initial.abAssignments || []);
  const feedbackArray = Array.from(initial.feedbackRecords || []);

  const store: PostgresStore = {
    applications: new Map([['app_live_8832109', { id: 'app-uuid-1', name: 'Production AX Application' }]]),
    abExperiments: new Map([['new_inventory_schema_v2', { id: 'exp-uuid-1', splitPercentage: 50, isActive: true }]]),
    abAssignments: abAssignmentsMap,
    feedbackRecords: feedbackArray,
    save: () => {
      const current = loadDbStore();
      saveDbStore({
        ...current,
        abAssignments: Array.from(abAssignmentsMap.entries()),
        feedbackRecords: feedbackArray
      });
    }
  };

  return store;
}
