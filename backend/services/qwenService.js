const Core = require('@alicloud/pop-core');

class QwenService {
  constructor() {
    // 从环境变量获取API密钥
    this.accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
    this.accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
    
    // 初始化Qwen客户端
    this.client = new Core({
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      endpoint: 'https://dashscope.aliyuncs.com/api/',
      apiVersion: '2023-03-30'
    });
    
    console.log('QwenService initialized with accessKeyId:', this.accessKeyId ? 'SET' : 'NOT SET');
  }

  /**
   * 调用Qwen大模型生成文本
   * @param {string} prompt - 用户提示词
   * @returns {Promise<string>} 生成的文本内容
   */
  async generateText(prompt) {
    try {
      const params = {
        "model": "qwen-coder",
        "input": {
          "messages": [
            {
              "role": "system",
              "content": "你是一个专业的Web开发者，擅长使用Tailwind CSS创建现代化的网站。请根据用户的提示生成完整的HTML代码，确保包含适当的Tailwind CSS类来实现美观的设计。"
            },
            {
              "role": "user",
              "content": prompt
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
      
      const response = await this.client.request('/services/aigc/text-generation/generation', params, requestOption);
      
      // 提取生成的文本内容
      if (response.output && response.output.choices && response.output.choices.length > 0) {
        return response.output.choices[0].message.content;
      } else {
        throw new Error('API response format error');
      }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || error.message.includes('认证')) {
        console.error('API密钥认证失败，请检查.env文件中的ALIBABA_CLOUD_ACCESS_KEY_ID和ALIBABA_CLOUD_ACCESS_KEY_SECRET配置');
      }
      
      // 如果API调用失败，回退到默认模板
      return `<!DOCTYPE html>
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
    }
  }

  /**
   * 将用户提示词转换为详细的需求文档
   * @param {string} prompt - 用户提示词
   * @returns {Promise<string>} 详细的需求文档
   */
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
              "content": requirementPrompt
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
      
      const response = await this.client.request('/services/aigc/text-generation/generation', params, requestOption);
      
      // 提取生成的需求文档
      if (response.output && response.output.choices && response.output.choices.length > 0) {
        return response.output.choices[0].message.content;
      } else {
        throw new Error('API response format error');
      }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || error.message.includes('认证')) {
        console.error('API密钥认证失败，请检查.env文件中的ALIBABA_CLOUD_ACCESS_KEY_ID和ALIBABA_CLOUD_ACCESS_KEY_SECRET配置');
      }
      
      // 如果API调用失败，回退到默认模板
      return `网站需求文档：${prompt}
    
1. 网站目标和受众:
   - 目标：创建一个展示${prompt}的现代化网站
   - 受众：对${prompt}感兴趣的用户

2. 核心功能模块:
   - 首页展示
   - 产品/服务介绍
   - 联系方式

3. 页面结构和布局:
   - 顶部导航栏
   - 主要内容区域
   - 页脚信息

4. 设计风格和色彩搭配:
   - 现代简约风格
   - 使用蓝色和白色为主色调

5. 交互细节:
   - 响应式设计
   - 悬停效果

6. 内容要求:
   - 包含相关介绍内容
   - 添加图片占位符`;
    }
  }

  /**
   * 根据需求文档生成HTML代码
   * @param {string} requirementDoc - 需求文档
   * @returns {Promise<string>} 生成的HTML代码
   */
  async generateHTMLFromRequirement(requirementDoc) {
    try {
      const htmlPrompt = `请根据以下网站需求文档生成一个完整的HTML页面代码：

需求文档：
${requirementDoc}

要求：
1. 使用Tailwind CSS框架实现现代化设计
2. 包含完整的HTML结构（DOCTYPE, html, head, body等）
3. 在head部分引入Tailwind CSS CDN链接
4. 实现响应式设计，适配不同屏幕尺寸
5. 使用语义化的HTML标签
6. 添加适当的颜色、间距和字体样式
7. 不要包含任何JavaScript代码
8. 不要使用内联样式
9. 直接返回HTML代码，不要包含任何解释性文字或其他内容

请生成高质量的HTML代码。`;

      const params = {
        "model": "qwen-coder",
        "input": {
          "messages": [
            {
              "role": "system",
              "content": "你是一个专业的前端开发工程师，精通HTML和Tailwind CSS。"
            },
            {
              "role": "user",
              "content": htmlPrompt
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
      
      const response = await this.client.request('/services/aigc/text-generation/generation', params, requestOption);
      
      // 提取生成的HTML代码
      let htmlContent = '';
      if (response.output && response.output.choices && response.output.choices.length > 0) {
        htmlContent = response.output.choices[0].message.content;
      } else {
        throw new Error('API response format error');
      }
      
      // 如果返回的内容包含````，提取其中的HTML
      if (htmlContent.includes('``')) {
        const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
        if (match && match[1]) {
          htmlContent = match[1].trim();
        }
      }
      
      return htmlContent;
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || error.message.includes('认证')) {
        console.error('API密钥认证失败，请检查.env文件中的ALIBABA_CLOUD_ACCESS_KEY_ID和ALIBABA_CLOUD_ACCESS_KEY_SECRET配置');
      }
      
      // 如果API调用失败，回退到默认模板
      return `<!DOCTYPE html>
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
    }
  }
}

module.exports = QwenService;