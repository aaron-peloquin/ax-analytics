export const tsTypesCode = `export type EventStatusCode_v1 = 
  | 'SUCCESS' 
  | 'PARAMETER_ERROR' 
  | 'TIMEOUT' 
  | 'AUTH_DENIED' 
  | 'MODEL_REFUSAL' 
  | 'ASSERTION_FAILED';

export type EntityType_v1 = 'human' | 'agent';

export interface TelemetryEvent_v1 {
  readonly timestamp?: string;
  readonly appKey: string;
  readonly sessionId: string;
  readonly entityId: string;
  /** Set to 'agent' for autonomous AI personas, 'human' for user UI actions. Leave undefined for deterministic system workers. */
  readonly entityType?: EntityType_v1;
  readonly eventType: string;
  readonly multiagentIdentity?: string;
  /** Strictly reserved for autonomous agent tool invocations (e.g. MCP tools). Do not emit for background tasks or Temporal activities. */
  readonly invokedToolName?: string;
  readonly previousToolName?: string;
  readonly provider?: string;
  readonly model?: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly params?: Record<string, unknown>;
  readonly results?: Record<string, unknown>;
  readonly statusCode?: EventStatusCode_v1;
  readonly tokenCost?: number;
  readonly executionTimeMs?: number;
  /** Correlates event with OpenTelemetry spans for low-level execution timing and stack traces. */
  readonly otelTraceId?: string;
  readonly otelSpanId?: string;
  readonly assignedVariant?: string;
}

export interface ExperimentVariantRequest_v1 {
  readonly appKey: string;
  readonly experimentKey: string;
  readonly entityId: string;
}

export interface SessionFeedback_v1 {
  readonly appKey: string;
  readonly sessionId: string;
  readonly entityId: string;
  readonly vote: 1 | -1;
  readonly comment?: string;
}`;

export const pythonTypesCode = `from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

EventStatusCode_v1 = Literal[
    "SUCCESS", 
    "PARAMETER_ERROR", 
    "TIMEOUT", 
    "AUTH_DENIED", 
    "MODEL_REFUSAL", 
    "ASSERTION_FAILED"
]

EntityType_v1 = Literal["human", "agent"]

class TelemetryEvent_v1(BaseModel):
    appKey: str = Field(..., description="Application key identifier")
    sessionId: str = Field(..., description="Trace or session ID")
    entityId: str = Field(..., description="User ID, Agent persona ID, or system endpoint")
    entityType: Optional[EntityType_v1] = Field(
        None, 
        description="Set to 'agent' for autonomous AI personas, 'human' for user UI actions. Leave None for deterministic backend code or system workers."
    )
    eventType: str = Field(
        default="tool_call", 
        description="Event type ('tool_call' for autonomous agent tools, 'llm_inference', 'page_view', 'button_click')"
    )
    multiagentIdentity: Optional[str] = Field(None, description="System-wide multi-agent grouping identifier")
    invokedToolName: Optional[str] = Field(
        None, 
        description="Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for Temporal activities or routine DB queries."
    )
    previousToolName: Optional[str] = None
    provider: Optional[str] = Field(None, description="LLM vendor, e.g. 'openai', 'anthropic', 'google'")
    model: Optional[str] = Field(None, description="LLM model string, e.g. 'gpt-4o', 'claude-3-5-sonnet'")
    inputTokens: Optional[int] = Field(None, description="Prompt token count")
    outputTokens: Optional[int] = Field(None, description="Completion token count")
    params: Optional[Dict[str, Any]] = Field(None, description="Tool JSON parameters or LLM prompt payload")
    results: Optional[Dict[str, Any]] = Field(None, description="Tool return payload or LLM completion response")
    statusCode: Optional[EventStatusCode_v1] = Field(default="SUCCESS")
    tokenCost: Optional[float] = Field(None, description="Token expenditure in USD ($)")
    executionTimeMs: Optional[int] = Field(None, description="Turn execution duration in milliseconds")
    otelTraceId: Optional[str] = Field(None, description="W3C OTel 128-bit hex trace ID for OpenTelemetry correlation")
    otelSpanId: Optional[str] = Field(None, description="OTel 64-bit hex span ID")
    assignedVariant: Optional[str] = None

class ExperimentVariantRequest_v1(BaseModel):
    appKey: str
    experimentKey: str
    entityId: str

class SessionFeedback_v1(BaseModel):
    appKey: str
    sessionId: str
    entityId: str
    vote: Literal[1, -1]
    comment: Optional[str] = None`;

export const kotlinTypesCode = `import kotlinx.serialization.Serializable

@Serializable
enum class EventStatusCode_v1 {
    SUCCESS,
    PARAMETER_ERROR,
    TIMEOUT,
    AUTH_DENIED,
    MODEL_REFUSAL,
    ASSERTION_FAILED
}

@Serializable
enum class EntityType_v1 {
    human,
    agent
}

@Serializable
data class TelemetryEvent_v1(
    val appKey: String,
    val sessionId: String,
    val entityId: String,
    /** Set to EntityType_v1.agent for autonomous AI personas, EntityType_v1.human for user actions. Leave null for deterministic workers. */
    val entityType: EntityType_v1? = null,
    val eventType: String = "tool_call",
    val multiagentIdentity: String? = null,
    /** Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for routine background activities. */
    val invokedToolName: String? = null,
    val previousToolName: String? = null,
    val provider: String? = null,
    val model: String? = null,
    val inputTokens: Long? = null,
    val outputTokens: Long? = null,
    val params: Map<String, String>? = null,
    val results: Map<String, String>? = null,
    val statusCode: EventStatusCode_v1? = EventStatusCode_v1.SUCCESS,
    val tokenCost: Double? = null,
    val executionTimeMs: Long? = null,
    val otelTraceId: String? = null,
    val otelSpanId: String? = null,
    val assignedVariant: String? = null,
    val timestamp: String? = null
)

@Serializable
data class ExperimentVariantRequest_v1(
    val appKey: String,
    val experimentKey: String,
    val entityId: String
)

@Serializable
data class SessionFeedback_v1(
    val appKey: String,
    val sessionId: String,
    val entityId: String,
    val vote: Int,
    val comment: String? = null
)`;

export const goTypesCode = `package telemetry

type EventStatusCode string

const (
    StatusSuccess         EventStatusCode = "SUCCESS"
    StatusParameterError  EventStatusCode = "PARAMETER_ERROR"
    StatusTimeout         EventStatusCode = "TIMEOUT"
    StatusAuthDenied      EventStatusCode = "AUTH_DENIED"
    StatusModelRefusal    EventStatusCode = "MODEL_REFUSAL"
    StatusAssertionFailed EventStatusCode = "ASSERTION_FAILED"
)

type EntityType string

const (
    EntityHuman EntityType = "human"
    EntityAgent EntityType = "agent"
)

type TelemetryEvent_v1 struct {
    AppKey             string                 \`json:"appKey"\`
    SessionID          string                 \`json:"sessionId"\`
    EntityID           string                 \`json:"entityId"\`
    // Set to EntityAgent for autonomous AI personas, EntityHuman for user actions. Nil for deterministic routines.
    EntityType         *EntityType            \`json:"entityType,omitempty"\`
    EventType          string                 \`json:"eventType"\`            // "tool_call", "llm_inference", "page_view", "button_click"
    MultiagentIdentity *string                \`json:"multiagentIdentity,omitempty"\`
    // Strictly for autonomous agent tool invocations (e.g. MCP tools). Do NOT emit for Temporal activities or DB queries.
    InvokedToolName    *string                \`json:"invokedToolName,omitempty"\`
    PreviousToolName   *string                \`json:"previousToolName,omitempty"\`
    Provider           *string                \`json:"provider,omitempty"\`
    Model              *string                \`json:"model,omitempty"\`
    InputTokens        *int64                 \`json:"inputTokens,omitempty"\`
    OutputTokens       *int64                 \`json:"outputTokens,omitempty"\`
    Params             map[string]interface{} \`json:"params,omitempty"\`
    Results            map[string]interface{} \`json:"results,omitempty"\`
    StatusCode         *EventStatusCode       \`json:"statusCode,omitempty"\`
    TokenCost          *float64               \`json:"tokenCost,omitempty"\`
    ExecutionTimeMs    *int64                 \`json:"executionTimeMs,omitempty"\`
    OtelTraceID        *string                \`json:"otelTraceId,omitempty"\`
    OtelSpanID         *string                \`json:"otelSpanId,omitempty"\`
    AssignedVariant    *string                \`json:"assignedVariant,omitempty"\`
    Timestamp          *string                \`json:"timestamp,omitempty"\`
}

type ExperimentVariantRequest_v1 struct {
    AppKey        string \`json:"appKey"\`
    ExperimentKey string \`json:"experimentKey"\`
    EntityID      string \`json:"entityId"\`
}

type SessionFeedback_v1 struct {
    AppKey    string  \`json:"appKey"\`
    SessionID string  \`json:"sessionId"\`
    EntityID  string  \`json:"entityId"\`
    Vote      int     \`json:"vote"\` // 1 or -1
    Comment   *string \`json:"comment,omitempty"\`
}`;
