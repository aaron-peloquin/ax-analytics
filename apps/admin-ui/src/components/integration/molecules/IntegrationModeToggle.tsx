import React from 'react';
import { Terminal, BookOpen } from 'lucide-react';

export type IntegrationViewMode = 'api' | 'skill';

export interface IntegrationModeToggleProps {
  readonly viewMode: IntegrationViewMode;
  readonly onToggleMode: (mode: IntegrationViewMode) => void;
}

export function IntegrationModeToggle({
  viewMode,
  onToggleMode
}: IntegrationModeToggleProps): React.ReactElement {
  return (
    <div className="flex gap-2 p-1.5 bg-[#130a24] rounded-xl border border-purple-900/60 w-fit">
      <button
        type="button"
        onClick={() => onToggleMode('api')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
          viewMode === 'api'
            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50'
            : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
        }`}
      >
        <Terminal className="w-4 h-4" />
        <span>HTTP API Specification</span>
      </button>
      <button
        type="button"
        onClick={() => onToggleMode('skill')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
          viewMode === 'skill'
            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50'
            : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Agent Skill Document</span>
      </button>
    </div>
  );
}
