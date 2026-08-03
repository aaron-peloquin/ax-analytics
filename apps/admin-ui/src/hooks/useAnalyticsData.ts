import { useState, useEffect, useCallback } from 'react';
import { TelemetryEvent, SessionFeedbackRecord } from '@ax-analytics/shared';

export interface AnalyticsSummary {
  readonly totalEvents: number;
  readonly totalCost: number;
  readonly transitions: Record<string, number>;
  readonly parameterFrequency: Record<string, number>;
  readonly rawEvents: TelemetryEvent[];
  readonly feedback: SessionFeedbackRecord[];
}

export function useAnalyticsData(pollIntervalMs: number = 3000) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/v1/analytics/summary');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json: AnalyticsSummary = await response.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchSummary, pollIntervalMs]);

  return { data, loading, error, refresh: fetchSummary };
}
