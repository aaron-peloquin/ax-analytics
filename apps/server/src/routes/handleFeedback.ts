import { Request, Response } from 'express';
import { PostgresStore } from '../db/initPostgres.js';

export function handleFeedback(postgresStore: PostgresStore) {
  return (req: Request, res: Response): void => {
    const { session_id, sessionId, entity_id, entityId, vote, comment } = req.body || {};
    const sess = sessionId || session_id;
    const entity = entityId || entity_id;

    if (!sess || !entity || (vote !== 1 && vote !== -1)) {
      res.status(400).json({ error: 'Invalid vote payload' });
      return;
    }

    postgresStore.feedbackRecords.push({
      id: `fb_${Date.now()}`,
      sessionId: sess,
      entityId: entity,
      vote,
      comment,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ status: 'recorded' });
  };
}
