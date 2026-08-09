import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRangeState } from '../utils/filterEventsByDateRange';
import { calculatePrefabDateRange } from '../utils/calculatePrefabDateRange';

export interface DateRangePickerProps {
  readonly range: DateRangeState;
  readonly onChange: (range: DateRangeState) => void;
}

export function DateRangePicker({ range, onChange }: DateRangePickerProps): React.ReactElement {
  const handlePresetChange = (preset: DateRangeState['preset']) => {
    if (preset === 'custom') {
      onChange({ ...range, preset: 'custom' });
      return;
    }
    const dates = calculatePrefabDateRange(preset);
    onChange({
      preset,
      startDate: dates.startDate,
      endDate: dates.endDate
    });
  };

  const handleStartDateChange = (val: string) => {
    onChange({
      preset: 'custom',
      startDate: val,
      endDate: range.endDate || ''
    });
  };

  const handleEndDateChange = (val: string) => {
    onChange({
      preset: 'custom',
      startDate: range.startDate || '',
      endDate: val
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-fuchsia-400" aria-hidden="true" />
        <label htmlFor="global-date-range-select" className="text-purple-300 font-semibold cursor-pointer">
          Range:
        </label>
        <select
          id="global-date-range-select"
          value={range.preset}
          aria-label="Filter events by date range"
          onChange={(e) => handlePresetChange(e.target.value as DateRangeState['preset'])}
          className="bg-[#0c051a] text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-2 py-1 border border-purple-900/40"
        >
          <option value="24h" className="bg-[#140a28] text-purple-200">Last 24 Hours</option>
          <option value="7d" className="bg-[#140a28] text-purple-200">Last 7 Days</option>
          <option value="30d" className="bg-[#140a28] text-purple-200">Last 30 Days</option>
          <option value="all" className="bg-[#140a28] text-purple-200">All Time</option>
          <option value="custom" className="bg-[#140a28] text-purple-200">Custom Range</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 border-l border-purple-900/60 pl-2">
        <label htmlFor="start-date-input" className="text-purple-300 font-medium">
          From:
        </label>
        <input
          id="start-date-input"
          type="date"
          value={range.startDate || ''}
          onChange={(e) => handleStartDateChange(e.target.value)}
          aria-label="Start date"
          className="bg-[#0c051a] text-fuchsia-300 font-mono focus:outline-none focus:ring-1 focus:ring-fuchsia-400 rounded px-2 py-1 border border-purple-900/40"
        />

        <label htmlFor="end-date-input" className="text-purple-300 font-medium ml-1">
          To:
        </label>
        <input
          id="end-date-input"
          type="date"
          value={range.endDate || ''}
          onChange={(e) => handleEndDateChange(e.target.value)}
          aria-label="End date"
          className="bg-[#0c051a] text-fuchsia-300 font-mono focus:outline-none focus:ring-1 focus:ring-fuchsia-400 rounded px-2 py-1 border border-purple-900/40"
        />
      </div>
    </div>
  );
}

