export enum StorageType {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  LOCAL = 'local',
}

export class StorageResponseDto {
  success: boolean;
  provider: StorageType;
  location: string;
  key: string;
  metadata: any;
}
