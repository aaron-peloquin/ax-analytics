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

import { SlidersHorizontal, Check } from 'lucide-react';

export interface AgGridDataListingProps {
  readonly events: readonly TelemetryEvent[];
}

const DEFAULT_FILTERS: SpanFilters = {
  search: '',
  statusCode: 'ALL',
  entityType: 'ALL',
  eventType: 'ALL'
};

const ALL_RAW_COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'appKey', label: 'App Scope' },
  { key: 'sessionId', label: 'Session ID' },
  { key: 'urlPath', label: 'URL Path' },
  { key: 'documentTitle', label: 'Document Title' },
  { key: 'deviceCategory', label: 'Device (Desktop/Mobile)' },
  { key: 'isEntrypointPage', label: 'Entrypoint Page' },
  { key: 'documentVisibilityState', label: 'Visibility State' },
  { key: 'multiagentIdentity', label: 'Orchestrator ID' },
  { key: 'entityId', label: 'Entity / User ID' },
  { key: 'entityType', label: 'Type' },
  { key: 'eventType', label: 'Event Type' },
  { key: 'invokedToolName', label: 'Invoked Tool / Page' },
  { key: 'previousToolName', label: 'Previous Tool / Path' },
  { key: 'provider', label: 'LLM Vendor' },
  { key: 'model', label: 'LLM Model' },
  { key: 'inputTokens', label: 'Prompt Tokens' },
  { key: 'outputTokens', label: 'Completion Tokens' },
  { key: 'statusCode', label: 'Status' },
  { key: 'executionTimeMs', label: 'Latency (ms)' },
  { key: 'tokenCost', label: 'Token Cost ($)' },
  { key: 'otelTraceId', label: 'OTel Trace ID' }
];

export function AgGridDataListing({ events }: AgGridDataListingProps): React.ReactElement {
  const [filters, setFilters] = useState<SpanFilters>(DEFAULT_FILTERS);
  const [groupingMode, setGroupingMode] = useState<TraceGroupingMode>('spans');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showColumnPicker, setShowColumnPicker] = useState<boolean>(false);
  const [visibleColKeys, setVisibleColKeys] = useState<Set<string>>(
    new Set([
      'timestamp', 'appKey', 'sessionId', 'urlPath', 'documentTitle', 'deviceCategory', 
      'isEntrypointPage', 'entityId', 'entityType', 'eventType', 'invokedToolName', 
      'statusCode', 'executionTimeMs', 'otelTraceId'
    ])
  );

  const toggleColumn = (key: string) => {
    setVisibleColKeys(prev => {
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
    return events.filter(evt => {
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

  const rawSpanColumnDefs: ColDef<TelemetryEvent>[] = useMemo(() => {
    const allDefs: ColDef<TelemetryEvent>[] = [
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        sortable: true,
        filter: true,
        width: 130,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleTimeString() : 'Now'
      },
      { field: 'appKey', headerName: 'App Scope', sortable: true, filter: true, width: 140 },
      { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 150 },
      { field: 'urlPath', headerName: 'URL Path', sortable: true, filter: true, width: 180, valueFormatter: p => p.value || p.data?.invokedToolName || '-' },
      { field: 'documentTitle', headerName: 'Document Title', sortable: true, filter: true, width: 180, valueFormatter: p => p.value || '-' },
      {
        field: 'deviceCategory',
        headerName: 'Device',
        sortable: true,
        filter: true,
        width: 110,
        cellRenderer: (params: { value?: string, data?: TelemetryEvent }) => {
          const cat = params.value || (params.data?.browserMobile ? 'mobile' : 'desktop');
          return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${cat === 'mobile' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'}`}>
              {cat}
            </span>
          );
        }
      },
      {
        field: 'isEntrypointPage',
        headerName: 'Entrypoint',
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params: { value?: boolean }) => {
          return params.value ? (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Initial Load
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs text-purple-400">SPA Nav</span>
          );
        }
      },
      { field: 'documentVisibilityState', headerName: 'Visibility', sortable: true, filter: true, width: 110, valueFormatter: p => p.value || 'visible' },
      { field: 'multiagentIdentity', headerName: 'Orchestrator ID', sortable: true, filter: true, width: 180 },
      { field: 'entityId', headerName: 'Entity / User ID', sortable: true, filter: true, width: 180 },
      {
        field: 'entityType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: (params: { value?: string }) => {
          const type = params.value;
          if (type === 'agent') {
            return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">agent</span>;
          }
          if (type === 'human') {
            return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-800/50">human</span>;
          }
          return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-950/40 text-purple-400 border border-purple-900/30">system</span>;
        }
      },
      { field: 'eventType', headerName: 'Event Type', sortable: true, filter: true, width: 120 },
      { field: 'invokedToolName', headerName: 'Invoked Tool / Page', sortable: true, filter: true, width: 180 },
      { field: 'previousToolName', headerName: 'Previous Tool / Path', sortable: true, filter: true, width: 160 },
      { field: 'provider', headerName: 'LLM Vendor', sortable: true, filter: true, width: 120 },
      { field: 'model', headerName: 'LLM Model', sortable: true, filter: true, width: 150 },
      { field: 'inputTokens', headerName: 'Prompt Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
      { field: 'outputTokens', headerName: 'Completion Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 145 },
      {
        field: 'statusCode',
        headerName: 'Status',
        sortable: true,
        filter: true,
        width: 120,
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

    return allDefs.filter(col => visibleColKeys.has(col.field as string));
  }, [visibleColKeys]);

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
    { field: 'trajectorySummary', headerName: 'Event Action Sequence', sortable: false, filter: true, width: 340, valueFormatter: p => (p.value || []).join(' → ') || 'No events recorded' },
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
      {/* Grouping Toggle & Column Picker */}
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 text-xs font-medium transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Column Picker ({visibleColKeys.size}/{ALL_RAW_COLUMNS.length})</span>
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-[#130a24] border border-purple-700/60 rounded-xl shadow-2xl z-50 text-xs space-y-2 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                  <span className="font-semibold text-fuchsia-300">Visible Columns</span>
                  <button
                    type="button"
                    onClick={() => setShowColumnPicker(false)}
                    className="text-purple-400 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {ALL_RAW_COLUMNS.map(col => {
                    const isChecked = visibleColKeys.has(col.key);
                    return (
                      <label
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-purple-900/40 cursor-pointer text-purple-200 select-none"
                      >
                        <span>{col.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-purple-600 border-purple-400 text-white' : 'border-purple-800 bg-purple-950/50'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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

