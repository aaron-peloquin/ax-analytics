import { hashEntityVariant } from '../experiments/hashEntityVariant.js';
import { verifyADGroup } from '../auth/verifyADGroup.js';

export function runServerTests(): void {
  console.log('Testing deterministic A/B hashing...');
  const variant1 = hashEntityVariant('agent-01', 'new_inventory_schema_v2', 50);
  const variant2 = hashEntityVariant('agent-01', 'new_inventory_schema_v2', 50);

  if (variant1 !== variant2) {
    throw new Error(`Determinism failure: ${variant1} !== ${variant2}`);
  }
  console.log(`✓ Hash determinism passed (${variant1}).`);

  console.log('Testing AD Group verification...');
  const adGroups = ['CN=AX-Analytics-Admins,OU=Groups,DC=company,DC=com'];
  const isAllowed = verifyADGroup(adGroups, 'CN=AX-Analytics-Admins,OU=Groups,DC=company,DC=com');
  const isDenied = verifyADGroup([], 'CN=AX-Analytics-Admins,OU=Groups,DC=company,DC=com');

  if (!isAllowed || isDenied) {
    throw new Error('AD Group verification logic failed!');
  }
  console.log('✓ AD Group verification passed.');
}

runServerTests();
