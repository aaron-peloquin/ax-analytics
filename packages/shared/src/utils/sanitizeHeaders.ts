import { McpHeaderPair } from '../types/mcpTypes.js';

/**
  Sanitizes an array of header key/value objects, stripping out empty keys and trimming whitespace.
  Returns a clean key-value object map suitable for HTTP request header forwarding.
 */
export function sanitizeHeaders(headers: readonly McpHeaderPair[] = []): Record<string, string> {
  return headers.reduce<Record<string, string>>((acc, item) => {
    const trimmedKey = item.key.trim();
    if (trimmedKey.length > 0) {
      acc[trimmedKey] = item.value;
    }
    return acc;
  }, {});
}
