import { Request, Response } from 'express';
import { PostgresStore } from '../db/initPostgres.js';

export function handleResetExperimentAssignments(postgresStore: PostgresStore) {
  return (req: Request, res: Response): void => {
    const { experimentKey, experiment_key } = req.body || {};
    const key = experimentKey || experiment_key;

    if (!key) {
      res.status(400).json({ error: 'Missing experimentKey parameter' });
      return;
    }

    let resetCount = 0;
    for (const k of Array.from(postgresStore.abAssignments.keys())) {
      if (k.endsWith(`:${key}`)) {
        postgresStore.abAssignments.delete(k);
        resetCount++;
      }
    }

    postgresStore.save();

    res.status(200).json({
      status: 'success',
      experimentKey: key,
      resetCount,
      message: `Reset ${resetCount} user_id assignments for experiment "${key}".`
    });
  };
}
