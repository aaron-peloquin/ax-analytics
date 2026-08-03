import React, { useState } from 'react';
import { TelemetryEvent } from '@ax-analytics/shared';
import { buildSunburstData } from '../utils/buildSunburstData';
import { SunburstChart } from './SunburstChart';
import { ParamValueSummaryGrid, ParamValueSummaryRow } from './ParamValueSummaryGrid';
import { PieChart, Filter, Table, Layers } from 'lucide-react';

export interface ToolSunburstInspectorProps {
  readonly events: readonly TelemetryEvent[];
}

export function ToolSunburstInspector({ events }: ToolSunburstInspectorProps): React.ReactElement {
  const availableTools = Array.from(
    new Set(
      events
        .map(e => e.invokedToolName)
        .filter((t): t is string => Boolean(t))
    )
  );

  const [selectedTool, setSelectedTool] = useState<string>(availableTools[0] || '');
  const activeTool = selectedTool || availableTools[0] || '';

  const toolEvents = events.filter(e => e.invokedToolName === activeTool);
  
  // Extract all distinct parameter keys for the active tool
  const availableParams = Array.from(
    new Set(
      toolEvents.flatMap(e => (e.params ? Object.keys(e.params) : []))
    )
  );

  const [selectedParam, setSelectedParam] = useState<string>('');
  const activeParam = selectedParam || availableParams[0] || '';

  const sunburstNodes = buildSunburstData(events, activeTool);

  // Group events by parameter value to compute summary AG Grid rows with sample full payloads
  const valueGroupMap: Record<string, { count: number; totalMs: number; sampleEvt: TelemetryEvent }> = {};

  for (const evt of toolEvents) {
    if (!evt.params || !activeParam || !(activeParam in evt.params)) continue;
    const rawVal = evt.params[activeParam];
    const valStr = typeof rawVal === 'object' && rawVal !== null ? JSON.stringify(rawVal) : String(rawVal);

    if (!valueGroupMap[valStr]) {
      valueGroupMap[valStr] = { count: 0, totalMs: 0, sampleEvt: evt };
    }
    valueGroupMap[valStr].count += 1;
    valueGroupMap[valStr].totalMs += evt.executionTimeMs || 0;
  }

  const summaryRows: ParamValueSummaryRow[] = Object.entries(valueGroupMap).map(([valStr, metrics]) => ({
    paramValue: valStr,
    count: metrics.count,
    avgToolResponseTimeMs: Math.round(metrics.totalMs / metrics.count),
    samplePayload: JSON.stringify(metrics.sampleEvt)
  }));

  if (availableTools.length === 0) {
    return (
      <section aria-label="Tool Inspector" className="neon-panel p-8 text-center space-y-3">
        <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-800/40 text-purple-300 w-12 h-12 mx-auto flex items-center justify-center">
          <PieChart className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-white font-heading">No Agent Tool Telemetry Ingested Yet</h3>
        <p className="text-xs text-purple-200 font-medium max-w-md mx-auto">
          Ingest agent tool call events with <code className="text-fuchsia-300 font-mono font-bold">invokedToolName</code> and parameter arguments to inspect tool parameter hubs and value AG Grid tables.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Tool Inspector" className="neon-panel p-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            Tool Inspector
            <PieChart className="w-5 h-5 text-fuchsia-400" aria-hidden="true" />
          </h2>
          <p className="text-xs text-purple-200 font-medium mt-1">
            Inner Hub: Parameter Name | Outer Hub: Parameter Value (≥ 8% share threshold). Click any parameter to inspect grouped AG Grid summary values and full telemetry payloads below.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#140a28] px-3 py-1.5 rounded-xl border border-purple-900/60 text-xs">
          <Filter className="w-4 h-4 text-purple-400" aria-hidden="true" />
          <label htmlFor="tool-inspector-select" className="text-purple-200 font-semibold cursor-pointer">
            Select Tool:
          </label>
          <select
            id="tool-inspector-select"
            value={activeTool}
            onChange={e => {
              setSelectedTool(e.target.value);
              setSelectedParam('');
            }}
            className="bg-transparent text-fuchsia-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-fuchsia-400 cursor-pointer rounded px-1"
          >
            {availableTools.map(t => (
              <option key={t} value={t} className="bg-[#140a28] text-purple-200">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sunburst Graph */}
      <SunburstChart
        data={sunburstNodes}
        title={`Tool Inspector for "${activeTool}"`}
        onNodeClick={(paramName) => {
          if (availableParams.includes(paramName)) {
            setSelectedParam(paramName);
          }
        }}
      />

      {/* Parameter Selection Tabs & AG Grid Summary Table */}
      <div className="neon-panel p-6 space-y-4 border-purple-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Table className="w-4 h-4 text-fuchsia-400" />
              Parameter Value Group Summary (AG Grid): <span className="text-fuchsia-300 font-mono">{activeParam || 'None'}</span>
            </h3>
            <p className="text-xs text-purple-200 font-medium mt-0.5">
              Grouped summary for parameter <code className="text-fuchsia-300 font-mono">{activeParam}</code> showing invocation counts, average tool execution duration, and full event telemetry payloads with copy controls
            </p>
          </div>

          {availableParams.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0f071e] p-1 rounded-xl border border-purple-900/60 flex-wrap">
              <span className="text-[10px] text-purple-300 font-mono px-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-400" /> Params:
              </span>
              {availableParams.map(param => (
                <button
                  key={param}
                  onClick={() => setSelectedParam(param)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeParam === param
                      ? 'bg-purple-900/80 text-fuchsia-200 border border-purple-500/60 shadow-sm'
                      : 'text-purple-200 hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  {param}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AG Grid Datatable */}
        <ParamValueSummaryGrid
          data={summaryRows}
          paramName={activeParam}
          toolName={activeTool}
        />
      </div>
    </section>
  );
}
