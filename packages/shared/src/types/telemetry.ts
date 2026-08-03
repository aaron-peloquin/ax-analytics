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
  readonly entityType: EntityType;
  readonly clientString?: string;
  readonly eventType: string;
  readonly invokedToolName?: string;
  readonly previousToolName?: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly results?: Readonly<Record<string, unknown>>;
  readonly statusCode?: EventStatusCode;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly assignedVariant?: string;
}

export interface AgentToolCallPayload {
  readonly sessionId: string;
  readonly agentIdentity: string;
  readonly toolName: string;
  readonly previousToolName?: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly results?: Readonly<Record<string, unknown>>;
  readonly statusCode?: EventStatusCode;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly assignedVariant?: string;
}
