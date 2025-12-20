const OpenAI = require('openai');
require('dotenv').config();

class QwenService {
  constructor() {
    // 从环境变量获取DashScope专用API密钥
    this.apiKey = process.env.QWEN_API_KEY;
    
    // 初始化OpenAI兼容客户端
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
    
    console.log('QwenService initialized with API key:', this.apiKey ? 'SET' : 'NOT SET');
    
    // 检查API密钥是否设置
    if (!this.apiKey) {
      console.warn('警告: DashScope API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
    }
  }

  /**
   * 调用Qwen大模型生成文本
   * @param {string} prompt - 用户提示词
   * @returns {Promise<string>} 生成的文本内容
   */
  async generateText(prompt) {
    try {
      // 检查API密钥是否设置
      if (!this.apiKey) {
        throw new Error('API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
      }
      
      // 使用qwen3-coder-plus模型
      const model = 'qwen3-coder-plus';
      
      try {
        console.log(`尝试使用模型: ${model}`);
        
        const response = await this.client.chat.completions.create({
          model: model,
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
              content: prompt
            }
          ],
          stream: false
        });
        
        console.log('API响应状态码:', response.choices ? 'Success' : 'Failed');
        console.log('API完整响应:', JSON.stringify(response, null, 2));
        
        // 提取生成的文本内容
        if (response.choices && response.choices.length > 0) {
          return response.choices[0].message.content;
        } else {
          throw new Error('API response format error: ' + JSON.stringify(response));
        }
      } catch (error) {
        console.error(`使用模型 ${model} 调用失败:`, error.message);
        console.error('错误类型:', error.constructor.name);
        console.error('错误堆栈:', error.stack);
        throw error;
      }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || 
          error.message.includes('认证') || error.message.includes('InvalidApiKey') || 
          error.message.includes('Unauthorized') || (error.code && error.code === '401')) {
        console.error('API密钥认证失败，请检查.env文件中的QWEN_API_KEY配置');
        console.error('解决方案：请登录DashScope控制台获取有效的API密钥');
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
   * 调用Qwen大模型生成文本（支持流式输出）
   * @param {string} prompt - 用户提示词
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<string>} 生成的文本内容
   */
  async generateTextStream(prompt, onProgress) {
    try {
      // 检查API密钥是否设置
      if (!this.apiKey) {
        throw new Error('API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
      }
      
      // 使用qwen3-coder-plus模型
      const model = 'qwen3-coder-plus';
      
      try {
        console.log(`尝试使用模型: ${model}`);
        
        // 发送初始进度
        if (onProgress) {
          onProgress({ type: 'start', message: '开始生成HTML...' });
        }
        
        const response = await this.client.chat.completions.create({
          model: model,
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
              content: prompt
            }
          ],
          stream: true  // 启用流式输出
        });
        
        let fullContent = '';
        
        // 处理流式响应
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullContent += content;
          
          // 发送进度更新
          if (onProgress && content) {
            onProgress({ type: 'stream', content: content });
          }
        }
        
        // 发送完成消息
        if (onProgress) {
          onProgress({ type: 'complete', message: 'HTML生成完成' });
        }
        
        return fullContent;
      } catch (error) {
        console.error(`使用模型 ${model} 调用失败:`, error.message);
        console.error('错误类型:', error.constructor.name);
        console.error('错误堆栈:', error.stack);
        
        // 发送错误消息
        if (onProgress) {
          onProgress({ type: 'error', message: '生成过程中出现错误: ' + error.message });
        }
        
        // 如果是API密钥错误，直接抛出
        if (error.message.includes('InvalidApiKey') || error.message.includes('Invalid API-key') || 
            error.message.includes('Unauthorized') || (error.code && error.code === '401')) {
          throw new Error('API密钥无效或未授权，请检查.env文件中的QWEN_API_KEY配置，或在DashScope控制台生成新的API密钥');
        }
        
        // 如果是网络错误，记录详细信息
        if (error.name === 'RequestError' || error.name === 'FetchError') {
          console.error('网络错误详情:', error);
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || 
          error.message.includes('认证') || error.message.includes('InvalidApiKey') || 
          error.message.includes('Unauthorized') || (error.code && error.code === '401')) {
        console.error('API密钥认证失败，请检查.env文件中的QWEN_API_KEY配置');
        console.error('解决方案：请登录DashScope控制台获取有效的API密钥');
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
      // 检查API密钥是否设置
      if (!this.apiKey) {
        throw new Error('API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
      }
      
      // 使用qwen3-coder-plus模型
      const model = 'qwen3-coder-plus';
      
      try {
        console.log(`尝试使用模型生成需求文档: ${model}`);
        const requirementPrompt = `请根据以下用户提示词生成一份详细的网站需求文档，特别注意要指导后续HTML生成时保持与默认模板一致的风格：

参考默认模板风格：
- 页面背景：bg-gray-100
- 导航栏：bg-white shadow-sm，包含网站标题和导航链接
- 内容区域：container mx-auto px-4，包含标题和卡片式布局
- 卡片样式：bg-white rounded-lg shadow-md，带hover效果
- 按钮样式：bg-indigo-600 text-white，带hover效果
- 页脚：bg-white border-t
- 颜色搭配：indigo-600作为强调色，gray-800作为标题色，gray-600作为正文色

用户提示词：${prompt}

请按照以下格式生成需求文档：

1. 网站目标和受众:
   - 目标：[描述网站的主要目标]
   - 受众：[描述目标用户群体]

2. 核心功能模块:
   - [列出主要功能模块，每个模块应包含标题、描述和可能的CTA按钮]

3. 页面结构和布局:
   - [描述页面整体结构，包括导航栏、主要内容区域、页脚等]

4. 设计风格和色彩搭配:
   - [描述设计风格，重点说明要与参考模板保持一致的视觉风格]

5. 交互细节:
   - [描述交互设计细节，如hover效果、响应式行为等]

6. 内容要求:
   - [描述各模块的具体内容要求]

请确保需求文档详细且具体，以便后续用于生成与默认模板风格一致的HTML代码。`;

          const response = await this.client.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: "你是一个专业的产品经理，擅长将用户需求转化为详细的产品需求文档，特别要注意指导前端开发保持一致的设计风格。"
              },
              {
                role: "user",
                content: requirementPrompt
              }
            ],
            stream: false
          });
          
          console.log('API生成需求文档响应状态码:', response.choices ? 'Success' : 'Failed');
          console.log('API生成需求文档完整响应:', JSON.stringify(response, null, 2));
          
          // 提取生成的需求文档
          if (response.choices && response.choices.length > 0) {
            return response.choices[0].message.content;
          } else {
            throw new Error('API response format error: ' + JSON.stringify(response));
          }
        } catch (error) {
          console.error(`使用模型 ${model} 生成需求文档失败:`, error.message);
          console.error('错误类型:', error.constructor.name);
          console.error('错误堆栈:', error.stack);
          throw error;
        }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || 
          error.message.includes('认证') || error.message.includes('InvalidApiKey') || 
          error.message.includes('Unauthorized') || (error.code && error.code === '401')) {
        console.error('API密钥认证失败，请检查.env文件中的QWEN_API_KEY配置');
        console.error('解决方案：请登录DashScope控制台获取有效的API密钥');
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
   - 使用蓝色和白色为主色调，与默认模板保持一致

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
      // 检查API密钥是否设置
      if (!this.apiKey) {
        throw new Error('API密钥未设置，请检查.env文件中的QWEN_API_KEY配置');
      }
      
      // 使用qwen3-coder-plus模型
      const model = 'qwen3-coder-plus';
      
      try {
        console.log(`尝试使用模型生成HTML: ${model}`);
        const htmlPrompt = `请根据以下网站需求文档生成一个完整的HTML页面代码，必须严格遵守以下要求：

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
</html>

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
9. 必须包含完整的HTML结构（DOCTYPE, html, head, body等）
10. 实现响应式设计，适配不同屏幕尺寸
11. 使用语义化的HTML标签（header, nav, main, section, footer等）
12. 不要包含任何JavaScript代码
13. 不要使用内联样式
14. 直接返回HTML代码，不要包含任何解释性文字或其他内容
15. 确保生成的HTML结构清晰，层次分明

请生成高质量且样式正确的HTML代码。`;

          const response = await this.client.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: "你是一个专业的前端开发工程师，精通HTML和Tailwind CSS。你生成的HTML必须包含Tailwind CSS CDN链接才能正确渲染样式。请严格按照用户提供的要求生成代码。"
              },
              {
                role: "user",
                content: htmlPrompt
              }
            ],
            stream: false
          });
          
          console.log('API生成HTML响应状态码:', response.choices ? 'Success' : 'Failed');
          console.log('API生成HTML完整响应:', JSON.stringify(response, null, 2));
          
          // 提取生成的HTML代码
          let htmlContent = '';
          if (response.choices && response.choices.length > 0) {
            htmlContent = response.choices[0].message.content;
          } else {
            throw new Error('API response format error: ' + JSON.stringify(response));
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
          console.error(`使用模型 ${model} 生成HTML失败:`, error.message);
          console.error('错误类型:', error.constructor.name);
          console.error('错误堆栈:', error.stack);
          throw error;
        }
    } catch (error) {
      console.error('Qwen API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
      // 检查是否是认证错误
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.message.includes('InvalidAccessKeyId') || 
          error.message.includes('认证') || error.message.includes('InvalidApiKey') || 
          error.message.includes('Unauthorized') || (error.code && error.code === '401')) {
        console.error('API密钥认证失败，请检查.env文件中的QWEN_API_KEY配置');
        console.error('解决方案：请登录DashScope控制台获取有效的API密钥');
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