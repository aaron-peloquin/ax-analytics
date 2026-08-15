export type EntityType = 'human' | 'agent';

export type EventStatusCode = 
  | 'SUCCESS' 
  | 'PARAMETER_ERROR' 
  | 'TIMEOUT' 
  | 'AUTH_DENIED'
  | 'MODEL_REFUSAL'
  | 'ASSERTION_FAILED';

export interface TelemetryEvent {
  readonly timestamp?: string;
  readonly appKey: string;
  readonly sessionId: string;
  readonly entityId: string;
  readonly entityType?: EntityType;
  readonly clientString?: string;
  readonly eventType: string;
  readonly multiagentIdentity?: string;
  readonly invokedToolName?: string;
  readonly previousToolName?: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly results?: Readonly<Record<string, unknown>>;
  readonly statusCode?: EventStatusCode;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly provider?: string;
  readonly model?: string;
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly parentSpanId?: string;
  readonly assignedVariant?: string;
  readonly urlFull?: string;
  readonly urlPath?: string;
  readonly urlScheme?: string;
  readonly documentTitle?: string;
  readonly documentReferrer?: string;
  readonly documentVisibilityState?: string;
  readonly userAgent?: string;
  readonly browserPlatform?: string;
  readonly browserMobile?: boolean;
  readonly deviceCategory?: 'mobile' | 'desktop';
  readonly browserBrands?: readonly string[];
  readonly userId?: string;
  readonly isEntrypointPage?: boolean;
  readonly previousUrlPath?: string;
}

export interface AgentToolCallPayload {
  readonly sessionId?: string;
  readonly agentIdentity: string;
  readonly multiagentIdentity?: string;
  readonly toolName: string;
  readonly previousToolName?: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly results?: Readonly<Record<string, unknown>>;
  readonly statusCode?: EventStatusCode;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly provider?: string;
  readonly model?: string;
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly assignedVariant?: string;
}

