import { TelemetryEvent } from '@ax-analytics/shared';

function extractPageTitle(evt: TelemetryEvent): string | undefined {
  const params = evt.params;
  if (!params) return undefined;

  if (typeof params.pageTitle === 'string' && params.pageTitle.trim()) {
    return params.pageTitle.trim();
  }
  if (typeof params.title === 'string' && params.title.trim()) {
    return params.title.trim();
  }
  if (typeof params.page_title === 'string' && params.page_title.trim()) {
    return params.page_title.trim();
  }
  return undefined;
}

export function computeUserPageTransitions(events: readonly TelemetryEvent[]): Record<string, number> {
  const userTransitions: Record<string, number> = {};

  // 1. Explicit previousPageTitle & pageTitle on a single event
  for (const evt of events) {
    const prev = evt.params?.previousPageTitle || evt.params?.previous_page_title;
    const curr = evt.params?.pageTitle || evt.params?.page_title || evt.params?.title;
    if (typeof prev === 'string' && typeof curr === 'string' && prev.trim() && curr.trim()) {
      const key = `${prev.trim()} -> ${curr.trim()}`;
      userTransitions[key] = (userTransitions[key] || 0) + 1;
    }
  }

  // 2. Sequential session page transitions (using pageTitle only, ignoring URLs/pathnames)
  const sessionPageMap = new Map<string, string[]>();
  for (const evt of events) {
    if (!evt.sessionId) continue;
    const title = extractPageTitle(evt);
    if (title) {
      const list = sessionPageMap.get(evt.sessionId) || [];
      list.push(title);
      sessionPageMap.set(evt.sessionId, list);
    }
  }

  for (const pages of sessionPageMap.values()) {
    for (let i = 1; i < pages.length; i++) {
      const prev = pages[i - 1];
      const curr = pages[i];
      if (prev && curr && prev !== curr) {
        const key = `${prev} -> ${curr}`;
        if (!userTransitions[key]) {
          userTransitions[key] = (userTransitions[key] || 0) + 1;
        }
      }
    }
  }

  return userTransitions;
}
