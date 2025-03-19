
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
