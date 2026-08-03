async function resetDb() {
  const ports = [4400, 3300];
  let success = false;

  for (const port of ports) {
    const endpoint = process.env.SERVER_ENDPOINT || `http://localhost:${port}`;
    console.log(`🧹 Attempting DB data wipe at ${endpoint}/v1/admin/reset-db...`);
    try {
      const res = await fetch(`${endpoint}/v1/admin/reset-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (_e) {
        continue;
      }

      if (res.ok && json.status === 'success') {
        console.log('✓ SUCCESS:', json.message || 'Database telemetry events, feedback records, and sticky assignments wiped clean.');
        success = true;
        break;
      }
    } catch (_err) {
      // Try next port
    }
  }

  if (!success) {
    console.error('❌ Could not reset DB. Ensure AX Analytics server is running (pnpm dev).');
    process.exit(1);
  }
}

resetDb();
