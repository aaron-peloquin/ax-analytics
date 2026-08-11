import { TelemetryEvent } from '@ax-analytics/shared';
import { loadDbStore } from './loadDbStore.js';
import { saveDbStore } from './saveDbStore.js';

export interface ClickhouseStore {
  readonly telemetryEvents: TelemetryEvent[];
  readonly pushEvent: (event: TelemetryEvent) => void;
  readonly save: () => void;
}

export function initClickhouse(host?: string, database?: string): ClickhouseStore {
  console.log(`[ClickHouse Engine] Initializing time-series connection... (${host || 'http://localhost:8124'}/${database || 'ax_telemetry'})`);
  const initial = loadDbStore();
  const telemetryEvents: TelemetryEvent[] = Array.from(initial.telemetryEvents || []);

  const save = () => {
    const current = loadDbStore();
    saveDbStore({
      ...current,
      telemetryEvents
    });
  };

  return {
    telemetryEvents,
    pushEvent: (evt: TelemetryEvent) => {
      telemetryEvents.push(evt);
      save();
    },
    save
  };
}
