const autocannon = require('autocannon');
const { writeFileSync } = require('fs');
const { join } = require('path');

// Configure the load test
const instance = autocannon({
  url: 'http://localhost:8000',
  connections: 500, // 500 concurrent connections
  pipelining: 1,
  duration: 30, // 30 seconds
  workers: 4, // Use 4 worker threads
  headers: {
    'Content-Type': 'application/json',
  },
  requests: [
    {
      method: 'GET',
      path: '/api/health',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
      onResponse: (status, body, context) => {
        try {
          const { token } = JSON.parse(body);
          if (token) {
            context.token = token;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      },
    },
    {
      method: 'GET',
      path: '/api/user/profile',
      setupRequest: (req, context) => {
        if (context.token) {
          req.headers = {
            ...req.headers,
            Authorization: `Bearer ${context.token}`,
          };
        }
        return req;
      },
    },
  ],
});

// Log progress
instance.on('tick', (results) => {
  console.log('Current statistics:');
  console.log(`Requests/sec: ${results.requests.average}`);
  console.log(`Latency: ${results.latency.average} ms`);
  console.log(`Status codes: ${JSON.stringify(results.statusCodeStats)}`);
  console.log('--------------------------');
});

// Handle completion
instance.on('done', (results) => {
  console.log('Load test completed');
  console.log('Summary:');
  console.log(`Requests/sec: ${results.requests.average}`);
  console.log(`Latency: ${results.latency.average} ms`);
  console.log(`Status codes: ${JSON.stringify(results.statusCodeStats)}`);
  
  // Save results to file
  const resultsPath = join(__dirname, '../load-test-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${resultsPath}`);
  
  // Check if the system can handle 500 concurrent users
  const successRate = (results.statusCodeStats['200'] || 0) / results.requests.total;
  if (successRate >= 0.95 && results.latency.average < 1000) {
    console.log('✅ System can handle 500 concurrent users');
  } else {
    console.log('❌ System may not handle 500 concurrent users optimally');
    console.log('Consider optimizing performance');
  }
});

// Handle errors
instance.on('error', (err) => {
  console.error('Load test error:', err);
});

console.log('Starting load test with 500 concurrent users...');
