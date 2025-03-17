const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  totalUsers: 500,
  rampUpTime: 60, // seconds to ramp up to full load
  testDuration: 300, // seconds to run the test
  workers: 10, // number of worker threads
  endpoints: [
    { path: '/api/auth/login', method: 'POST', weight: 20, payload: () => ({ email: `user${Math.floor(Math.random() * 1000)}@example.com`, password: 'Password123!' }) },
    { path: '/api/encryption/generate-key', method: 'POST', weight: 15, payload: () => ({ keyType: 'AES-256', description: 'Test key' }) },
    { path: '/api/data/upload', method: 'POST', weight: 25, payload: () => ({ data: Buffer.from('Test data').toString('base64'), metadata: { filename: 'test.txt', contentType: 'text/plain' } }) },
    { path: '/api/data/encrypt', method: 'POST', weight: 30, payload: () => ({ dataId: `data-${Math.floor(Math.random() * 1000)}`, fields: ['field1', 'field2'] }) },
    { path: '/api/health', method: 'GET', weight: 10 },
  ],
  authToken: null, // Will be set after login
};

// Metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimeTotal: 0,
  responseTimeMin: Number.MAX_SAFE_INTEGER,
  responseTimeMax: 0,
  startTime: 0,
  endTime: 0,
  requestsPerSecond: 0,
  statusCodes: {},
  errors: {},
};

// Helper function to select an endpoint based on weight
function selectEndpoint() {
  const totalWeight = CONFIG.endpoints.reduce((sum, endpoint) => sum + endpoint.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of CONFIG.endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return CONFIG.endpoints[0]; // Fallback
}

// Worker thread function
async function runWorker(id, usersPerWorker) {
  const workerMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimeTotal: 0,
    responseTimeMin: Number.MAX_SAFE_INTEGER,
    responseTimeMax: 0,
    statusCodes: {},
    errors: {},
  };

  // Login to get auth token
  try {
    const loginResponse = await axios.post(`${CONFIG.baseUrl}/api/auth/login`, {
      email: `worker${id}@example.com`,
      password: 'Password123!'
    });
    
    if (loginResponse.data && loginResponse.data.accessToken) {
      CONFIG.authToken = loginResponse.data.accessToken;
    }
  } catch (error) {
    console.error(`Worker ${id}: Failed to login - ${error.message}`);
    // Continue without auth token
  }

  // Create virtual users
  const users = Array.from({ length: usersPerWorker }, (_, i) => ({
    id: id * usersPerWorker + i,
    active: false,
    nextRequestTime: 0,
  }));

  // Start test
  const startTime = performance.now();
  const endTime = startTime + (CONFIG.testDuration * 1000);
  const rampUpEndTime = startTime + (CONFIG.rampUpTime * 1000);

  // Main test loop
  while (performance.now() < endTime) {
    const currentTime = performance.now();
    
    // Calculate how many users should be active based on ramp-up time
    let activeUserCount = usersPerWorker;
    if (currentTime < rampUpEndTime) {
      activeUserCount = Math.floor((currentTime - startTime) / (rampUpEndTime - startTime) * usersPerWorker);
    }
    
    // Activate users
    for (let i = 0; i < activeUserCount; i++) {
      users[i].active = true;
    }
    
    // Process active users
    for (const user of users) {
      if (!user.active) continue;
      
      if (currentTime >= user.nextRequestTime) {
        // Select endpoint
        const endpoint = selectEndpoint();
        
        // Send request
        try {
          const requestStartTime = performance.now();
          
          const headers = {};
          if (CONFIG.authToken) {
            headers['Authorization'] = `Bearer ${CONFIG.authToken}`;
          }
          
          const response = await axios({
            method: endpoint.method,
            url: `${CONFIG.baseUrl}${endpoint.path}`,
            data: endpoint.method !== 'GET' ? endpoint.payload() : undefined,
            headers,
            timeout: 10000, // 10 seconds timeout
          });
          
          const requestEndTime = performance.now();
          const responseTime = requestEndTime - requestStartTime;
          
          // Update metrics
          workerMetrics.totalRequests++;
          workerMetrics.successfulRequests++;
          workerMetrics.responseTimeTotal += responseTime;
          workerMetrics.responseTimeMin = Math.min(workerMetrics.responseTimeMin, responseTime);
          workerMetrics.responseTimeMax = Math.max(workerMetrics.responseTimeMax, responseTime);
          
          const statusCode = response.status;
          workerMetrics.statusCodes[statusCode] = (workerMetrics.statusCodes[statusCode] || 0) + 1;
          
          // Set next request time (random between 1-3 seconds)
          user.nextRequestTime = currentTime + (1000 + Math.random() * 2000);
        } catch (error) {
          workerMetrics.totalRequests++;
          workerMetrics.failedRequests++;
          
          const statusCode = error.response ? error.response.status : 'network';
          workerMetrics.statusCodes[statusCode] = (workerMetrics.statusCodes[statusCode] || 0) + 1;
          
          const errorMessage = error.message;
          workerMetrics.errors[errorMessage] = (workerMetrics.errors[errorMessage] || 0) + 1;
          
          // Set next request time (random between 1-3 seconds)
          user.nextRequestTime = currentTime + (1000 + Math.random() * 2000);
        }
      }
    }
    
    // Small delay to prevent CPU hogging
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Send metrics back to main thread
  parentPort.postMessage(workerMetrics);
}

// Main thread function
async function runLoadTest() {
  if (!isMainThread) {
    const { id, usersPerWorker } = workerData;
    await runWorker(id, usersPerWorker);
    return;
  }
  
  console.log(`Starting load test with ${CONFIG.totalUsers} concurrent users`);
  console.log(`Ramping up over ${CONFIG.rampUpTime} seconds, running for ${CONFIG.testDuration} seconds`);
  console.log(`Using ${CONFIG.workers} worker threads`);
  console.log(`Testing against ${CONFIG.baseUrl}`);
  console.log('---------------------------------------------------');
  
  metrics.startTime = performance.now();
  
  const usersPerWorker = Math.ceil(CONFIG.totalUsers / CONFIG.workers);
  const workers = [];
  
  // Create worker threads
  for (let i = 0; i < CONFIG.workers; i++) {
    const worker = new Worker(__filename, {
      workerData: { id: i, usersPerWorker },
    });
    
    worker.on('message', (workerMetrics) => {
      // Aggregate metrics
      metrics.totalRequests += workerMetrics.totalRequests;
      metrics.successfulRequests += workerMetrics.successfulRequests;
      metrics.failedRequests += workerMetrics.failedRequests;
      metrics.responseTimeTotal += workerMetrics.responseTimeTotal;
      metrics.responseTimeMin = Math.min(metrics.responseTimeMin, workerMetrics.responseTimeMin);
      metrics.responseTimeMax = Math.max(metrics.responseTimeMax, workerMetrics.responseTimeMax);
      
      // Aggregate status codes
      for (const [code, count] of Object.entries(workerMetrics.statusCodes)) {
        metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + count;
      }
      
      // Aggregate errors
      for (const [error, count] of Object.entries(workerMetrics.errors)) {
        metrics.errors[error] = (metrics.errors[error] || 0) + count;
      }
    });
    
    worker.on('error', (error) => {
      console.error(`Worker error: ${error}`);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      
      // Check if all workers have completed
      const completed = workers.every(w => w.threadId === null);
      if (completed) {
        metrics.endTime = performance.now();
        printResults();
      }
    });
    
    workers.push(worker);
  }
  
  // Print progress every 10 seconds
  const progressInterval = setInterval(() => {
    const elapsedSeconds = (performance.now() - metrics.startTime) / 1000;
    const remainingSeconds = CONFIG.testDuration - elapsedSeconds;
    
    if (remainingSeconds <= 0) {
      clearInterval(progressInterval);
      return;
    }
    
    console.log(`Progress: ${Math.min(100, Math.round(elapsedSeconds / CONFIG.testDuration * 100))}% complete, ${Math.round(remainingSeconds)} seconds remaining`);
    console.log(`Requests: ${metrics.totalRequests} total, ${metrics.successfulRequests} successful, ${metrics.failedRequests} failed`);
    console.log('---------------------------------------------------');
  }, 10000);
}

// Print test results
function printResults() {
  const testDurationMs = metrics.endTime - metrics.startTime;
  const testDurationSeconds = testDurationMs / 1000;
  
  metrics.requestsPerSecond = metrics.totalRequests / testDurationSeconds;
  
  console.log('===================================================');
  console.log('LOAD TEST RESULTS');
  console.log('===================================================');
  console.log(`Total test duration: ${testDurationSeconds.toFixed(2)} seconds`);
  console.log(`Total requests: ${metrics.totalRequests}`);
  console.log(`Successful requests: ${metrics.successfulRequests} (${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%)`);
  console.log(`Failed requests: ${metrics.failedRequests} (${(metrics.failedRequests / metrics.totalRequests * 100).toFixed(2)}%)`);
  console.log(`Requests per second: ${metrics.requestsPerSecond.toFixed(2)}`);
  
  if (metrics.totalRequests > 0) {
    console.log(`Average response time: ${(metrics.responseTimeTotal / metrics.totalRequests).toFixed(2)} ms`);
    console.log(`Min response time: ${metrics.responseTimeMin.toFixed(2)} ms`);
    console.log(`Max response time: ${metrics.responseTimeMax.toFixed(2)} ms`);
  }
  
  console.log('\nStatus Code Distribution:');
  for (const [code, count] of Object.entries(metrics.statusCodes).sort()) {
    console.log(`  ${code}: ${count} (${(count / metrics.totalRequests * 100).toFixed(2)}%)`);
  }
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log('\nTop Errors:');
    const sortedErrors = Object.entries(metrics.errors).sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < Math.min(5, sortedErrors.length); i++) {
      const [error, count] = sortedErrors[i];
      console.log(`  ${error}: ${count} occurrences`);
    }
  }
  
  console.log('\nCONCLUSION:');
  if (metrics.requestsPerSecond >= CONFIG.totalUsers / 10) {
    console.log('✅ The system successfully handled the target load of 500 concurrent users.');
    console.log(`   Achieved ${metrics.requestsPerSecond.toFixed(2)} requests per second with ${metrics.successfulRequests} successful requests.`);
  } else {
    console.log('❌ The system did not meet the target performance for 500 concurrent users.');
    console.log(`   Only achieved ${metrics.requestsPerSecond.toFixed(2)} requests per second with ${metrics.failedRequests} failed requests.`);
  }
  console.log('===================================================');
}

// Run the load test
if (isMainThread) {
  runLoadTest().catch(error => {
    console.error('Load test failed:', error);
    process.exit(1);
  });
}
