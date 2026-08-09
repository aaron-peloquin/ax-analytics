import React from 'react';
import { Activity, GitMerge, Table, DollarSign, Settings, PieChart, Code, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface SidebarProps {
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly isMobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isCollapsed, onToggleCollapse, isMobileOpen = false, onCloseMobile }: SidebarProps): React.ReactElement {
  const navItems = [
    { id: 'overview', label: 'Traffic Overview', icon: Activity, desc: 'Real-time telemetry' },
    { id: 'sunburst', label: 'Tool Inspector', icon: PieChart, desc: 'Param hub & value table' },
    { id: 'transitions', label: 'Tool Request Flows', icon: GitMerge, desc: 'Agent & page flows' },
    { id: 'cost', label: 'Resolved Agent Runs', icon: DollarSign, desc: 'Execution & outcomes' },
    { id: 'experiments', label: 'A/B Experiments', icon: Settings, desc: 'Sticky variant rules' },
    { id: 'traces', label: 'Telemetry Spans Grid', icon: Table, desc: 'Filterable trace data' },
    { id: 'integrate', label: 'cURL API & Types', icon: Code, desc: 'HTTP API & _v1 contracts' }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside 
        aria-label="Main Sidebar Navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#090412] border-r border-purple-900/40 flex flex-col justify-between transition-all duration-300 shadow-md ${
          isCollapsed ? 'w-16 p-2' : 'w-56 p-4'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Header Logo & Collapse Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1 pt-1`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-sm border border-purple-400/40 text-sm font-heading" aria-hidden="true">
                  AX
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-white font-heading">
                    AX Analytics
                  </h1>
                  <p className="text-[11px] text-purple-200 font-medium">Telemetry Platform</p>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-sm border border-purple-400/40 text-xs font-heading" aria-hidden="true">
                AX
              </div>
            )}

            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
              aria-expanded={!isCollapsed}
              className="p-1.5 rounded-lg bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-colors border border-purple-800/40"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" aria-hidden="true" /> : <PanelLeftClose className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav aria-label="Primary Dashboard Views" className="space-y-1">
            {!isCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-300 px-2 block mb-2 font-mono">
                Menu
              </span>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full transition-all text-left flex items-center group focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${
                    isCollapsed ? 'justify-center p-2.5 rounded-xl' : 'p-2.5 rounded-xl justify-between'
                  } ${
                    isActive
                      ? 'bg-purple-900/50 text-white border border-purple-400/60 shadow-md'
                      : 'text-purple-200 hover:bg-purple-950/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-purple-950/70 text-purple-300 group-hover:text-purple-100'}`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    {!isCollapsed && (
                      <div>
                        <span className="text-xs font-bold block text-white">{item.label}</span>
                        <span className="text-[10px] text-purple-200 font-medium block">{item.desc}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Connection Status */}
        <div className={`p-2.5 rounded-xl bg-[#120822] border border-purple-900/60 ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-xs`}>
            {!isCollapsed && <span className="text-xs text-purple-200 font-semibold">Server</span>}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400" aria-label="Server status: Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              {!isCollapsed && 'Connected'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
