import React from 'react';
import { TelemetryEvent, EventStatusCode } from '@ax-analytics/shared';
import { Filter } from 'lucide-react';

export interface SpanFilters {
  readonly search: string;
  readonly statusCode: string;
  readonly entityType: string;
  readonly eventType: string;
}

export interface SpanFiltersBarProps {
  readonly events: readonly TelemetryEvent[];
  readonly filters: SpanFilters;
  readonly onChange: (filters: SpanFilters) => void;
}

const STATUS_CODES: readonly string[] = ['ALL', 'SUCCESS', 'PARAMETER_ERROR', 'TIMEOUT', 'AUTH_DENIED', 'MODEL_REFUSAL', 'ASSERTION_FAILED'];

export function SpanFiltersBar({ events, filters, onChange }: SpanFiltersBarProps): React.ReactElement {
  const hasUnset = events.some(e => !e.entityType);
  const knownTypes = Array.from(new Set(events.map(e => e.entityType).filter(Boolean))) as string[];
  const entityTypes = ['ALL', ...knownTypes, ...(hasUnset ? ['system (unassigned)'] : [])];
  const eventTypes = ['ALL', ...Array.from(new Set(events.map(e => e.eventType).filter(Boolean)))];

  const update = (partial: Partial<SpanFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[#0c0519] border border-purple-900/50 rounded-xl">
      <div className="flex items-center gap-2 text-purple-300">
        <Filter className="w-4 h-4 text-fuchsia-400" aria-hidden="true" />
        <span className="text-xs font-bold text-fuchsia-300 font-mono uppercase">Filters:</span>
      </div>

      {/* Keyword Search */}
      <input
        type="text"
        id="span-filter-search"
        value={filters.search}
        onChange={e => update({ search: e.target.value })}
        placeholder="Search session, tool, entity…"
        aria-label="Search telemetry spans"
        className="bg-[#140a28] border border-purple-800/50 rounded-lg px-3 py-1.5 text-xs font-mono text-purple-100 placeholder-purple-400/60 focus:outline-none focus:ring-1 focus:ring-fuchsia-400 w-full sm:w-52"
      />

      {/* Status Code */}
      <label htmlFor="span-filter-status" className="sr-only">Filter by Status Code</label>
      <select
        id="span-filter-status"
        value={filters.statusCode}
        onChange={e => update({ statusCode: e.target.value })}
        className="bg-[#140a28] border border-purple-800/50 rounded-lg px-2 py-1.5 text-xs font-mono text-purple-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer w-full sm:w-auto flex-1 min-w-[120px]"
      >
        {STATUS_CODES.map(s => (
          <option key={s} value={s} className="bg-[#140a28]">{s === 'ALL' ? 'All Statuses' : s}</option>
        ))}
      </select>

      {/* Entity Type */}
      <label htmlFor="span-filter-entity" className="sr-only">Filter by Entity Type</label>
      <select
        id="span-filter-entity"
        value={filters.entityType}
        onChange={e => update({ entityType: e.target.value })}
        className="bg-[#140a28] border border-purple-800/50 rounded-lg px-2 py-1.5 text-xs font-mono text-purple-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer w-full sm:w-auto flex-1 min-w-[120px]"
      >
        {entityTypes.map(t => (
          <option key={t} value={t} className="bg-[#140a28]">{t === 'ALL' ? 'All Entity Types' : t}</option>
        ))}
      </select>

      {/* Event Type */}
      <label htmlFor="span-filter-event" className="sr-only">Filter by Event Type</label>
      <select
        id="span-filter-event"
        value={filters.eventType}
        onChange={e => update({ eventType: e.target.value })}
        className="bg-[#140a28] border border-purple-800/50 rounded-lg px-2 py-1.5 text-xs font-mono text-purple-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer w-full sm:w-auto flex-1 min-w-[120px]"
      >
        {eventTypes.map(t => (
          <option key={t} value={t} className="bg-[#140a28]">{t === 'ALL' ? 'All Event Types' : t}</option>
        ))}
      </select>

      {/* Result Count */}
    </div>
  );
}
