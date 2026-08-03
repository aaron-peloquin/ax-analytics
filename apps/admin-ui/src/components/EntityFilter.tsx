import React from 'react';
import { UserCheck } from 'lucide-react';
import { TelemetryEvent } from '@ax-analytics/shared';

export interface EntityFilterProps {
  readonly events: readonly TelemetryEvent[];
  readonly selectedEntityId: string;
  readonly onChange: (entityId: string) => void;
}

export function EntityFilter({ events, selectedEntityId, onChange }: EntityFilterProps): React.ReactElement {
  const availableEntities = Array.from(
    new Set(
      events
        .map(e => e.entityId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const defaultEntities = ['sales-assistant', 'live-test-agent', 'user_4821'];
  const allEntities = availableEntities.length > 0 ? availableEntities : defaultEntities;

  return (
    <div className="flex items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
      <UserCheck className="w-4 h-4 text-fuchsia-400" aria-hidden="true" />
      <label htmlFor="global-entity-filter-select" className="text-purple-200 font-semibold cursor-pointer whitespace-nowrap">
        Entity / Agent ID:
      </label>
      
      <select
        id="global-entity-filter-select"
        value={selectedEntityId}
        aria-label="Filter events by entity or agent ID"
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-1 max-w-[160px] truncate"
      >
        <option value="all" className="bg-[#140a28] text-purple-200">All Entities ({allEntities.length})</option>
        {allEntities.map(id => (
          <option key={id} value={id} className="bg-[#140a28] text-purple-200 font-mono">
            {id}
          </option>
        ))}
      </select>
    </div>
  );
}
