import { TelemetryEvent, EntityType } from '@ax-analytics/shared';

export interface AgentGroupSummary {
  readonly entityId: string;
  readonly entityType: EntityType;
  readonly spanCount: number;
  readonly sessionCount: number;
  readonly multiagentCount: number;
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly avgLatencyMs: number;
  readonly successRate: number;
  readonly errorCount: number;
  readonly toolsUsed: readonly string[];
}

export function groupEventsByAgentIdentity(
  events: readonly TelemetryEvent[]
): readonly AgentGroupSummary[] {
  const groupsMap = new Map<string, TelemetryEvent[]>();

  for (const evt of events) {
    const key = evt.entityId?.trim() || 'unassigned';
    const existing = groupsMap.get(key);
    if (existing) {
      existing.push(evt);
    } else {
      groupsMap.set(key, [evt]);
    }
  }

  const result: AgentGroupSummary[] = [];

  for (const [entityId, groupEvents] of groupsMap.entries()) {
    const spanCount = groupEvents.length;
    const entityType = groupEvents[0]?.entityType || 'agent';
    const sessionIds = new Set(groupEvents.map(e => e.sessionId).filter(Boolean));
    const multiagentIds = new Set(groupEvents.map(e => e.multiagentIdentity).filter(Boolean));
    const toolsUsed = Array.from(new Set(groupEvents.map(e => e.invokedToolName).filter((t): t is string => Boolean(t))));

    let totalTokens = 0;
    let totalCost = 0;
    let totalLatency = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const e of groupEvents) {
      totalTokens += (e.inputTokens || 0) + (e.outputTokens || 0);
      totalCost += e.tokenCost || 0;
      totalLatency += e.executionTimeMs || 0;
      if (e.statusCode === 'SUCCESS' || !e.statusCode) {
        successCount += 1;
      } else {
        errorCount += 1;
      }
    }

    const avgLatencyMs = spanCount > 0 ? totalLatency / spanCount : 0;
    const successRate = spanCount > 0 ? (successCount / spanCount) * 100 : 100;

    result.push({
      entityId,
      entityType,
      spanCount,
      sessionCount: sessionIds.size,
      multiagentCount: multiagentIds.size,
      totalTokens,
      totalCost,
      avgLatencyMs,
      successRate,
      errorCount,
      toolsUsed
    });
  }

  return result.sort((a, b) => b.spanCount - a.spanCount);
}
