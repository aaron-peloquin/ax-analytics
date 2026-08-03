export type VoteType = -1 | 1;

export interface SessionFeedbackPayload {
  readonly appKey?: string;
  readonly sessionId: string;
  readonly entityId: string;
  readonly vote: VoteType;
  readonly comment?: string;
}

export interface SessionFeedbackRecord extends SessionFeedbackPayload {
  readonly id: string;
  readonly appId: string;
  readonly createdAt: string;
}
