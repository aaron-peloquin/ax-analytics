import { TelemetryEvent } from '../types/telemetry.js';

export function validateTelemetryPayload(payload: unknown): payload is TelemetryEvent {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const p = payload as Record<string, unknown>;
  return typeof p.sessionId === 'string' && typeof p.entityId === 'string';
}
