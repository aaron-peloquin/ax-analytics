import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Code,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Key,
  Sliders,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  BookOpen,
  Sparkles
} from 'lucide-react';
import {
  extractUrlParams,
  resolveTargetUrl,
  sanitizeHeaders,
  createMcpProxyClient,
  McpHeaderPair,
  McpTool,
  JsonRpcResponse
} from '@ax-analytics/shared';
import { buildInitialFormValues } from '../utils/buildInitialFormValues';
import { McpSchemaFieldInput } from './McpSchemaFieldInput';

export function McpClientAdmin(): React.ReactElement {
  const [rawUrl, setRawUrl] = useState<string>('https://api.remote-mcp-server.com/v1/[tenantId]/mcp');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({ tenantId: 'acme-corp' });
  const [headers, setHeaders] = useState<McpHeaderPair[]>([]);
  const [isConnectionExpanded, setIsConnectionExpanded] = useState<boolean>(true);
  const [showAxGuide, setShowAxGuide] = useState<boolean>(true);

  const [connecting, setConnecting] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [ingesting, setIngesting] = useState<boolean>(false);

  const [tools, setTools] = useState<readonly McpTool[]>([]);
  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [toolFormValues, setToolFormValues] = useState<Record<string, unknown>>({});

  const [response, setResponse] = useState<JsonRpcResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [telemetryLogged, setTelemetryLogged] = useState<boolean>(false);

  // Dynamically extract square bracket tokens: e.g. [tenantId], [serviceId]
  const detectedParams = useMemo(() => extractUrlParams(rawUrl), [rawUrl]);

  // Compute live resolved target URL
  const resolvedTargetUrl = useMemo(
    () => resolveTargetUrl(rawUrl, urlParams),
    [rawUrl, urlParams]
  );

  // Selected tool object
  const selectedTool = useMemo(
    () => tools.find((t) => t.name === selectedToolName),
    [tools, selectedToolName]
  );

  // Automatically update tool form fields whenever selected tool changes
  useEffect(() => {
    if (selectedTool) {
      setToolFormValues(buildInitialFormValues(selectedTool.inputSchema));
    } else {
      setToolFormValues({});
    }
  }, [selectedTool]);

  // Header management functions
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleUpdateHeaderKey = (index: number, key: string) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], key };
    setHeaders(updated);
  };

  const handleUpdateHeaderValue = (index: number, value: string) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], value };
    setHeaders(updated);
  };

  const handleFormFieldChange = (fieldName: string, val: unknown) => {
    setToolFormValues((prev) => ({
      ...prev,
      [fieldName]: val
    }));
  };

  // Connect & Discover Tools via Reverse Proxy
  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setErrorMessage(null);
    setResponse(null);
    setHttpStatus(null);
    setLatencyMs(null);

    const startTime = performance.now();
    try {
      const cleanHeaders = sanitizeHeaders(headers);
      const client = createMcpProxyClient(resolvedTargetUrl, { headers: cleanHeaders });
      const res = await client.listTools();

      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      setResponse(res);

      if (res.error) {
        setHttpStatus(500);
        setErrorMessage(res.error.message || 'JSON-RPC Error');
      } else {
        setHttpStatus(200);
        if (res.result?.tools && Array.isArray(res.result.tools)) {
          setTools(res.result.tools);
          if (res.result.tools.length > 0) {
            setSelectedToolName(res.result.tools[0].name);
          }
        }
        // Auto-collapse accordion upon successful connection
        setIsConnectionExpanded(false);
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      setHttpStatus(502);
      setErrorMessage(err instanceof Error ? err.message : 'Connection failed via reverse proxy');
    } finally {
      setConnecting(false);
    }
  }, [resolvedTargetUrl, headers]);

  // Execute Tool Call via Reverse Proxy using Schema Form Values
  const handleExecuteTool = useCallback(async () => {
    if (!selectedToolName) return;

    setExecuting(true);
    setErrorMessage(null);
    setResponse(null);
    setHttpStatus(null);
    setTelemetryLogged(false);

    const startTime = performance.now();
    try {
      const cleanHeaders = sanitizeHeaders(headers);
      const client = createMcpProxyClient(resolvedTargetUrl, { headers: cleanHeaders });
      const res = await client.callTool(selectedToolName, toolFormValues);

      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      setResponse(res);

      if (res.error) {
        setHttpStatus(500);
        setErrorMessage(res.error.message || 'Tool execution returned error');
      } else {
        setHttpStatus(200);
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      setHttpStatus(500);
      setErrorMessage(err instanceof Error ? err.message : 'Tool execution failed');
    } finally {
      setExecuting(false);
    }
  }, [resolvedTargetUrl, headers, selectedToolName, toolFormValues]);

  // Log Telemetry Event directly to AX Analytics Server
  const handleLogTelemetry = useCallback(async () => {
    if (!selectedToolName) return;
    setIngesting(true);

    try {
      const telemetryPayload = {
        appKey: 'app_live_8832109',
        sessionId: `mcp_sess_${Date.now()}`,
        entityId: 'mcp-client-tester',
        entityType: 'agent',
        eventType: 'tool_call',
        invokedToolName: selectedToolName,
        previousToolName: 'mcp_tools_list',
        params: toolFormValues,
        results: response?.result || { status: 'executed' },
        statusCode: response?.error ? 'ERROR' : 'SUCCESS',
        executionTimeMs: latencyMs || 120,
        tokenCost: 0.0015
      };

      const res = await fetch('/v1/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetryPayload)
      });

      if (res.ok) {
        setTelemetryLogged(true);
        setTimeout(() => setTelemetryLogged(false), 3000);
      }
    } catch (err) {
      console.error('Telemetry ingestion failed:', err);
    } finally {
      setIngesting(false);
    }
  }, [selectedToolName, toolFormValues, response, latencyMs]);

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const schemaProperties = selectedTool?.inputSchema?.properties || {};
  const requiredList = selectedTool?.inputSchema?.required || [];
  const propertyEntries = Object.entries(schemaProperties);

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#130a24] via-[#1a0c33] to-[#0d071a] p-6 rounded-2xl border border-purple-800/40 shadow-xl backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40 shadow-md">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">
                MCP Test Client
              </h1>
              <p className="text-xs text-purple-200/90 font-medium">
                Interactive Model Context Protocol tester mapping User Experience (UX) to Agent Experience (AX).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="https://gist.github.com/aaron-peloquin/593eaaa1639be87774c73296a8e91bfc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/70 text-fuchsia-300 hover:text-white border border-purple-600/50 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>AX: Structuring MCP Servers</span>
            <ExternalLink className="w-3 h-3 text-purple-300 ml-0.5" />
          </a>

          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-xs font-mono flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Reverse Proxy Active
          </span>
        </div>
      </div>

      {/* AX Mental Model Guidance Card for UX Designers */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#120726] to-[#0c051a] rounded-2xl border border-purple-800/50 p-4 shadow-lg">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAxGuide(!showAxGuide)}>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                <span>UX-to-AX Design Mental Model: Tools as Forms & Action Buttons</span>
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              </h3>
              <p className="text-[11px] text-purple-300/90 font-sans">
                How GenAI Agents navigate MCP Server tools using semantic schemas and input parameter fieldsets.
              </p>
            </div>
          </div>
          <button className="text-purple-300 hover:text-white p-1">
            {showAxGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAxGuide && (
          <div className="mt-3 pt-3 border-t border-purple-900/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090412] border border-purple-900/60 space-y-1">
              <span className="text-fuchsia-400 font-bold font-mono text-[11px] flex items-center gap-1">
                <Play className="w-3 h-3 text-fuchsia-400" /> 1. Verbs as Action Buttons
              </span>
              <p className="text-[11px] text-purple-200/90 leading-relaxed">
                Tool names (<code className="text-cyan-300 font-mono">action_noun</code>) act like high-contrast GUI buttons helping models pick the right step.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090412] border border-purple-900/60 space-y-1">
              <span className="text-cyan-400 font-bold font-mono text-[11px] flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" /> 2. Schemas as Form Fields
              </span>
              <p className="text-[11px] text-purple-200/90 leading-relaxed">
                JSON parameters translate into dropdowns, numbers, and checkboxes that constrain model outputs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090412] border border-purple-900/60 space-y-1">
              <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-400" /> 3. Descriptions as Microcopy
              </span>
              <p className="text-[11px] text-purple-200/90 leading-relaxed">
                Tool & parameter descriptions act as onboarding microcopy telling the model <em>when</em> and <em>why</em> to call a tool.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090412] border border-purple-900/60 space-y-1">
              <span className="text-amber-400 font-bold font-mono text-[11px] flex items-center gap-1">
                <Server className="w-3 h-3 text-amber-400" /> 4. Single Capability Servers
              </span>
              <p className="text-[11px] text-purple-200/90 leading-relaxed">
                Modular MCP Servers keep capabilities focused, lowering context noise and latency. Read the full strategy in{' '}
                <a
                  href="https://gist.github.com/aaron-peloquin/593eaaa1639be87774c73296a8e91bfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fuchsia-300 underline font-semibold hover:text-white"
                >
                  Aaron's Gist
                </a>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Combined Connection & Custom Headers Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* COMBINED CARD: Service URL & Custom Headers (Collapsible Accordion) */}
          <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 shadow-lg backdrop-blur-xl overflow-hidden transition-all duration-300">
            {/* Accordion Header Toggle */}
            <button
              onClick={() => setIsConnectionExpanded(!isConnectionExpanded)}
              className="w-full p-4 sm:p-5 flex items-center justify-between bg-purple-950/30 hover:bg-purple-900/40 text-left transition-colors border-b border-purple-900/40 focus:outline-none"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-fuchsia-400 border border-purple-700/40">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                    Target MCP Server & Custom Headers
                  </h2>
                  <p className="text-[11px] text-purple-300/80 font-mono truncate max-w-xs sm:max-w-md">
                    {resolvedTargetUrl ? `Target: ${resolvedTargetUrl}` : 'Configure target URL and HTTP headers'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {httpStatus === 200 && !isConnectionExpanded && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                  </span>
                )}
                <div className="p-1.5 rounded-lg bg-purple-900/50 text-purple-200 hover:text-white border border-purple-700/40">
                  {isConnectionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Accordion Content Body */}
            {isConnectionExpanded && (
              <div className="p-5 space-y-6">
                {/* Target URL Sub-Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-200 font-mono uppercase tracking-wider">
                      1. MCP Server Endpoint URL
                    </span>
                    <span className="text-[11px] font-mono text-purple-300">CORS Immunity Enabled</span>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-purple-200 block font-mono">
                      Endpoint URL <span className="text-purple-400 font-normal">(supports [param] placeholders)</span>
                    </label>
                    <input
                      type="text"
                      value={rawUrl}
                      onChange={(e) => setRawUrl(e.target.value)}
                      placeholder="https://api.mcp-server.com/v1/[tenantId]/mcp"
                      className="w-full bg-[#090412] border border-purple-800/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-all"
                    />
                  </div>

                  {/* Detected Bracket Parameters */}
                  {detectedParams.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-200">
                          Detected URL Parameters ({detectedParams.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {detectedParams.map((param) => (
                          <div key={param} className="space-y-1">
                            <label className="text-[11px] font-mono text-purple-300 font-semibold block">
                              [{param}] Value:
                            </label>
                            <input
                              type="text"
                              value={urlParams[param] || ''}
                              onChange={(e) => setUrlParams({ ...urlParams, [param]: e.target.value })}
                              placeholder={`Enter ${param}...`}
                              className="w-full bg-[#07030d] border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolved URL Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
                      <span className="text-purple-400 font-bold">Resolved Proxy Target:</span>
                      <span className="text-fuchsia-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50 break-all">
                        {resolvedTargetUrl || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-900/60"></div>

                {/* Custom Headers Sub-Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-fuchsia-400" />
                      <h2 className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
                        2. Custom HTTP Headers (+/-)
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-purple-300">Forwarded via Server Proxy</span>
                  </div>

                  {/* Dynamic Header Rows */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {headers.length === 0 ? (
                      <p className="text-xs text-purple-400/70 italic font-mono py-2 text-center border border-dashed border-purple-900/40 rounded-xl">
                        No custom headers configured. Click "+ Add Header Row" to set custom headers.
                      </p>
                    ) : (
                      headers.map((h, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Header Name (e.g. Authorization)"
                            value={h.key}
                            onChange={(e) => handleUpdateHeaderKey(index, e.target.value)}
                            className="flex-1 bg-[#090412] border border-purple-800/60 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder-purple-500/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                          />
                          <input
                            type="text"
                            placeholder="Header Value (e.g. Bearer token)"
                            value={h.value}
                            onChange={(e) => handleUpdateHeaderValue(index, e.target.value)}
                            className="flex-1 bg-[#090412] border border-purple-800/60 rounded-xl px-3 py-1.5 text-xs text-fuchsia-200 font-mono placeholder-purple-500/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                          />
                          <button
                            onClick={() => handleRemoveHeader(index)}
                            title="Remove Header"
                            className="p-2 rounded-xl bg-rose-950/50 text-rose-300 hover:text-rose-100 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Header Row Button */}
                  <div>
                    <button
                      onClick={handleAddHeader}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/40 text-purple-200 hover:text-white hover:bg-purple-800/50 border border-purple-700/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-fuchsia-400" /> Add Header Row
                    </button>
                  </div>
                </div>

                <div className="border-t border-purple-900/60 pt-2">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs font-mono shadow-lg border border-purple-400/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" /> Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-yellow-300" /> Connect & Discover Tools (tools/list)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tools Discovery & Schema Form Fieldset Panel */}
          <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 p-5 space-y-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-fuchsia-400" />
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                  MCP Tool Discovery & Execution
                </h2>
              </div>
              <span className="text-[11px] font-mono text-purple-300 font-semibold">
                {tools.length} Tools Discovered
              </span>
            </div>

            {tools.length > 0 ? (
              <div className="space-y-4">
                {/* Clean Tool Selector Dropdown (Name Only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-200 block font-mono">
                    Select Discovered Tool:
                  </label>
                  <select
                    value={selectedToolName}
                    onChange={(e) => setSelectedToolName(e.target.value)}
                    className="w-full bg-[#090412] border border-purple-800/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  >
                    {tools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTool && (
                  <div className="p-3 rounded-xl bg-[#090412] border border-purple-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 font-mono">{selectedTool.name}</span>
                      <span className="text-[10px] font-mono text-purple-400">tools/call</span>
                    </div>
                    {selectedTool.description && (
                      <p className="text-xs text-purple-200/90">{selectedTool.description}</p>
                    )}
                  </div>
                )}

                {/* Schema-Driven Dynamic Form Fieldset */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                    <span className="text-xs font-bold text-purple-200 font-mono uppercase tracking-wider">
                      Tool Parameter Form Fieldset
                    </span>
                    <span className="text-[11px] text-purple-400 font-mono">
                      Generated from JSON Schema
                    </span>
                  </div>

                  {propertyEntries.length > 0 ? (
                    <div className="space-y-3">
                      {propertyEntries.map(([propKey, propSchema]) => (
                        <McpSchemaFieldInput
                          key={propKey}
                          name={propKey}
                          schema={propSchema}
                          value={toolFormValues[propKey]}
                          isRequired={requiredList.includes(propKey)}
                          onChange={handleFormFieldChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-purple-300/80 italic font-mono py-4 text-center border border-dashed border-purple-900/40 rounded-xl">
                      This tool requires no input parameters.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleExecuteTool}
                    disabled={executing || !selectedToolName}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow-md border border-emerald-400/40 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {executing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" /> Executing Tool...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-200 fill-emerald-200" /> Execute Tool (tools/call)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-purple-900/50 rounded-xl">
                <Terminal className="w-8 h-8 text-purple-400/50 mx-auto" />
                <p className="text-xs text-purple-300 font-mono">
                  No tools loaded yet. Click <span className="text-fuchsia-300 font-bold">Connect & Discover Tools</span> above.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution Response & Telemetry Debugger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#130a24]/90 rounded-2xl border border-purple-800/40 p-5 space-y-4 shadow-lg backdrop-blur-xl h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-fuchsia-400" />
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                    Response Inspector
                  </h2>
                </div>

                {httpStatus && (
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold border ${
                        httpStatus >= 200 && httpStatus < 300
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                      }`}
                    >
                      HTTP {httpStatus}
                    </span>
                    {latencyMs !== null && (
                      <span className="text-purple-300 font-semibold">{latencyMs} ms</span>
                    )}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Proxy Error:</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Formatted JSON-RPC Response Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
                    JSON-RPC Response Payload:
                  </span>
                  {response && (
                    <button
                      onClick={handleCopyResponse}
                      className="px-2 py-1 text-[10px] font-mono rounded bg-purple-950 text-purple-300 hover:text-white border border-purple-800 flex items-center gap-1"
                    >
                      {copiedResponse ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy JSON
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <pre className="w-full h-80 bg-[#07030d] border border-purple-800/60 rounded-xl p-3.5 text-xs text-fuchsia-200 font-mono overflow-auto leading-relaxed">
                    {response
                      ? JSON.stringify(response, null, 2)
                      : '// Response payload will appear here after connection or execution...'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Log to AX Telemetry */}
            <div className="pt-4 border-t border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
                <span>AX Analytics Integration</span>
                <span>ClickHouse Engine</span>
              </div>

              <button
                onClick={handleLogTelemetry}
                disabled={ingesting || !selectedToolName || !response}
                className="w-full py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 text-purple-100 font-bold text-xs font-mono border border-purple-700/50 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {ingesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" /> Logging Telemetry...
                  </>
                ) : telemetryLogged ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Telemetry Event Logged!
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-fuchsia-400" /> Log Execution to AX Telemetry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
