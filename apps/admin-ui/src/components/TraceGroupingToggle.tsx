import React from 'react';
import { Table, Boxes, Bot, History } from 'lucide-react';

export type TraceGroupingMode = 'spans' | 'multiagent' | 'agent' | 'session';

export interface TraceGroupingToggleProps {
  readonly activeMode: TraceGroupingMode;
  readonly onChange: (mode: TraceGroupingMode) => void;
  readonly counts?: {
    readonly spans: number;
    readonly multiagent: number;
    readonly agent: number;
    readonly session: number;
  };
}

export function TraceGroupingToggle({
  activeMode,
  onChange,
  counts
}: TraceGroupingToggleProps): React.ReactElement {
  const options: readonly {
    readonly id: TraceGroupingMode;
    readonly label: string;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly badgeCount?: number;
    readonly tooltip: string;
  }[] = [
    {
      id: 'spans',
      label: 'Raw Spans',
      icon: Table,
      badgeCount: counts?.spans,
      tooltip: 'Individual telemetry trace events & span details'
    },
    {
      id: 'multiagent',
      label: 'Multi-Agent Systems',
      icon: Boxes,
      badgeCount: counts?.multiagent,
      tooltip: 'Grouped by multiagentIdentity orchestrator scope'
    },
    {
      id: 'agent',
      label: 'Agent Identities',
      icon: Bot,
      badgeCount: counts?.agent,
      tooltip: 'Grouped by worker entityId / agentIdentity persona'
    },
    {
      id: 'session',
      label: 'Session Groupings',
      icon: History,
      badgeCount: counts?.session,
      tooltip: 'Grouped by user request sessionId timeline'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#090414] p-1.5 rounded-xl border border-purple-900/60 shadow-inner">
      <span className="text-[11px] font-mono font-bold uppercase text-purple-400/80 px-2 flex items-center gap-1.5">
        Group By:
      </span>

      <div className="flex flex-wrap items-center gap-1">
        {options.map(opt => {
          const IconComponent = opt.icon;
          const isActive = activeMode === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              title={opt.tooltip}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-purple-950/90 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.35)]'
                  : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/30 border border-transparent'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-fuchsia-400' : 'text-purple-400/80'}`} />
              <span>{opt.label}</span>
              {typeof opt.badgeCount === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                      : 'bg-purple-900/40 text-purple-300/80'
                  }`}
                >
                  {opt.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
