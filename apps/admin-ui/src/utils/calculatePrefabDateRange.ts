import { DateRangeState } from './filterEventsByDateRange';

export function calculatePrefabDateRange(
  preset: DateRangeState['preset'],
  refDate: Date = new Date()
): { readonly startDate: string; readonly endDate: string } {
  if (preset === 'all' || preset === 'custom') {
    return { startDate: '', endDate: '' };
  }

  const end = new Date(refDate);
  const start = new Date(refDate);

  if (preset === '24h') {
    start.setDate(end.getDate() - 1);
  } else if (preset === '7d') {
    start.setDate(end.getDate() - 7);
  } else if (preset === '30d') {
    start.setDate(end.getDate() - 30);
  }

  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
}
