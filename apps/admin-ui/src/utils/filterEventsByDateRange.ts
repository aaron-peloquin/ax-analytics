import { TelemetryEvent } from '@ax-analytics/shared';

export interface DateRangeState {
  readonly preset: '24h' | '7d' | '30d' | 'all' | 'custom';
  readonly startDate?: string;
  readonly endDate?: string;
}

export function filterEventsByDateRange(
  events: readonly TelemetryEvent[],
  range: DateRangeState
): readonly TelemetryEvent[] {
  if (range.preset === 'all') {
    return events;
  }

  const now = Date.now();
  let startTime = 0;

  if (range.preset === '24h') {
    startTime = now - 24 * 60 * 60 * 1000;
  } else if (range.preset === '7d') {
    startTime = now - 7 * 24 * 60 * 60 * 1000;
  } else if (range.preset === '30d') {
    startTime = now - 30 * 24 * 60 * 60 * 1000;
  } else if (range.preset === 'custom' && range.startDate) {
    startTime = new Date(range.startDate).getTime();
  }

  let endTime = now;
  if (range.preset === 'custom' && range.endDate) {
    endTime = new Date(range.endDate).getTime();
  }

  return events.filter(evt => {
    if (!evt.timestamp) return true;
    const evtTime = new Date(evt.timestamp).getTime();
    return evtTime >= startTime && evtTime <= endTime;
  });
}
