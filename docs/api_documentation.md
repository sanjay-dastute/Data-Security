# QuantumTrust Data Security API Documentation

## Overview

This document provides comprehensive documentation for the QuantumTrust Data Security API, which enables secure data encryption using quantum-resistant algorithms and blockchain key management.

## Authentication

All API requests require authentication using an API key. The API key should be included in the `X-API-Key` header of each request.

### Generating an API Key

API keys can be generated through the QuantumTrust dashboard by organization administrators.

## Endpoints

### Encryption

#### POST /api/encrypt

Encrypts data using quantum-resistant algorithms.

**Request Body:**
```json
{
  "data": "Data to encrypt or file path",
  "fields": ["field1", "field2"],
  "options": {
    "algorithm": "AES-256",
    "storage": {
      "type": "s3",
      "bucket": "data-bucket"
    }
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
      "expires_at": "2025-04-17T10:00:00Z"
    }
  ]
}
```

#### POST /api/keys/set-timer

Sets a timer for automatic key regeneration.

**Request Body:**
```json
{
  "timer_interval": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timer set successfully"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 500: Internal Server Error

Error responses include a message field with details about the error.

```json
{
  "success": false,
  "message": "Invalid API key"
}
```

## Rate Limiting

API requests are limited to 1000 requests per minute per API key. If you exceed this limit, you will receive a 429 Too Many Requests response.
