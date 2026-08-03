import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { TelemetryEvent } from '@ax-analytics/shared';
import { SpanFiltersBar, SpanFilters } from './SpanFiltersBar';
import { SessionModal } from './SessionModal';
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return events.filter(evt => {
      if (filters.statusCode !== 'ALL' && (evt.statusCode || 'SUCCESS') !== filters.statusCode) return false;
      if (filters.entityType !== 'ALL' && evt.entityType !== filters.entityType) return false;
      if (filters.eventType !== 'ALL' && evt.eventType !== filters.eventType) return false;
      if (q) {
        const haystack = [
          evt.sessionId, evt.entityId, evt.invokedToolName,
          evt.previousToolName, evt.otelTraceId, evt.otelSpanId, evt.eventType
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const columnDefs: ColDef<TelemetryEvent>[] = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleTimeString() : 'Now'
    },
    { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 150 },
    { field: 'entityId', headerName: 'Entity / Agent ID', sortable: true, filter: true, width: 220 },
    { field: 'entityType', headerName: 'Type', sortable: true, filter: true, width: 100 },
    { field: 'eventType', headerName: 'Event Type', sortable: true, filter: true, width: 130 },
    { field: 'invokedToolName', headerName: 'Invoked Tool', sortable: true, filter: true, width: 200 },
    { field: 'previousToolName', headerName: 'Previous Tool', sortable: true, filter: true, width: 160 },
    {
      field: 'statusCode',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 140,
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

  return (
    <div className="space-y-3">
      {/* Filters */}
      <SpanFiltersBar events={events} filters={filters} onChange={setFilters} />

      {/* Result Count */}
      <p className="text-xs font-mono text-purple-400 px-1">
        Showing <span className="text-fuchsia-300 font-bold">{filteredEvents.length}</span> of <span className="font-bold text-white">{events.length}</span> spans — click any row to view full session timeline
      </p>

      {/* AG Grid */}
      <div className="ag-theme-alpine-dark w-full h-[480px] shadow-neon-purple rounded-xl overflow-hidden border border-purple-900/50">
        <AgGridReact<TelemetryEvent>
          rowData={filteredEvents as TelemetryEvent[]}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={15}
          animateRows={true}
          rowSelection="single"
          onRowClicked={e => {
            if (e.data?.sessionId) setSelectedSessionId(e.data.sessionId);
          }}
          rowClass="cursor-pointer"
        />
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
