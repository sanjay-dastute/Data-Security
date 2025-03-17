# QuantumTrust Data Security API Documentation

## Overview

This document provides comprehensive documentation for the QuantumTrust Data Security API, which enables secure data encryption using quantum-resistant algorithms and blockchain key management. The API supports a wide range of features including selective field encryption, batch processing, multi-cloud storage, and decentralized key recovery.

## Authentication

All API requests require authentication using one of the following methods:

1. **API Key**: Include the API key in the `X-API-Key` header of each request.
2. **JWT Token**: Include a JWT token in the `Authorization` header with the format `Bearer <token>`.
3. **mTLS**: For high-security operations, mutual TLS authentication is required.

Additionally, IP/MAC address validation is enforced for sensitive operations.

### Generating an API Key

API keys can be generated through the QuantumTrust dashboard by organization administrators. Each key can be configured with specific permissions and expiration dates.

## Core Endpoints

### Encryption

#### POST /api/encrypt

Encrypts data using quantum-resistant algorithms.

**Request Body:**
```json
{
  "data": "Data to encrypt or file path",
  "fields": ["field1", "field2"],
  "options": {
    "algorithm": "CRYSTALS-Kyber",
    "storage": {
      "type": "s3",
      "bucket": "data-bucket"
    },
    "selfDestruct": true,
    "retainData": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "encryptedData": "...",
  "metadata": {
    "fields_encrypted": ["field1", "field2"],
    "timestamp": "2025-03-17T10:00:00Z",
    "algorithm": "CRYSTALS-Kyber",
    "keyId": "uuid"
  }
}
```

#### POST /api/decrypt

Decrypts previously encrypted data.

**Request Body:**
```json
{
  "encryptedData": "...",
  "keyId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "decryptedData": "...",
  "metadata": {
    "fields_decrypted": ["field1", "field2"],
    "timestamp": "2025-03-17T10:00:00Z"
  }
}
```

### Key Management

#### GET /api/keys

Retrieves keys associated with the authenticated user or organization.

**Response:**
```json
{
  "success": true,
  "keys": [
    {
      "key_id": "uuid",
      "key_type": "encryption",
      "created_at": "2025-03-17T10:00:00Z",
      "expires_at": "2025-04-17T10:00:00Z",
      "algorithm": "CRYSTALS-Kyber",
      "status": "active"
    }
  ]
}
```

#### POST /api/keys/set-timer

Sets a timer for automatic key regeneration.

**Request Body:**
```json
{
  "timer_interval": 300,
  "key_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timer set successfully",
  "next_rotation": "2025-03-17T15:00:00Z"
}
```

#### POST /api/keys/rotate

Manually rotates encryption keys.

**Request Body:**
```json
{
  "key_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "rotated_keys": [
    {
      "old_key_id": "uuid1",
      "new_key_id": "uuid3"
    },
    {
      "old_key_id": "uuid2",
      "new_key_id": "uuid4"
    }
  ]
}
```

## Advanced Feature Endpoints

### Selective Field Encryption

#### POST /api/view-data

View uploaded data and select specific fields for encryption.

**Request Body:**
```json
{
  "file_id": "uuid",
  "format": "json"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "ssn": "123-45-6789",
    "address": "123 Main St"
  },
  "available_fields": ["name", "email", "ssn", "address"]
}
```

#### POST /api/encrypt/selective

Encrypt only selected fields from a dataset.

**Request Body:**
```json
{
  "file_id": "uuid",
  "fields": ["ssn", "email"],
  "options": {
    "algorithm": "CRYSTALS-Kyber"
  }
}
```

**Response:**
```json
{
  "success": true,
  "encryptedData": "...",
  "metadata": {
    "fields_encrypted": ["ssn", "email"],
    "fields_plaintext": ["name", "address"],
    "timestamp": "2025-03-17T10:00:00Z"
  },
  "download_url": "https://example.com/download/uuid"
}
```

### HSM Integration

#### GET /api/hsm/providers

List available HSM providers.

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "id": "aws-cloudhsm",
      "name": "AWS CloudHSM",
      "status": "connected"
    },
    {
      "id": "azure-keyvault",
      "name": "Azure Key Vault",
      "status": "available"
    },
    {
      "id": "google-cloudkms",
      "name": "Google Cloud KMS",
      "status": "available"
    }
  ]
}
```

#### POST /api/hsm/connect

Connect to an HSM provider.

**Request Body:**
```json
{
  "provider_id": "aws-cloudhsm",
  "credentials": {
    "access_key": "...",
    "secret_key": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "connection_id": "uuid",
  "status": "connected",
  "capabilities": ["key_generation", "encryption", "signing"]
}
```

#### POST /api/hsm/generate-key

Generate a key in the HSM.

**Request Body:**
```json
{
  "connection_id": "uuid",
  "key_type": "encryption",
  "algorithm": "CRYSTALS-Kyber",
  "key_length": 3072
}
```

**Response:**
```json
{
  "success": true,
  "key_id": "uuid",
  "key_reference": "hsm://aws-cloudhsm/uuid",
  "created_at": "2025-03-17T10:00:00Z"
}
```

### Decentralized Key Recovery

#### POST /api/key-recovery/create-shards

Create key shards for decentralized recovery.

**Request Body:**
```json
{
  "key_id": "uuid",
  "threshold": 3,
  "total_shards": 5,
  "custodians": [
    {"user_id": "uuid1", "email": "custodian1@example.com"},
    {"user_id": "uuid2", "email": "custodian2@example.com"},
    {"user_id": "uuid3", "email": "custodian3@example.com"},
    {"user_id": "uuid4", "email": "custodian4@example.com"},
    {"user_id": "uuid5", "email": "custodian5@example.com"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recovery_id": "uuid",
  "threshold": 3,
  "total_shards": 5,
  "shards_distributed": true,
  "custodians_notified": true
}
```

#### POST /api/key-recovery/submit-shard

Submit a key shard for recovery.

**Request Body:**
```json
{
  "recovery_id": "uuid",
  "shard_id": "uuid",
  "shard_data": "...",
  "custodian_id": "uuid1"
}
```

**Response:**
```json
{
  "success": true,
  "shards_received": 1,
  "threshold": 3,
  "status": "in_progress"
}
```

#### GET /api/key-recovery/status

Check the status of a key recovery process.

**Query Parameters:**
- `recovery_id`: UUID of the recovery process

**Response:**
```json
{
  "success": true,
  "recovery_id": "uuid",
  "shards_received": 3,
  "threshold": 3,
  "status": "complete",
  "recovered_key_id": "uuid",
  "completed_at": "2025-03-17T10:00:00Z"
}
```

### Batch Processing

#### POST /api/batch/process

Submit a batch processing job for large datasets.

**Request Body:**
```json
{
  "dataset_location": "s3://bucket/path",
  "operation": "encrypt",
  "fields": ["ssn", "credit_card"],
  "options": {
    "algorithm": "CRYSTALS-Kyber",
    "parallelism": 8,
    "output_location": "s3://output-bucket/path"
  }
}
```

**Response:**
```json
{
  "success": true,
  "batch_job_id": "uuid",
  "status": "queued",
  "estimated_completion": "2025-03-17T11:00:00Z"
}
```

#### GET /api/batch/status

Check the status of a batch processing job.

**Query Parameters:**
- `batch_job_id`: UUID of the batch job

**Response:**
```json
{
  "success": true,
  "batch_job_id": "uuid",
  "status": "processing",
  "progress": 45,
  "items_processed": 450,
  "total_items": 1000,
  "estimated_completion": "2025-03-17T10:30:00Z"
}
```

### Multi-Cloud Support

#### GET /api/storage/providers

List available storage providers.

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "id": "aws-s3",
      "name": "AWS S3",
      "status": "connected"
    },
    {
      "id": "azure-blob",
      "name": "Azure Blob Storage",
      "status": "available"
    },
    {
      "id": "gcp-storage",
      "name": "Google Cloud Storage",
      "status": "available"
    },
    {
      "id": "local",
      "name": "Local Storage",
      "status": "connected"
    }
  ]
}
```

#### POST /api/storage/configure

Configure a storage provider.

**Request Body:**
```json
{
  "provider_id": "aws-s3",
  "credentials": {
    "access_key": "...",
    "secret_key": "..."
  },
  "settings": {
    "region": "us-west-2",
    "default_bucket": "quantumtrust-data"
  }
}
```

**Response:**
```json
{
  "success": true,
  "provider_id": "aws-s3",
  "status": "connected",
  "connection_id": "uuid"
}
```

#### POST /api/storage/store

Store encrypted data in a configured storage provider.

**Request Body:**
```json
{
  "encrypted_data_id": "uuid",
  "provider_id": "aws-s3",
  "path": "customer-data/2025/03/17/",
  "metadata": {
    "customer_id": "uuid",
    "data_type": "financial"
  }
}
```

**Response:**
```json
{
  "success": true,
  "storage_id": "uuid",
  "location": "aws-s3://quantumtrust-data/customer-data/2025/03/17/uuid",
  "stored_at": "2025-03-17T10:00:00Z"
}
```

### Self-Destructing Data

#### POST /api/self-destruct/configure

Configure self-destruct settings for encrypted data.

**Request Body:**
```json
{
  "data_id": "uuid",
  "trigger_conditions": {
    "unauthorized_access": true,
    "expiration_time": "2025-04-17T10:00:00Z",
    "access_count": 5,
    "ip_restriction": true
  },
  "notification_email": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "self_destruct_id": "uuid",
  "status": "configured",
  "trigger_conditions": {
    "unauthorized_access": true,
    "expiration_time": "2025-04-17T10:00:00Z",
    "access_count": 5,
    "ip_restriction": true
  }
}
```

#### GET /api/self-destruct/status

Check the status of self-destruct configuration.

**Query Parameters:**
- `data_id`: UUID of the encrypted data

**Response:**
```json
{
  "success": true,
  "self_destruct_id": "uuid",
  "status": "active",
  "remaining_access_count": 3,
  "expiration_time": "2025-04-17T10:00:00Z",
  "access_logs": [
    {
      "timestamp": "2025-03-17T10:00:00Z",
      "ip": "192.168.1.1",
      "user_id": "uuid",
      "status": "authorized"
    }
  ]
}
```

### Regulatory Templates

#### GET /api/regulatory/templates

List available regulatory compliance templates.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "gdpr",
      "name": "GDPR Compliance",
      "version": "1.2",
      "last_updated": "2025-01-15T10:00:00Z"
    },
    {
      "id": "hipaa",
      "name": "HIPAA Compliance",
      "version": "2.1",
      "last_updated": "2025-02-20T10:00:00Z"
    },
    {
      "id": "pci-dss",
      "name": "PCI DSS Compliance",
      "version": "4.0",
      "last_updated": "2025-03-01T10:00:00Z"
    }
  ]
}
```

#### POST /api/regulatory/apply-template

Apply a regulatory template to encryption settings.

**Request Body:**
```json
{
  "template_id": "gdpr",
  "data_categories": ["personal", "financial"],
  "organization_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "applied_template": "gdpr",
  "encryption_settings": {
    "algorithm": "CRYSTALS-Kyber",
    "key_rotation_interval": 90,
    "fields_to_encrypt": ["name", "email", "address", "phone", "id_number"],
    "retention_period": 730,
    "access_logging": true
  },
  "compliance_status": "compliant"
}
```

### IP/MAC Access Control

#### GET /api/access-control/devices

List approved devices for the authenticated user or organization.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "uuid",
      "name": "Office Workstation",
      "ip": "192.168.1.100",
      "mac": "00:1A:2B:3C:4D:5E",
      "status": "approved",
      "last_access": "2025-03-17T09:30:00Z"
    },
    {
      "id": "uuid",
      "name": "Admin Laptop",
      "ip": "192.168.1.101",
      "mac": "00:1A:2B:3C:4D:5F",
      "status": "approved",
      "last_access": "2025-03-17T10:00:00Z"
    }
  ]
}
```

#### POST /api/access-control/approve

Approve a new device for access.

**Request Body:**
```json
{
  "name": "New Device",
  "ip": "192.168.1.102",
  "mac": "00:1A:2B:3C:4D:60",
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "device_id": "uuid",
  "status": "approved",
  "approval_time": "2025-03-17T10:00:00Z"
}
```

### Enhanced Logging

#### GET /api/logs

Retrieve detailed logs with filtering options.

**Query Parameters:**
- `start_time`: ISO timestamp for log start time
- `end_time`: ISO timestamp for log end time
- `user_id`: Filter logs by user ID
- `action_type`: Filter by action type (e.g., "encryption", "key_rotation", "access")
- `status`: Filter by status (e.g., "success", "failure")
- `limit`: Maximum number of logs to return
- `offset`: Offset for pagination

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2025-03-17T10:00:00Z",
      "user_id": "uuid",
      "action": "encryption",
      "details": {
        "data_id": "uuid",
        "algorithm": "CRYSTALS-Kyber",
        "fields_encrypted": ["ssn", "credit_card"]
      },
      "ip": "192.168.1.100",
      "mac": "00:1A:2B:3C:4D:5E",
      "status": "success"
    }
  ],
  "total": 1245,
  "limit": 10,
  "offset": 0
}
```

#### POST /api/logs/approval

Request approval for sensitive operations.

**Request Body:**
```json
{
  "operation": "key_deletion",
  "resource_id": "uuid",
  "reason": "Key rotation policy"
}
```

**Response:**
```json
{
  "success": true,
  "approval_request_id": "uuid",
  "status": "pending",
  "approvers_notified": true,
  "expiration": "2025-03-18T10:00:00Z"
}
```

### API Integration

#### GET /api/integration/config

Get API integration configuration.

**Response:**
```json
{
  "success": true,
  "api_endpoints": {
    "encryption": "/api/encrypt",
    "decryption": "/api/decrypt",
    "key_management": "/api/keys",
    "batch_processing": "/api/batch/process"
  },
  "authentication_methods": ["api_key", "jwt", "mtls"],
  "rate_limits": {
    "requests_per_minute": 1000,
    "requests_per_day": 100000
  },
  "webhook_url": "https://example.com/webhook"
}
```

#### POST /api/integration/webhook

Configure a webhook for event notifications.

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["encryption_complete", "key_rotation", "breach_detected"],
  "secret": "webhook_secret"
}
```

**Response:**
```json
{
  "success": true,
  "webhook_id": "uuid",
  "status": "configured",
  "test_status": "pending"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

Error responses include a message field with details about the error.

```json
{
  "success": false,
  "message": "Invalid API key",
  "error_code": "AUTH_001",
  "request_id": "uuid"
}
```

## Rate Limiting

API requests are limited to 1000 requests per minute per API key. If you exceed this limit, you will receive a 429 Too Many Requests response.

## Security Considerations

1. **API Keys**: Store API keys securely and never expose them in client-side code.
2. **mTLS**: For high-security operations, use mutual TLS authentication.
3. **IP/MAC Restrictions**: Configure IP and MAC address restrictions for sensitive operations.
4. **Webhook Security**: Verify webhook signatures using the shared secret.
5. **Data Retention**: The API does not retain data after processing unless explicitly configured to do so.

## Versioning

The API uses semantic versioning. The current version is v1.0.0.

To specify a version, include the version in the URL path:

```
https://api.quantumtrust.com/v1/encrypt
```

## Support

For API support, contact api-support@quantumtrust.com or open a support ticket through the QuantumTrust dashboard.
