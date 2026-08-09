import React from 'react';
import { Layers } from 'lucide-react';
import { TelemetryEvent } from '@ax-analytics/shared';

export interface AppKeyFilterProps {
  readonly events: readonly TelemetryEvent[];
  readonly selectedAppKey: string;
  readonly onChange: (appKey: string) => void;
}

export function AppKeyFilter({ events, selectedAppKey, onChange }: AppKeyFilterProps): React.ReactElement {
  const availableAppKeys = Array.from(
    new Set(
      events
        .map(e => e.appKey)
        .filter((key): key is string => Boolean(key) && key.trim().length > 0)
    )
  );

  const defaultAppKeys = ['adm_live_8832109', 'adm_dev_12345', 'quickshot_prod'];
  const mergedKeys = Array.from(new Set([...availableAppKeys, ...defaultAppKeys]));

  return (
    <div className="flex items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
      <label htmlFor="global-appkey-filter-select" className="text-purple-200 font-semibold cursor-pointer whitespace-nowrap">
        App Scope:
      </label>
      
      <select
        id="global-appkey-filter-select"
        value={selectedAppKey}
        aria-label="Filter events by Application Key"
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-cyan-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer rounded px-1 max-w-[170px] truncate"
      >
        <option value="all" className="bg-[#140a28] text-purple-200">
          All Apps ({mergedKeys.length})
        </option>
        {mergedKeys.map(key => (
          <option key={key} value={key} className="bg-[#140a28] text-purple-200 font-mono">
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}
