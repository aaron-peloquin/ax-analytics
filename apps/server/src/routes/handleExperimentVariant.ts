import { Request, Response } from 'express';
import { PostgresStore } from '../db/initPostgres.js';
import { hashEntityVariant } from '../experiments/hashEntityVariant.js';

export function handleExperimentVariant(postgresStore: PostgresStore) {
  return (req: Request, res: Response): void => {
    const { experiment_key, experimentKey, entity_id, entityId } = req.body || {};
    const key = experimentKey || experiment_key;
    const entity = entityId || entity_id;

    if (!key || !entity) {
      res.status(400).json({ error: 'Missing experiment_key or entity_id' });
      return;
    }

    const assignmentKey = `${entity}:${key}`;
    let variant = postgresStore.abAssignments.get(assignmentKey);

    if (!variant) {
      const expRule = postgresStore.abExperiments.get(key);
      const splitPercentage = expRule ? expRule.splitPercentage : 50;
      variant = hashEntityVariant(entity, key, splitPercentage);
      postgresStore.abAssignments.set(assignmentKey, variant);
    }

    res.status(200).json({
      experiment_key: key,
      experimentKey: key,
      entity_id: entity,
      entityId: entity,
      assigned_variant: variant,
      assignedVariant: variant
    });
  };
}
