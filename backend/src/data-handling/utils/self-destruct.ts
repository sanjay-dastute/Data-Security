/**
 * Self-destruct script utility
 * 
 * This module provides functionality to generate self-destruct scripts
 * that can be embedded in encrypted data. When triggered, these scripts
 * will delete the data on the unauthorized system while preserving
 * the data on the server.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SelfDestructScriptGenerator {
  private readonly logger = new Logger(SelfDestructScriptGenerator.name);

  /**
   * Generate a self-destruct script for the specified platform
   */
  generateScript(platform: 'windows' | 'linux' | 'macos', options: {
    triggerCondition: string;
    filePattern: string;
    logEndpoint?: string;
  }): string {
    switch (platform) {
      case 'windows':
        return this.generateWindowsScript(options);
      case 'linux':
        return this.generateLinuxScript(options);
      case 'macos':
        return this.generateMacOSScript(options);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Generate a Windows batch script for self-destruction
   */
  private generateWindowsScript(options: {
    triggerCondition: string;
    filePattern: string;
    logEndpoint?: string;
  }): string {
    const { triggerCondition, filePattern, logEndpoint } = options;
    
    // Generate a unique script ID
    const scriptId = crypto.randomUUID();
    
    // Create the script
    let script = `
@echo off
setlocal enabledelayedexpansion

REM Self-destruct script ID: ${scriptId}
REM This script will delete the file if the trigger condition is met

REM Check trigger condition
if ${triggerCondition} (
  REM Log breach if endpoint is provided
  ${logEndpoint ? `
  set "ip="
  for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    if "!ip!"=="" set "ip=%%a"
  )
  set ip=!ip:~1!
  
  set "mac="
  for /f "tokens=3 delims=," %%a in ('getmac /fo csv /nh ^| findstr /v "Disconnected"') do (
    if "!mac!"=="" set "mac=%%a"
  )
  set mac=!mac:~1,-1!
  
  curl -X POST "${logEndpoint}" -H "Content-Type: application/json" -d "{\\"script_id\\":\\"${scriptId}\\",\\"ip\\":\\"!ip!\\",\\"mac\\":\\"!mac!\\",\\"platform\\":\\"windows\\"}"
  ` : 'REM No log endpoint provided'}
  
  REM Delete the file
  del ${filePattern}
  
  REM Self-delete this script
  (goto) 2>nul & del "%~f0"
)
`;
    
    return script;
  }

  /**
   * Generate a Linux shell script for self-destruction
   */
  private generateLinuxScript(options: {
    triggerCondition: string;
    filePattern: string;
    logEndpoint?: string;
  }): string {
    const { triggerCondition, filePattern, logEndpoint } = options;
    
    // Generate a unique script ID
    const scriptId = crypto.randomUUID();
    
    // Create the script
    let script = `
#!/bin/bash

# Self-destruct script ID: ${scriptId}
# This script will delete the file if the trigger condition is met

# Check trigger condition
if ${triggerCondition}; then
  # Log breach if endpoint is provided
  ${logEndpoint ? `
  IP=$(hostname -I | awk '{print $1}')
  MAC=$(ip link | grep -m 1 link/ether | awk '{print $2}')
  
  curl -X POST "${logEndpoint}" \\
    -H "Content-Type: application/json" \\
    -d "{\\"script_id\\":\\"${scriptId}\\",\\"ip\\":\\"$IP\\",\\"mac\\":\\"$MAC\\",\\"platform\\":\\"linux\\"}"
  ` : '# No log endpoint provided'}
  
  # Delete the file
  rm -f ${filePattern}
  
  # Self-delete this script
  rm -f "$0"
fi
`;
    
    return script;
  }

  /**
   * Generate a macOS shell script for self-destruction
   */
  private generateMacOSScript(options: {
    triggerCondition: string;
    filePattern: string;
    logEndpoint?: string;
  }): string {
    const { triggerCondition, filePattern, logEndpoint } = options;
    
    // Generate a unique script ID
    const scriptId = crypto.randomUUID();
    
    // Create the script
    let script = `
#!/bin/bash

# Self-destruct script ID: ${scriptId}
# This script will delete the file if the trigger condition is met

# Check trigger condition
if ${triggerCondition}; then
  # Log breach if endpoint is provided
  ${logEndpoint ? `
  IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')
  MAC=$(ifconfig en0 | grep ether | awk '{print $2}')
  
  curl -X POST "${logEndpoint}" \\
    -H "Content-Type: application/json" \\
    -d "{\\"script_id\\":\\"${scriptId}\\",\\"ip\\":\\"$IP\\",\\"mac\\":\\"$MAC\\",\\"platform\\":\\"macos\\"}"
  ` : '# No log endpoint provided'}
  
  # Delete the file
  rm -f ${filePattern}
  
  # Self-delete this script
  rm -f "$0"
fi
`;
    
    return script;
  }

  /**
   * Generate a platform-agnostic JavaScript self-destruct script
   * This can be embedded in JSON or other text-based files
   */
  generateJavaScriptScript(options: {
    triggerCondition: string;
    filePattern: string;
    logEndpoint?: string;
  }): string {
    const { triggerCondition, filePattern, logEndpoint } = options;
    
    // Generate a unique script ID
    const scriptId = crypto.randomUUID();
    
    // Create the script
    let script = `
// Self-destruct script ID: ${scriptId}
// This script will delete the file if the trigger condition is met
(function() {
  // Check trigger condition
  if (${triggerCondition}) {
    try {
      ${logEndpoint ? `
      // Log breach if endpoint is provided
      const logData = {
        script_id: "${scriptId}",
        platform: navigator.platform,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      fetch("${logEndpoint}", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });
      ` : '// No log endpoint provided'}
      
      // In a browser context, we can't directly delete files
      // This is a placeholder for the actual implementation
      console.log("Self-destruct triggered for: ${filePattern}");
      
      // In a Node.js context, we could use:
      // const fs = require('fs');
      // fs.unlinkSync('${filePattern}');
    } catch (error) {
      console.error("Self-destruct error:", error);
    }
  }
})();
`;
    
    return script;
  }

  /**
   * Embed a self-destruct script in a file
   */
  embedScriptInFile(fileContent: string | Buffer, script: string): string | Buffer {
    if (Buffer.isBuffer(fileContent)) {
      // For binary files, append the script as a comment at the end
      const scriptBuffer = Buffer.from(`\n/*\n${script}\n*/`);
      return Buffer.concat([fileContent, scriptBuffer]);
    } else {
      // For text files, append the script as a comment at the end
      return `${fileContent}\n\n/*\n${script}\n*/`;
    }
  }
}
