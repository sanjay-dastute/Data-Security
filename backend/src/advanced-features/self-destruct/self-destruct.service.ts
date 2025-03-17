import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SelfDestructService {
  private readonly logger = new Logger(SelfDestructService.name);
  private readonly scriptTemplatesDir: string;

  constructor(private readonly configService: ConfigService) {
    // Path to script templates
    this.scriptTemplatesDir = path.join(__dirname, '..', '..', '..', 'assets', 'scripts');
    this.ensureScriptTemplatesDir();
  }

  /**
   * Ensure script templates directory exists
   */
  private ensureScriptTemplatesDir(): void {
    try {
      if (!fs.existsSync(this.scriptTemplatesDir)) {
        fs.mkdirSync(this.scriptTemplatesDir, { recursive: true });
        this.createDefaultScriptTemplates();
      }
    } catch (error) {
      this.logger.error(`Failed to ensure script templates directory: ${error.message}`);
    }
  }

  /**
   * Create default script templates
   */
  private createDefaultScriptTemplates(): void {
    try {
      // JavaScript template
      const jsTemplate = `
// QuantumTrust Self-Destruct Script
// This script checks if the current environment is authorized to access this data
// If not, it will delete the file locally and report the breach

(function() {
  const authorizedIPs = '{{AUTHORIZED_IPS}}';
  const authorizedMACs = '{{AUTHORIZED_MACS}}';
  const fileId = '{{FILE_ID}}';
  const apiEndpoint = '{{API_ENDPOINT}}';
  
  // Function to get client IP
  async function getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (e) {
      console.error('Failed to get IP:', e);
      return null;
    }
  }
  
  // Function to get MAC address (simplified for browser environment)
  async function getMAC() {
    try {
      // In a real implementation, this would use system-specific methods
      // This is a placeholder that would be replaced with actual implementation
      // based on the target environment (Windows, Linux, macOS)
      return '{{CLIENT_MAC}}';
    } catch (e) {
      console.error('Failed to get MAC:', e);
      return null;
    }
  }
  
  // Function to check if environment is authorized
  async function isAuthorized() {
    const clientIP = await getClientIP();
    const clientMAC = await getMAC();
    
    const ipAuthorized = !authorizedIPs || authorizedIPs.split(',').includes(clientIP);
    const macAuthorized = !authorizedMACs || authorizedMACs.split(',').includes(clientMAC);
    
    return ipAuthorized && macAuthorized;
  }
  
  // Function to report breach
  async function reportBreach(clientIP, clientMAC) {
    try {
      await fetch(apiEndpoint + '/api/detect-breach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          ip: clientIP,
          mac: clientMAC,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Failed to report breach:', e);
    }
  }
  
  // Function to delete file locally
  function deleteFile() {
    try {
      // In a real implementation, this would use system-specific methods
      // This is a placeholder that would be replaced with actual implementation
      // based on the target environment (Windows, Linux, macOS)
      console.log('File deleted locally');
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  }
  
  // Main function
  async function main() {
    const authorized = await isAuthorized();
    
    if (!authorized) {
      const clientIP = await getClientIP();
      const clientMAC = await getMAC();
      
      await reportBreach(clientIP, clientMAC);
      deleteFile();
    }
  }
  
  // Execute main function
  main();
})();
`;

      // PowerShell template
      const psTemplate = `
# QuantumTrust Self-Destruct Script
# This script checks if the current environment is authorized to access this data
# If not, it will delete the file locally and report the breach

$authorizedIPs = '{{AUTHORIZED_IPS}}'
$authorizedMACs = '{{AUTHORIZED_MACS}}'
$fileId = '{{FILE_ID}}'
$apiEndpoint = '{{API_ENDPOINT}}'
$filePath = '{{FILE_PATH}}'

# Function to get client IP
function Get-ClientIP {
    try {
        $response = Invoke-RestMethod -Uri 'https://api.ipify.org?format=json'
        return $response.ip
    } catch {
        Write-Error "Failed to get IP: $_"
        return $null
    }
}

# Function to get MAC address
function Get-MACAddress {
    try {
        $networkInterfaces = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
        return ($networkInterfaces | Select-Object -First 1).MacAddress -replace '-', ':'
    } catch {
        Write-Error "Failed to get MAC: $_"
        return $null
    }
}

# Function to check if environment is authorized
function Test-Authorized {
    $clientIP = Get-ClientIP
    $clientMAC = Get-MACAddress
    
    $ipAuthorized = (-not $authorizedIPs) -or ($authorizedIPs -split ',' -contains $clientIP)
    $macAuthorized = (-not $authorizedMACs) -or ($authorizedMACs -split ',' -contains $clientMAC)
    
    return $ipAuthorized -and $macAuthorized
}

# Function to report breach
function Report-Breach {
    param (
        [string]$clientIP,
        [string]$clientMAC
    )
    
    try {
        $body = @{
            file_id = $fileId
            ip = $clientIP
            mac = $clientMAC
            timestamp = (Get-Date).ToString('o')
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$apiEndpoint/api/detect-breach" -Method Post -Body $body -ContentType 'application/json'
    } catch {
        Write-Error "Failed to report breach: $_"
    }
}

# Function to delete file locally
function Remove-FileLocally {
    try {
        if (Test-Path $filePath) {
            Remove-Item -Path $filePath -Force
            Write-Output "File deleted locally"
        }
    } catch {
        Write-Error "Failed to delete file: $_"
    }
}

# Main function
function Main {
    $authorized = Test-Authorized
    
    if (-not $authorized) {
        $clientIP = Get-ClientIP
        $clientMAC = Get-MACAddress
        
        Report-Breach -clientIP $clientIP -clientMAC $clientMAC
        Remove-FileLocally
    }
}

# Execute main function
Main
`;

      // Bash template
      const bashTemplate = `
#!/bin/bash
# QuantumTrust Self-Destruct Script
# This script checks if the current environment is authorized to access this data
# If not, it will delete the file locally and report the breach

AUTHORIZED_IPS="{{AUTHORIZED_IPS}}"
AUTHORIZED_MACS="{{AUTHORIZED_MACS}}"
FILE_ID="{{FILE_ID}}"
API_ENDPOINT="{{API_ENDPOINT}}"
FILE_PATH="{{FILE_PATH}}"

# Function to get client IP
get_client_ip() {
    local ip
    ip=$(curl -s https://api.ipify.org?format=json | grep -o '"ip":"[^"]*' | cut -d'"' -f4)
    echo "$ip"
}

# Function to get MAC address
get_mac_address() {
    local mac
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        mac=$(ip link | grep -E "ether" | head -n 1 | awk '{print $2}')
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        mac=$(ifconfig en0 | grep ether | awk '{print $2}')
    else
        mac="unknown"
    fi
    echo "$mac"
}

# Function to check if environment is authorized
is_authorized() {
    local client_ip
    local client_mac
    client_ip=$(get_client_ip)
    client_mac=$(get_mac_address)
    
    local ip_authorized=false
    local mac_authorized=false
    
    if [ -z "$AUTHORIZED_IPS" ] || [[ "$AUTHORIZED_IPS" == *"$client_ip"* ]]; then
        ip_authorized=true
    fi
    
    if [ -z "$AUTHORIZED_MACS" ] || [[ "$AUTHORIZED_MACS" == *"$client_mac"* ]]; then
        mac_authorized=true
    fi
    
    if [ "$ip_authorized" = true ] && [ "$mac_authorized" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to report breach
report_breach() {
    local client_ip="$1"
    local client_mac="$2"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    curl -s -X POST "$API_ENDPOINT/api/detect-breach" \
        -H "Content-Type: application/json" \
        -d "{\"file_id\":\"$FILE_ID\",\"ip\":\"$client_ip\",\"mac\":\"$client_mac\",\"timestamp\":\"$timestamp\"}"
}

# Function to delete file locally
delete_file() {
    if [ -f "$FILE_PATH" ]; then
        rm -f "$FILE_PATH"
        echo "File deleted locally"
    fi
}

# Main function
main() {
    if ! is_authorized; then
        local client_ip
        local client_mac
        client_ip=$(get_client_ip)
        client_mac=$(get_mac_address)
        
        report_breach "$client_ip" "$client_mac"
        delete_file
    fi
}

# Execute main function
main
`;

      // Write templates to files
      fs.writeFileSync(path.join(this.scriptTemplatesDir, 'self-destruct.js'), jsTemplate);
      fs.writeFileSync(path.join(this.scriptTemplatesDir, 'self-destruct.ps1'), psTemplate);
      fs.writeFileSync(path.join(this.scriptTemplatesDir, 'self-destruct.sh'), bashTemplate);
    } catch (error) {
      this.logger.error(`Failed to create default script templates: ${error.message}`);
    }
  }

  /**
   * Generate self-destruct script for a file
   * @param fileId - ID of the file
   * @param authorizedIPs - Comma-separated list of authorized IPs
   * @param authorizedMACs - Comma-separated list of authorized MACs
   * @param scriptType - Type of script to generate (js, ps1, sh)
   * @param filePath - Path to the file (for PowerShell and Bash scripts)
   */
  async generateSelfDestructScript(
    fileId: string,
    authorizedIPs: string,
    authorizedMACs: string,
    scriptType: 'js' | 'ps1' | 'sh' = 'js',
    filePath?: string,
  ): Promise<string> {
    try {
      const templatePath = path.join(this.scriptTemplatesDir, `self-destruct.${scriptType}`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Script template not found: ${templatePath}`);
      }
      
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders
      template = template.replace(/{{AUTHORIZED_IPS}}/g, authorizedIPs || '');
      template = template.replace(/{{AUTHORIZED_MACS}}/g, authorizedMACs || '');
      template = template.replace(/{{FILE_ID}}/g, fileId);
      template = template.replace(/{{API_ENDPOINT}}/g, this.configService.get('API_URL') || 'https://api.quantumtrust.com');
      
      if (filePath) {
        template = template.replace(/{{FILE_PATH}}/g, filePath);
      }
      
      return template;
    } catch (error) {
      this.logger.error(`Failed to generate self-destruct script: ${error.message}`);
      throw error;
    }
  }

  /**
   * Embed self-destruct script in a file
   * @param fileContent - Content of the file
   * @param script - Self-destruct script
   * @param fileType - Type of file (e.g., 'json', 'csv', 'pdf')
   */
  async embedSelfDestructScript(
    fileContent: Buffer,
    script: string,
    fileType: string,
  ): Promise<Buffer> {
    try {
      // Different embedding strategies based on file type
      switch (fileType.toLowerCase()) {
        case 'json':
          return this.embedInJson(fileContent, script);
        case 'csv':
          return this.embedInCsv(fileContent, script);
        case 'pdf':
          return this.embedInPdf(fileContent, script);
        case 'txt':
          return this.embedInText(fileContent, script);
        default:
          // For other file types, use a generic approach
          return this.embedGeneric(fileContent, script);
      }
    } catch (error) {
      this.logger.error(`Failed to embed self-destruct script: ${error.message}`);
      throw error;
    }
  }

  /**
   * Embed script in JSON file
   */
  private embedInJson(fileContent: Buffer, script: string): Buffer {
    try {
      const jsonContent = JSON.parse(fileContent.toString('utf8'));
      
      // Add script as a special property
      jsonContent.__quantumtrust_security = {
        script: Buffer.from(script).toString('base64'),
        timestamp: new Date().toISOString(),
      };
      
      return Buffer.from(JSON.stringify(jsonContent));
    } catch (error) {
      this.logger.error(`Failed to embed script in JSON: ${error.message}`);
      throw error;
    }
  }

  /**
   * Embed script in CSV file
   */
  private embedInCsv(fileContent: Buffer, script: string): Buffer {
    try {
      const csvContent = fileContent.toString('utf8');
      
      // Add script as a comment at the beginning of the file
      const encodedScript = Buffer.from(script).toString('base64');
      const comment = `# QuantumTrust Security Script (Base64):\n# ${encodedScript}\n# End QuantumTrust Security Script\n`;
      
      return Buffer.from(comment + csvContent);
    } catch (error) {
      this.logger.error(`Failed to embed script in CSV: ${error.message}`);
      throw error;
    }
  }

  /**
   * Embed script in PDF file
   * Note: This is a simplified implementation. In a real-world scenario,
   * you would use a PDF library to properly embed the script.
   */
  private embedInPdf(fileContent: Buffer, script: string): Buffer {
    try {
      // For demonstration purposes, we're just appending the script as a comment
      // In a real implementation, you would use a PDF library to properly embed the script
      const encodedScript = Buffer.from(script).toString('base64');
      const comment = `%% QuantumTrust Security Script (Base64):\n%% ${encodedScript}\n%% End QuantumTrust Security Script\n`;
      
      // Create a new buffer with the comment and the original content
      const newContent = Buffer.concat([
        Buffer.from(comment),
        fileContent,
      ]);
      
      return newContent;
    } catch (error) {
      this.logger.error(`Failed to embed script in PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Embed script in text file
   */
  private embedInText(fileContent: Buffer, script: string): Buffer {
    try {
      const textContent = fileContent.toString('utf8');
      
      // Add script as a comment at the beginning of the file
      const encodedScript = Buffer.from(script).toString('base64');
      const comment = `// QuantumTrust Security Script (Base64):\n// ${encodedScript}\n// End QuantumTrust Security Script\n\n`;
      
      return Buffer.from(comment + textContent);
    } catch (error) {
      this.logger.error(`Failed to embed script in text: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generic embedding strategy for other file types
   */
  private embedGeneric(fileContent: Buffer, script: string): Buffer {
    try {
      // For generic files, we'll append the script at the end
      // This is a simplified approach and may not work for all file types
      const encodedScript = Buffer.from(script).toString('base64');
      const comment = `\n\n<!-- QuantumTrust Security Script (Base64):\n${encodedScript}\nEnd QuantumTrust Security Script -->\n`;
      
      return Buffer.concat([
        fileContent,
        Buffer.from(comment),
      ]);
    } catch (error) {
      this.logger.error(`Failed to embed script in generic file: ${error.message}`);
      throw error;
    }
  }
}
