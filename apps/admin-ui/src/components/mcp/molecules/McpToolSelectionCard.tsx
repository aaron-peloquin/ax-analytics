import React from 'react';
import { Terminal, Play, RefreshCw } from 'lucide-react';
import { McpTool } from '@ax-analytics/shared';
import { McpSchemaFieldInput } from '../../McpSchemaFieldInput.js';

export interface McpToolSelectionCardProps {
  readonly tools: readonly McpTool[];
  readonly selectedToolName: string;
  readonly onSelectToolName: (name: string) => void;
  readonly toolFormValues: Record<string, unknown>;
  readonly onFormFieldChange: (fieldName: string, value: unknown) => void;
  readonly executing: boolean;
  readonly onExecuteTool: () => void;
}

export function McpToolSelectionCard({
  tools,
  selectedToolName,
  onSelectToolName,
  toolFormValues,
  onFormFieldChange,
  executing,
  onExecuteTool
}: McpToolSelectionCardProps): React.ReactElement {
  const selectedTool = tools.find((t) => t.name === selectedToolName);
  const properties = (selectedTool?.inputSchema?.properties || {}) as Record<string, { type?: string; description?: string; enum?: string[] }>;
  const propertyEntries = Object.entries(properties);

  return (
    <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 p-5 shadow-lg backdrop-blur-xl space-y-5">
      <div className="flex items-center space-x-3 border-b border-purple-900/60 pb-3">
        <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Execute MCP Tool
          </h2>
          <p className="text-[11px] text-purple-300 font-mono">
            {tools.length > 0 ? `${tools.length} tool(s) discovered from server` : 'Discover tools to execute calls'}
          </p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="py-8 text-center text-xs text-purple-400 font-mono italic">
          No tools discovered yet. Connect to a remote MCP server above.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 block font-mono">Select Tool</label>
            <select
              value={selectedToolName}
              onChange={(e) => onSelectToolName(e.target.value)}
              className="w-full bg-[#090412] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-fuchsia-400"
            >
              {tools.map((t) => (
                <option key={t.name} value={t.name} className="bg-[#0c0517]">
                  {t.name} {t.description ? `— ${t.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedTool?.description && (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 text-xs text-purple-200">
              <span className="text-fuchsia-300 font-semibold font-mono">Description: </span>
              {selectedTool.description}
            </div>
          )}

          {propertyEntries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                Input Parameters ({propertyEntries.length})
              </h3>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {propertyEntries.map(([propKey, propDef]) => {
                  const requiredFields = (selectedTool?.inputSchema?.required || []) as readonly string[];
                  return (
                    <McpSchemaFieldInput
                      key={propKey}
                      name={propKey}
                      schema={propDef}
                      isRequired={requiredFields.includes(propKey)}
                      value={toolFormValues[propKey]}
                      onChange={(fieldName, val) => onFormFieldChange(fieldName, val)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onExecuteTool}
            disabled={executing || !selectedToolName}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/50"
          >
            {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{executing ? 'Executing Tool...' : `Execute ${selectedToolName || 'Tool'} (tools/call)`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
