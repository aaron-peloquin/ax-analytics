import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { TimeGroupingInterval } from '../utils/groupEventsByTimeInterval';

export interface TimeGroupingDropdownProps {
  readonly interval: TimeGroupingInterval;
  readonly autoInterval: TimeGroupingInterval;
  readonly onChange: (interval: TimeGroupingInterval) => void;
}

const INTERVAL_LABELS: Record<TimeGroupingInterval, string> = {
  '5m':  '5 Min',
  '30m': '30 Min',
  '1h':  '1 Hour',
  '1d':  'Daily',
  '1w':  'Weekly',
};

export function TimeGroupingDropdown({ interval, autoInterval, onChange }: TimeGroupingDropdownProps): React.ReactElement {
  const isAuto = interval === autoInterval;

  return (
    <div className="flex items-center gap-1.5 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <Clock className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" aria-hidden="true" />
      <label htmlFor="homepage-time-grouping-select" className="text-purple-300 font-semibold cursor-pointer whitespace-nowrap">
        Grouping:
      </label>

      <select
        id="homepage-time-grouping-select"
        value={interval}
        aria-label="Group graph data by time range"
        onChange={(e) => onChange(e.target.value as TimeGroupingInterval)}
        className="bg-transparent text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-1 text-xs"
      >
        <option value="5m"  className="bg-[#140a28] text-purple-200">5 Minute Ranges</option>
        <option value="30m" className="bg-[#140a28] text-purple-200">30 Minute Ranges</option>
        <option value="1h"  className="bg-[#140a28] text-purple-200">1 Hour Ranges</option>
        <option value="1d"  className="bg-[#140a28] text-purple-200">Daily Groupings</option>
        <option value="1w"  className="bg-[#140a28] text-purple-200">Weekly Groupings</option>
      </select>

      {isAuto && (
        <span
          aria-label="Grouping automatically determined from date range"
          title={`Auto-selected: ${INTERVAL_LABELS[autoInterval]} based on date range`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-900/60 border border-purple-700/50 text-[9px] font-bold uppercase tracking-wider text-purple-400"
        >
          <Zap className="w-2.5 h-2.5" aria-hidden="true" />
          auto
        </span>
      )}
    </div>
  );
}
