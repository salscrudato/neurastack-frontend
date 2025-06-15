#!/usr/bin/env node

/**
 * Simple test script to verify NeuraStack API integration
 */

const API_BASE_URL = 'https://neurastack-backend-638289111765.us-central1.run.app';

async function testEnsembleAPI() {
  console.log('🚀 Testing NeuraStack Ensemble API...\n');

  const requestBody = {
    prompt: 'What is artificial intelligence?',
    sessionId: `test-session-${Date.now()}`
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': 'test-user',
    'X-Session-Id': requestBody.sessionId,
    'X-Correlation-ID': `test-${Date.now()}`
  };

  console.log('📤 Request Details:');
  console.log('URL:', `${API_BASE_URL}/ensemble-test`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Body:', JSON.stringify(requestBody, null, 2));
  console.log('\n⏳ Sending request...\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE_URL}/ensemble-test`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;

    console.log('📥 Response Details:');
    console.log('Status:', response.status, response.statusText);
    console.log('Response Time:', `${responseTime}ms`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.log('\n❌ Error Response:');
      console.log(errorData);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Success Response:');
    console.log('Status:', data.status);
    
    if (data.status === 'success' && data.data) {
      console.log('Synthesis Content:', data.data.synthesis.content.substring(0, 200) + '...');
      console.log('Roles Count:', data.data.roles.length);
      console.log('Processing Time:', data.data.metadata.processingTimeMs + 'ms');
      console.log('Successful Roles:', data.data.metadata.successfulRoles);
      console.log('Failed Roles:', data.data.metadata.failedRoles);
      
      console.log('\n📊 Individual Roles:');
      data.data.roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.role} (${role.provider}): ${role.status}`);
        console.log(`   Content: ${role.content.substring(0, 100)}...`);
      });
    } else {
      console.log('Full Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('\n❌ Network Error:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

// Run the test
testEnsembleAPI().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
