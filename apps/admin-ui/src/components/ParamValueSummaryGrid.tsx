import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Copy, Check } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface ParamValueSummaryRow {
  readonly paramValue: string;
  readonly count: number;
  readonly avgToolResponseTimeMs: number;
  readonly samplePayload: string;
}

export interface ParamValueSummaryGridProps {
  readonly data: readonly ParamValueSummaryRow[];
  readonly paramName: string;
  readonly toolName: string;
}

function CopyableCellRenderer({ value, label }: { value: string; label?: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full h-full">
      <span className="font-mono text-xs text-emerald-300 font-bold truncate">{value}</span>
      <button
        onClick={handleCopy}
        title={`Copy ${label || 'value'}`}
        className="p-1 rounded bg-purple-950/80 text-purple-300 hover:text-white hover:bg-purple-900 border border-purple-800/50 flex-shrink-0 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function CopyablePayloadCellRenderer({ value }: { value: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full h-full">
      <span className="font-mono text-[11px] text-fuchsia-200 truncate">{value}</span>
      <button
        onClick={handleCopy}
        title="Copy full telemetry JSON payload"
        className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-200 hover:text-white hover:bg-fuchsia-900 border border-fuchsia-800/50 text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export function ParamValueSummaryGrid({ data, paramName, toolName }: ParamValueSummaryGridProps): React.ReactElement {
  const columnDefs = useMemo<ColDef<ParamValueSummaryRow>[]>(() => [
    {
      headerName: 'Parameter Value',
      field: 'paramValue',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: { value: string }) => (
        <CopyableCellRenderer value={params.value || ''} label="Parameter Value" />
      )
    },
    {
      headerName: 'Invocations Count',
      field: 'count',
      flex: 1,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: { value: number }) => (
        <span className="font-mono font-bold text-fuchsia-300">
          {params.value} turns
        </span>
      )
    },
    {
      headerName: 'Average Tool Response Time (ms)',
      field: 'avgToolResponseTimeMs',
      flex: 2,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: { value: number }) => (
        <span className="font-mono font-semibold text-pink-300">
          {params.value} ms <span className="text-[10px] text-purple-300/70">(Tool Duration)</span>
        </span>
      )
    },
    {
      headerName: 'Full Telemetry Event Payload',
      field: 'samplePayload',
      flex: 3,
      sortable: false,
      filter: true,
      cellRenderer: (params: { value: string }) => (
        <CopyablePayloadCellRenderer value={params.value || '{}'} />
      )
    }
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true
  }), []);

  if (data.length === 0) {
    return (
      <div className="py-8 text-center bg-[#0a0414] rounded-xl border border-purple-900/40 text-purple-300 text-xs font-mono">
        No invocations recorded yet for parameter <code className="text-fuchsia-300 font-bold">{paramName}</code> under tool <code className="text-fuchsia-300 font-bold">{toolName}</code>.
      </div>
    );
  }

  return (
    <div className="ag-theme-alpine-dark w-full h-80 rounded-xl border border-purple-900/60 overflow-hidden shadow-lg">
      <AgGridReact<ParamValueSummaryRow>
        rowData={data as ParamValueSummaryRow[]}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}
