import React, { useState } from 'react';
import { Activity, Copy, Check, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { JsonRpcResponse } from '@ax-analytics/shared';

export interface McpResponseCardProps {
  readonly response: JsonRpcResponse | null;
  readonly httpStatus: number | null;
  readonly latencyMs: number | null;
  readonly errorMessage: string | null;
  readonly telemetryLogged: boolean;
}

export function McpResponseCard({
  response,
  httpStatus,
  latencyMs,
  errorMessage,
  telemetryLogged
}: McpResponseCardProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = httpStatus === 200 && !response?.error;

  return (
    <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 p-5 shadow-lg backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              JSON-RPC 2.0 Response
            </h2>
            <p className="text-[11px] text-purple-300 font-mono">
              Live output from upstream MCP service
            </p>
          </div>
        </div>

        {httpStatus !== null && (
          <div className="flex items-center gap-2 font-mono text-xs">
            {latencyMs !== null && (
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                {latencyMs} ms
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded border font-bold ${
                isSuccess
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
              }`}
            >
              {httpStatus} {isSuccess ? 'OK' : 'ERR'}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-mono">Execution Error: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {telemetryLogged && (
        <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-700/50 text-xs text-fuchsia-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />
            <span className="font-mono">Telemetry Event Ingested (POST /v1/telemetry/event)</span>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
            Live Trajectory Linked
          </span>
        </div>
      )}

      {response ? (
        <div className="relative group rounded-xl overflow-hidden border border-purple-900/60 bg-[#0c0517]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#130a24] border-b border-purple-900/50 text-xs font-mono text-purple-300">
            <span>JSON-RPC Response Payload</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-white"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-purple-100 overflow-x-auto leading-relaxed max-h-96">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-purple-400 font-mono italic">
          Awaiting execution response...
        </div>
      )}
    </div>
  );
}
