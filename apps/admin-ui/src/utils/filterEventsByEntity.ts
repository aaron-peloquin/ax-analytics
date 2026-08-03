import { TelemetryEvent } from '@ax-analytics/shared';

export function filterEventsByEntity(
  events: readonly TelemetryEvent[],
  selectedEntityId: string
): readonly TelemetryEvent[] {
  if (!selectedEntityId || selectedEntityId === 'all') {
    return events;
  }
  return events.filter(e => e.entityId === selectedEntityId);
}
