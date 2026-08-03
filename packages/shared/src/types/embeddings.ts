export interface ReasoningEmbeddingRecord {
  readonly id: string;
  readonly sessionId: string;
  readonly turnIndex: number;
  readonly agentIdentity: string;
  readonly reasoningText: string;
  readonly embedding?: readonly number[];
  readonly createdAt: string;
}
