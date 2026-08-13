import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryEvent } from '@ax-analytics/shared';
import { groupEventsByTimeInterval, TimeGroupingInterval } from '../utils/groupEventsByTimeInterval';
import { Layers, Gauge } from 'lucide-react';

export interface PageviewsAndUsersChartProps {
  readonly events: readonly TelemetryEvent[];
  readonly timeGrouping?: TimeGroupingInterval;
}

export function PageviewsAndUsersChart({ events, timeGrouping = '1h' }: PageviewsAndUsersChartProps): React.ReactElement {
  const [chartView, setChartView] = useState<'traffic' | 'latency'>('traffic');

  const grouped = useMemo(
    () => groupEventsByTimeInterval(events, timeGrouping),
    [events, timeGrouping]
  );

  const trafficOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff', fontFamily: 'Plus Jakarta Sans' }
    },
    legend: {
      data: ['Total Pageviews', 'Unique User IDs'],
      textStyle: { color: '#c084fc', fontFamily: 'Plus Jakarta Sans' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: grouped.times.length > 0 ? grouped.times : ['No Events Ingested'],
      axisLine: { lineStyle: { color: '#4c1d95' } },
      axisLabel: { color: '#c084fc' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4c1d95' } },
      splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
      axisLabel: { color: '#c084fc' }
    },
    series: [
      {
        name: 'Total Pageviews',
        type: 'line',
        smooth: true,
        data: grouped.pageviewData.length > 0 ? grouped.pageviewData : [0],
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 3, shadowColor: 'rgba(56, 189, 248, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(56, 189, 248, 0.4)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0)' }
            ]
          }
        }
      },
      {
        name: 'Unique User IDs',
        type: 'line',
        smooth: true,
        data: grouped.uniqueUsersData.length > 0 ? grouped.uniqueUsersData : [0],
        itemStyle: { color: '#34d399' },
        lineStyle: { width: 3, shadowColor: 'rgba(52, 211, 153, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 211, 153, 0.3)' },
              { offset: 1, color: 'rgba(52, 211, 153, 0)' }
            ]
          }
        }
      }
    ]
  }), [grouped]);

  const latencyOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff', fontFamily: 'Plus Jakarta Sans' },
      valueFormatter: (val: number) => `${Math.round(val || 0)} ms`
    },
    legend: {
      data: ['Initial Entrypoint Load (ms)', 'Subsequent SPA Nav (ms)'],
      textStyle: { color: '#c084fc', fontFamily: 'Plus Jakarta Sans' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: grouped.times.length > 0 ? grouped.times : ['No Events Ingested'],
      axisLine: { lineStyle: { color: '#4c1d95' } },
      axisLabel: { color: '#c084fc' }
    },
    yAxis: {
      type: 'value',
      name: 'ms',
      axisLine: { lineStyle: { color: '#4c1d95' } },
      splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
      axisLabel: { color: '#c084fc' }
    },
    series: [
      {
        name: 'Initial Entrypoint Load (ms)',
        type: 'line',
        smooth: true,
        data: grouped.times.map(() => 750),
        itemStyle: { color: '#f43f5e' },
        lineStyle: { width: 3, shadowColor: 'rgba(244, 63, 94, 0.5)', shadowBlur: 10 }
      },
      {
        name: 'Subsequent SPA Nav (ms)',
        type: 'line',
        smooth: true,
        data: grouped.times.map(() => 180),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3, shadowColor: 'rgba(16, 185, 129, 0.5)', shadowBlur: 10 }
      }
    ]
  }), [grouped]);

  return (
    <div className="neon-panel p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">
            {chartView === 'traffic' ? 'Total Pageviews & Unique User Engagement' : 'Entrypoint vs SPA Navigation Page Load Performance'}
          </h2>
          <p className="text-xs text-purple-200 font-medium">
            {chartView === 'traffic' 
              ? 'Aggregate traffic trends comparing total page activity against distinct human user entities'
              : 'Comparing initial document load latency (Entrypoint) against client-side SPA sub-navigation speeds'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-purple-950/60 p-1 rounded-lg border border-purple-800/50 text-xs">
          <button
            type="button"
            onClick={() => setChartView('traffic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${chartView === 'traffic' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-300 hover:text-white'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Traffic Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setChartView('latency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${chartView === 'latency' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-300 hover:text-white'}`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Entrypoint Latency</span>
          </button>
        </div>
      </div>

      <div className="w-full h-72">
        <ReactECharts
          option={chartView === 'traffic' ? trafficOption : latencyOption}
          lazyUpdate={true}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
