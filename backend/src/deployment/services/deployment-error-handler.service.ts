import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeploymentStatus } from '../dto/deployment-status.dto';
import { DeploymentStatusService } from './deployment-status.service';
import { CloudProvider } from '../dto/create-deployment-config.dto';

/**
 * Error categories for deployment failures
 */
export enum DeploymentErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CONFIGURATION = 'configuration',
  NETWORK = 'network',
  RESOURCE = 'resource',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

/**
 * Interface for deployment errors
 */
export interface DeploymentError {
  category: DeploymentErrorCategory;
  message: string;
  provider?: CloudProvider;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  recommendedAction?: string;
}

/**
 * Service for handling deployment errors
 */
@Injectable()
export class DeploymentErrorHandlerService {
  private readonly logger = new Logger(DeploymentErrorHandlerService.name);
  private readonly errorHistory: Map<string, DeploymentError[]> = new Map();
  private readonly maxErrorHistorySize = 100;

  constructor(
    private readonly configService: ConfigService,
    private readonly deploymentStatusService: DeploymentStatusService,
  ) {}

  /**
   * Handle a deployment error
   * @param jobId Deployment job ID
   * @param error Error object or message
   * @param provider Cloud provider
   * @returns Processed deployment error
   */
  async handleError(
    jobId: string,
    error: Error | string,
    provider?: CloudProvider,
  ): Promise<DeploymentError> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Categorize the error
    const category = this.categorizeError(errorMessage, provider);
    
    // Create deployment error object
    const deploymentError: DeploymentError = {
      category,
      message: errorMessage,
      provider,
      timestamp: new Date(),
      recoverable: this.isRecoverable(category, errorMessage),
      recommendedAction: this.getRecommendedAction(category, errorMessage, provider),
    };
    
    // Add error to history
    this.addToErrorHistory(jobId, deploymentError);
    
    // Update deployment status
    await this.deploymentStatusService.updateDeploymentStatus(
      jobId,
      DeploymentStatus.FAILED,
      `Deployment failed: ${deploymentError.message}. ${deploymentError.recoverable ? 'This error is recoverable.' : 'This error is not recoverable.'}`,
    );
    
    // Log the error
    this.logger.error(
      `Deployment error [${jobId}] [${category}]: ${errorMessage}`,
      provider ? { provider } : undefined,
    );
    
    // Append error details to deployment logs
    await this.deploymentStatusService.appendToLogs(
      jobId,
      `[${new Date().toISOString()}] ERROR [${category}]: ${errorMessage}\n` +
      `Recoverable: ${deploymentError.recoverable}\n` +
      `Recommended Action: ${deploymentError.recommendedAction || 'None'}\n`,
    );
    
    return deploymentError;
  }

  /**
   * Categorize an error based on its message
   * @param errorMessage Error message
   * @param provider Cloud provider
   * @returns Error category
   */
  private categorizeError(
    errorMessage: string,
    provider?: CloudProvider,
  ): DeploymentErrorCategory {
    const lowerCaseMessage = errorMessage.toLowerCase();
    
    if (
      lowerCaseMessage.includes('authentication') ||
      lowerCaseMessage.includes('login') ||
      lowerCaseMessage.includes('credentials') ||
      lowerCaseMessage.includes('access key') ||
      lowerCaseMessage.includes('secret key') ||
      lowerCaseMessage.includes('password')
    ) {
      return DeploymentErrorCategory.AUTHENTICATION;
    }
    
    if (
      lowerCaseMessage.includes('permission') ||
      lowerCaseMessage.includes('forbidden') ||
      lowerCaseMessage.includes('access denied') ||
      lowerCaseMessage.includes('not authorized')
    ) {
      return DeploymentErrorCategory.AUTHORIZATION;
    }
    
    if (
      lowerCaseMessage.includes('configuration') ||
      lowerCaseMessage.includes('config') ||
      lowerCaseMessage.includes('parameter') ||
      lowerCaseMessage.includes('invalid setting')
    ) {
      return DeploymentErrorCategory.CONFIGURATION;
    }
    
    if (
      lowerCaseMessage.includes('network') ||
      lowerCaseMessage.includes('connection') ||
      lowerCaseMessage.includes('timeout') ||
      lowerCaseMessage.includes('unreachable') ||
      lowerCaseMessage.includes('dns')
    ) {
      return DeploymentErrorCategory.NETWORK;
    }
    
    if (
      lowerCaseMessage.includes('resource') ||
      lowerCaseMessage.includes('quota') ||
      lowerCaseMessage.includes('limit') ||
      lowerCaseMessage.includes('capacity')
    ) {
      return DeploymentErrorCategory.RESOURCE;
    }
    
    if (
      lowerCaseMessage.includes('timeout') ||
      lowerCaseMessage.includes('timed out')
    ) {
      return DeploymentErrorCategory.TIMEOUT;
    }
    
    if (
      lowerCaseMessage.includes('validation') ||
      lowerCaseMessage.includes('invalid') ||
      lowerCaseMessage.includes('not valid')
    ) {
      return DeploymentErrorCategory.VALIDATION;
    }
    
    return DeploymentErrorCategory.UNKNOWN;
  }

  /**
   * Determine if an error is recoverable
   * @param category Error category
   * @param errorMessage Error message
   * @returns True if the error is recoverable, false otherwise
   */
  private isRecoverable(
    category: DeploymentErrorCategory,
    errorMessage: string,
  ): boolean {
    const lowerCaseMessage = errorMessage.toLowerCase();
    
    switch (category) {
      case DeploymentErrorCategory.AUTHENTICATION:
        // Authentication errors are recoverable if credentials can be updated
        return true;
        
      case DeploymentErrorCategory.AUTHORIZATION:
        // Authorization errors are recoverable if permissions can be granted
        return true;
        
      case DeploymentErrorCategory.CONFIGURATION:
        // Configuration errors are recoverable if settings can be corrected
        return true;
        
      case DeploymentErrorCategory.NETWORK:
        // Network errors are often temporary and recoverable
        return true;
        
      case DeploymentErrorCategory.RESOURCE:
        // Resource errors may be recoverable if resources can be freed or limits increased
        return !lowerCaseMessage.includes('permanent') && 
               !lowerCaseMessage.includes('hard limit');
        
      case DeploymentErrorCategory.TIMEOUT:
        // Timeout errors are usually recoverable by retrying
        return true;
        
      case DeploymentErrorCategory.VALIDATION:
        // Validation errors are recoverable if input can be corrected
        return true;
        
      case DeploymentErrorCategory.UNKNOWN:
      default:
        // Unknown errors are considered not recoverable by default
        return false;
    }
  }

  /**
   * Get a recommended action for an error
   * @param category Error category
   * @param errorMessage Error message
   * @param provider Cloud provider
   * @returns Recommended action
   */
  private getRecommendedAction(
    category: DeploymentErrorCategory,
    errorMessage: string,
    provider?: CloudProvider,
  ): string {
    switch (category) {
      case DeploymentErrorCategory.AUTHENTICATION:
        return 'Verify and update the authentication credentials for the cloud provider.';
        
      case DeploymentErrorCategory.AUTHORIZATION:
        return 'Check and update the permissions for the service account or IAM role.';
        
      case DeploymentErrorCategory.CONFIGURATION:
        return 'Review and correct the deployment configuration parameters.';
        
      case DeploymentErrorCategory.NETWORK:
        return 'Check network connectivity and firewall rules. Retry the deployment after ensuring connectivity.';
        
      case DeploymentErrorCategory.RESOURCE:
        return 'Increase resource quotas or reduce resource requests in the deployment configuration.';
        
      case DeploymentErrorCategory.TIMEOUT:
        return 'Retry the deployment. If the issue persists, check for service health issues with the cloud provider.';
        
      case DeploymentErrorCategory.VALIDATION:
        return 'Correct the invalid parameters in the deployment configuration.';
        
      case DeploymentErrorCategory.UNKNOWN:
      default:
        return 'Contact support for assistance with this deployment error.';
    }
  }

  /**
   * Add an error to the error history
   * @param jobId Deployment job ID
   * @param error Deployment error
   */
  private addToErrorHistory(jobId: string, error: DeploymentError): void {
    if (!this.errorHistory.has(jobId)) {
      this.errorHistory.set(jobId, []);
    }
    
    const errors = this.errorHistory.get(jobId);
    errors.push(error);
    
    // Trim error history if it exceeds the maximum size
    if (errors.length > this.maxErrorHistorySize) {
      errors.shift();
    }
    
    this.errorHistory.set(jobId, errors);
  }

  /**
   * Get the error history for a deployment job
   * @param jobId Deployment job ID
   * @returns Array of deployment errors
   */
  getErrorHistory(jobId: string): DeploymentError[] {
    return this.errorHistory.get(jobId) || [];
  }

  /**
   * Clear the error history for a deployment job
   * @param jobId Deployment job ID
   */
  clearErrorHistory(jobId: string): void {
    this.errorHistory.delete(jobId);
  }

  /**
   * Get recovery suggestions for a deployment error
   * @param error Deployment error
   * @returns Array of recovery suggestions
   */
  getRecoverySuggestions(error: DeploymentError): string[] {
    if (!error.recoverable) {
      return ['This error is not automatically recoverable. Manual intervention is required.'];
    }
    
    const suggestions: string[] = [];
    
    switch (error.category) {
      case DeploymentErrorCategory.AUTHENTICATION:
        suggestions.push('Update the authentication credentials in the deployment configuration.');
        suggestions.push('Verify that the credentials have not expired.');
        suggestions.push('Check if multi-factor authentication is required and properly configured.');
        break;
        
      case DeploymentErrorCategory.AUTHORIZATION:
        suggestions.push('Grant the necessary permissions to the service account or IAM role.');
        suggestions.push('Verify that the service account has the required roles assigned.');
        suggestions.push('Check for any organization policies that might be restricting the deployment.');
        break;
        
      case DeploymentErrorCategory.CONFIGURATION:
        suggestions.push('Review and correct the deployment configuration parameters.');
        suggestions.push('Ensure that all required fields are provided and valid.');
        suggestions.push('Check for any deprecated or unsupported configuration options.');
        break;
        
      case DeploymentErrorCategory.NETWORK:
        suggestions.push('Verify network connectivity to the cloud provider.');
        suggestions.push('Check firewall rules and network security groups.');
        suggestions.push('Ensure that the required ports are open for communication.');
        suggestions.push('Retry the deployment after confirming connectivity.');
        break;
        
      case DeploymentErrorCategory.RESOURCE:
        suggestions.push('Increase resource quotas for the cloud provider account.');
        suggestions.push('Reduce resource requests in the deployment configuration.');
        suggestions.push('Delete unused resources to free up quota.');
        suggestions.push('Request a quota increase from the cloud provider.');
        break;
        
      case DeploymentErrorCategory.TIMEOUT:
        suggestions.push('Retry the deployment operation.');
        suggestions.push('Check for any service health issues with the cloud provider.');
        suggestions.push('Increase timeout values in the deployment configuration if possible.');
        break;
        
      case DeploymentErrorCategory.VALIDATION:
        suggestions.push('Correct the invalid parameters in the deployment configuration.');
        suggestions.push('Ensure that all values are within the allowed ranges.');
        suggestions.push('Check for any formatting issues in the configuration.');
        break;
        
      case DeploymentErrorCategory.UNKNOWN:
      default:
        suggestions.push('Retry the deployment operation.');
        suggestions.push('Check the cloud provider\'s status page for any ongoing issues.');
        suggestions.push('Review the deployment logs for more detailed information.');
        suggestions.push('Contact support for assistance with this deployment error.');
        break;
    }
    
    return suggestions;
  }

  /**
   * Attempt to automatically recover from a deployment error
   * @param jobId Deployment job ID
   * @param error Deployment error
   * @returns True if recovery was successful, false otherwise
   */
  async attemptRecovery(jobId: string, error: DeploymentError): Promise<boolean> {
    if (!error.recoverable) {
      return false;
    }
    
    // Log recovery attempt
    this.logger.log(`Attempting to recover from deployment error [${jobId}] [${error.category}]`);
    await this.deploymentStatusService.appendToLogs(
      jobId,
      `[${new Date().toISOString()}] Attempting to recover from error: ${error.message}`,
    );
    
    // Update deployment status
    await this.deploymentStatusService.updateDeploymentStatus(
      jobId,
      DeploymentStatus.IN_PROGRESS,
      `Attempting to recover from deployment error: ${error.message}`,
    );
    
    // Implement recovery strategies based on error category
    let recoverySuccessful = false;
    
    switch (error.category) {
      case DeploymentErrorCategory.NETWORK:
      case DeploymentErrorCategory.TIMEOUT:
        // For network and timeout errors, simply retrying might work
        recoverySuccessful = await this.retryDeployment(jobId);
        break;
        
      // Other categories would have specific recovery strategies
      // For now, we'll return false for them
      default:
        recoverySuccessful = false;
        break;
    }
    
    // Log recovery result
    if (recoverySuccessful) {
      this.logger.log(`Successfully recovered from deployment error [${jobId}] [${error.category}]`);
      await this.deploymentStatusService.appendToLogs(
        jobId,
        `[${new Date().toISOString()}] Successfully recovered from error`,
      );
      
      // Update deployment status
      await this.deploymentStatusService.updateDeploymentStatus(
        jobId,
        DeploymentStatus.IN_PROGRESS,
        `Recovered from deployment error, continuing deployment`,
      );
    } else {
      this.logger.error(`Failed to recover from deployment error [${jobId}] [${error.category}]`);
      await this.deploymentStatusService.appendToLogs(
        jobId,
        `[${new Date().toISOString()}] Failed to recover from error`,
      );
      
      // Update deployment status
      await this.deploymentStatusService.updateDeploymentStatus(
        jobId,
        DeploymentStatus.FAILED,
        `Failed to recover from deployment error: ${error.message}`,
      );
    }
    
    return recoverySuccessful;
  }

  /**
   * Retry a deployment
   * @param jobId Deployment job ID
   * @returns True if the retry was successful, false otherwise
   */
  private async retryDeployment(jobId: string): Promise<boolean> {
    // In a real implementation, this would trigger the deployment process again
    // For now, we'll simulate a successful retry
    await this.deploymentStatusService.appendToLogs(
      jobId,
      `[${new Date().toISOString()}] Retrying deployment`,
    );
    
    // Simulate a delay for the retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return success (in a real implementation, this would be based on the actual result)
    return true;
  }
}
