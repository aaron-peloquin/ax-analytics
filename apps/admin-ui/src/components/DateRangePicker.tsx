import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRangeState } from '../utils/filterEventsByDateRange';

export interface DateRangePickerProps {
  readonly range: DateRangeState;
  readonly onChange: (range: DateRangeState) => void;
}

export function DateRangePicker({ range, onChange }: DateRangePickerProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <Calendar className="w-4 h-4 text-fuchsia-400" aria-hidden="true" />
      <label htmlFor="global-date-range-select" className="text-purple-300 font-semibold cursor-pointer">
        Date Range:
      </label>
      
      <select
        id="global-date-range-select"
        value={range.preset}
        aria-label="Filter events by date range"
        onChange={(e) => {
          const val = e.target.value as DateRangeState['preset'];
          onChange({ ...range, preset: val });
        }}
        className="bg-transparent text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-1"
      >
        <option value="24h" className="bg-[#140a28] text-purple-200">Last 24 Hours</option>
        <option value="7d" className="bg-[#140a28] text-purple-200">Last 7 Days</option>
        <option value="30d" className="bg-[#140a28] text-purple-200">Last 30 Days</option>
        <option value="all" className="bg-[#140a28] text-purple-200">All Time</option>
      </select>
    </div>
  );
}
