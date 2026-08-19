import { parseAttributeValue, OtlpAnyValue } from './parseAttributeValue.js';

export interface OtlpAttribute {
  readonly key: string;
  readonly value?: OtlpAnyValue | unknown;
}

export function extractAttributeMap(attrs?: readonly OtlpAttribute[] | Record<string, unknown>): Record<string, unknown> {
  if (!attrs) return {};
  if (!Array.isArray(attrs) && typeof attrs === 'object') {
    return attrs as Record<string, unknown>;
  }
  if (!Array.isArray(attrs)) return {};
  const map: Record<string, unknown> = {};
  for (const attr of attrs) {
    if (attr && typeof attr.key === 'string') {
      map[attr.key] = parseAttributeValue(attr.value);
    }
  }
  return map;
}
