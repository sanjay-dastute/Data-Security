// Global Jest setup
jest.setTimeout(30000); // Increase timeout for tests

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MASTER_API_KEY = 'test-master-api-key';
process.env.NODE_ENV = 'test';
