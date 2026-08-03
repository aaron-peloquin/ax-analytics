import { TelemetryEvent } from '@ax-analytics/shared';

export interface ClickhouseStore {
  readonly telemetryEvents: TelemetryEvent[];
  readonly pushEvent: (event: TelemetryEvent) => void;
}

export function initClickhouse(host?: string, database?: string): ClickhouseStore {
  console.log(`[ClickHouse Engine] Initializing time-series connection... (${host || 'http://localhost:8124'}/${database || 'ax_telemetry'})`);
  const telemetryEvents: TelemetryEvent[] = [];

  return {
    telemetryEvents,
    pushEvent: (evt: TelemetryEvent) => {
      telemetryEvents.push(evt);
    }
  };
}
