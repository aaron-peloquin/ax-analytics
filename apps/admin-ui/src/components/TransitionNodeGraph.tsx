import React from 'react';
import { SankeyFlowChart } from './SankeyFlowChart';

export interface TransitionNodeGraphProps {
  readonly transitions: Record<string, number>;
  readonly userPageTransitions?: Record<string, number>;
}

export function TransitionNodeGraph({ transitions, userPageTransitions = {} }: TransitionNodeGraphProps): React.ReactElement {
  return (
    <div className="space-y-8">
      {/* 1. Agent Tool Call Trajectory */}
      <div className="neon-panel p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            Agent Tool Flow
            <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-fuchsia-300 border border-purple-500/40 font-mono">
              Agent Tool Flow Map (% Branching)
            </span>
          </h2>
          <p className="text-xs text-purple-200 font-medium mt-1">
            Visualizing multi-step agent tool call navigation trajectories, branching percentage paths, and tool call transition paths.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#100720]/80 border border-purple-900/50">
          <SankeyFlowChart
            transitions={transitions}
            emptyTitle="No Agent Tool Trajectory Data Ingested Yet"
            emptySubtext="Ingest agent tool call telemetry with invokedToolName and previousToolName to map live tool request flows."
          />
        </div>
      </div>

      {/* 2. User Page Navigation Flow */}
      <div className="neon-panel p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            User Page Flow
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
              Page Title Flow Map (% Conversion)
            </span>
          </h2>
          <p className="text-xs text-purple-200 font-medium mt-1">
            Visualizing multi-step user web navigation trajectories, page titles, and conversion path branching.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#100720]/80 border border-purple-900/50">
          <SankeyFlowChart
            transitions={userPageTransitions}
            emptyTitle="No User Page Navigation Data Ingested Yet"
            emptySubtext="Ingest web pageview telemetry with pageTitle or previousPageTitle to map live user navigation paths."
          />
        </div>
      </div>
    </div>
  );
}

