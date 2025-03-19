
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
    
    curl -s -X POST "$API_ENDPOINT/api/detect-breach"         -H "Content-Type: application/json"         -d "{"file_id":"$FILE_ID","ip":"$client_ip","mac":"$client_mac","timestamp":"$timestamp"}"
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
