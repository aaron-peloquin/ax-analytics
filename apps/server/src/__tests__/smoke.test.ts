import { createAXServer } from '../createAXServer.js';

export async function runSmokeTest(): Promise<void> {
  console.log('🚀 Starting AX Analytics HTTP API Smoke Test...');

  const app = createAXServer();
  const port = 4499;
  const server = app.listen(port);

  try {
    const endpoint = `http://localhost:${port}`;
    console.log(`Checking Server Health at ${endpoint}/health...`);

    const healthRes = await fetch(`${endpoint}/health`);
    const healthJson = (await healthRes.json()) as { status: string };
    if (healthRes.status !== 200 || healthJson.status !== 'ok') {
      throw new Error(`Health check failed! Status: ${healthRes.status}`);
    }
    console.log('✓ Health check PASSED:', healthJson);

    console.log('Testing cURL HTTP API endpoints against live ingestion server...');

    console.log('1a. Posting Ingestion Event with full OTEL GenAI fields via POST /v1/telemetry/event...');
    const trackRes = await fetch(`${endpoint}/v1/telemetry/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appKey: 'app_live_8832109',
        sessionId: 'sess_smoke_test',
        multiagentIdentity: 'smoke-orchestrator',
        entityId: 'smoke-agent-01',
        entityType: 'agent',
        eventType: 'tool_call',
        invokedToolName: 'search_products',
        previousToolName: 'get_skill_doc',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 500,
        outputTokens: 120,
        params: { query: 'laptop' },
        tokenCost: 0.0035,
        executionTimeMs: 250
      })
    });
    const trackJson = (await trackRes.json()) as { status: string; sessionId: string };
    if (trackRes.status !== 202 || trackJson.status !== 'queued' || trackJson.sessionId !== 'sess_smoke_test') {
      throw new Error(`Track event failed! Response: ${JSON.stringify(trackJson)}`);
    }
    console.log('✓ Ingestion event with full OTEL GenAI fields PASSED:', trackJson);

    console.log('1b. Posting Ingestion Event WITHOUT sessionId to test server auto-generation...');
    const autoSessRes = await fetch(`${endpoint}/v1/telemetry/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appKey: 'app_live_8832109',
        entityId: 'smoke-agent-02',
        eventType: 'llm_inference',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        tokenCost: 0.0012
      })
    });
    const autoSessJson = (await autoSessRes.json()) as { status: string; sessionId: string };
    if (autoSessRes.status !== 202 || !autoSessJson.sessionId?.startsWith('ax_sess_')) {
      throw new Error(`Auto sessionId generation failed! Response: ${JSON.stringify(autoSessJson)}`);
    }
    console.log('✓ Auto sessionId generation PASSED:', autoSessJson);

    console.log('2. Requesting Sticky A/B Experiment Variant via POST /v1/experiments/variant...');
    const variantRes = await fetch(`${endpoint}/v1/experiments/variant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appKey: 'app_live_8832109',
        experimentKey: 'new_inventory_schema_v2',
        entityId: 'smoke-agent-01'
      })
    });
    const variantJson = (await variantRes.json()) as { assignedVariant: string };
    if (variantRes.status !== 200 || (variantJson.assignedVariant !== 'A' && variantJson.assignedVariant !== 'B')) {
      throw new Error(`Invalid A/B variant returned: ${JSON.stringify(variantJson)}`);
    }
    console.log(`✓ Sticky A/B variant assigned PASSED: Variant "${variantJson.assignedVariant}"`);

    console.log('3. Resetting User Assignments via POST /v1/experiments/reset-assignments...');
    const resetRes = await fetch(`${endpoint}/v1/experiments/reset-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentKey: 'new_inventory_schema_v2'
      })
    });
    const resetJson = (await resetRes.json()) as { status: string };
    if (resetRes.status !== 200 || resetJson.status !== 'success') {
      throw new Error(`Reset assignments failed! Response: ${JSON.stringify(resetJson)}`);
    }
    console.log('✓ Reset assignments PASSED:', resetJson);

    console.log('4. Submitting Session Feedback via POST /v1/feedback...');
    const feedbackRes = await fetch(`${endpoint}/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appKey: 'app_live_8832109',
        sessionId: 'sess_smoke_test',
        entityId: 'smoke-agent-01',
        vote: 1,
        comment: 'Smoke test passed flawlessly'
      })
    });
    const feedbackJson = (await feedbackRes.json()) as { status: string };
    if ((feedbackRes.status !== 200 && feedbackRes.status !== 201) || feedbackJson.status !== 'recorded') {
      throw new Error(`Submit feedback failed! Response: ${JSON.stringify(feedbackJson)}`);
    }
    console.log('✓ Submit feedback PASSED:', feedbackJson);

    console.log('5. Fetching Analytics Summary via GET /v1/analytics/summary...');
    const summaryRes = await fetch(`${endpoint}/v1/analytics/summary`);
    const summaryJson = (await summaryRes.json()) as { totalEvents: number; totalCost: number };
    if (summaryRes.status !== 200 || !summaryJson.totalEvents) {
      throw new Error(`Analytics summary failed! Status: ${summaryRes.status}`);
    }
    console.log(`✓ Analytics summary PASSED: ${summaryJson.totalEvents} total events, total cost $${summaryJson.totalCost}`);

    console.log('🎉 ALL HTTP API SMOKE TESTS PASSED CLEANLY!');
  } finally {
    server.close();
  }
}

runSmokeTest().catch((err) => {
  console.error('❌ SMOKE TEST FAILED:', err);
  process.exit(1);
});
