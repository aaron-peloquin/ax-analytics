import { TelemetryEvent } from '@ax-analytics/shared';
import { DateRangeState } from './filterEventsByDateRange';
import { TimeGroupingInterval } from './groupEventsByTimeInterval';

export function calculateDateRangeDurationMs(
  events: readonly TelemetryEvent[],
  dateRange: DateRangeState
): number {
  const now = Date.now();

  if (dateRange.preset === '24h') {
    return 24 * 60 * 60 * 1000;
  }

  if (dateRange.preset === '7d') {
    return 7 * 24 * 60 * 60 * 1000;
  }

  if (dateRange.preset === '30d') {
    return 30 * 24 * 60 * 60 * 1000;
  }

  if (dateRange.preset === 'custom') {
    let startTime = 0;
    let endTime = now;

    if (dateRange.startDate) {
      const parsedStart = new Date(`${dateRange.startDate}T00:00:00`).getTime();
      startTime = isNaN(parsedStart) ? new Date(dateRange.startDate).getTime() : parsedStart;
    }

    if (dateRange.endDate) {
      const parsedEnd = new Date(`${dateRange.endDate}T23:59:59.999`).getTime();
      endTime = isNaN(parsedEnd) ? new Date(dateRange.endDate).getTime() : parsedEnd;
    }

    if (startTime > 0 && endTime > startTime) {
      return endTime - startTime;
    }
  }

  // Fallback for preset 'all' or custom without valid start/end bounds
  if (events.length === 0) {
    return 0;
  }

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const evt of events) {
    if (evt.timestamp) {
      const t = new Date(evt.timestamp).getTime();
      if (!isNaN(t)) {
        if (t < minTime) minTime = t;
        if (t > maxTime) maxTime = t;
      }
    }
  }

  if (minTime !== Infinity && maxTime !== -Infinity && maxTime >= minTime) {
    return maxTime - minTime;
  }

  return 0;
}

export function determineTimeGrouping(
  events: readonly TelemetryEvent[],
  dateRange: DateRangeState
): TimeGroupingInterval {
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const durationMs = calculateDateRangeDurationMs(events, dateRange);

  return durationMs > FORTY_EIGHT_HOURS_MS ? '1d' : '1h';
}
