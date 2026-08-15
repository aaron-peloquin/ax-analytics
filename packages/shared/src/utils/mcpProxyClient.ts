import { JsonRpcResponse, McpProxyRequestBody, McpToolCallResult, McpToolListResult } from '../types/mcpTypes.js';

export interface McpProxyClientConfig {
  readonly proxyEndpoint?: string; // Default: "/v1/mcp/proxy"
  readonly headers?: Record<string, string>;
  readonly customFetch?: typeof fetch;
}

export interface McpProxyClientInstance {
  readonly sendJsonRpc: <T = unknown>(method: string, params?: unknown) => Promise<JsonRpcResponse<T>>;
  readonly listTools: () => Promise<JsonRpcResponse<McpToolListResult>>;
  readonly callTool: (name: string, args?: Record<string, unknown>) => Promise<JsonRpcResponse<McpToolCallResult>>;
}

/**
  Creates an MCP Proxy Client instance for sending JSON-RPC 2.0 messages to remote MCP servers via reverse proxy.
 */
export function createMcpProxyClient(
  targetUrl: string,
  config: McpProxyClientConfig = {}
): McpProxyClientInstance {
  const proxyEndpoint = config.proxyEndpoint || '/v1/mcp/proxy';
  const headers = config.headers || {};
  const fetchFn = config.customFetch || globalThis.fetch;
  let requestIdCounter = 0;

  const sendJsonRpc = async <T = unknown>(method: string, params?: unknown): Promise<JsonRpcResponse<T>> => {
    requestIdCounter += 1;
    const reqId = requestIdCounter;

    const proxyBody: McpProxyRequestBody = {
      targetUrl,
      headers,
      payload: {
        jsonrpc: '2.0',
        method,
        params,
        id: reqId,
      },
    };

    const response = await fetchFn(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proxyBody),
    });

    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('text/event-stream')) {
      const streamText = await response.text();
      const match = streamText.split('\n').find((line) => line.startsWith('data:'));
      if (!match) {
        throw new Error('Invalid SSE payload format received from reverse proxy');
      }
      return JSON.parse(match.substring(5).trim()) as JsonRpcResponse<T>;
    }

    return (await response.json()) as JsonRpcResponse<T>;
  };

  const listTools = async (): Promise<JsonRpcResponse<McpToolListResult>> => {
    return sendJsonRpc<McpToolListResult>('tools/list');
  };

  const callTool = async (
    name: string,
    args: Record<string, unknown> = {}
  ): Promise<JsonRpcResponse<McpToolCallResult>> => {
    return sendJsonRpc<McpToolCallResult>('tools/call', { name, arguments: args });
  };

  return {
    sendJsonRpc,
    listTools,
    callTool,
  };
}
