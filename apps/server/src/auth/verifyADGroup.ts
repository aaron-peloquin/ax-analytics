export function verifyADGroup(
  userGroups: readonly string[],
  requiredGroup: string
): boolean {
  if (!requiredGroup) {
    return true;
  }
  return userGroups.includes(requiredGroup);
}
