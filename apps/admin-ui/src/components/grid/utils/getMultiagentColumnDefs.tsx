import React from 'react';
import { ColDef } from 'ag-grid-community';
import { MultiagentGroupSummary } from '../../../utils/groupEventsByMultiagentIdentity.js';

export function getMultiagentColumnDefs(): ColDef<MultiagentGroupSummary>[] {
  return [
    { field: 'multiagentIdentity', headerName: 'Orchestrator System ID', sortable: true, filter: true, width: 220 },
    { field: 'spanCount', headerName: 'Spans Count', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
    { field: 'sessionCount', headerName: 'Unique Sessions', sortable: true, filter: 'agNumberColumnFilter', width: 145 },
    { field: 'agentCount', headerName: 'Unique Agents', sortable: true, filter: 'agNumberColumnFilter', width: 135 },
    { field: 'totalTokens', headerName: 'Total LLM Tokens', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: (p) => p.value?.toLocaleString() || '0' },
    { field: 'totalCost', headerName: 'Total Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 135, valueFormatter: (p) => `$${(p.value || 0).toFixed(4)}` },
    { field: 'avgLatencyMs', headerName: 'Avg Latency (ms)', sortable: true, filter: 'agNumberColumnFilter', width: 145, valueFormatter: (p) => `${Math.round(p.value || 0)} ms` },
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
    { field: 'toolsUsed', headerName: 'Tools Invoked', sortable: false, filter: true, width: 280, valueFormatter: (p) => (p.value || []).join(', ') || 'None' }
  ];
}
