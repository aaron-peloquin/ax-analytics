import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  extractUrlParams,
  resolveTargetUrl,
  sanitizeHeaders,
  createMcpProxyClient,
  McpHeaderPair,
  McpTool,
  JsonRpcResponse
} from '@ax-analytics/shared';
import { buildInitialFormValues } from '../utils/buildInitialFormValues.js';
import { McpGuideCard } from './mcp/molecules/McpGuideCard.js';
import { McpConnectionCard } from './mcp/molecules/McpConnectionCard.js';
import { McpToolSelectionCard } from './mcp/molecules/McpToolSelectionCard.js';
import { McpResponseCard } from './mcp/molecules/McpResponseCard.js';

export function McpClientAdmin(): React.ReactElement {
  const [rawUrl, setRawUrl] = useState<string>('https://api.remote-mcp-server.com/v1/[tenantId]/mcp');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({ tenantId: 'acme-corp' });
  const [headers, setHeaders] = useState<McpHeaderPair[]>([]);

  const [connecting, setConnecting] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  const [tools, setTools] = useState<readonly McpTool[]>([]);
  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [toolFormValues, setToolFormValues] = useState<Record<string, unknown>>({});

  const [response, setResponse] = useState<JsonRpcResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [telemetryLogged, setTelemetryLogged] = useState<boolean>(false);

  const detectedParams = useMemo(() => extractUrlParams(rawUrl), [rawUrl]);
  const resolvedTargetUrl = useMemo(() => resolveTargetUrl(rawUrl, urlParams), [rawUrl, urlParams]);
  const selectedTool = useMemo(() => tools.find((t) => t.name === selectedToolName), [tools, selectedToolName]);

  useEffect(() => {
    if (selectedTool) {
      setToolFormValues(buildInitialFormValues(selectedTool.inputSchema));
    } else {
      setToolFormValues({});
    }
  }, [selectedTool]);

  const handleFormFieldChange = (fieldName: string, val: unknown) => {
    setToolFormValues((prev) => ({
      ...prev,
      [fieldName]: val
    }));
  };

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
        try {
          await fetch('/v1/telemetry/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appKey: 'app_live_8832109',
              sessionId: `mcp_sess_${Date.now()}`,
              multiagentIdentity: 'mcp-admin-tester',
              entityId: 'admin-tester',
              entityType: 'agent',
              eventType: 'tool_call',
              invokedToolName: selectedToolName,
              params: toolFormValues,
              results: (res.result as Record<string, unknown>) || {},
              statusCode: 'SUCCESS',
              executionTimeMs: duration
            })
          });
          setTelemetryLogged(true);
        } catch (_telemetryErr) {
          // Ignore telemetry log failure
        }
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setLatencyMs(duration);
      setHttpStatus(502);
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed via reverse proxy');
    } finally {
      setExecuting(false);
    }
  }, [selectedToolName, toolFormValues, resolvedTargetUrl, headers]);

  return (
    <div className="space-y-6 max-w-7xl">
      <McpGuideCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <McpConnectionCard
            rawUrl={rawUrl}
            setRawUrl={setRawUrl}
            urlParams={urlParams}
            setUrlParams={setUrlParams}
            detectedParams={detectedParams}
            resolvedTargetUrl={resolvedTargetUrl}
            headers={headers}
            setHeaders={setHeaders}
            connecting={connecting}
            onConnect={handleConnect}
            httpStatus={httpStatus}
          />

          <McpToolSelectionCard
            tools={tools}
            selectedToolName={selectedToolName}
            onSelectToolName={setSelectedToolName}
            toolFormValues={toolFormValues}
            onFormFieldChange={handleFormFieldChange}
            executing={executing}
            onExecuteTool={handleExecuteTool}
          />
        </div>

        <div className="lg:col-span-6">
          <McpResponseCard
            response={response}
            httpStatus={httpStatus}
            latencyMs={latencyMs}
            errorMessage={errorMessage}
            telemetryLogged={telemetryLogged}
          />
        </div>
      </div>
    </div>
  );
}
