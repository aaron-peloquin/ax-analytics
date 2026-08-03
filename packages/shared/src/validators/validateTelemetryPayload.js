export function validateTelemetryPayload(payload) {
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }
    const p = payload;
    return typeof p.sessionId === 'string' && typeof p.entityId === 'string';
}
