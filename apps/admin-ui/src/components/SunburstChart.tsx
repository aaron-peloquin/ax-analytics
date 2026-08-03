import React from 'react';
import ReactECharts from 'echarts-for-react';
import { SunburstNode } from '../utils/buildSunburstData';

export interface SunburstChartProps {
  readonly data: readonly SunburstNode[];
  readonly title: string;
  readonly onNodeClick?: (paramName: string) => void;
}

export function SunburstChart({ data, title, onNodeClick }: SunburstChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center p-6 bg-[#100720]/60 rounded-2xl border border-purple-900/40 text-center space-y-2">
        <p className="text-sm font-bold text-white font-heading">No Parameter Data Available for Selected Tool</p>
        <p className="text-xs text-purple-200 font-medium max-w-sm">
          Ingest agent tool call telemetry with JSON parameters to build the Sunburst inner and outer parameter hubs.
        </p>
      </div>
    );
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff', fontFamily: 'Plus Jakarta Sans' },
      formatter: (params: { name: string; value: number; treePathInfo: { name: string }[] }) => {
        const path = params.treePathInfo?.map(p => p.name).filter(Boolean).join(' → ') || params.name;
        return `
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <strong style="color: #d946ef;">${path}</strong><br/>
            <span>Invocations: <strong>${params.value || 1}</strong></span>
          </div>
        `;
      }
    },
    series: {
      type: 'sunburst',
      data: data,
      radius: [0, '90%'],
      label: {
        rotate: 'radial',
        color: '#f3e8ff',
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        fontWeight: 600
      },
      itemStyle: {
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#0a0414'
      },
      levels: [
        {},
        {
          r0: '0%',
          r: '42%',
          label: {
            rotate: 0,
            fontSize: 12,
            fontWeight: 700,
            color: '#ffffff'
          },
          itemStyle: {
            color: '#7c3aed'
          }
        },
        {
          r0: '42%',
          r: '88%',
          label: {
            rotate: 'tangential',
            fontSize: 10,
            color: '#e9d5ff'
          },
          itemStyle: {
            color: '#06b6d4'
          }
        }
      ]
    }
  };

  const onChartClick = (params: { name: string; treePathInfo?: { name: string }[] }) => {
    if (!onNodeClick) return;
    // Extract root paramName from treePathInfo if clicked on outer value hub
    const rootParam = params.treePathInfo && params.treePathInfo.length > 1
      ? params.treePathInfo[1]?.name
      : params.name;
    
    if (rootParam) {
      // Clean up percentage labels e.g. "laptop (60%)"
      const cleanParam = rootParam.replace(/\s*\(\d+%\)$/, '').trim();
      onNodeClick(cleanParam);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-white font-heading">{title}</h3>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border bg-purple-950/80 text-fuchsia-300 border-purple-500/40">
          Click Parameter Hub to Inspect
        </span>
      </div>

      <div className="w-full h-80 bg-[#100720]/60 rounded-2xl border border-purple-900/40 p-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{ click: onChartClick }}
        />
      </div>
    </div>
  );
}
