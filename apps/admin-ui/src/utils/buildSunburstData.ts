import { TelemetryEvent } from '@ax-analytics/shared';

export interface SunburstNode {
  readonly name: string;
  readonly value?: number;
  readonly children?: readonly SunburstNode[];
}

export function buildSunburstData(
  events: readonly TelemetryEvent[],
  toolName: string
): readonly SunburstNode[] {
  const filteredEvents = events.filter(e => e.invokedToolName === toolName);

  if (filteredEvents.length === 0) {
    return [];
  }

  // Group paramName -> paramValue -> count
  const paramMap: Record<string, Record<string, number>> = {};

  for (const evt of filteredEvents) {
    if (!evt.params) continue;
    for (const [key, val] of Object.entries(evt.params)) {
      if (!paramMap[key]) paramMap[key] = {};
      const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
      paramMap[key][valStr] = (paramMap[key][valStr] || 0) + 1;
    }
  }

  const resultNodes: SunburstNode[] = [];

  for (const [paramName, valCounts] of Object.entries(paramMap)) {
    const totalParamCount = Object.values(valCounts).reduce((acc, c) => acc + c, 0);
    if (totalParamCount === 0) continue;

    let mixedCount = 0;
    const children: SunburstNode[] = [];

    for (const [valStr, count] of Object.entries(valCounts)) {
      const share = count / totalParamCount;
      if (share >= 0.08) {
        children.push({
          name: `${valStr} (${Math.round(share * 100)}%)`,
          value: count
        });
      } else {
        mixedCount += count;
      }
    }

    if (mixedCount > 0) {
      const mixedShare = Math.round((mixedCount / totalParamCount) * 100);
      children.push({
        name: `mixed (${mixedShare}%)`,
        value: mixedCount
      });
    }

    resultNodes.push({
      name: paramName,
      children
    });
  }

  return resultNodes;
}
