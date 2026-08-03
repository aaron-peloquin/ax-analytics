import React from 'react';
import { SankeyFlowChart } from './SankeyFlowChart';

export interface TransitionNodeGraphProps {
  readonly transitions: Record<string, number>;
}

export function TransitionNodeGraph({ transitions }: TransitionNodeGraphProps): React.ReactElement {
  return (
    <div className="neon-panel p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          Agent Trajectory User Flow Diagram
          <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-fuchsia-300 border border-purple-500/40 font-mono">
            Agent Flow Map (% Branching)
          </span>
        </h2>
        <p className="text-xs text-purple-200 font-medium mt-1">
          Visualizing multi-step agent tool call navigation trajectories, branching percentage paths, and tool call transition paths.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#100720]/80 border border-purple-900/50">
        <SankeyFlowChart transitions={transitions} />
      </div>
    </div>
  );
}
