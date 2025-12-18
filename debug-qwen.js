const Core = require('@alicloud/pop-core');
require('dotenv').config();

console.log('Checking environment variables...');
console.log('ALIBABA_CLOUD_ACCESS_KEY_ID:', process.env.ALIBABA_CLOUD_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('ALIBABA_CLOUD_ACCESS_KEY_SECRET:', process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET ? 'SET' : 'NOT SET');

// 初始化Qwen客户端
const client = new Core({
  accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  endpoint: 'https://dashscope.aliyuncs.com/api/',
  apiVersion: '2023-03-30'
});

async function testQwenAPI() {
  console.log('\nTesting Qwen API connection...');
  
  const params = {
    "model": "qwen-plus",
    "input": {
      "messages": [
        {
          "role": "system",
          "content": "你是一个专业的产品经理，擅长将用户需求转化为详细的产品需求文档。"
        },
        {
          "role": "user",
          "content": "生成一个仓库管理系统"
        }
      ]
    },
    "parameters": {
      "result_format": "message"
    }
  };
  
  const requestOption = {
    method: 'POST'
  };
  
  try {
    console.log('Sending request to Qwen API...');
    const response = await client.request('/services/aigc/text-generation/generation', params, requestOption);
    console.log('API Response received:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('API Call failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error data:', error.data);
  }
}

testQwenAPI();