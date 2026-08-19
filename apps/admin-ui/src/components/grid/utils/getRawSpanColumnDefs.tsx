import React from 'react';
import { ColDef } from 'ag-grid-community';
import { TelemetryEvent } from '@ax-analytics/shared';

export const ALL_RAW_COLUMNS: readonly { readonly key: string; readonly label: string }[] = [
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

export function getRawSpanColumnDefs(visibleColKeys: ReadonlySet<string>): ColDef<TelemetryEvent>[] {
  const allDefs: ColDef<TelemetryEvent>[] = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      sortable: true,
      filter: true,
      width: 130,
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleTimeString() : 'Now')
    },
    { field: 'appKey', headerName: 'App Scope', sortable: true, filter: true, width: 140 },
    { field: 'sessionId', headerName: 'Session ID', sortable: true, filter: true, width: 150 },
    {
      field: 'urlPath',
      headerName: 'URL Path',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (p) => p.value || p.data?.invokedToolName || '-'
    },
    {
      field: 'documentTitle',
      headerName: 'Document Title',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (p) => p.value || '-'
    },
    {
      field: 'deviceCategory',
      headerName: 'Device',
      sortable: true,
      filter: true,
      width: 110,
      cellRenderer: (params: { value?: string; data?: TelemetryEvent }) => {
        const cat = params.value || (params.data?.browserMobile ? 'mobile' : 'desktop');
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
              cat === 'mobile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}
          >
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
      cellRenderer: (params: { value?: boolean; data?: TelemetryEvent }) => {
        if (params.data?.eventType !== 'page_view' && params.value === undefined) {
          return <span className="text-purple-600 font-mono text-xs">—</span>;
        }
        return params.value ? (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Initial Load
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs text-purple-400 font-medium">SPA Nav</span>
        );
      }
    },
    {
      field: 'documentVisibilityState',
      headerName: 'Visibility',
      sortable: true,
      filter: true,
      width: 110,
      cellRenderer: (params: { value?: string; data?: TelemetryEvent }) => {
        if (params.data?.eventType !== 'page_view' && !params.value) {
          return <span className="text-purple-600 font-mono text-xs">—</span>;
        }
        return <span className="text-purple-200 text-xs font-mono">{params.value || 'visible'}</span>;
      }
    },
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
    { field: 'tokenCost', headerName: 'Token Cost ($)', sortable: true, filter: 'agNumberColumnFilter', width: 130, valueFormatter: (p) => `$${(p.value || 0).toFixed(4)}` },
    { field: 'otelTraceId', headerName: 'OTel Trace ID', sortable: true, filter: true, width: 220 }
  ];

  return allDefs.filter((col) => visibleColKeys.has(col.field as string));
}
