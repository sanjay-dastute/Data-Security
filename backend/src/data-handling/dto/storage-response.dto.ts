import { StorageType } from './temporary-metadata.dto';

export class StorageResponseDto {
  storage_path: string;
  storage_type: StorageType;
  id?: string;
  url?: string;
  location?: string;
}
