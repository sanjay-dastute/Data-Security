import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for generating cross-platform scripts for security operations
 * Supports Windows (PowerShell), Linux (Bash), and macOS (Bash) platforms
 */
@Injectable()
export class CrossPlatformScriptsService {
  private readonly logger = new Logger(CrossPlatformScriptsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a self-destruct script for the specified platform
   * @param platform Target platform ('windows', 'linux', 'macos')
   * @param filePath Path to the file to delete
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns Script content as a string
   */
  generateSelfDestructScript(
    platform: 'windows' | 'linux' | 'macos',
    filePath: string,
    triggerCondition: string
  ): string {
    switch (platform) {
      case 'windows':
        return this.generateWindowsSelfDestructScript(filePath, triggerCondition);
      case 'linux':
        return this.generateLinuxSelfDestructScript(filePath, triggerCondition);
      case 'macos':
        return this.generateMacOSSelfDestructScript(filePath, triggerCondition);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Generates a Windows PowerShell self-destruct script
   * @param filePath Path to the file to delete
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns PowerShell script content
   */
  private generateWindowsSelfDestructScript(filePath: string, triggerCondition: string): string {
    // Generate a unique script ID for tracking
    const scriptId = crypto.randomBytes(8).toString('hex');
    
    return `
# QuantumTrust Data Security - Self-Destruct Script (Windows)
# Script ID: ${scriptId}
# This script is designed to securely delete data on unauthorized access

# Function to securely delete a file by overwriting with random data
function Secure-Delete {
    param (
        [string]$FilePath
    )
    
    try {
        if (Test-Path $FilePath) {
            # Get file size
            $fileSize = (Get-Item $FilePath).Length
            
            # Create random data for secure overwrite
            $randomData = New-Object byte[] $fileSize
            $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
            $rng.GetBytes($randomData)
            
            # Overwrite file with random data
            [System.IO.File]::WriteAllBytes($FilePath, $randomData)
            
            # Delete the file
            Remove-Item -Path $FilePath -Force
            
            Write-Host "File securely deleted: $FilePath"
            return $true
        } else {
            Write-Host "File not found: $FilePath"
            return $false
        }
    } catch {
        Write-Host "Error deleting file: $_"
        return $false
    }
}

# Check trigger condition
if (${triggerCondition}) {
    # Log the breach attempt (only locally)
    $logEntry = "$(Get-Date) - Unauthorized access detected - Self-destruct triggered"
    $logPath = "$env:TEMP\\quantumtrust_breach_$scriptId.log"
    Add-Content -Path $logPath -Value $logEntry
    
    # Execute secure deletion
    Secure-Delete -FilePath "${filePath}"
    
    # Clean up the log after a delay
    Start-Sleep -Seconds 300
    if (Test-Path $logPath) {
        Remove-Item -Path $logPath -Force
    }
}
`;
  }

  /**
   * Generates a Linux Bash self-destruct script
   * @param filePath Path to the file to delete
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns Bash script content
   */
  private generateLinuxSelfDestructScript(filePath: string, triggerCondition: string): string {
    // Generate a unique script ID for tracking
    const scriptId = crypto.randomBytes(8).toString('hex');
    
    return `
#!/bin/bash
# QuantumTrust Data Security - Self-Destruct Script (Linux)
# Script ID: ${scriptId}
# This script is designed to securely delete data on unauthorized access

# Function to securely delete a file by overwriting with random data
secure_delete() {
    local file_path="$1"
    
    if [ -f "$file_path" ]; then
        # Get file size
        local file_size=$(stat -c%s "$file_path")
        
        # Overwrite with random data
        dd if=/dev/urandom of="$file_path" bs=1 count=$file_size conv=notrunc status=none
        
        # Delete the file
        rm -f "$file_path"
        
        echo "File securely deleted: $file_path"
        return 0
    else
        echo "File not found: $file_path"
        return 1
    fi
}

# Check trigger condition
if ${triggerCondition}; then
    # Log the breach attempt (only locally)
    log_entry="$(date) - Unauthorized access detected - Self-destruct triggered"
    log_path="/tmp/quantumtrust_breach_$scriptId.log"
    echo "$log_entry" > "$log_path"
    
    # Execute secure deletion
    secure_delete "${filePath}"
    
    # Clean up the log after a delay
    (sleep 300 && rm -f "$log_path") &
fi
`;
  }

  /**
   * Generates a macOS Bash self-destruct script
   * @param filePath Path to the file to delete
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns Bash script content
   */
  private generateMacOSSelfDestructScript(filePath: string, triggerCondition: string): string {
    // Generate a unique script ID for tracking
    const scriptId = crypto.randomBytes(8).toString('hex');
    
    return `
#!/bin/bash
# QuantumTrust Data Security - Self-Destruct Script (macOS)
# Script ID: ${scriptId}
# This script is designed to securely delete data on unauthorized access

# Function to securely delete a file by overwriting with random data
secure_delete() {
    local file_path="$1"
    
    if [ -f "$file_path" ]; then
        # Get file size
        local file_size=$(stat -f%z "$file_path")
        
        # Overwrite with random data
        dd if=/dev/urandom of="$file_path" bs=1 count=$file_size conv=notrunc status=none
        
        # Delete the file
        rm -f "$file_path"
        
        echo "File securely deleted: $file_path"
        return 0
    else
        echo "File not found: $file_path"
        return 1
    fi
}

# Check trigger condition
if ${triggerCondition}; then
    # Log the breach attempt (only locally)
    log_entry="$(date) - Unauthorized access detected - Self-destruct triggered"
    log_path="/tmp/quantumtrust_breach_$scriptId.log"
    echo "$log_entry" > "$log_path"
    
    # Execute secure deletion
    secure_delete "${filePath}"
    
    # Clean up the log after a delay
    (sleep 300 && rm -f "$log_path") &
fi
`;
  }

  /**
   * Generates a JavaScript self-destruct script for web browsers
   * @param fileIdentifier Identifier for the file to delete
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns JavaScript script content
   */
  generateJavaScriptSelfDestructScript(
    fileIdentifier: string,
    triggerCondition: string
  ): string {
    // Generate a unique script ID for tracking
    const scriptId = crypto.randomBytes(8).toString('hex');
    
    return `
// QuantumTrust Data Security - Self-Destruct Script (JavaScript)
// Script ID: ${scriptId}
// This script is designed to securely delete data on unauthorized access

// Function to securely delete data
function secureDelete(fileIdentifier) {
  try {
    // For IndexedDB storage
    if (window.indexedDB) {
      const request = indexedDB.deleteDatabase(fileIdentifier);
      request.onsuccess = () => {
        console.log(\`IndexedDB database \${fileIdentifier} deleted\`);
      };
    }
    
    // For localStorage
    if (window.localStorage) {
      localStorage.removeItem(fileIdentifier);
      console.log(\`LocalStorage item \${fileIdentifier} deleted\`);
    }
    
    // For sessionStorage
    if (window.sessionStorage) {
      sessionStorage.removeItem(fileIdentifier);
      console.log(\`SessionStorage item \${fileIdentifier} deleted\`);
    }
    
    // For cookies
    document.cookie = \`\${fileIdentifier}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;\`;
    console.log(\`Cookie \${fileIdentifier} deleted\`);
    
    return true;
  } catch (error) {
    console.error(\`Error deleting data: \${error.message}\`);
    return false;
  }
}

// Check trigger condition
if (${triggerCondition}) {
  // Log the breach attempt (only locally)
  const logEntry = \`\${new Date().toISOString()} - Unauthorized access detected - Self-destruct triggered\`;
  console.log(logEntry);
  
  // Execute secure deletion
  secureDelete("${fileIdentifier}");
  
  // Notify the server about the breach (optional)
  try {
    fetch('/api/security/breach-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptId: "${scriptId}",
        timestamp: new Date().toISOString(),
        fileIdentifier: "${fileIdentifier}"
      }),
    });
  } catch (e) {
    // Silent fail - don't block execution if server notification fails
  }
}
`;
  }

  /**
   * Embeds a self-destruct script into a file
   * @param fileContent Original file content
   * @param platform Target platform
   * @param triggerCondition Condition that triggers the self-destruct
   * @returns Modified file content with embedded script
   */
  embedSelfDestructScript(
    fileContent: Buffer,
    platform: 'windows' | 'linux' | 'macos' | 'browser',
    triggerCondition: string
  ): Buffer {
    // Generate a unique identifier for this file
    const fileId = crypto.randomBytes(16).toString('hex');
    
    let script: string;
    
    if (platform === 'browser') {
      script = this.generateJavaScriptSelfDestructScript(fileId, triggerCondition);
    } else {
      // Use a temporary path for the script generation
      const tempPath = platform === 'windows' 
        ? `C:\\Temp\\${fileId}.bin` 
        : `/tmp/${fileId}.bin`;
      
      script = this.generateSelfDestructScript(platform, tempPath, triggerCondition);
    }
    
    // Encode the script to base64 to avoid any issues with binary data
    const encodedScript = Buffer.from(script).toString('base64');
    
    // Create a metadata block with the encoded script
    const metadataBlock = Buffer.from(
      `QTRUST_METADATA_BEGIN:${platform}:${encodedScript}:QTRUST_METADATA_END`
    );
    
    // Append the metadata block to the file content
    return Buffer.concat([fileContent, metadataBlock]);
  }

  /**
   * Extracts and executes a self-destruct script from a file
   * @param fileContent File content with embedded script
   * @returns True if a script was found and executed, false otherwise
   */
  extractAndExecuteScript(fileContent: Buffer): boolean {
    // Look for the metadata block
    const contentStr = fileContent.toString();
    const metadataRegex = /QTRUST_METADATA_BEGIN:([^:]+):([^:]+):QTRUST_METADATA_END/;
    const match = contentStr.match(metadataRegex);
    
    if (!match) {
      return false;
    }
    
    const platform = match[1];
    const encodedScript = match[2];
    
    try {
      // Decode the script
      const script = Buffer.from(encodedScript, 'base64').toString();
      
      // Execute the script based on the platform
      if (platform === 'browser' && typeof window !== 'undefined') {
        // For browser scripts, evaluate the JavaScript
        // eslint-disable-next-line no-eval
        eval(script);
        return true;
      } else if (platform === 'windows' && process.platform === 'win32') {
        // For Windows scripts, execute with PowerShell
        const { execSync } = require('child_process');
        execSync(`powershell -Command "${script}"`);
        return true;
      } else if ((platform === 'linux' || platform === 'macos') && 
                (process.platform === 'linux' || process.platform === 'darwin')) {
        // For Linux/macOS scripts, execute with Bash
        const { execSync } = require('child_process');
        execSync(`bash -c "${script}"`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Error executing self-destruct script: ${error.message}`);
    }
    
    return false;
  }
}
