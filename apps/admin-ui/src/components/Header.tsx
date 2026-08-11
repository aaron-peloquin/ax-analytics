import React from 'react';
import { Activity, GitMerge, Table, Zap, DollarSign, Settings } from 'lucide-react';

export interface HeaderProps {
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
  readonly totalEvents: number;
  readonly onSendTestEvent: () => void;
}

export function Header({ activeTab, setActiveTab, totalEvents, onSendTestEvent }: HeaderProps): React.ReactElement {
  const tabs = [
    { id: 'overview', label: 'Traffic Overview', icon: Activity },
    { id: 'transitions', label: 'Flows', icon: GitMerge },
    { id: 'cost', label: 'Cost & ROI', icon: DollarSign },
    { id: 'experiments', label: 'A/B Experiments', icon: Settings },
    { id: 'traces', label: 'Opik / AG-Grid Spans', icon: Table }
  ];

  return (
    <header className="border-b border-purple-900/40 bg-[#0c0618]/90 backdrop-blur-2xl sticky top-0 z-50 shadow-neon-purple">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-neon-pink border border-purple-400/40 text-xl font-heading">
            AX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-400 font-heading">
                AX Analytics Engine
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-purple-950/80 text-fuchsia-300 border border-purple-500/50 shadow-neon-purple">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></span>
                Neon Live Telemetry ({totalEvents} events)
              </span>
            </div>
            <p className="text-xs text-purple-300/70 mt-0.5">Agent Experience & Behavioral Intelligence System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={onSendTestEvent}
            className="neon-glow-btn text-xs flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-fuchsia-300 animate-bounce" />
            Send Test Telemetry Event
          </button>

          <nav className="flex space-x-1 overflow-x-auto p-1.5 bg-[#140a28]/80 rounded-2xl border border-purple-900/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600/30 text-fuchsia-200 border border-purple-500/50 shadow-neon-purple'
                      : 'text-purple-300/60 hover:text-purple-100 hover:bg-purple-950/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-fuchsia-400' : 'text-purple-400/60'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
