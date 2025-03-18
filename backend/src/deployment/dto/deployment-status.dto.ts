export enum DeploymentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class DeploymentStatusDto {
  id: string;
  jobId: string;
  organizationId: string;
  userId: string;
  deploymentConfigId: string;
  status: DeploymentStatus;
  message: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  logs: string[];
}
