import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { TelemetryEvent } from '@ax-analytics/shared';
import { SpanFiltersBar, SpanFilters } from './SpanFiltersBar.js';
import { SessionModal } from './SessionModal.js';
import { TraceGroupingToggle, TraceGroupingMode } from './TraceGroupingToggle.js';
import { groupEventsByMultiagentIdentity, MultiagentGroupSummary } from '../utils/groupEventsByMultiagentIdentity.js';
import { groupEventsByAgentIdentity, AgentGroupSummary } from '../utils/groupEventsByAgentIdentity.js';
import { groupEventsBySessionId, SessionGroupSummary } from '../utils/groupEventsBySessionId.js';
import { getRawSpanColumnDefs } from './grid/utils/getRawSpanColumnDefs.js';
import { getMultiagentColumnDefs } from './grid/utils/getMultiagentColumnDefs.js';
import { getAgentColumnDefs } from './grid/utils/getAgentColumnDefs.js';
import { getSessionColumnDefs } from './grid/utils/getSessionColumnDefs.js';
import { ColumnPickerModal } from './grid/molecules/ColumnPickerModal.js';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface AgGridDataListingProps {
  readonly events: readonly TelemetryEvent[];
}

const DEFAULT_FILTERS: SpanFilters = {
  search: '',
  statusCode: 'ALL',
  entityType: 'ALL',
  eventType: 'ALL'
};

const DEFAULT_VISIBLE_COLUMNS = new Set([
  'timestamp', 'appKey', 'sessionId', 'urlPath', 'documentTitle', 'deviceCategory',
  'isEntrypointPage', 'entityId', 'entityType', 'eventType', 'invokedToolName',
  'statusCode', 'executionTimeMs', 'otelTraceId'
]);

export function AgGridDataListing({ events }: AgGridDataListingProps): React.ReactElement {
  const [filters, setFilters] = useState<SpanFilters>(DEFAULT_FILTERS);
  const [groupingMode, setGroupingMode] = useState<TraceGroupingMode>('spans');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColKeys, setVisibleColKeys] = useState<Set<string>>(DEFAULT_VISIBLE_COLUMNS);

  const toggleColumn = (key: string) => {
    setVisibleColKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return events.filter((evt) => {
      if (filters.statusCode !== 'ALL' && (evt.statusCode || 'SUCCESS') !== filters.statusCode) return false;
      if (filters.entityType !== 'ALL') {
        if (filters.entityType === 'system (unassigned)') {
          if (evt.entityType) return false;
        } else if (evt.entityType !== filters.entityType) {
          return false;
        }
      }
      if (filters.eventType !== 'ALL' && evt.eventType !== filters.eventType) return false;
      if (q) {
        const haystack = [
          evt.sessionId, evt.entityId, evt.multiagentIdentity, evt.invokedToolName,
          evt.previousToolName, evt.otelTraceId, evt.otelSpanId, evt.eventType,
          evt.urlPath, evt.documentTitle, evt.deviceCategory, evt.userAgent
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const multiagentGroups = useMemo(() => groupEventsByMultiagentIdentity(filteredEvents), [filteredEvents]);
  const agentGroups = useMemo(() => groupEventsByAgentIdentity(filteredEvents), [filteredEvents]);
  const sessionGroups = useMemo(() => groupEventsBySessionId(filteredEvents), [filteredEvents]);

  const rawSpanColumnDefs = useMemo(() => getRawSpanColumnDefs(visibleColKeys), [visibleColKeys]);
  const multiagentColumnDefs = useMemo(() => getMultiagentColumnDefs(), []);
  const agentColumnDefs = useMemo(() => getAgentColumnDefs(), []);
  const sessionColumnDefs = useMemo(() => getSessionColumnDefs(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TraceGroupingToggle
          activeMode={groupingMode}
          onChange={setGroupingMode}
          counts={{
            spans: filteredEvents.length,
            multiagent: multiagentGroups.length,
            agent: agentGroups.length,
            session: sessionGroups.length
          }}
        />

        {groupingMode === 'spans' && (
          <ColumnPickerModal
            show={showColumnPicker}
            onClose={() => setShowColumnPicker(false)}
            onToggleShow={() => setShowColumnPicker(!showColumnPicker)}
            visibleColKeys={visibleColKeys}
            onToggleColumn={toggleColumn}
          />
        )}
      </div>

      <SpanFiltersBar events={events} filters={filters} onChange={setFilters} />

      <p className="text-xs font-mono text-purple-400 px-1">
        {groupingMode === 'spans' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{filteredEvents.length}</span> of <span className="font-bold text-white">{events.length}</span> raw spans - click any row to view session modal</>
        )}
        {groupingMode === 'multiagent' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{multiagentGroups.length}</span> Multi-Agent Systems across <span className="font-bold text-white">{filteredEvents.length}</span> spans</>
        )}
        {groupingMode === 'agent' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{agentGroups.length}</span> Agent Identities across <span className="font-bold text-white">{filteredEvents.length}</span> spans</>
        )}
        {groupingMode === 'session' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{sessionGroups.length}</span> Session Groupings across <span className="font-bold text-white">{filteredEvents.length}</span> spans</>
        )}
      </p>

      <div className="ag-theme-alpine-dark w-full h-[480px] shadow-neon-purple rounded-xl overflow-hidden border border-purple-900/50">
        {groupingMode === 'spans' && (
          <AgGridReact<TelemetryEvent>
            rowData={filteredEvents as TelemetryEvent[]}
            columnDefs={rawSpanColumnDefs}
            pagination={true}
            paginationPageSize={15}
            animateRows={true}
            rowSelection="single"
            onRowClicked={(e) => {
              if (e.data?.sessionId) setSelectedSessionId(e.data.sessionId);
            }}
            rowClass="cursor-pointer"
          />
        )}
        {groupingMode === 'multiagent' && (
          <AgGridReact<MultiagentGroupSummary>
            rowData={multiagentGroups as MultiagentGroupSummary[]}
            columnDefs={multiagentColumnDefs}
            pagination={true}
            paginationPageSize={15}
            animateRows={true}
            rowSelection="single"
            onRowClicked={(e) => {
              if (e.data?.multiagentIdentity && e.data.multiagentIdentity !== 'unassigned') {
                setFilters((prev) => ({ ...prev, search: e.data!.multiagentIdentity! }));
                setGroupingMode('spans');
              }
            }}
            rowClass="cursor-pointer"
          />
        )}
        {groupingMode === 'agent' && (
          <AgGridReact<AgentGroupSummary>
            rowData={agentGroups as AgentGroupSummary[]}
            columnDefs={agentColumnDefs}
            pagination={true}
            paginationPageSize={15}
            animateRows={true}
            rowSelection="single"
            onRowClicked={(e) => {
              if (e.data?.entityId && e.data.entityId !== 'unassigned') {
                setFilters((prev) => ({ ...prev, search: e.data!.entityId }));
                setGroupingMode('spans');
              }
            }}
            rowClass="cursor-pointer"
          />
        )}
        {groupingMode === 'session' && (
          <AgGridReact<SessionGroupSummary>
            rowData={sessionGroups as SessionGroupSummary[]}
            columnDefs={sessionColumnDefs}
            pagination={true}
            paginationPageSize={15}
            animateRows={true}
            rowSelection="single"
            onRowClicked={(e) => {
              if (e.data?.sessionId && e.data.sessionId !== 'unassigned') {
                setSelectedSessionId(e.data.sessionId);
              }
            }}
            rowClass="cursor-pointer"
          />
        )}
      </div>

      {selectedSessionId && (
        <SessionModal
          sessionId={selectedSessionId}
          allEvents={events}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </div>
  );
}
