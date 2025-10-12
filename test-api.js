const fetch = require('node-fetch');

async function testCoinsAPI() {
  try {
    console.log('Testing coins API...');
    const response = await fetch('http://localhost:3001/api/zora/coins?type=TOP_GAINERS&count=5');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    const text = await response.text();
    console.log('Response body length:', text.length);
    
    if (response.ok) {
      console.log('✅ Success! Response:', text.substring(0, 500) + '...');
    } else {
      console.log('❌ Error:', text);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testCoinsAPI();

