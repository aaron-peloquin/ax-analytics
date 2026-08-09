import { TelemetryEvent } from '@ax-analytics/shared';

export type TimeGroupingInterval = '5m' | '30m' | '1h' | '1d';

export interface GroupedAnalyticsResult {
  readonly times: readonly string[];
  readonly toolData: readonly number[];
  readonly clickData: readonly number[];
  readonly pageviewData: readonly number[];
  readonly uniqueUsersData: readonly number[];
}

interface MutableBucket {
  timeMs: number;
  label: string;
  toolCalls: number;
  webClicks: number;
  pageviews: number;
  userIds: Set<string>;
}

export function groupEventsByTimeInterval(
  events: readonly TelemetryEvent[],
  interval: TimeGroupingInterval
): GroupedAnalyticsResult {
  if (events.length === 0) {
    return {
      times: ['No Events Ingested'],
      toolData: [0],
      clickData: [0],
      pageviewData: [0],
      uniqueUsersData: [0]
    };
  }

  const buckets: Record<number, MutableBucket> = {};

  for (const evt of events) {
    const rawMs = evt.timestamp ? new Date(evt.timestamp).getTime() : Date.now();
    let bucketMs: number;
    let label: string;

    if (interval === '5m') {
      bucketMs = Math.floor(rawMs / (5 * 60 * 1000)) * (5 * 60 * 1000);
      label = new Date(bucketMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (interval === '30m') {
      bucketMs = Math.floor(rawMs / (30 * 60 * 1000)) * (30 * 60 * 1000);
      label = new Date(bucketMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (interval === '1h') {
      bucketMs = Math.floor(rawMs / (60 * 60 * 1000)) * (60 * 60 * 1000);
      label = new Date(bucketMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      const d = new Date(rawMs);
      d.setHours(0, 0, 0, 0);
      bucketMs = d.getTime();
      label = new Date(bucketMs).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    if (!buckets[bucketMs]) {
      buckets[bucketMs] = {
        timeMs: bucketMs,
        label,
        toolCalls: 0,
        webClicks: 0,
        pageviews: 0,
        userIds: new Set()
      };
    }

    const b = buckets[bucketMs];
    if (evt.eventType === 'tool_call') {
      b.toolCalls += 1;
    } else {
      b.webClicks += 1;
    }
    if (evt.eventType === 'page_view') {
      b.pageviews += 1;
    }
    if (evt.entityId) {
      b.userIds.add(evt.entityId);
    }
  }

  const sortedBucketKeys = Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b);

  const times = sortedBucketKeys.map(k => buckets[k].label);
  const toolData = sortedBucketKeys.map(k => buckets[k].toolCalls);
  const clickData = sortedBucketKeys.map(k => buckets[k].webClicks);
  const pageviewData = sortedBucketKeys.map(k => buckets[k].pageviews);
  const uniqueUsersData = sortedBucketKeys.map(k => buckets[k].userIds.size);

  return {
    times,
    toolData,
    clickData,
    pageviewData,
    uniqueUsersData
  };
}
