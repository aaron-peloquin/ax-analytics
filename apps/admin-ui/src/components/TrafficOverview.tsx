import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Activity, Zap, Clock, Users, Eye } from 'lucide-react';
import { TelemetryEvent } from '@ax-analytics/shared';
import { PageviewsAndUsersChart } from './PageviewsAndUsersChart';
import { TimeGroupingDropdown } from './TimeGroupingDropdown';
import { groupEventsByTimeInterval, TimeGroupingInterval } from '../utils/groupEventsByTimeInterval';

export interface TrafficOverviewProps {
  readonly events: readonly TelemetryEvent[];
  readonly timeGrouping?: TimeGroupingInterval;
  readonly onTimeGroupingChange?: (interval: TimeGroupingInterval) => void;
}

export function TrafficOverview({
  events,
  timeGrouping = '5m',
  onTimeGroupingChange
}: TrafficOverviewProps): React.ReactElement {
  const toolCallCount = events.filter(e => e.eventType === 'tool_call').length;
  
  const uniqueUsersCount = new Set(
    events
      .map(e => e.entityId)
      .filter((id): id is string => Boolean(id))
  ).size;

  const avgLatency = events.length > 0
    ? Math.round(events.reduce((acc, e) => acc + (e.executionTimeMs || 0), 0) / events.length)
    : 0;

  const grouped = useMemo(
    () => groupEventsByTimeInterval(events, timeGrouping),
    [events, timeGrouping]
  );

  const echartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff' }
    },
    legend: {
      data: ['Agent Tool Calls', 'Human Web Clicks'],
      textStyle: { color: '#e9d5ff', fontFamily: 'Plus Jakarta Sans', fontWeight: 'bold' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: grouped.times.length > 0 ? grouped.times : ['No Events Ingested'],
      axisLine: { lineStyle: { color: '#6b21a8' } },
      axisLabel: { color: '#e9d5ff', fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#6b21a8' } },
      splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.2)' } },
      axisLabel: { color: '#e9d5ff', fontWeight: 'bold' }
    },
    series: [
      {
        name: 'Agent Tool Calls',
        type: 'line',
        smooth: true,
        data: grouped.toolData.length > 0 ? grouped.toolData : [0],
        itemStyle: { color: '#d946ef' },
        lineStyle: { width: 3, shadowColor: 'rgba(217, 70, 239, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(217, 70, 239, 0.4)' },
              { offset: 1, color: 'rgba(217, 70, 239, 0)' }
            ]
          }
        }
      },
      {
        name: 'Human Web Clicks',
        type: 'line',
        smooth: true,
        data: grouped.clickData.length > 0 ? grouped.clickData : [0],
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3, shadowColor: 'rgba(6, 182, 212, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0)' }
            ]
          }
        }
      }
    ]
  }), [grouped]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        <div className="neon-panel p-5 border-purple-500/40">
          <div className="flex justify-between items-center text-purple-200">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Total Telemetry Events</span>
            <Activity className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-heading">{events.length}</p>
          <span className="text-xs text-fuchsia-300 font-bold flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></span> Live ingested
          </span>
        </div>

        <div className="neon-panel p-5 border-blue-500/40">
          <div className="flex justify-between items-center text-sky-200">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Total Pageviews</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-sky-300 mt-2 font-heading">{events.filter(e => e.eventType === 'page_view').length}</p>
          <span className="text-xs text-sky-300 font-semibold mt-1 block">Web page views</span>
        </div>

        <div className="neon-panel p-5 border-emerald-500/40">
          <div className="flex justify-between items-center text-emerald-200">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Unique User IDs</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-300 mt-2 font-heading">{uniqueUsersCount}</p>
          <span className="text-xs text-emerald-300 font-semibold mt-1 block">Active user entities</span>
        </div>

        <div className="neon-panel p-5 border-fuchsia-500/40">
          <div className="flex justify-between items-center text-fuchsia-200">
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-200">Agent Tool Invocations</span>
            <Zap className="w-4 h-4 text-fuchsia-400" />
          </div>
          <p className="text-3xl font-extrabold text-fuchsia-300 mt-2 font-heading">{toolCallCount}</p>
          <span className="text-xs text-purple-200 font-semibold mt-1 block">AX trajectory turns</span>
        </div>

        <div className="neon-panel p-5 border-pink-500/40">
          <div className="flex justify-between items-center text-pink-200">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Avg Turn Latency</span>
            <Clock className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-3xl font-extrabold text-pink-300 mt-2 font-heading">{avgLatency} <span className="text-sm font-normal text-purple-200 font-semibold">ms</span></p>
          <span className="text-xs text-pink-300 font-semibold mt-1 block">Turn velocity</span>
        </div>
      </div>

      <PageviewsAndUsersChart events={events} timeGrouping={timeGrouping} />

      <div className="neon-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Real-Time Event Ingestion Stream</h2>
            <p className="text-xs text-purple-200 font-medium mt-0.5">Live time-series telemetry events streaming in real time</p>
          </div>

          {onTimeGroupingChange && (
            <TimeGroupingDropdown interval={timeGrouping} onChange={onTimeGroupingChange} />
          )}
        </div>

        <div className="w-full h-80">
          <ReactECharts option={echartsOption} lazyUpdate={true} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
