# QuantumTrust Data Security - Windows Installation Guide

This guide provides step-by-step instructions for installing and configuring QuantumTrust Data Security on Windows.

## System Requirements

- Windows 10 or Windows Server 2019 or later
- 8GB RAM minimum (16GB recommended)
- 50GB free disk space
- Docker Desktop for Windows
- Node.js 16 or later
- PostgreSQL 13 or later
- MongoDB 5 or later
- Redis for Windows

## Installation Steps

### 1. Install Prerequisites

#### Docker Desktop

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Run the installer and follow the instructions
3. Start Docker Desktop and ensure it's running properly

#### Node.js

1. Download Node.js from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
2. Run the installer and follow the instructions
3. Verify installation by opening Command Prompt and running:
   ```
   node --version
   npm --version
   ```

#### PostgreSQL

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the instructions
3. Remember the password you set for the postgres user
4. Verify installation by opening pgAdmin

#### MongoDB

1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the instructions
3. Verify installation by opening MongoDB Compass

#### Redis

1. Download Redis for Windows from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Extract the zip file to a location of your choice
3. Run redis-server.exe to start Redis

### 2. Clone the Repository

1. Download and install Git from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Open Command Prompt and run:
   ```
   git clone https://github.com/your-organization/quantumtrust-data-security.git
   cd quantumtrust-data-security
   ```

### 3. Configure Databases

#### PostgreSQL

1. Open pgAdmin
2. Connect to the server using the password you set during installation
3. Create a new database named "quantumtrust"
4. Create a new user named "quantumuser" with password "your_password"
5. Grant all privileges on the "quantumtrust" database to "quantumuser"

#### MongoDB

1. Open MongoDB Compass
2. Connect to the local server
3. Create a new database named "quantumtrust"
4. Create a new user with username "quantumuser" and password "your_password" with readWrite role

#### Redis

Redis should be running with default configuration.

### 4. Set Up Hyperledger Fabric

1. Open PowerShell as Administrator
2. Navigate to the repository directory
3. Run the following commands:
   ```
   curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.9
   cd fabric-network
   .\start-network.ps1
   ```

### 5. Configure Backend

1. Open Command Prompt
2. Navigate to the backend directory:
   ```
   cd quantumtrust-data-security\backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create .env file:
   ```
   copy .env.example .env
   ```
5. Edit the .env file with your configuration using Notepad or any text editor
6. Build the application:
   ```
   npm run build
   ```
7. Start the backend:
   ```
   npm run start:prod
   ```

### 6. Configure Frontend

1. Open another Command Prompt
2. Navigate to the frontend directory:
   ```
   cd quantumtrust-data-security\frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create .env file:
   ```
   copy .env.example .env
   ```
5. Edit the .env file with your configuration using Notepad or any text editor
6. Build the application:
   ```
   npm run build
   ```
7. Start the frontend:
   ```
   npm run start
   ```

### 7. Deploy with Docker (Alternative)

1. Open Command Prompt as Administrator
2. Navigate to the repository directory
3. Run:
   ```
   docker-compose up -d
   ```

## Verification

1. Open a web browser and navigate to `http://localhost:3000/admin/dashboard`
2. Log in with the default admin credentials:
   - Username: admin
   - Password: QuantumTrust123!
3. Change the default password immediately

## Troubleshooting

### Docker Issues

If Docker containers fail to start:

1. Open Docker Desktop
2. Check the status of containers
3. View logs for any failing containers
4. Restart Docker Desktop if necessary

### Database Connection Issues

If the application cannot connect to databases:

1. Verify that PostgreSQL, MongoDB, and Redis services are running
2. Check that the connection details in the .env file are correct
3. Ensure that firewalls are not blocking connections

### Hyperledger Fabric Issues

If Hyperledger Fabric fails to start:

1. Check Docker containers:
   ```
   docker ps -a
   ```
2. View container logs:
   ```
   docker logs <container_id>
   ```
3. Restart the network:
   ```
   cd fabric-network
   .\stop-network.ps1
   .\start-network.ps1
   ```

## Support

For additional support, please contact our technical support team at support@quantumtrust.com or visit our documentation website at https://docs.quantumtrust.com.
