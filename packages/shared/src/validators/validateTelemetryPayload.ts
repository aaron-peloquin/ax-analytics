import { TelemetryEvent } from '../types/telemetry.js';

export function validateTelemetryPayload(payload: unknown): payload is Partial<TelemetryEvent> & { entityId: string } {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const p = payload as Record<string, unknown>;
  const hasEntityId = typeof p.entityId === 'string' && p.entityId.trim().length > 0;
  const hasValidSessionId = p.sessionId === undefined || p.sessionId === null || typeof p.sessionId === 'string';
  return hasEntityId && hasValidSessionId;
}

