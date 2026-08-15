/**
  Extracts parameter placeholders enclosed in square brackets (e.g. `[tenantId]`, `[serviceId]`) from a raw URL.
  Returns a unique array of parameter names without brackets.
 */
export function extractUrlParams(rawUrl: string): readonly string[] {
  if (!rawUrl) {
    return [];
  }
  const matches = rawUrl.matchAll(/\[([a-zA-Z0-9_-]+)\]/g);
  const paramNames = Array.from(matches, (match) => match[1]);
  return Array.from(new Set(paramNames));
}
