import React from 'react';
import { TelemetryEvent, SessionFeedbackRecord } from '@ax-analytics/shared';
import { AgGridDataListing } from './AgGridDataListing';

export interface TraceAndFeedbackFeedProps {
  readonly rawEvents: readonly TelemetryEvent[];
  readonly feedbackRecords: readonly SessionFeedbackRecord[];
}

export function TraceAndFeedbackFeed({ rawEvents, feedbackRecords }: TraceAndFeedbackFeedProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="neon-panel p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            Telemetry Spans & Data Table Listing
            <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-fuchsia-300 border border-purple-500/40 font-mono">
              Interactive Grid Feed
            </span>
          </h2>
          <p className="text-xs text-purple-300/70">Data grid with sorting, filtering, and pagination across all telemetry events and trace spans.</p>
        </div>

        <AgGridDataListing events={rawEvents} />
      </div>

      <div className="neon-panel p-6 space-y-4">
        <h2 className="text-lg font-bold text-white font-heading flex items-center justify-between">
          Explicit Session Feedback Votes (+1 / -1)
          <span className="text-xs font-mono text-fuchsia-400 font-semibold">User Votes</span>
        </h2>

        {feedbackRecords.length === 0 ? (
          <div className="py-8 text-center bg-[#100720]/60 rounded-xl border border-purple-900/40 text-xs text-purple-300/60">
            No session feedback votes submitted yet. Submit votes via <code className="text-fuchsia-300 font-mono">POST /v1/session/feedback</code> to populate!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackRecords.map((fb, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#140a28]/80 border border-purple-900/60 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-purple-200 font-bold">{fb.sessionId}</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${fb.vote === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                    {fb.vote === 1 ? '+1 Vote' : '-1 Vote'}
                  </span>
                </div>
                <p className="text-purple-100 italic">"{fb.comment || 'No comment'}"</p>
                <span className="text-[11px] text-purple-400/80 font-mono block">Entity: {fb.entityId}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
