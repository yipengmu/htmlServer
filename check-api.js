const https = require('https');

// 从环境变量获取API密钥
const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;

console.log('Checking API keys...');
console.log('Access Key ID:', accessKeyId ? 'SET' : 'NOT SET');
console.log('Access Key Secret:', accessKeySecret ? 'SET' : 'NOT SET');

if (!accessKeyId || !accessKeySecret) {
  console.error('API keys are not set in environment variables');
  process.exit(1);
}

// 简单测试DashScope API
const options = {
  hostname: 'dashscope.aliyuncs.com',
  port: 443,
  path: '/api/v1/services/aigc/text-generation/generation',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessKeyId}`,
    'Content-Type': 'application/json'
  }
};

console.log('Testing API connectivity...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Response Body:', chunk.toString());
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.end();