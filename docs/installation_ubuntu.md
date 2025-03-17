# QuantumTrust Data Security - Ubuntu Installation Guide

This guide provides step-by-step instructions for installing and configuring QuantumTrust Data Security on Ubuntu.

## System Requirements

- Ubuntu 20.04 LTS or later
- 8GB RAM minimum (16GB recommended)
- 50GB free disk space
- Docker and Docker Compose
- Node.js 16 or later
- PostgreSQL 13 or later
- MongoDB 5 or later
- Redis 6 or later

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/quantumtrust-data-security.git
cd quantumtrust-data-security
```

### 2. Install Dependencies

```bash
# Update package lists
sudo apt update

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Redis
sudo apt install -y redis-server
```

### 3. Configure Databases

```bash
# PostgreSQL setup
sudo -u postgres psql -c "CREATE DATABASE quantumtrust;"
sudo -u postgres psql -c "CREATE USER quantumuser WITH ENCRYPTED PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE quantumtrust TO quantumuser;"

# MongoDB setup
mongosh --eval "db.getSiblingDB('admin').createUser({user: 'quantumuser', pwd: 'your_password', roles: [{role: 'readWrite', db: 'quantumtrust'}]})"

# Redis setup
sudo sed -i 's/supervised no/supervised systemd/g' /etc/redis/redis.conf
sudo systemctl restart redis.service
```

### 4. Set Up Hyperledger Fabric

```bash
# Install prerequisites
sudo apt install -y golang git

# Install Hyperledger Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.4.9

# Add Fabric binaries to PATH
export PATH=$PATH:$HOME/fabric-samples/bin

# Start Fabric network
cd fabric-network
./start-network.sh
```

### 5. Configure Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Build the application
npm run build

# Start the backend
npm run start:prod
```

### 6. Configure Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Build the application
npm run build

# Start the frontend
npm run start
```

### 7. Deploy with Docker (Alternative)

```bash
# Build and start all services
docker-compose up -d
```

## Verification

1. Access the admin dashboard at `http://localhost:3000/admin/dashboard`
2. Log in with the default admin credentials:
   - Username: admin
   - Password: QuantumTrust123!
3. Change the default password immediately

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check MongoDB status
sudo systemctl status mongod

# Check Redis status
sudo systemctl status redis
```

### Hyperledger Fabric Issues

If Hyperledger Fabric fails to start:

```bash
# Check Docker containers
docker ps -a

# View container logs
docker logs <container_id>

# Restart the network
cd fabric-network
./stop-network.sh
./start-network.sh
```

## Support

For additional support, please contact our technical support team at support@quantumtrust.com or visit our documentation website at https://docs.quantumtrust.com.
