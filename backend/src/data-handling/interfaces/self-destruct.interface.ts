/**
 * Self-destruct script interfaces
 */

export interface SelfDestructScriptOptions {
  triggerCondition: string;
  filePattern: string;
  logEndpoint?: string;
}

export interface LogBreachDto {
  script_id: string;
  ip: string;
  mac: string;
  platform: string;
}

export interface GenerateScriptDto {
  platform: 'windows' | 'linux' | 'macos' | 'javascript';
  triggerCondition: string;
  filePattern: string;
  logEndpoint?: string;
}
