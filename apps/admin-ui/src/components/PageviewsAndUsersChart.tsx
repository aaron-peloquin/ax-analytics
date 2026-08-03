import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryEvent } from '@ax-analytics/shared';

export interface PageviewsAndUsersChartProps {
  readonly events: readonly TelemetryEvent[];
}

export function PageviewsAndUsersChart({ events }: PageviewsAndUsersChartProps): React.ReactElement {
  const timeBuckets: Record<string, { time: string; pageviews: number; userIds: Set<string> }> = {};

  for (const evt of events) {
    const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
    if (!timeBuckets[timeStr]) {
      timeBuckets[timeStr] = { time: timeStr, pageviews: 0, userIds: new Set() };
    }
    if (evt.eventType === 'page_view') {
      timeBuckets[timeStr].pageviews += 1;
    }
    if (evt.entityId) {
      timeBuckets[timeStr].userIds.add(evt.entityId);
    }
  }

  const times = Object.keys(timeBuckets);
  const pageviewData = Object.values(timeBuckets).map(b => b.pageviews);
  const uniqueUsersData = Object.values(timeBuckets).map(b => b.userIds.size);

  const option = {
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
      data: times.length > 0 ? times : ['No Events Ingested'],
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
        data: pageviewData.length > 0 ? pageviewData : [0],
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
        data: uniqueUsersData.length > 0 ? uniqueUsersData : [0],
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
  };

  return (
    <div className="neon-panel p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-heading">Total Pageviews & Unique User Engagement</h2>
        <p className="text-xs text-purple-200 font-medium">Aggregate traffic trends comparing total page activity against distinct user entity IDs</p>
      </div>

      <div className="w-full h-72">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
