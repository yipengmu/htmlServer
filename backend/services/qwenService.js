const { modelManager } = require('./llmService');

// 为了保持向后兼容，创建一个包装类
class QwenService {
  constructor() {
    // 使用模型管理器作为底层实现
    this.modelManager = modelManager;
  }

  /**
   * 调用当前选中的大模型生成文本
   * @param {string} prompt - 用户提示词
   * @returns {Promise<string>} 生成的文本内容
   */
  async generateText(prompt) {
    try {
      return await this.modelManager.generateText(prompt);
    } catch (error) {
      console.error('模型API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
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
      return await this.modelManager.generateRequirementDoc(prompt);
    } catch (error) {
      console.error('模型API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
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
      return await this.modelManager.generateHTMLFromRequirement(requirementDoc);
    } catch (error) {
      console.error('模型API调用失败，使用默认模板:', error.message);
      console.error('错误详情:', error);
      console.error('错误堆栈:', error.stack);
      
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
   * 切换到指定的模型提供商
   * @param {string} provider - 模型提供商 (qwen, qwen3, doubao, zhipu)
   * @returns {Object} 切换结果
   */
  switchModel(provider) {
    return this.modelManager.switchProvider(provider);
  }

  /**
   * 获取当前模型信息
   * @returns {Object} 当前模型信息
   */
  getCurrentModelInfo() {
    return this.modelManager.getCurrentProviderInfo();
  }

  /**
   * 获取可用的模型列表
   * @returns {Array} 可用模型列表
   */
  getAvailableModels() {
    return this.modelManager.getAvailableProviders();
  }
}

module.exports = QwenService;