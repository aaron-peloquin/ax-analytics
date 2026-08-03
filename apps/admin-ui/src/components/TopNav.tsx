import React from 'react';
import { RefreshCw } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { EntityFilter } from './EntityFilter';
import { DateRangeState } from '../utils/filterEventsByDateRange';
import { TelemetryEvent } from '@ax-analytics/shared';

export interface TopNavProps {
  readonly activeTab: string;
  readonly events: readonly TelemetryEvent[];
  readonly totalEvents: number;
  readonly dateRange: DateRangeState;
  readonly selectedEntityId: string;
  readonly onDateRangeChange: (range: DateRangeState) => void;
  readonly onEntityChange: (entityId: string) => void;
  readonly onRefresh: () => void;
}

export function TopNav({ activeTab, events, totalEvents, dateRange, selectedEntityId, onDateRangeChange, onEntityChange, onRefresh }: TopNavProps): React.ReactElement {
  const pageTitles: Record<string, string> = {
    overview: 'Traffic & Operational Telemetry Overview',
    sunburst: 'Tool Inspector & Parameter Value Breakdown',
    transitions: 'Trajectory Flow Diagrams & Agent Page Flows',
    heatmaps: 'Parameter Value Friction & Schema Heatmap',
    cost: 'Resolved Agent Runs & Performance Metrics',
    experiments: 'Sticky A/B Experimentation Rules',
    traces: 'Telemetry Spans & Data Table Listing',
    integrate: 'cURL HTTP API Specification & Language Type Contracts (_v1)'
  };

  return (
    <header 
      aria-label="Top Site Toolbar"
      className="h-16 border-b border-purple-900/50 bg-[#0a0414]/90 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center space-x-2 text-xs text-purple-200 font-mono truncate font-medium">
          <span>AX Analytics</span>
          <span aria-hidden="true" className="text-purple-400">/</span>
          <span className="text-fuchsia-300 font-bold uppercase">{activeTab}</span>
        </div>
        <h2 className="text-sm md:text-lg font-extrabold text-white font-heading truncate">
          {pageTitles[activeTab] || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
        <EntityFilter events={events} selectedEntityId={selectedEntityId} onChange={onEntityChange} />

        <DateRangePicker range={dateRange} onChange={onDateRangeChange} />

        <span className="hidden sm:inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-purple-950 text-fuchsia-200 border border-purple-500/50 font-mono">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" aria-hidden="true"></span>
          Feed: {totalEvents} events
        </span>

        <button
          onClick={onRefresh}
          aria-label="Refresh telemetry data"
          className="p-2 rounded-xl bg-purple-950 text-purple-200 hover:text-white hover:bg-purple-900/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-all border border-purple-800/50"
          title="Refresh telemetry summary"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
