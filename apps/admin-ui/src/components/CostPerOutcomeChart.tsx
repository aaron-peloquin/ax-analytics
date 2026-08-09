import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryEvent } from '@ax-analytics/shared';
import { ScatterChart } from 'lucide-react';

export interface CostPerOutcomeChartProps {
  readonly totalCost: number;
  readonly events: readonly TelemetryEvent[];
}

interface SessionRunMetrics {
  readonly sessionId: string;
  readonly entityId: string;
  readonly totalCost: number;
  readonly speedSeconds: number;
  readonly assignedVariant: string;
  readonly isSuccess: boolean;
}

export function CostPerOutcomeChart({ totalCost, events }: CostPerOutcomeChartProps): React.ReactElement {
  const successCount = events.filter(e => e.statusCode === 'SUCCESS').length;
  const failedCount = events.filter(e => e.statusCode !== 'SUCCESS').length;

  const costPerOutcome = successCount > 0 ? (totalCost / successCount).toFixed(4) : '0.0000';
  
  const totalExecutionMs = events.reduce((acc, e) => acc + (e.executionTimeMs || 0), 0);
  const avgSecondsToResolution = successCount > 0 
    ? (totalExecutionMs / successCount / 1000).toFixed(2) 
    : (totalExecutionMs / (events.length || 1) / 1000).toFixed(2);

  const { sessionRuns, option } = useMemo(() => {
    const sessionMap: Record<string, {
      sessionId: string;
      entityId: string;
      totalCost: number;
      totalExecutionMs: number;
      assignedVariant: string;
      hasFailure: boolean;
    }> = {};

    for (const evt of events) {
      const sId = evt.sessionId || 'default_session';
      if (!sessionMap[sId]) {
        sessionMap[sId] = {
          sessionId: sId,
          entityId: evt.entityId || 'unknown_entity',
          totalCost: 0,
          totalExecutionMs: 0,
          assignedVariant: evt.assignedVariant || 'A',
          hasFailure: false
        };
      }
      sessionMap[sId].totalCost += evt.tokenCost || 0;
      sessionMap[sId].totalExecutionMs += evt.executionTimeMs || 0;
      if (evt.assignedVariant) {
        sessionMap[sId].assignedVariant = evt.assignedVariant;
      }
      if (evt.statusCode && evt.statusCode !== 'SUCCESS') {
        sessionMap[sId].hasFailure = true;
      }
    }

    const runs: SessionRunMetrics[] = Object.values(sessionMap).map(s => ({
      sessionId: s.sessionId,
      entityId: s.entityId,
      totalCost: Number(s.totalCost.toFixed(5)),
      speedSeconds: Number((s.totalExecutionMs / 1000).toFixed(3)),
      assignedVariant: s.assignedVariant,
      isSuccess: !s.hasFailure
    }));

    const variantASeriesData = runs
      .filter(r => r.assignedVariant === 'A')
      .map(r => [r.totalCost, r.speedSeconds, r.sessionId, r.entityId, r.isSuccess ? 'Success' : 'Failed']);

    const variantBSeriesData = runs
      .filter(r => r.assignedVariant === 'B')
      .map(r => [r.totalCost, r.speedSeconds, r.sessionId, r.entityId, r.isSuccess ? 'Success' : 'Failed']);

    const unassignedSeriesData = runs
      .filter(r => r.assignedVariant !== 'A' && r.assignedVariant !== 'B')
      .map(r => [r.totalCost, r.speedSeconds, r.sessionId, r.entityId, r.isSuccess ? 'Success' : 'Failed']);

    const echartsOpt = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#160d26',
        borderColor: '#a855f7',
        textStyle: { color: '#f3e8ff', fontFamily: 'Plus Jakarta Sans' },
        formatter: (params: { data: [number, number, string, string, string]; seriesName: string }) => {
          const [cost, speed, sessionId, entityId, status] = params.data;
          return `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <strong style="color: #d946ef;">${params.seriesName} Run</strong><br/>
              <span>Session ID: ${sessionId}</span><br/>
              <span>Entity ID: ${entityId}</span><br/>
              <span>Cost (X): <strong>$${cost.toFixed(5)}</strong></span><br/>
              <span>Speed (Y): <strong>${speed.toFixed(3)} sec</strong></span><br/>
              <span>Status: <strong>${status}</strong></span>
            </div>
          `;
        }
      },
      legend: {
        data: ['Variant A Runs', 'Variant B Runs', 'Standard Runs'],
        textStyle: { color: '#e9d5ff', fontFamily: 'Plus Jakarta Sans', fontWeight: 'bold' }
      },
      grid: { left: '4%', right: '5%', bottom: '5%', containLabel: true },
      xAxis: {
        name: 'Cost ($ USD)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#f3e8ff', fontWeight: 'bold', fontFamily: 'Plus Jakarta Sans' },
        type: 'value',
        axisLine: { lineStyle: { color: '#6b21a8' } },
        splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
        axisLabel: { color: '#e9d5ff', fontWeight: 'bold', formatter: '${value}' }
      },
      yAxis: {
        name: 'Speed / Latency (Seconds)',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#f3e8ff', fontWeight: 'bold', fontFamily: 'Plus Jakarta Sans' },
        type: 'value',
        axisLine: { lineStyle: { color: '#6b21a8' } },
        splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
        axisLabel: { color: '#e9d5ff', fontWeight: 'bold', formatter: '{value}s' }
      },
      series: [
        {
          name: 'Variant A Runs',
          type: 'scatter',
          symbolSize: 14,
          data: variantASeriesData,
          itemStyle: { color: '#a855f7', shadowBlur: 8, shadowColor: 'rgba(168, 85, 247, 0.6)' }
        },
        {
          name: 'Variant B Runs',
          type: 'scatter',
          symbolSize: 14,
          data: variantBSeriesData,
          itemStyle: { color: '#ec4899', shadowBlur: 8, shadowColor: 'rgba(236, 72, 153, 0.6)' }
        },
        {
          name: 'Standard Runs',
          type: 'scatter',
          symbolSize: 14,
          data: unassignedSeriesData,
          itemStyle: { color: '#06b6d4', shadowBlur: 8, shadowColor: 'rgba(6, 182, 212, 0.6)' }
        }
      ]
    };

    return { sessionRuns: runs, option: echartsOpt };
  }, [events]);

  return (
    <section aria-label="Resolved Agent Runs Analytics" className="neon-panel p-6 space-y-6 border-purple-500/40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            Resolved Agent Runs Scatter Analytics
            <ScatterChart className="w-5 h-5 text-fuchsia-400" />
          </h2>
          <p className="text-xs text-purple-200 font-medium mt-1">
            Scatter distribution mapping each agent session run as a discrete dot: X-Axis represents Financial Cost ($) and Y-Axis represents Latency Speed (Seconds).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 shadow-neon-purple">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Successful Runs</span>
          <p className="text-3xl font-extrabold text-emerald-300 mt-1 font-heading">{successCount}</p>
          <span className="text-xs text-emerald-400">Resolved outcomes</span>
        </div>

        <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 shadow-neon-pink">
          <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Failed Runs</span>
          <p className="text-3xl font-extrabold text-rose-400 mt-1 font-heading">{failedCount}</p>
          <span className="text-xs text-rose-400">Schema / error turns</span>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 shadow-neon-cyan">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Seconds to Resolution</span>
          <p className="text-3xl font-extrabold text-cyan-300 mt-1 font-heading">{avgSecondsToResolution} <span className="text-sm font-normal text-purple-300">sec</span></p>
          <span className="text-xs text-cyan-400">Average resolution speed</span>
        </div>

        <div className="p-5 rounded-2xl border border-fuchsia-500/40 bg-purple-950/30 shadow-neon-purple">
          <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">Cost Per Outcome</span>
          <p className="text-3xl font-extrabold text-pink-300 mt-1 font-heading">${costPerOutcome}</p>
          <span className="text-xs text-fuchsia-400">Financial efficiency score</span>
        </div>
      </div>

      <div className="neon-panel p-6 border-purple-900/50 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white font-heading">Agent Session Runs Distribution: Cost ($) vs Speed (Seconds)</h3>
          <p className="text-xs text-purple-200 font-medium">Each dot represents an entire session run. Hover over dots to inspect session IDs, entity IDs, cost, speed, and status.</p>
        </div>

        {sessionRuns.length === 0 ? (
          <div className="w-full h-72 flex flex-col items-center justify-center text-center p-6 bg-[#0d061a]/60 rounded-2xl border border-purple-900/40 space-y-2">
            <ScatterChart className="w-8 h-8 text-purple-400/60" />
            <h4 className="text-sm font-bold text-white font-heading">No Agent Session Telemetry Ingested Yet</h4>
            <p className="text-xs text-purple-200 font-medium max-w-sm">
              Ingest telemetry events with <code className="text-fuchsia-300 font-mono">sessionId</code>, <code className="text-fuchsia-300 font-mono">tokenCost</code>, and <code className="text-fuchsia-300 font-mono">executionTimeMs</code> to view the scatter graph.
            </p>
          </div>
        ) : (
          <div className="w-full h-80">
            <ReactECharts option={option} lazyUpdate={true} style={{ height: '100%', width: '100%' }} />
          </div>
        )}
      </div>
    </section>
  );
}
