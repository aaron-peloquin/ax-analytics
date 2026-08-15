export interface McpHeaderPair {
  readonly key: string;
  readonly value: string;
}

export interface JsonRpcRequest<T = unknown> {
  readonly jsonrpc: '2.0';
  readonly method: string;
  readonly params?: T;
  readonly id: number | string;
}

export interface JsonRpcError {
  readonly code: number;
  readonly message: string;
  readonly data?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  readonly jsonrpc: '2.0';
  readonly result?: T;
  readonly error?: JsonRpcError;
  readonly id: number | string | null;
}

export interface McpProxyRequestBody {
  readonly targetUrl: string;
  readonly headers?: Record<string, string>;
  readonly payload: JsonRpcRequest;
}

export interface McpPropertySchema {
  readonly type?: string;
  readonly description?: string;
  readonly enum?: readonly (string | number)[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly default?: unknown;
}

export interface McpToolInputSchema {
  readonly type: string;
  readonly properties?: Record<string, McpPropertySchema>;
  readonly required?: readonly string[];
}

export interface McpTool {
  readonly name: string;
  readonly description?: string;
  readonly inputSchema?: McpToolInputSchema;
}

export interface McpToolListResult {
  readonly tools: readonly McpTool[];
}

export interface McpToolCallParams {
  readonly name: string;
  readonly arguments?: Record<string, unknown>;
}

export interface McpContentItem {
  readonly type: string;
  readonly text?: string;
}

export interface McpToolCallResult {
  readonly content?: readonly McpContentItem[];
  readonly isError?: boolean;
}
