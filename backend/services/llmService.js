const https = require('https');
require('dotenv').config();

// 基础LLM服务类
class BaseLLMService {
  constructor(config) {
    this.config = config;
    this.model = config.model || 'qwen3-coder-plus';
    this.provider = config.provider;
  }

  async generateText(prompt) {
    throw new Error('generateText method must be implemented');
  }

  async generateRequirementDoc(prompt) {
    throw new Error('generateRequirementDoc method must be implemented');
  }

  async generateHTMLFromRequirement(requirementDoc) {
    throw new Error('generateHTMLFromRequirement method must be implemented');
  }
}

// 使用原生HTTPS发送请求的通用函数
function makeHttpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Response parsing error: ${error.message}, data: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// Qwen服务实现（使用原生HTTPS请求）
class QwenService extends BaseLLMService {
  constructor(config) {
    super(config);
    
    this.apiKey = process.env.QWEN_API_KEY;
    this.baseUrl = 'https://dashscope.aliyuncs.com';
    
    console.log('QwenService initialized with API key:', this.apiKey ? 'SET' : 'NOT SET');
    
    // 检查API密钥是否设置
    if (!this.apiKey) {
      console.warn('警告: DashScope API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
    }
  }

  async generateText(prompt) {
    try {
      // 检查API密钥是否设置
      if (!this.apiKey) {
        throw new Error('API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
      }
      
      const requestBody = JSON.stringify({
        model: this.model,
        input: {
          messages: [
            {
              role: "system",
              content: "你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，确保包含适当的Tailwind CSS类来实现美观的设计。"
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: "message"
        }
      });

      const options = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/api/v1/services/aigc/text-generation/generation',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.output && response.output.choices && response.output.choices.length > 0) {
        return response.output.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Qwen API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateRequirementDoc(prompt) {
    try {
      const requirementPrompt = `请根据以下用户提示词生成一份详细的网站需求文档：

用户提示词：${prompt}

请按照以下格式生成需求文档：

1. 网站目标和受众:
   - 目标：[描述网站的主要目标]
   - 受众：[描述目标用户群体]

2. 核心功能模块:
   - [列出主要功能模块]

3. 页面结构和布局:
   - [描述页面结构和布局]

4. 设计风格和色彩搭配:
   - [描述设计风格和色彩方案]

5. 交互细节:
   - [描述交互设计细节]

6. 内容要求:
   - [描述内容要求]

请确保需求文档详细且具体，以便后续用于生成HTML代码。`;

      const requestBody = JSON.stringify({
        model: this.model,
        input: {
          messages: [
            {
              role: "system",
              content: "你是一个专业的产品经理，擅长将用户需求转化为详细的产品需求文档。"
            },
            {
              role: "user",
              content: requirementPrompt
            }
          ]
        },
        parameters: {
          result_format: "message"
        }
      });

      const options = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/api/v1/services/aigc/text-generation/generation',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.output && response.output.choices && response.output.choices.length > 0) {
        return response.output.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Qwen API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateHTMLFromRequirement(requirementDoc) {
    try {
      const htmlPrompt = `请根据以下网站需求文档生成一个完整的HTML页面代码：

需求文档：
${requirementDoc}

强制要求（必须严格遵守）：
1. 绝对必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容

参考模板风格示例：
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow-sm py-4">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <div class="text-xl font-bold text-indigo-600">AI网站生成器</div>
            <div class="flex space-x-4">
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">首页</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">产品</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">评价</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">联系</a>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">科技产品展示网站</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">展示最新的科技产品，提供详细的产品特性和客户评价。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">产品特性</h2>
                <p class="text-gray-600 mb-4">了解我们产品的核心特性和优势。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">了解更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">客户评价</h2>
                <p class="text-gray-600 mb-4">查看其他用户对我们产品的评价。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">查看更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">联系方式</h2>
                <p class="text-gray-600 mb-4">如有疑问，请联系我们。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">联系我们</button>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-600">&copy; 2023 科技产品展示网站. 保留所有权利.</p>
        </div>
    </footer>
</body>
</html>`;

      const requestBody = JSON.stringify({
        model: this.model,
        input: {
          messages: [
            {
              role: "system",
              content: `你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，必须严格遵守以下要求：
1. 必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容`
            },
            {
              role: "user",
              content: htmlPrompt
            }
          ]
        },
        parameters: {
          result_format: "message"
        }
      });

      const options = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/api/v1/services/aigc/text-generation/generation',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      let htmlContent = '';
      if (response && response.output && response.output.choices && response.output.choices.length > 0) {
        htmlContent = response.output.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }

      // 如果返回的内容包含markdown代码块，提取其中的HTML
      if (htmlContent.includes('```')) {
        const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
        if (match && match[1]) {
          htmlContent = match[1].trim();
        }
      }

      return htmlContent;
    } catch (error) {
      console.error('Qwen API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }
}

// Doubao服务实现（使用原生HTTPS请求）
class DoubaoService extends BaseLLMService {
  constructor(config) {
    super(config);
    
    // 检查API密钥是否存在
    if (!process.env.DOUBAO_API_KEY) {
      throw new Error('DOUBAO_API_KEY未设置，无法初始化Doubao服务');
    }
    
    this.apiKey = process.env.DOUBAO_API_KEY;
    this.baseUrl = 'https://ark.cn-beijing.volces.com';
  }

  async generateText(prompt) {
    try {
      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，确保包含适当的Tailwind CSS类来实现美观的设计。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const options = {
        hostname: 'ark.cn-beijing.volces.com',
        port: 443,
        path: '/api/v3/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Doubao API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateRequirementDoc(prompt) {
    try {
      const requirementPrompt = `请根据以下用户提示词生成一份详细的网站需求文档：

用户提示词：${prompt}

请按照以下格式生成需求文档：

1. 网站目标和受众:
   - 目标：[描述网站的主要目标]
   - 受众：[描述目标用户群体]

2. 核心功能模块:
   - [列出主要功能模块]

3. 页面结构和布局:
   - [描述页面结构和布局]

4. 设计风格和色彩搭配:
   - [描述设计风格和色彩方案]

5. 交互细节:
   - [描述交互设计细节]

6. 内容要求:
   - [描述内容要求]

请确保需求文档详细且具体，以便后续用于生成HTML代码。`;

      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的产品经理，擅长将用户需求转化为详细的产品需求文档。"
          },
          {
            role: "user",
            content: requirementPrompt
          }
        ]
      });

      const options = {
        hostname: 'ark.cn-beijing.volces.com',
        port: 443,
        path: '/api/v3/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Doubao API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateHTMLFromRequirement(requirementDoc) {
    try {
      const htmlPrompt = `请根据以下网站需求文档生成一个完整的HTML页面代码：

需求文档：
${requirementDoc}

强制要求（必须严格遵守）：
1. 绝对必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容

参考模板风格示例：
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow-sm py-4">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <div class="text-xl font-bold text-indigo-600">AI网站生成器</div>
            <div class="flex space-x-4">
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">首页</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">产品</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">评价</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">联系</a>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">科技产品展示网站</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">展示最新的科技产品，提供详细的产品特性和客户评价。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">产品特性</h2>
                <p class="text-gray-600 mb-4">了解我们产品的核心特性和优势。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">了解更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">客户评价</h2>
                <p class="text-gray-600 mb-4">查看其他用户对我们产品的评价。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">查看更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">联系方式</h2>
                <p class="text-gray-600 mb-4">如有疑问，请联系我们。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">联系我们</button>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-600">&copy; 2023 科技产品展示网站. 保留所有权利.</p>
        </div>
    </footer>
</body>
</html>`;

      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，必须严格遵守以下要求：
1. 必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容`
          },
          {
            role: "user",
            content: htmlPrompt
          }
        ]
      });

      const options = {
        hostname: 'ark.cn-beijing.volces.com',
        port: 443,
        path: '/api/v3/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      let htmlContent = '';
      if (response && response.choices && response.choices.length > 0) {
        htmlContent = response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }

      // 如果返回的内容包含markdown代码块，提取其中的HTML
      if (htmlContent.includes('```')) {
        const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
        if (match && match[1]) {
          htmlContent = match[1].trim();
        }
      }

      return htmlContent;
    } catch (error) {
      console.error('Doubao API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }
}

// 智谱AI服务实现（使用原生HTTPS请求）
class ZhipuService extends BaseLLMService {
  constructor(config) {
    super(config);
    
    // 检查API密钥是否存在
    if (!process.env.ZHIPU_API_KEY) {
      throw new Error('ZHIPU_API_KEY未设置，无法初始化智谱AI服务');
    }
    
    this.apiKey = process.env.ZHIPU_API_KEY;
    this.baseUrl = 'https://open.bigmodel.cn';
  }

  async generateText(prompt) {
    try {
      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，确保包含适当的Tailwind CSS类来实现美观的设计。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const options = {
        hostname: 'open.bigmodel.cn',
        port: 443,
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('智谱AI API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateRequirementDoc(prompt) {
    try {
      const requirementPrompt = `请根据以下用户提示词生成一份详细的网站需求文档：

用户提示词：${prompt}

请按照以下格式生成需求文档：

1. 网站目标和受众:
   - 目标：[描述网站的主要目标]
   - 受众：[描述目标用户群体]

2. 核心功能模块:
   - [列出主要功能模块]

3. 页面结构和布局:
   - [描述页面结构和布局]

4. 设计风格和色彩搭配:
   - [描述设计风格和色彩方案]

5. 交互细节:
   - [描述交互设计细节]

6. 内容要求:
   - [描述内容要求]

请确保需求文档详细且具体，以便后续用于生成HTML代码。`;

      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的产品经理，擅长将用户需求转化为详细的产品需求文档。"
          },
          {
            role: "user",
            content: requirementPrompt
          }
        ]
      });

      const options = {
        hostname: 'open.bigmodel.cn',
        port: 443,
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('智谱AI API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }

  async generateHTMLFromRequirement(requirementDoc) {
    try {
      const htmlPrompt = `请根据以下网站需求文档生成一个完整的HTML页面代码：

需求文档：
${requirementDoc}

强制要求（必须严格遵守）：
1. 绝对必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容

参考模板风格示例：
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow-sm py-4">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <div class="text-xl font-bold text-indigo-600">AI网站生成器</div>
            <div class="flex space-x-4">
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">首页</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">产品</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">评价</a>
                <a href="#" class="text-gray-600 hover:text-indigo-600 px-3 py-2">联系</a>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">科技产品展示网站</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">展示最新的科技产品，提供详细的产品特性和客户评价。</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">产品特性</h2>
                <p class="text-gray-600 mb-4">了解我们产品的核心特性和优势。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">了解更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">客户评价</h2>
                <p class="text-gray-600 mb-4">查看其他用户对我们产品的评价。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">查看更多</button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">联系方式</h2>
                <p class="text-gray-600 mb-4">如有疑问，请联系我们。</p>
                <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 mx-auto"></div>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">联系我们</button>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-600">&copy; 2023 科技产品展示网站. 保留所有权利.</p>
        </div>
    </footer>
</body>
</html>`;

      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，必须严格遵守以下要求：
1. 必须在head部分引入Tailwind CSS CDN链接：<script src="https://cdn.tailwindcss.com"></script>
2. 页面背景必须使用 bg-gray-100
3. 导航栏必须使用 bg-white shadow-sm 样式
4. 内容容器必须使用 container mx-auto px-4 布局
5. 卡片必须使用 bg-white rounded-lg shadow-md 样式，并添加 hover:shadow-lg transition-shadow 效果
6. 按钮必须使用 bg-indigo-600 text-white 样式，并添加 hover:bg-indigo-700 transition-colors 效果
7. 页脚必须使用 bg-white border-t 样式
8. 标题颜色使用 text-gray-800，正文颜色使用 text-gray-600
9. 不要包含任何JavaScript代码
10. 不要使用内联样式
11. 直接返回HTML代码，不要包含任何解释性文字或其他内容`
          },
          {
            role: "user",
            content: htmlPrompt
          }
        ]
      });

      const options = {
        hostname: 'open.bigmodel.cn',
        port: 443,
        path: '/api/paas/v4/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          'User-Agent': 'Node.js HTTPS Client'
        }
      };

      const response = await makeHttpsRequest(options, requestBody);
      
      let htmlContent = '';
      if (response && response.choices && response.choices.length > 0) {
        htmlContent = response.choices[0].message.content;
      } else {
        throw new Error('Invalid API response format');
      }

      // 如果返回的内容包含markdown代码块，提取其中的HTML
      if (htmlContent.includes('```')) {
        const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
        if (match && match[1]) {
          htmlContent = match[1].trim();
        }
      }

      return htmlContent;
    } catch (error) {
      console.error('智谱AI API调用失败:', error.message);
      console.error('错误详情:', error);
      throw error;
    }
  }
}

// 模型管理器
class ModelManager {
  constructor() {
    // 初始化所有支持的模型服务
    this.services = {
      'qwen': new QwenService({ model: 'qwen-max', provider: 'Alibaba' }),
      'qwen3': new QwenService({ model: 'qwen3-coder-plus', provider: 'Alibaba' }),
    };
    
    // 尝试初始化其他服务（如果API密钥可用）
    try {
      this.services['doubao'] = new DoubaoService({ model: 'doubao-pro', provider: 'ByteDance' });
    } catch (error) {
      console.log('Doubao服务未初始化（API密钥未设置）:', error.message);
    }
    
    try {
      this.services['zhipu'] = new ZhipuService({ model: 'glm-4', provider: 'Zhipu AI' });
    } catch (error) {
      console.log('智谱AI服务未初始化（API密钥未设置）:', error.message);
    }
    
    // 默认使用qwen3服务
    this.currentService = this.services.qwen3;
    this.currentProvider = 'qwen3';
    
    // 模型元数据
    this.modelMetadata = {
      'qwen': {
        name: '通义千问',
        provider: 'Alibaba',
        description: '阿里巴巴通义千问大模型',
        capabilities: ['代码生成', '需求分析', 'HTML生成'],
        enabled: true
      },
      'qwen3': {
        name: '通义千问3',
        provider: 'Alibaba',
        description: '阿里巴巴通义千问3代 coder plus模型',
        capabilities: ['代码生成', '需求分析', 'HTML生成'],
        enabled: true
      },
      'doubao': {
        name: '豆包',
        provider: 'ByteDance',
        description: '字节跳动豆包大模型',
        capabilities: ['代码生成', '需求分析', 'HTML生成'],
        enabled: !!process.env.DOUBAO_API_KEY // 仅当API密钥存在时启用
      },
      'zhipu': {
        name: '智谱AI',
        provider: 'Zhipu AI',
        description: '智谱AI大模型',
        capabilities: ['代码生成', '需求分析', 'HTML生成'],
        enabled: !!process.env.ZHIPU_API_KEY // 仅当API密钥存在时启用
      }
    };
  }

  // 切换LLM提供商
  switchProvider(provider) {
    if (this.services[provider]) {
      this.currentService = this.services[provider];
      this.currentProvider = provider;
      
      // 检查API密钥是否可用
      const apiKey = this.getApiKeyForProvider(provider);
      if (!apiKey) {
        console.warn(`警告: ${this.modelMetadata[provider].name} 的API密钥未设置`);
        return { success: false, message: `${this.modelMetadata[provider].name} API密钥未设置` };
      }
      
      return { success: true, message: `已切换到 ${this.modelMetadata[provider].name}` };
    }
    return { success: false, message: `不支持的模型提供商: ${provider}` };
  }

  // 获取指定提供商的API密钥
  getApiKeyForProvider(provider) {
    switch(provider) {
      case 'qwen':
      case 'qwen3':
        return process.env.QWEN_API_KEY;
      case 'doubao':
        return process.env.DOUBAO_API_KEY;
      case 'zhipu':
        return process.env.ZHIPU_API_KEY;
      default:
        return null;
    }
  }

  // 获取可用的提供商列表
  getAvailableProviders() {
    const available = [];
    for (const [key, metadata] of Object.entries(this.modelMetadata)) {
      if (metadata.enabled) {
        const hasApiKey = !!this.getApiKeyForProvider(key);
        available.push({
          id: key,
          name: metadata.name,
          provider: metadata.provider,
          description: metadata.description,
          capabilities: metadata.capabilities,
          enabled: metadata.enabled,
          hasApiKey: hasApiKey
        });
      }
    }
    return available;
  }

  // 获取当前提供商信息
  getCurrentProviderInfo() {
    const metadata = this.modelMetadata[this.currentProvider];
    return {
      id: this.currentProvider,
      name: metadata.name,
      provider: metadata.provider,
      description: metadata.description,
      capabilities: metadata.capabilities,
      hasApiKey: !!this.getApiKeyForProvider(this.currentProvider)
    };
  }

  // 代理调用方法
  async generateText(prompt) {
    return this.currentService.generateText(prompt);
  }

  async generateRequirementDoc(prompt) {
    return this.currentService.generateRequirementDoc(prompt);
  }

  async generateHTMLFromRequirement(requirementDoc) {
    return this.currentService.generateHTMLFromRequirement(requirementDoc);
  }
}

// 创建单例实例
const modelManager = new ModelManager();

module.exports = { ModelManager, modelManager, BaseLLMService, QwenService, DoubaoService, ZhipuService };