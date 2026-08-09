import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { GitMerge } from 'lucide-react';
import { sanitizeSankeyLinks, SankeyLink } from '../utils/sanitizeSankeyLinks';

export interface SankeyFlowChartProps {
  readonly transitions: Record<string, number>;
}

export function SankeyFlowChart({ transitions }: SankeyFlowChartProps): React.ReactElement {
  const { links, sourceTotals, nodes, calculatedHeight } = useMemo(() => {
    const transitionEntries = Object.entries(transitions);
    const rawLinks: SankeyLink[] = [];

    for (const [path, count] of transitionEntries) {
      const parts = path.split(' -> ');
      const source = parts[0];
      const target = parts[1];

      if (source && target) {
        rawLinks.push({
          source,
          target,
          value: count
        });
      }
    }

    const processedLinks = sanitizeSankeyLinks(rawLinks);
    const totals: Record<string, number> = {};
    for (const link of processedLinks) {
      totals[link.source] = (totals[link.source] || 0) + link.value;
    }

    const nodeSet = new Set<string>();
    for (const link of processedLinks) {
      nodeSet.add(link.source);
      nodeSet.add(link.target);
    }
    const derivedNodes = Array.from(nodeSet).map(name => ({ name }));

    const nodeCount = derivedNodes.length;
    const linkCount = processedLinks.length;
    const maxBranchesFromSingleNode = Math.max(...Object.values(totals), 1);

    const height = Math.max(
      580,
      Math.min(1200, Math.max(nodeCount * 50, linkCount * 70, maxBranchesFromSingleNode * 140))
    );

    return {
      links: processedLinks,
      sourceTotals: totals,
      nodes: derivedNodes,
      calculatedHeight: height
    };
  }, [transitions]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#160d26',
      borderColor: '#a855f7',
      textStyle: { color: '#f3e8ff', fontFamily: 'Plus Jakarta Sans' },
      formatter: (params: { dataType: string; name: string; data: { source: string; target: string; value: number } }) => {
        if (params.dataType === 'edge') {
          const total = sourceTotals[params.data.source] || params.data.value;
          const pct = Math.round((params.data.value / total) * 100);
          return `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <span style="color: #ec4899; font-weight: bold;">User Flow Branching</span><br/>
              <span>Path: <strong>${params.data.source} → ${params.data.target}</strong></span><br/>
              <span>Volume: <strong>${params.data.value} turns</strong></span><br/>
              <span>Branch Share: <strong style="color: #38bdf8;">${pct}%</strong> of outgoing "${params.data.source}" turns</span>
            </div>
          `;
        }
        return `<strong style="font-family: 'JetBrains Mono', monospace;">Tool Step: ${params.name}</strong>`;
      }
    },
    series: [
      {
        type: 'sankey',
        data: nodes,
        links: links,
        draggable: true,
        nodeWidth: 22,
        nodeGap: 36,
        layoutIterations: 64,
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.45
        },
        label: {
          show: true,
          position: 'bottom',
          distance: 10,
          color: '#f3e8ff',
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: 700
        },
        edgeLabel: {
          show: true,
          position: 'middle',
          formatter: (params: { data: { source: string; value: number } }) => {
            const total = sourceTotals[params.data.source] || params.data.value;
            const pct = Math.round((params.data.value / total) * 100);
            return `${pct}%`;
          },
          color: '#38bdf8',
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: 800,
          backgroundColor: '#0a0414',
          borderColor: '#38bdf8',
          borderWidth: 1,
          borderRadius: 4,
          padding: [3, 7]
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#a855f7'
        },
        levels: [
          {
            depth: 0,
            itemStyle: { color: '#a855f7' },
            lineStyle: { color: 'source', opacity: 0.5 }
          },
          {
            depth: 1,
            itemStyle: { color: '#ec4899' },
            lineStyle: { color: 'source', opacity: 0.5 }
          },
          {
            depth: 2,
            itemStyle: { color: '#06b6d4' },
            lineStyle: { color: 'source', opacity: 0.5 }
          },
          {
            depth: 3,
            itemStyle: { color: '#10b981' },
            lineStyle: { color: 'source', opacity: 0.5 }
          }
        ]
      }
    ]
  }), [nodes, links, sourceTotals]);

  if (links.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center p-8 text-center bg-[#0d061a]/60 rounded-2xl border border-purple-900/40 space-y-3">
        <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-800/40 text-purple-300">
          <GitMerge className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white font-heading">No Agent Tool Trajectory Data Ingested Yet</h4>
          <p className="text-xs text-purple-200 font-medium max-w-md mt-1">
            Ingest agent tool call telemetry with <code className="text-fuchsia-300 font-mono font-bold">invokedToolName</code> and <code className="text-fuchsia-300 font-mono font-bold">previousToolName</code> via cURL to map live tool request flows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full transition-all duration-300" style={{ height: `${calculatedHeight}px` }}>
      <ReactECharts option={option} lazyUpdate={true} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
