export interface OtlpAnyValue {
  readonly stringValue?: string;
  readonly intValue?: number | string;
  readonly doubleValue?: number;
  readonly boolValue?: boolean;
}

export function parseAttributeValue(val: unknown): unknown {
  if (val === null || val === undefined) return undefined;
  if (typeof val !== 'object') return val;
  const anyVal = val as OtlpAnyValue;
  if (anyVal.stringValue !== undefined) return anyVal.stringValue;
  if (anyVal.intValue !== undefined) return Number(anyVal.intValue);
  if (anyVal.doubleValue !== undefined) return Number(anyVal.doubleValue);
  if (anyVal.boolValue !== undefined) return anyVal.boolValue;
  return val;
}
