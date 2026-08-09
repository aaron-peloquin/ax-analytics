import React from 'react';
import { Clock } from 'lucide-react';
import { TimeGroupingInterval } from '../utils/groupEventsByTimeInterval';

export interface TimeGroupingDropdownProps {
  readonly interval: TimeGroupingInterval;
  readonly onChange: (interval: TimeGroupingInterval) => void;
}

export function TimeGroupingDropdown({ interval, onChange }: TimeGroupingDropdownProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <Clock className="w-4 h-4 text-fuchsia-400" aria-hidden="true" />
      <label htmlFor="homepage-time-grouping-select" className="text-purple-300 font-semibold cursor-pointer">
        Grouping:
      </label>
      
      <select
        id="homepage-time-grouping-select"
        value={interval}
        aria-label="Group graph data by time range"
        onChange={(e) => onChange(e.target.value as TimeGroupingInterval)}
        className="bg-transparent text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-1"
      >
        <option value="5m" className="bg-[#140a28] text-purple-200">5 Minute Ranges</option>
        <option value="30m" className="bg-[#140a28] text-purple-200">30 Minute Ranges</option>
        <option value="1h" className="bg-[#140a28] text-purple-200">1 Hour Ranges</option>
        <option value="1d" className="bg-[#140a28] text-purple-200">Daily Groupings</option>
      </select>
    </div>
  );
}
