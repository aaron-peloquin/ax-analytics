export function hashEntityVariant(
  entityId: string,
  experimentKey: string,
  splitPercentage: number = 50
): 'A' | 'B' {
  const combined = `${entityId}:${experimentKey}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const score = Math.abs(hash) % 100;
  return score < splitPercentage ? 'B' : 'A';
}
