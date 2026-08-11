import React from 'react';
import { RefreshCw, Menu } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { EntityFilter } from './EntityFilter';
import { AppKeyFilter } from './AppKeyFilter';
import { TimeGroupingDropdown } from './TimeGroupingDropdown';
import { DateRangeState } from '../utils/filterEventsByDateRange';
import { TimeGroupingInterval } from '../utils/groupEventsByTimeInterval';
import { TelemetryEvent } from '@ax-analytics/shared';

// Tabs where the filter bar is not applicable
const FILTER_BAR_HIDDEN_TABS = new Set(['integrate', 'experiments']);

export interface TopNavProps {
  readonly activeTab: string;
  readonly events: readonly TelemetryEvent[];
  readonly totalEvents: number;
  readonly dateRange: DateRangeState;
  readonly selectedEntityId: string;
  readonly selectedAppKey: string;
  readonly timeGrouping: TimeGroupingInterval;
  readonly autoTimeGrouping: TimeGroupingInterval;
  readonly onDateRangeChange: (range: DateRangeState) => void;
  readonly onEntityChange: (entityId: string) => void;
  readonly onAppKeyChange: (appKey: string) => void;
  readonly onTimeGroupingChange: (interval: TimeGroupingInterval) => void;
  readonly onRefresh: () => void;
  readonly onToggleMobileNav?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  overview:    'Traffic & Operational Telemetry Overview',
  sunburst:    'Tool Inspector & Parameter Value Breakdown',
  transitions: 'Flows — Agent Trajectories & User Navigation',
  cost:        'Resolved Agent Runs & Performance Metrics',
  experiments: 'Sticky A/B Experimentation Rules',
  traces:      'Telemetry Spans & Data Table Listing',
  integrate:   'cURL HTTP API Specification & Language Type Contracts (_v1)',
};

export function TopNav({
  activeTab,
  events,
  totalEvents,
  dateRange,
  selectedEntityId,
  selectedAppKey,
  timeGrouping,
  autoTimeGrouping,
  onDateRangeChange,
  onEntityChange,
  onAppKeyChange,
  onTimeGroupingChange,
  onRefresh,
  onToggleMobileNav,
}: TopNavProps): React.ReactElement {
  const showFilterBar = !FILTER_BAR_HIDDEN_TABS.has(activeTab);

  return (
    <header
      aria-label="Top Site Toolbar"
      className="sticky top-0 z-40 bg-[#0a0414]/95 backdrop-blur-xl border-b border-purple-900/50"
    >
      {/* ── Row 1: Brand / Page Identity ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-6 h-14 gap-3">
        {/* Left: mobile toggle + breadcrumb + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileNav}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-xl bg-purple-950 text-purple-200 hover:text-white hover:bg-purple-900/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-all border border-purple-800/50 flex-shrink-0"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-mono font-medium uppercase tracking-widest">
              <span>AX Analytics</span>
              <span aria-hidden="true" className="text-purple-600">/</span>
              <span className="text-fuchsia-400 font-bold">{activeTab}</span>
            </div>
            <h2 className="text-sm md:text-base font-extrabold text-white font-heading truncate leading-tight">
              {PAGE_TITLES[activeTab] || 'Dashboard'}
            </h2>
          </div>
        </div>

        {/* Right: live feed counter + refresh */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-purple-950 text-fuchsia-200 border border-purple-500/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" aria-hidden="true" />
            Feed: {totalEvents} events
          </span>

          <button
            onClick={onRefresh}
            aria-label="Refresh telemetry data"
            title="Refresh telemetry summary"
            className="p-2 rounded-xl bg-purple-950 text-purple-200 hover:text-white hover:bg-purple-900/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-all border border-purple-800/50"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Row 2: Filter Toolbar ─────────────────────────────────────────── */}
      {showFilterBar && (
        <div
          aria-label="Data filter toolbar"
          className="flex items-center flex-wrap gap-2 px-3 sm:px-6 py-2 border-t border-purple-900/40 bg-[#06020c]/60"
        >
          {/* Identity filters — left cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            <AppKeyFilter
              events={events}
              selectedAppKey={selectedAppKey}
              onChange={onAppKeyChange}
            />
            <EntityFilter
              events={events}
              selectedEntityId={selectedEntityId}
              onChange={onEntityChange}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" aria-hidden="true" />

          {/* Time controls — right cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangePicker range={dateRange} onChange={onDateRangeChange} />

            {/* Thin divider */}
            <div className="hidden sm:block w-px h-5 bg-purple-800/50 flex-shrink-0" aria-hidden="true" />

            <TimeGroupingDropdown
              interval={timeGrouping}
              autoInterval={autoTimeGrouping}
              onChange={onTimeGroupingChange}
            />
          </div>
        </div>
      )}
    </header>
  );
}
