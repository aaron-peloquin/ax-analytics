export function calculateMsDuration(
  startNano?: string | number,
  endNano?: string | number,
  startArr?: readonly [number, number] | string | number,
  endArr?: readonly [number, number] | string | number
): number | undefined {
  if (startNano && endNano) {
    try {
      const start = BigInt(startNano);
      const end = BigInt(endNano);
      const nanoDiff = Number(end - start);
      if (!isNaN(nanoDiff) && nanoDiff >= 0) {
        return Math.round(nanoDiff / 1_000_000);
      }
    } catch {
      // Fallback below
    }
  }

  if (Array.isArray(startArr) && Array.isArray(endArr) && startArr.length === 2 && endArr.length === 2) {
    const startMs = startArr[0] * 1000 + startArr[1] / 1_000_000;
    const endMs = endArr[0] * 1000 + endArr[1] / 1_000_000;
    const diff = endMs - startMs;
    if (!isNaN(diff) && diff >= 0) {
      return Math.round(diff);
    }
  }

  return undefined;
}
