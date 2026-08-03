export interface ABExperiment {
  readonly id: string;
  readonly appId: string;
  readonly experimentKey: string;
  readonly variantAName: string;
  readonly variantBName: string;
  readonly splitPercentage: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface ABAssignmentRequest {
  readonly appKey: string;
  readonly experimentKey?: string;
  readonly experiment_key?: string;
  readonly entityId?: string;
  readonly entity_id?: string;
}

export interface ABAssignmentResponse {
  readonly experimentKey?: string;
  readonly experiment_key?: string;
  readonly entityId?: string;
  readonly entity_id?: string;
  readonly assignedVariant?: string;
  readonly assigned_variant?: string;
}
