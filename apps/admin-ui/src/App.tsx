import React, { useState, useEffect } from 'react';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { filterEventsByDateRange, DateRangeState } from './utils/filterEventsByDateRange';
import { filterEventsByEntity } from './utils/filterEventsByEntity';
import { TimeGroupingInterval } from './utils/groupEventsByTimeInterval';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { TrafficOverview } from './components/TrafficOverview';
import { ToolSunburstInspector } from './components/ToolSunburstInspector';
import { TransitionNodeGraph } from './components/TransitionNodeGraph';
import { ParameterHeatmap } from './components/ParameterHeatmap';
import { CostPerOutcomeChart } from './components/CostPerOutcomeChart';
import { ExperimentManager } from './components/ExperimentManager';
import { TraceAndFeedbackFeed } from './components/TraceAndFeedbackFeed';
import { IntegrationGuide } from './components/IntegrationGuide';

export function App(): React.ReactElement {
  const getInitialTab = (): string => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashTab = window.location.hash.replace(/^#\/?/, '');
      if (['overview', 'sunburst', 'transitions', 'heatmaps', 'cost', 'experiments', 'traces', 'integrate'].includes(hashTab)) {
        return hashTab;
      }
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeState>({ preset: 'all' });
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [selectedAppKey, setSelectedAppKey] = useState<string>('all');
  const [timeGrouping, setTimeGrouping] = useState<TimeGroupingInterval>('5m');
  const { data, loading, refresh } = useAnalyticsData(300000);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${tab}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hashTab = window.location.hash.replace(/^#\/?/, '');
      if (['overview', 'sunburst', 'transitions', 'heatmaps', 'cost', 'experiments', 'traces', 'integrate'].includes(hashTab)) {
        setActiveTab(hashTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const rawEvents = data?.rawEvents || [];
  const dateFilteredEvents = filterEventsByDateRange(rawEvents, dateRange);
  const entityFilteredEvents = filterEventsByEntity(dateFilteredEvents, selectedEntityId);
  const filteredEvents = selectedAppKey === 'all'
    ? entityFilteredEvents
    : entityFilteredEvents.filter(e => e.appKey === selectedAppKey);

  const totalCost = filteredEvents.reduce((acc, e) => acc + (e.tokenCost || 0), 0);

  
  const transitions: Record<string, number> = {};
  const parameterFrequency: Record<string, number> = {};
  
  for (const evt of filteredEvents) {
    // Strictly filter trajectory flows to agentic tool_call events only
    if (evt.eventType === 'tool_call' && evt.invokedToolName && evt.previousToolName) {
      const key = `${evt.previousToolName} -> ${evt.invokedToolName}`;
      transitions[key] = (transitions[key] || 0) + 1;
    }
    if (evt.params) {
      for (const k of Object.keys(evt.params)) {
        parameterFrequency[k] = (parameterFrequency[k] || 0) + 1;
      }
    }
  }

  const feedback = data?.feedback || [];

  return (
    <div className="min-h-screen bg-[#07030d] text-slate-100 flex font-sans max-w-full overflow-x-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pl-0 ${
        isCollapsed ? 'md:pl-16' : 'md:pl-56'
      }`}>
        <TopNav
          activeTab={activeTab}
          events={rawEvents}
          totalEvents={filteredEvents.length}
          dateRange={dateRange}
          selectedEntityId={selectedEntityId}
          selectedAppKey={selectedAppKey}
          onDateRangeChange={setDateRange}
          onEntityChange={setSelectedEntityId}
          onAppKeyChange={setSelectedAppKey}
          onRefresh={refresh}
          onToggleMobileNav={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 md:p-8 space-y-6 overflow-y-auto w-full max-w-full">
          {loading && !data ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-purple-200 font-mono font-semibold">Connecting to AX Ingestion Engine...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <TrafficOverview
                  events={filteredEvents}
                  timeGrouping={timeGrouping}
                  onTimeGroupingChange={setTimeGrouping}
                />
              )}
              {activeTab === 'sunburst' && <ToolSunburstInspector events={filteredEvents} />}
              {activeTab === 'transitions' && <TransitionNodeGraph transitions={transitions} />}
              {activeTab === 'heatmaps' && <ParameterHeatmap parameterFrequency={parameterFrequency} />}
              {activeTab === 'cost' && <CostPerOutcomeChart totalCost={totalCost} events={filteredEvents} />}
              {activeTab === 'experiments' && <ExperimentManager />}
              {activeTab === 'traces' && <TraceAndFeedbackFeed rawEvents={filteredEvents} feedbackRecords={feedback} />}
              {activeTab === 'integrate' && <IntegrationGuide />}
            </>
          )}
        </main>

        <footer className="border-t border-purple-900/50 py-4 px-4 sm:px-8 text-center text-xs text-purple-200 font-semibold bg-[#07030d]">
          <p>AX Analytics Platform</p>
        </footer>
      </div>
    </div>
  );
}
