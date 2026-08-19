import { TelemetryEvent } from '@ax-analytics/shared';

export function extractPageTitle(evt: TelemetryEvent): string | undefined {
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
