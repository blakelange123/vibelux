import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 50 }, // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 }, // Stay at 50 users for 5 minutes
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    // Ramp down
    { duration: '2m', target: 0 }, // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'], // Error rate should be below 5%
    errors: ['rate<0.1'], // Custom error rate should be below 10%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  const responses = []
  
  // Test homepage
  let response = http.get(`${BASE_URL}/`)
  responses.push(response)
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads within 2s': (r) => r.timings.duration < 2000,
    'homepage contains title': (r) => r.body.includes('VibeLux'),
  }) || errorRate.add(1)

  sleep(1)

  // Test API health endpoint
  response = http.get(`${BASE_URL}/api/health`)
  responses.push(response)
  check(response, {
    'health endpoint status is 200': (r) => r.status === 200,
    'health endpoint response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1)

  sleep(1)

  // Test features page
  response = http.get(`${BASE_URL}/features`)
  responses.push(response)
  check(response, {
    'features page status is 200': (r) => r.status === 200,
    'features page loads within 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1)

  sleep(1)

  // Test pricing page
  response = http.get(`${BASE_URL}/pricing`)
  responses.push(response)
  check(response, {
    'pricing page status is 200': (r) => r.status === 200,
    'pricing page loads within 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1)

  sleep(1)

  // Test fixtures API (publicly accessible)
  response = http.get(`${BASE_URL}/api/fixtures`)
  responses.push(response)
  check(response, {
    'fixtures API status is 200': (r) => r.status === 200,
    'fixtures API response time < 1s': (r) => r.timings.duration < 1000,
    'fixtures API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  }) || errorRate.add(1)

  // Random sleep between 1-3 seconds to simulate realistic user behavior
  sleep(Math.random() * 2 + 1)
}

// Setup function runs once per VU at the beginning
export function setup() {
  console.log(`Starting load test against ${BASE_URL}`)
  
  // Verify the application is running
  const response = http.get(`${BASE_URL}/api/health`)
  if (response.status !== 200) {
    throw new Error(`Application not ready. Health check failed with status ${response.status}`)
  }
  
  console.log('Application health check passed. Starting load test...')
  return { baseUrl: BASE_URL }
}

// Teardown function runs once after all VUs have finished
export function teardown(data) {
  console.log(`Load test completed for ${data.baseUrl}`)
}

// Handle specific scenarios
export function handleSummary(data) {
  return {
    'load-test-results.html': htmlReport(data),
    'load-test-results.json': JSON.stringify(data),
  }
}

function htmlReport(data) {
  const date = new Date().toISOString()
  const duration = data.state.testRunDurationMs / 1000
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Load Test Results - ${date}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
            .pass { border-left: 4px solid #4CAF50; }
            .fail { border-left: 4px solid #f44336; }
            .warn { border-left: 4px solid #ff9800; }
        </style>
    </head>
    <body>
        <h1>Load Test Results</h1>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Duration:</strong> ${duration}s</p>
        <p><strong>Virtual Users:</strong> ${data.options.stages.map(s => s.target).join(' → ')}</p>
        
        <h2>Key Metrics</h2>
        <div class="metric ${data.metrics.http_req_duration.values.p95 < 2000 ? 'pass' : 'fail'}">
            <strong>95th Percentile Response Time:</strong> ${Math.round(data.metrics.http_req_duration.values.p95)}ms
        </div>
        <div class="metric ${data.metrics.http_req_failed.values.rate < 0.05 ? 'pass' : 'fail'}">
            <strong>Error Rate:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
        </div>
        <div class="metric">
            <strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}
        </div>
        <div class="metric">
            <strong>Requests/sec:</strong> ${data.metrics.http_reqs.values.rate.toFixed(2)}
        </div>
        
        <h2>Threshold Results</h2>
        ${Object.entries(data.thresholds).map(([name, result]) => 
          `<div class="metric ${result.ok ? 'pass' : 'fail'}">
            <strong>${name}:</strong> ${result.ok ? 'PASS' : 'FAIL'}
          </div>`
        ).join('')}
    </body>
    </html>
  `
}