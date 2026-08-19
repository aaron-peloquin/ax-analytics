import React from 'react';
import { ColDef } from 'ag-grid-community';
import { SessionGroupSummary } from '../../../utils/groupEventsBySessionId.js';

export function getSessionColumnDefs(): ColDef<SessionGroupSummary>[] {
  return [
    { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 200 },
    { field: 'multiagentIdentity', headerName: 'Orchestrator System', sortable: true, filter: true, width: 190, valueFormatter: (p) => p.value || 'unassigned' },
    { field: 'spanCount', headerName: 'Turns / Spans', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'agentCount', headerName: 'Agents Count', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'trajectorySummary', headerName: 'Event Action Sequence', sortable: false, filter: true, width: 340, valueFormatter: (p) => (p.value || []).join(' → ') || 'No events recorded' },
    { field: 'totalTokens', headerName: 'LLM Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: (p) => p.value?.toLocaleString() || '0' },
    { field: 'totalCost', headerName: 'Total Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: (p) => `$${(p.value || 0).toFixed(4)}` },
    { field: 'totalDurationMs', headerName: 'Duration (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 140, valueFormatter: (p) => `${Math.round(p.value || 0)} ms` },
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
}
