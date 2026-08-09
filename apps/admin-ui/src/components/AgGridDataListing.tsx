import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { TelemetryEvent } from '@ax-analytics/shared';
import { SpanFiltersBar, SpanFilters } from './SpanFiltersBar';
import { SessionModal } from './SessionModal';
import { TraceGroupingToggle, TraceGroupingMode } from './TraceGroupingToggle';
import { groupEventsByMultiagentIdentity, MultiagentGroupSummary } from '../utils/groupEventsByMultiagentIdentity';
import { groupEventsByAgentIdentity, AgentGroupSummary } from '../utils/groupEventsByAgentIdentity';
import { groupEventsBySessionId, SessionGroupSummary } from '../utils/groupEventsBySessionId';
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

export function AgGridDataListing({ events }: AgGridDataListingProps): React.ReactElement {
  const [filters, setFilters] = useState<SpanFilters>(DEFAULT_FILTERS);
  const [groupingMode, setGroupingMode] = useState<TraceGroupingMode>('spans');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return events.filter(evt => {
      if (filters.statusCode !== 'ALL' && (evt.statusCode || 'SUCCESS') !== filters.statusCode) return false;
      if (filters.entityType !== 'ALL' && evt.entityType !== filters.entityType) return false;
      if (filters.eventType !== 'ALL' && evt.eventType !== filters.eventType) return false;
      if (q) {
        const haystack = [
          evt.sessionId, evt.entityId, evt.multiagentIdentity, evt.invokedToolName,
          evt.previousToolName, evt.otelTraceId, evt.otelSpanId, evt.eventType
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const multiagentGroups = useMemo(() => groupEventsByMultiagentIdentity(filteredEvents), [filteredEvents]);
  const agentGroups = useMemo(() => groupEventsByAgentIdentity(filteredEvents), [filteredEvents]);
  const sessionGroups = useMemo(() => groupEventsBySessionId(filteredEvents), [filteredEvents]);

  const rawSpanColumnDefs: ColDef<TelemetryEvent>[] = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleTimeString() : 'Now'
    },
    { field: 'appKey', headerName: 'App Scope', sortable: true, filter: true, width: 140 },
    { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 150 },
    { field: 'multiagentIdentity', headerName: 'Orchestrator ID', sortable: true, filter: true, width: 200 },
    { field: 'entityId', headerName: 'Entity / Agent ID', sortable: true, filter: true, width: 200 },
    { field: 'entityType', headerName: 'Type', sortable: true, filter: true, width: 90 },
    { field: 'eventType', headerName: 'Event Type', sortable: true, filter: true, width: 120 },
    { field: 'invokedToolName', headerName: 'Invoked Tool', sortable: true, filter: true, width: 180 },
    { field: 'previousToolName', headerName: 'Previous Tool', sortable: true, filter: true, width: 150 },
    { field: 'provider', headerName: 'LLM Vendor', sortable: true, filter: true, width: 120 },
    { field: 'model', headerName: 'LLM Model', sortable: true, filter: true, width: 150 },
    { field: 'inputTokens', headerName: 'Prompt Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'outputTokens', headerName: 'Completion Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 145 },
    {
      field: 'statusCode',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params: { value?: string }) => {
        const val = params.value || 'SUCCESS';
        const isErr = val !== 'SUCCESS';
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isErr ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
            {val}
          </span>
        );
      }
    },
    { field: 'executionTimeMs', headerName: 'Latency (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 120 },
    { field: 'tokenCost', headerName: 'Token Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 130, valueFormatter: p => `$${(p.value || 0).toFixed(4)}` },
    { field: 'otelTraceId', headerName: 'OTel Trace ID', sortable: true, filter: true, width: 220 }
  ];

  const multiagentColumnDefs: ColDef<MultiagentGroupSummary>[] = [
    { field: 'multiagentIdentity', headerName: 'Orchestrator System ID', sortable: true, filter: true, width: 220 },
    { field: 'spanCount', headerName: 'Spans Count', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'sessionCount', headerName: 'Unique Sessions', sortable: true, filter: 'agNumberColumnFilter', width: 145 },
    { field: 'agentCount', headerName: 'Unique Agents', sortable: true, filter: 'agNumberColumnFilter', width: 135 },
    { field: 'totalTokens', headerName: 'Total LLM Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: p => p.value?.toLocaleString() || '0' },
    { field: 'totalCost', headerName: 'Total Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: p => `$${(p.value || 0).toFixed(4)}` },
    { field: 'avgLatencyMs', headerName: 'Avg Latency (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 145, valueFormatter: p => `${Math.round(p.value || 0)} ms` },
    {
      field: 'successRate',
      headerName: 'Success Rate',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
      cellRenderer: (params: { value?: number }) => {
        const val = params.value ?? 100;
        const isGood = val >= 90;
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isGood ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
            {val.toFixed(1)}%
          </span>
        );
      }
    },
    { field: 'toolsUsed', headerName: 'Tools Invoked', sortable: false, filter: true, width: 280, valueFormatter: p => (p.value || []).join(', ') || 'None' }
  ];

  const agentColumnDefs: ColDef<AgentGroupSummary>[] = [
    { field: 'entityId', headerName: 'Agent / Entity ID', sortable: true, filter: true, width: 220 },
    { field: 'entityType', headerName: 'Type', sortable: true, filter: true, width: 100 },
    { field: 'spanCount', headerName: 'Spans Count', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'sessionCount', headerName: 'Unique Sessions', sortable: true, filter: 'agNumberColumnFilter', width: 145 },
    { field: 'multiagentCount', headerName: 'Multi-Agent Systems', sortable: true, filter: 'agNumberColumnFilter', width: 160 },
    { field: 'totalTokens', headerName: 'Total LLM Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: p => p.value?.toLocaleString() || '0' },
    { field: 'totalCost', headerName: 'Total Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: p => `$${(p.value || 0).toFixed(4)}` },
    { field: 'avgLatencyMs', headerName: 'Avg Latency (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 145, valueFormatter: p => `${Math.round(p.value || 0)} ms` },
    {
      field: 'successRate',
      headerName: 'Success Rate',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
      cellRenderer: (params: { value?: number }) => {
        const val = params.value ?? 100;
        const isGood = val >= 90;
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isGood ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
            {val.toFixed(1)}%
          </span>
        );
      }
    },
    { field: 'toolsUsed', headerName: 'Tools Invoked', sortable: false, filter: true, width: 280, valueFormatter: p => (p.value || []).join(', ') || 'None' }
  ];

  const sessionColumnDefs: ColDef<SessionGroupSummary>[] = [
    { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 200 },
    { field: 'multiagentIdentity', headerName: 'Orchestrator System', sortable: true, filter: true, width: 190, valueFormatter: p => p.value || 'unassigned' },
    { field: 'spanCount', headerName: 'Turns / Spans', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'agentCount', headerName: 'Agents Count', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'trajectorySummary', headerName: 'Execution Tool Chain', sortable: false, filter: true, width: 320, valueFormatter: p => (p.value || []).join(' → ') || 'No tool calls' },
    { field: 'totalTokens', headerName: 'LLM Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: p => p.value?.toLocaleString() || '0' },
    { field: 'totalCost', headerName: 'Total Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: p => `$${(p.value || 0).toFixed(4)}` },
    { field: 'totalDurationMs', headerName: 'Duration (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 140, valueFormatter: p => `${Math.round(p.value || 0)} ms` },
    {
      field: 'hasErrors',
      headerName: 'Session Health',
      sortable: true,
      filter: true,
      width: 140,
      cellRenderer: (params: { value?: boolean }) => {
        const hasErr = Boolean(params.value);
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${hasErr ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
            {hasErr ? 'Errors' : 'Healthy'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Grouping Toggle */}
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
      </div>

      {/* Filters Bar */}
      <SpanFiltersBar events={events} filters={filters} onChange={setFilters} />

      {/* Group Info Summary */}
      <p className="text-xs font-mono text-purple-400 px-1">
        {groupingMode === 'spans' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{filteredEvents.length}</span> of <span className="font-bold text-white">{events.length}</span> raw spans — click any row to view session timeline modal</>
        )}
        {groupingMode === 'multiagent' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{multiagentGroups.length}</span> Multi-Agent Systems across <span className="font-bold text-white">{filteredEvents.length}</span> spans — click row to filter spans</>
        )}
        {groupingMode === 'agent' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{agentGroups.length}</span> Agent Identities across <span className="font-bold text-white">{filteredEvents.length}</span> spans — click row to filter spans</>
        )}
        {groupingMode === 'session' && (
          <>Showing <span className="text-fuchsia-300 font-bold">{sessionGroups.length}</span> Session Groupings across <span className="font-bold text-white">{filteredEvents.length}</span> spans — click row to open session timeline modal</>
        )}
      </p>

      {/* AG Grid */}
      <div className="ag-theme-alpine-dark w-full h-[480px] shadow-neon-purple rounded-xl overflow-hidden border border-purple-900/50">
        {groupingMode === 'spans' && (
          <AgGridReact<TelemetryEvent>
            rowData={filteredEvents as TelemetryEvent[]}
            columnDefs={rawSpanColumnDefs}
            pagination={true}
            paginationPageSize={15}
            animateRows={true}
            rowSelection="single"
            onRowClicked={e => {
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
            onRowClicked={e => {
              if (e.data?.multiagentIdentity && e.data.multiagentIdentity !== 'unassigned') {
                setFilters(prev => ({ ...prev, search: e.data!.multiagentIdentity }));
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
            onRowClicked={e => {
              if (e.data?.entityId && e.data.entityId !== 'unassigned') {
                setFilters(prev => ({ ...prev, search: e.data!.entityId }));
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
            onRowClicked={e => {
              if (e.data?.sessionId && e.data.sessionId !== 'unassigned') {
                setSelectedSessionId(e.data.sessionId);
              }
            }}
            rowClass="cursor-pointer"
          />
        )}
      </div>

      {/* Session Modal */}
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

