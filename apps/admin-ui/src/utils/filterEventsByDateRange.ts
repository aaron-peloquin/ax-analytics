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
  if (range.preset === 'all' && !range.startDate && !range.endDate) {
    return events;
  }

  const now = Date.now();
  let startTime = 0;
  let endTime = now;

  if (range.startDate) {
    const parsedStart = new Date(`${range.startDate}T00:00:00`).getTime();
    startTime = isNaN(parsedStart) ? new Date(range.startDate).getTime() : parsedStart;
  } else if (range.preset === '24h') {
    startTime = now - 24 * 60 * 60 * 1000;
  } else if (range.preset === '7d') {
    startTime = now - 7 * 24 * 60 * 60 * 1000;
  } else if (range.preset === '30d') {
    startTime = now - 30 * 24 * 60 * 60 * 1000;
  }

  if (range.endDate) {
    const parsedEnd = new Date(`${range.endDate}T23:59:59.999`).getTime();
    endTime = isNaN(parsedEnd) ? new Date(range.endDate).getTime() : parsedEnd;
  }

  return events.filter(evt => {
    if (!evt.timestamp) return true;
    const evtTime = new Date(evt.timestamp).getTime();
    return evtTime >= startTime && evtTime <= endTime;
  });
}

