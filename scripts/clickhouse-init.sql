CREATE DATABASE IF NOT EXISTS ax_telemetry;

CREATE TABLE IF NOT EXISTS ax_telemetry.telemetry_events
(
    timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    app_key String,
    session_id String,
    entity_id String,
    entity_type Enum8('human' = 1, 'agent' = 2),
    client_string String,
    event_type String,
    invoked_tool_name String,
    previous_tool_name String,
    params String,
    results String,
    status_code String,
    token_cost Float64,
    execution_time_ms UInt32,
    otel_trace_id String,
    otel_span_id String
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (app_key, event_type, timestamp, session_id);
