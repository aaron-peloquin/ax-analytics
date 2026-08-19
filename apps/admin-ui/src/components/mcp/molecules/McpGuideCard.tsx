import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export function McpGuideCard(): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 shadow-lg backdrop-blur-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-purple-950/30 hover:bg-purple-900/40 text-left transition-colors border-b border-purple-900/40"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              AX Ingestion & MCP Testing Guide
            </h2>
            <p className="text-[11px] text-purple-300 font-mono">
              CORS-immune remote tool execution and automated telemetry ingestion
            </p>
          </div>
        </div>
        <div className="p-1.5 rounded-lg bg-purple-900/50 text-purple-200 border border-purple-700/40">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-purple-200">
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-fuchsia-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <span>CORS-Immune Reverse Proxy</span>
            </div>
            <p className="text-[11px] text-purple-300">
              The server routes requests through <code className="text-fuchsia-300">POST /v1/mcp/proxy</code> to bypass browser CORS constraints.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Dynamic Param Interpolation</span>
            </div>
            <p className="text-[11px] text-purple-300">
              Use bracket tokens like <code className="text-cyan-300">[tenantId]</code> in URL strings to automatically interpolate dynamic path parameters.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Auto Telemetry Logging</span>
            </div>
            <p className="text-[11px] text-purple-300">
              Successful tool executions automatically record telemetry spans with latency, model parameters, and output results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
