/**
  Replaces square-bracket parameter placeholders in a raw URL with corresponding dynamic values.
  Example: `resolveTargetUrl('https://api.com/v1/[tenantId]/mcp', { tenantId: 'acme' })` -> `'https://api.com/v1/acme/mcp'`
 */
export function resolveTargetUrl(
  rawUrl: string,
  params: Readonly<Record<string, string>> = {}
): string {
  if (!rawUrl) {
    return '';
  }
  return Object.entries(params).reduce((accUrl, [key, value]) => {
    if (!key || !value || !value.trim()) {
      return accUrl;
    }
    return accUrl.replaceAll(`[${key}]`, value.trim());
  }, rawUrl);
}
