import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TelemetryEvent } from '@ax-analytics/shared';
import { X, Clock, Zap, DollarSign, Tag, Hash, ChevronRight } from 'lucide-react';

export interface SessionModalProps {
  readonly sessionId: string;
  readonly allEvents: readonly TelemetryEvent[];
  readonly onClose: () => void;
}

export function SessionModal({ sessionId, allEvents, onClose }: SessionModalProps): React.ReactElement {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const directEvents = allEvents.filter(e => e.sessionId === sessionId);
  const matchingMultiagentId = directEvents.find(e => Boolean(e.multiagentIdentity))?.multiagentIdentity;
  const matchingOtelTraceId = directEvents.find(e => Boolean(e.otelTraceId))?.otelTraceId;

  const sessionEvents = allEvents
    .filter(e => {
      if (e.sessionId === sessionId) return true;
      if (matchingMultiagentId && e.multiagentIdentity && e.multiagentIdentity === matchingMultiagentId) return true;
      if (matchingOtelTraceId && e.otelTraceId && e.otelTraceId === matchingOtelTraceId) return true;
      return false;
    })
    .slice()
    .sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

  const totalCost = sessionEvents.reduce((sum, e) => sum + (e.tokenCost || 0), 0);
  const totalMs = sessionEvents.reduce((sum, e) => sum + (e.executionTimeMs || 0), 0);
  const successCount = sessionEvents.filter(e => !e.statusCode || e.statusCode === 'SUCCESS').length;
  const errorCount = sessionEvents.length - successCount;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Session ${sessionId} full telemetry view`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="neon-panel w-[95vw] sm:w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] my-auto flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-purple-500/40">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-900/60 bg-[#0c051a] flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">Full Agent Run Timeline</h2>
            <p className="text-xs font-mono text-fuchsia-300 mt-0.5 truncate max-w-[200px] sm:max-w-none">{sessionId}</p>
          </div>

          {/* Session Stats */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-purple-200">
              <Hash className="w-3 h-3 text-purple-400" />
              <span className="font-bold text-white">{sessionEvents.length}</span> spans
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Zap className="w-3 h-3" />
              <span className="font-bold">{successCount}</span> ok
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-300">
                <X className="w-3 h-3" />
                <span className="font-bold">{errorCount}</span> err
              </span>
            )}
            <span className="flex items-center gap-1.5 text-pink-300">
              <Clock className="w-3 h-3" />
              {totalMs.toLocaleString()} ms
            </span>
            <span className="flex items-center gap-1.5 text-yellow-300">
              <DollarSign className="w-3 h-3" />
              ${totalCost.toFixed(4)}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close session modal"
            className="ml-4 p-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white hover:bg-purple-900 border border-purple-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {sessionEvents.length === 0 ? (
            <p className="text-center text-purple-300 text-sm py-8">No events found for this session run.</p>
          ) : (
            <ol className="relative border-l border-purple-800/50 ml-3 space-y-4">
              {sessionEvents.map((evt, idx) => {
                const isError = evt.statusCode && evt.statusCode !== 'SUCCESS';
                const isLlm = evt.eventType === 'llm_inference';
                const time = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : `Span ${idx + 1}`;
                const titleLabel = evt.invokedToolName || (isLlm ? `LLM (${evt.model || evt.provider || 'Inference'})` : evt.eventType);

                return (
                  <li key={`${evt.otelSpanId || idx}`} className="ml-6 relative">
                    {/* Timeline Dot */}
                    <span className={`absolute -left-9 flex items-center justify-center w-4 h-4 rounded-full border-2 mt-1 ${
                      isError
                        ? 'border-rose-500 bg-rose-950'
                        : isLlm
                        ? 'border-cyan-400 bg-cyan-950'
                        : 'border-fuchsia-500 bg-fuchsia-950'
                    }`} aria-hidden="true">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isError ? 'bg-rose-400' : isLlm ? 'bg-cyan-300' : 'bg-fuchsia-400'
                      }`} />
                    </span>

                    <div className={`neon-panel p-4 rounded-xl space-y-3 border ${
                      isError ? 'border-rose-900/50' : isLlm ? 'border-cyan-900/50' : 'border-purple-900/40'
                    }`}>
                      {/* Span Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                            isLlm
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800'
                          }`}>
                            {isLlm ? 'LLM Inference' : 'Tool Call'}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">{titleLabel}</span>
                          {evt.previousToolName && (
                            <>
                              <ChevronRight className="w-3 h-3 text-purple-400" aria-hidden="true" />
                              <span className="text-xs font-mono text-purple-300">{evt.previousToolName}</span>
                            </>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isError
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}>
                            {evt.statusCode || 'SUCCESS'}
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-400 font-mono">{time}</span>
                      </div>

                      {/* Span Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-purple-300">
                        {evt.appKey && (
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-cyan-300 border border-purple-800 text-[10px]">
                            app: {evt.appKey}
                          </span>
                        )}
                        {evt.multiagentIdentity && (
                          <span className="px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800 text-[10px]">
                            orch: {evt.multiagentIdentity}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-purple-500" />{evt.entityId}</span>
                        {evt.provider && (
                          <span className="text-purple-300 font-bold">[{evt.provider}{evt.model ? ` / ${evt.model}` : ''}]</span>
                        )}
                        {evt.inputTokens !== undefined && (
                          <span className="text-purple-400">prompt: {evt.inputTokens} tok</span>
                        )}
                        {evt.outputTokens !== undefined && (
                          <span className="text-fuchsia-400">completion: {evt.outputTokens} tok</span>
                        )}
                        {evt.executionTimeMs !== undefined && (
                          <span className="flex items-center gap-1 text-pink-300"><Clock className="w-3 h-3" />{evt.executionTimeMs} ms</span>
                        )}
                        {evt.tokenCost !== undefined && (
                          <span className="flex items-center gap-1 text-yellow-300"><DollarSign className="w-3 h-3" />${evt.tokenCost.toFixed(4)}</span>
                        )}
                        {evt.otelSpanId && (
                          <span className="text-purple-500 text-[10px] truncate max-w-xs">span: {evt.otelSpanId}</span>
                        )}
                      </div>

                      {/* Params */}
                      {evt.params && Object.keys(evt.params).length > 0 && (
                        <details className="group">
                          <summary className="text-[11px] font-mono font-bold text-purple-300 cursor-pointer hover:text-white select-none list-none flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" aria-hidden="true" />
                            Params ({Object.keys(evt.params).length})
                          </summary>
                          <pre className="mt-2 text-[10px] font-mono text-fuchsia-200 bg-[#0a0414] rounded-lg p-3 overflow-x-auto border border-purple-900/40 max-h-40">
                            {JSON.stringify(evt.params, null, 2)}
                          </pre>
                        </details>
                      )}

                      {/* Results */}
                      {evt.results && Object.keys(evt.results).length > 0 && (
                        <details className="group">
                          <summary className="text-[11px] font-mono font-bold text-purple-300 cursor-pointer hover:text-white select-none list-none flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" aria-hidden="true" />
                            Results ({Object.keys(evt.results).length})
                          </summary>
                          <pre className={`mt-2 text-[10px] font-mono rounded-lg p-3 overflow-x-auto border max-h-40 ${
                            isError
                              ? 'text-rose-200 bg-rose-950/30 border-rose-900/40'
                              : 'text-emerald-200 bg-emerald-950/20 border-emerald-900/40'
                          }`}>
                            {JSON.stringify(evt.results, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-purple-900/60 bg-[#0c051a] flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-purple-400 font-mono">Session: <span className="text-fuchsia-300">{sessionId}</span></p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-950 text-purple-200 hover:text-white hover:bg-purple-900 border border-purple-800/50 text-xs font-bold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

