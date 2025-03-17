# Data Handling Module

The Data Handling Module is responsible for managing the temporary storage, parsing, encryption, and storage of data in the QuantumTrust Data Security system.

## Features

- **Temporary Metadata Management**: Store and manage file metadata during the encryption process
- **Selective Field Encryption**: View uploaded data and select specific fields for encryption
- **Multi-Format File Parsing**: Support for JSON, CSV, XML, text, binary, and placeholder support for Parquet and Avro formats
- **Batch Processing**: Handle multiple file uploads and encryptions simultaneously
- **Multi-Storage Support**: Support for AWS S3, Azure Blob, Google Cloud, SQL/NoSQL databases, on-premises, and custom storage configurations
- **Self-Destruct Script Generation**: Generate platform-specific self-destruct scripts for enhanced security

## Components

### Controllers

- **TemporaryMetadataController**: Manage temporary metadata entries
- **FileUploadController**: Handle file uploads and parsing
- **DataEncryptionController**: Encrypt data with selected fields
- **BatchProcessingController**: Process multiple files in batch
- **SelfDestructController**: Generate and manage self-destruct scripts

### Services

- **TemporaryMetadataService**: Create, read, update, and delete temporary metadata entries
- **FileParserService**: Parse files of different formats and extract available fields
- **StorageService**: Store encrypted data in various storage types
- **SelfDestructScriptGenerator**: Generate platform-specific self-destruct scripts

### Entities

- **TemporaryMetadata**: Store metadata about uploaded files and encryption settings

## Usage

### File Upload and Encryption

1. Upload a file using the FileUploadController
2. View the file's metadata and available fields
3. Select fields to encrypt
4. Encrypt the data with the selected fields
5. Store the encrypted data in the configured storage type

### Batch Processing

1. Upload multiple files using the BatchProcessingController
2. Process all files with the same encryption settings
3. Store the encrypted data in the configured storage type

### Self-Destruct Script Generation

1. Generate a self-destruct script for a specific platform
2. Embed the script in the encrypted data
3. The script will delete the data on unauthorized systems while preserving the data on the server

## Storage Configuration

The system supports the following storage types:

- **AWS S3**: Store data in Amazon S3 buckets
- **Azure Blob Storage**: Store data in Azure Blob Storage containers
- **Google Cloud Storage**: Store data in Google Cloud Storage buckets
- **SQL Database**: Store data in SQL databases
- **NoSQL Database**: Store data in NoSQL databases
- **On-Premises**: Store data on local or network storage
- **Custom**: Store data in custom storage configurations

## Security Features

- **No Data Retention**: Temporary data is deleted after encryption
- **Selective Encryption**: Only selected fields are encrypted
- **Self-Destruct Scripts**: Data is deleted on unauthorized systems
- **Blockchain Logging**: All encryption and storage operations are logged to the blockchain
