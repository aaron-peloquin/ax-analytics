import React, { useState } from 'react';
import { Globe, Sliders, Key, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { McpHeaderPair } from '@ax-analytics/shared';

export interface McpConnectionCardProps {
  readonly rawUrl: string;
  readonly setRawUrl: (url: string) => void;
  readonly urlParams: Record<string, string>;
  readonly setUrlParams: (params: Record<string, string>) => void;
  readonly detectedParams: readonly string[];
  readonly resolvedTargetUrl: string;
  readonly headers: readonly McpHeaderPair[];
  readonly setHeaders: (headers: McpHeaderPair[]) => void;
  readonly connecting: boolean;
  readonly onConnect: () => void;
  readonly httpStatus: number | null;
}

export function McpConnectionCard({
  rawUrl,
  setRawUrl,
  urlParams,
  setUrlParams,
  detectedParams,
  resolvedTargetUrl,
  headers,
  setHeaders,
  connecting,
  onConnect,
  httpStatus
}: McpConnectionCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleUpdateHeaderKey = (index: number, key: string) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], key };
    setHeaders(updated);
  };

  const handleUpdateHeaderValue = (index: number, value: string) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], value };
    setHeaders(updated);
  };

  return (
    <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 shadow-lg backdrop-blur-xl overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between bg-purple-950/30 hover:bg-purple-900/40 text-left transition-colors border-b border-purple-900/40"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Target MCP Server & Custom Headers
            </h2>
            <p className="text-[11px] text-purple-300 font-mono truncate max-w-xs sm:max-w-md">
              {resolvedTargetUrl ? `Target: ${resolvedTargetUrl}` : 'Configure target URL and HTTP headers'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {httpStatus === 200 && !isExpanded && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
            </span>
          )}
          <div className="p-1.5 rounded-lg bg-purple-900/50 text-purple-200 border border-purple-700/40">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200 font-mono uppercase tracking-wider">
                1. MCP Server Endpoint URL
              </span>
              <span className="text-[11px] font-mono text-purple-300">CORS Immunity Enabled</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200 block font-mono">
                Endpoint URL <span className="text-purple-400 font-normal">(supports [param] placeholders)</span>
              </label>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="https://api.mcp-server.com/v1/[tenantId]/mcp"
                className="w-full bg-[#090412] border border-purple-800/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
            </div>

            {detectedParams.length > 0 && (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-200">
                    Detected URL Parameters ({detectedParams.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detectedParams.map((param) => (
                    <div key={param} className="space-y-1">
                      <label className="text-[11px] font-mono text-purple-300 font-semibold block">
                        [{param}] Value:
                      </label>
                      <input
                        type="text"
                        value={urlParams[param] || ''}
                        onChange={(e) => setUrlParams({ ...urlParams, [param]: e.target.value })}
                        placeholder={`Enter ${param}...`}
                        className="w-full bg-[#07030d] border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
              <span className="text-purple-400 font-bold">Resolved Proxy Target:</span>
              <span className="text-fuchsia-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50 break-all">
                {resolvedTargetUrl || '—'}
              </span>
            </div>
          </div>

          <div className="border-t border-purple-900/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-200 font-mono uppercase tracking-wider">
                  2. Custom HTTP Headers ({headers.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddHeader}
                className="flex items-center space-x-1.5 px-3 py-1 bg-purple-900/60 hover:bg-purple-800/80 text-fuchsia-200 rounded-lg text-xs font-mono border border-purple-700/50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </button>
            </div>

            {headers.length === 0 ? (
              <p className="text-xs text-purple-400 italic">No custom headers configured.</p>
            ) : (
              <div className="space-y-2">
                {headers.map((hdr, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hdr.key}
                      onChange={(e) => handleUpdateHeaderKey(idx, e.target.value)}
                      placeholder="Header Name (e.g. Authorization)"
                      className="flex-1 bg-[#090412] border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 font-mono"
                    />
                    <input
                      type="text"
                      value={hdr.value}
                      onChange={(e) => handleUpdateHeaderValue(idx, e.target.value)}
                      placeholder="Header Value"
                      className="flex-1 bg-[#090412] border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHeader(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onConnect}
              disabled={connecting || !resolvedTargetUrl}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50"
            >
              {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{connecting ? 'Connecting to MCP Server...' : 'Discover MCP Tools (tools/list)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
