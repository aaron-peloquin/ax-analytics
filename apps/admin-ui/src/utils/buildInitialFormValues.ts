import { McpToolInputSchema } from '@ax-analytics/shared';

/**
  Extracts initial form values from an MCP tool JSON schema definition.
 */
export function buildInitialFormValues(
  schema: McpToolInputSchema | undefined
): Record<string, unknown> {
  if (!schema?.properties) {
    return {};
  }

  const initialValues: Record<string, unknown> = {};

  for (const [propKey, propSchema] of Object.entries(schema.properties)) {
    if (propSchema.default !== undefined) {
      initialValues[propKey] = propSchema.default;
    } else if (propSchema.enum && propSchema.enum.length > 0) {
      initialValues[propKey] = propSchema.enum[0];
    } else if (propSchema.type === 'boolean') {
      initialValues[propKey] = false;
    } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
      initialValues[propKey] = propSchema.minimum !== undefined ? propSchema.minimum : 0;
    } else {
      initialValues[propKey] = '';
    }
  }

  return initialValues;
}
