import { TelemetryEvent } from '@ax-analytics/shared';

export interface SessionGroupSummary {
  readonly sessionId: string;
  readonly multiagentIdentity?: string;
  readonly spanCount: number;
  readonly agentCount: number;
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly totalDurationMs: number;
  readonly hasErrors: boolean;
  readonly trajectorySummary: readonly string[];
}

export function groupEventsBySessionId(
  events: readonly TelemetryEvent[]
): readonly SessionGroupSummary[] {
  const groupsMap = new Map<string, TelemetryEvent[]>();

  for (const evt of events) {
    const key = evt.sessionId?.trim() || 'unassigned';
    const existing = groupsMap.get(key);
    if (existing) {
      existing.push(evt);
    } else {
      groupsMap.set(key, [evt]);
    }
  }

  const result: SessionGroupSummary[] = [];

  for (const [sessionId, groupEvents] of groupsMap.entries()) {
    // Sort events by timestamp if available
    const sortedEvents = [...groupEvents].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });

    const spanCount = sortedEvents.length;
    const agentIds = new Set(sortedEvents.map(e => e.entityId).filter(Boolean));
    const multiagentId = sortedEvents.find(e => Boolean(e.multiagentIdentity))?.multiagentIdentity;

    let totalTokens = 0;
    let totalCost = 0;
    let totalDurationMs = 0;
    let hasErrors = false;

    const trajectoryList: string[] = [];

    for (const e of sortedEvents) {
      totalTokens += (e.inputTokens || 0) + (e.outputTokens || 0);
      totalCost += e.tokenCost || 0;
      totalDurationMs += e.executionTimeMs || 0;

      if (e.statusCode && e.statusCode !== 'SUCCESS') {
        hasErrors = true;
      }

      if (e.invokedToolName) {
        trajectoryList.push(e.invokedToolName);
      } else if (e.eventType === 'llm_inference') {
        const label = e.model ? `LLM (${e.model})` : e.provider ? `LLM (${e.provider})` : 'LLM Inference';
        trajectoryList.push(label);
      } else if (e.eventType) {
        trajectoryList.push(e.eventType);
      }
    }

    result.push({
      sessionId,
      multiagentIdentity: multiagentId,
      spanCount,
      agentCount: agentIds.size,
      totalTokens,
      totalCost,
      totalDurationMs,
      hasErrors,
      trajectorySummary: trajectoryList
    });
  }

  return result.sort((a, b) => b.spanCount - a.spanCount);
}
