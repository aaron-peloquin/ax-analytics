import { AnalyticsSummary } from '../hooks/useAnalyticsData';

export function isEqualAnalyticsSummary(
  prev: AnalyticsSummary | null,
  next: AnalyticsSummary | null
): boolean {
  if (prev === next) return true;
  if (!prev || !next) return prev === next;

  if (prev.totalEvents !== next.totalEvents) return false;
  if (prev.totalCost !== next.totalCost) return false;

  return JSON.stringify(prev) === JSON.stringify(next);
}
