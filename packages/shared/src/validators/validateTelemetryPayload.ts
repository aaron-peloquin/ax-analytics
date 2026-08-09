import { TelemetryEvent } from '../types/telemetry.js';

export function validateTelemetryPayload(payload: unknown): payload is Partial<TelemetryEvent> & { entityId: string } {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const p = payload as Record<string, unknown>;
  const entityIdVal = p.entityId || p.entity_id;
  const hasEntityId = typeof entityIdVal === 'string' && String(entityIdVal).trim().length > 0;
  const hasValidSessionId = p.sessionId === undefined || p.sessionId === null || typeof p.sessionId === 'string' || typeof p.session_id === 'string';
  return Boolean(hasEntityId && hasValidSessionId);
}


