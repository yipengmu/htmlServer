const QwenService = require('./backend/services/qwenService');

async function testQwenService() {
  const qwenService = new QwenService();
  
  console.log('Testing QwenService...');
  
  try {
    // 测试generateText方法
    console.log('\n=== Testing generateText ===');
    const prompt = '生成一个仓库管理系统';
    console.log('Input prompt:', prompt);
    const textResult = await qwenService.generateText(prompt);
    console.log('Text result length:', textResult.length);
    console.log('Text result (first 500 chars):', textResult.substring(0, 500));
    console.log('Text result contains HTML tags:', textResult.includes('<html') || textResult.includes('<!DOCTYPE'));
    
    // 测试generateRequirementDoc方法
    console.log('\n=== Testing generateRequirementDoc ===');
    const requirementResult = await qwenService.generateRequirementDoc(prompt);
    console.log('Requirement result length:', requirementResult.length);
    console.log('Requirement result (first 500 chars):', requirementResult.substring(0, 500));
    
    // 测试generateHTMLFromRequirement方法
    console.log('\n=== Testing generateHTMLFromRequirement ===');
    const htmlResult = await qwenService.generateHTMLFromRequirement(requirementResult);
    console.log('HTML result length:', htmlResult.length);
    console.log('HTML result contains HTML tags:', htmlResult.includes('<html') || htmlResult.includes('<!DOCTYPE'));
    console.log('HTML result (first 500 chars):', htmlResult.substring(0, 500));
    
    // 保存完整结果到文件以便查看
    const fs = require('fs');
    fs.writeFileSync('test-output.html', htmlResult, 'utf8');
    console.log('\nFull HTML result saved to test-output.html');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testQwenService();