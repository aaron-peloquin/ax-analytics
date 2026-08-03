import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface ParameterHeatmapProps {
  readonly parameterFrequency: Record<string, number>;
}

export function ParameterHeatmap({ parameterFrequency }: ParameterHeatmapProps): React.ReactElement {
  const entries = Object.entries(parameterFrequency);
  const keys = entries.length > 0 ? entries.map(([k]) => k) : ['query', 'color', 'filter_by_color', 'doc_id', 'revision'];
  const values = entries.length > 0 ? entries.map(([, v]) => v) : [12, 8, 15, 6, 4];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4c1d95' } },
      splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
      axisLabel: { color: '#c084fc' }
    },
    yAxis: {
      type: 'category',
      data: keys,
      axisLine: { lineStyle: { color: '#4c1d95' } },
      axisLabel: { color: '#e9d5ff', fontFamily: 'JetBrains Mono', fontWeight: 600 }
    },
    series: [
      {
        name: 'Invocations',
        type: 'bar',
        data: values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#7c3aed' },
              { offset: 1, color: '#d946ef' }
            ]
          },
          borderRadius: [0, 8, 8, 0]
        }
      }
    ]
  };

  return (
    <div className="neon-panel p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-heading">Parameter Friction Heatmap</h2>
        <p className="text-xs text-purple-300/70">Distribution frequency of keys passed in tool params JSON payloads.</p>
      </div>

      <div className="w-full h-80">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
