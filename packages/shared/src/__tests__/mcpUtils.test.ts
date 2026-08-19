import assert from 'node:assert';
import { extractUrlParams } from '../utils/extractUrlParams.js';
import { resolveTargetUrl } from '../utils/resolveTargetUrl.js';
import { sanitizeHeaders } from '../utils/sanitizeHeaders.js';
import { createMcpProxyClient } from '../utils/mcpProxyClient.js';

export async function runMcpUtilsTest(): Promise<void> {
  console.log('🧪 Testing MCP Utilities...');

  // 1. Test extractUrlParams
  const params1 = extractUrlParams('https://api.example.com/v1/[tenantId]/mcp/[serviceId]');
  assert.deepStrictEqual(params1, ['tenantId', 'serviceId']);

  const params2 = extractUrlParams('https://api.example.com/v1/mcp');
  assert.deepStrictEqual(params2, []);
  console.log('✓ extractUrlParams tests passed!');

  // 2. Test resolveTargetUrl
  const resolved = resolveTargetUrl(
    'https://api.example.com/v1/[tenantId]/mcp/[serviceId]',
    { tenantId: 'acme-corp', serviceId: 'billing-v2' }
  );
  assert.strictEqual(resolved, 'https://api.example.com/v1/acme-corp/mcp/billing-v2');

  const partialResolved = resolveTargetUrl(
    'https://api.example.com/v1/[tenantId]/mcp/[serviceId]',
    { tenantId: 'acme-corp' }
  );
  assert.strictEqual(partialResolved, 'https://api.example.com/v1/acme-corp/mcp/[serviceId]');
  console.log('✓ resolveTargetUrl tests passed!');

  // 3. Test sanitizeHeaders
  const cleanHeaders = sanitizeHeaders([
    { key: ' Authorization ', value: 'Bearer token123' },
    { key: '', value: 'ignored' },
    { key: '   ', value: 'also_ignored' },
    { key: 'x-app-key', value: 'app_live_8832109' }
  ]);
  assert.deepStrictEqual(cleanHeaders, {
    Authorization: 'Bearer token123',
    'x-app-key': 'app_live_8832109'
  });
  console.log('✓ sanitizeHeaders tests passed!');

  // 4. Test createMcpProxyClient
  const dummyFetch: typeof fetch = async (_url, init) => {
    const bodyObj = JSON.parse(init?.body as string);
    assert.strictEqual(bodyObj.targetUrl, 'https://api.example.com/mcp');
    assert.strictEqual(bodyObj.payload.method, 'tools/list');

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        result: { tools: [{ name: 'test_tool' }] },
        id: bodyObj.payload.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const client = createMcpProxyClient('https://api.example.com/mcp', {
    customFetch: dummyFetch
  });

  const res = await client.listTools();
  assert.strictEqual(res.result?.tools[0].name, 'test_tool');
  console.log('✓ createMcpProxyClient tests passed!');

  console.log('🎉 All MCP Utility Tests PASSED!');
}

runMcpUtilsTest().catch((err) => {
  console.error('❌ MCP Utility test failed:', err);
  process.exit(1);
});
