const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QwenService = require('../services/qwenService');
const websiteConfig = require('../config/websiteConfig');
const router = express.Router();

// 初始化Qwen服务
const qwenService = new QwenService();

// 确保目录存在
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 验证路径是否合法
const isValidPath = (pathStr) => {
  // 检查长度
  if (!pathStr || pathStr.length < websiteConfig.pathValidation.minLength || 
      pathStr.length > websiteConfig.pathValidation.maxLength) {
    return false;
  }
  
  // 检查是否包含非法字符
  if (websiteConfig.pathValidation.invalidChars.test(pathStr)) {
    return false;
  }
  
  // 检查是否符合允许的模式
  if (!websiteConfig.pathValidation.allowedPattern.test(pathStr)) {
    return false;
  }
  
  return true;
};

// 获取网站信息
const getWebsiteInfo = (websitePath) => {
  try {
    const websitesDir = path.join(__dirname, websiteConfig.websitesDir);
    const websiteDir = path.join(websitesDir, websitePath);
    
    if (!fs.existsSync(websiteDir)) {
      return null;
    }
    
    const stat = fs.statSync(websiteDir);
    const indexPath = path.join(websiteDir, 'index.html');
    
    let fileSize = 0;
    if (fs.existsSync(indexPath)) {
      const indexStat = fs.statSync(indexPath);
      fileSize = indexStat.size;
    }
    
    // 获取网站配置（如果存在）
    const configPath = path.join(websiteDir, 'config.json');
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        console.error('Error reading config:', e);
      }
    }
    
    return {
      id: websitePath,
      path: websitePath,
      name: config.name || websitePath,
      description: config.description || '',
      createdAt: stat.birthtime,
      fileSize: fileSize,
      url: `/websites/${websitePath}/`
    };
  } catch (error) {
    console.error('Get website info error:', error);
    return null;
  }
};

// 生成HTML内容的函数（使用Qwen大模型）
const generateHTMLFromPrompt = async (prompt) => {
  try {
    console.log('[API Request] 开始生成HTML，提示词:', prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));
    
    // 第一步：将用户提示词转换为详细需求文档
    console.log('[API Request] 开始生成需求文档...');
    const requirementDoc = await qwenService.generateRequirementDoc(prompt);
    console.log('[API Response] 需求文档生成完成，长度:', requirementDoc.length);
    
    // 第二步：根据需求文档生成HTML代码
    console.log('[API Request] 开始生成HTML代码...');
    const htmlContent = await qwenService.generateHTMLFromRequirement(requirementDoc);
    console.log('[API Response] HTML代码生成完成，长度:', htmlContent.length);
    
    // 提取HTML代码（去除可能的markdown包装）
    let cleanHtml = htmlContent;
    
    // 如果返回的内容包含markdown代码块，提取其中的HTML
    if (htmlContent.includes('```')) {
      const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
      if (match && match[1]) {
        cleanHtml = match[1].trim();
        console.log('[Processing] 提取HTML代码块完成');
      }
    }
    
    console.log('[API Success] HTML生成完成');
    return cleanHtml;
  } catch (error) {
    console.error('[API Error] Qwen API调用失败:', error.message);
    console.error('[API Error] 错误堆栈:', error.stack);
    
    // 如果API调用失败，回退到默认模板
    const defaultTemplate = websiteConfig.defaultTemplate(prompt);
    console.log('[API Fallback] 使用默认模板');
    return defaultTemplate;
  }
};

// 生成HTML接口
router.post('/generate', async (req, res) => {
  console.log('[Request] POST /api/websites/generate - 请求开始');
  console.log('[Request Data] Prompt:', req.body.prompt ? req.body.prompt.substring(0, 100) + (req.body.prompt.length > 100 ? '...' : '') : 'undefined');
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.log('[Validation Error] Prompt is required');
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // 生成HTML内容
    const htmlContent = await generateHTMLFromPrompt(prompt);
    
    console.log('[Response] POST /api/websites/generate - 响应成功，HTML长度:', htmlContent.length);
    res.json({
      success: true,
      html: htmlContent,
      message: 'HTML generated successfully'
    });
  } catch (error) {
    console.error('[Response Error] POST /api/websites/generate - 生成失败:', error);
    res.status(500).json({ error: 'Failed to generate HTML' });
  }
});

// 部署网站接口
router.post('/deploy', (req, res) => {
  console.log('[Request] POST /api/websites/deploy - 部署请求开始');
  console.log('[Request Data] 部署数据摘要 - HTML长度:', req.body.html ? req.body.html.length : 0, 
              '路径:', req.body.path || 'auto-generated');
  
  try {
    const { html, path: customPath, name, description } = req.body;
    
    if (!html) {
      console.log('[Validation Error] HTML content is required');
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // 验证自定义路径
    if (customPath && !isValidPath(customPath)) {
      console.log('[Validation Error] Invalid path:', customPath);
      return res.status(400).json({ 
        error: 'Invalid path. Path contains illegal characters, is too long, or has invalid format. Only letters, numbers, underscores, and hyphens are allowed.' 
      });
    }
    
    // 确保public/websites目录存在
    const websitesDir = path.join(__dirname, websiteConfig.websitesDir);
    ensureDirExists(websitesDir);
    
    // 生成唯一标识符或使用自定义路径
    const websitePath = customPath || uuidv4();
    const websiteDir = path.join(websitesDir, websitePath);
    
    // 检查路径是否已存在
    if (customPath && fs.existsSync(websiteDir)) {
      console.log('[Validation Error] Path already exists:', websitePath);
      return res.status(400).json({ error: 'Path already exists. Please choose another path.' });
    }
    
    // 确保网站目录存在
    ensureDirExists(websiteDir);
    
    // 写入HTML文件
    const indexPath = path.join(websiteDir, 'index.html');
    fs.writeFileSync(indexPath, html);
    
    // 创建网站配置文件
    const config = {
      id: websitePath,
      name: name || websitePath,
      description: description || 'Generated website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generator: qwenService.getCurrentModelInfo().name
    };
    
    const configPath = path.join(websiteDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('[Response] POST /api/websites/deploy - 部署成功，路径:', websitePath);
    res.json({
      success: true,
      path: websitePath,
      url: `/websites/${websitePath}/`,
      message: 'Website deployed successfully'
    });
  } catch (error) {
    console.error('[Response Error] POST /api/websites/deploy - 部署失败:', error);
    res.status(500).json({ error: 'Failed to deploy website' });
  }
});

// 获取已部署网站列表
router.get('/list', (req, res) => {
  console.log('[Request] GET /api/websites/list - 获取网站列表');
  
  try {
    const websitesDir = path.join(__dirname, websiteConfig.websitesDir);
    ensureDirExists(websitesDir);
    
    const websites = [];
    const items = fs.readdirSync(websitesDir);
    
    items.forEach(item => {
      const websiteInfo = getWebsiteInfo(item);
      if (websiteInfo) {
        websites.push(websiteInfo);
      }
    });
    
    // 按创建时间排序
    websites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('[Response] GET /api/websites/list - 返回', websites.length, '个网站');
    res.json({
      success: true,
      websites: websites
    });
  } catch (error) {
    console.error('[Response Error] GET /api/websites/list - 获取列表失败:', error);
    res.status(500).json({ error: 'Failed to list websites' });
  }
});

// 获取特定网站信息
router.get('/:id', (req, res) => {
  console.log('[Request] GET /api/websites/' + req.params.id + ' - 获取网站信息');
  
  try {
    const { id } = req.params;
    const websiteInfo = getWebsiteInfo(id);
    
    if (!websiteInfo) {
      console.log('[Response Error] Website not found:', id);
      return res.status(404).json({ error: 'Website not found' });
    }
    
    console.log('[Response] GET /api/websites/' + id + ' - 网站信息获取成功');
    res.json({
      success: true,
      website: websiteInfo
    });
  } catch (error) {
    console.error('[Response Error] GET /api/websites/' + req.params.id + ' - 获取网站信息失败:', error);
    res.status(500).json({ error: 'Failed to get website info' });
  }
});

// 获取网站文件列表
router.get('/:id/files', (req, res) => {
  console.log('[Request] GET /api/websites/' + req.params.id + '/files - 获取网站文件列表');
  
  try {
    const { id } = req.params;
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
      console.log('[Response Error] Website not found:', id);
      return res.status(404).json({ error: 'Website not found' });
    }
    
    const files = [];
    const items = fs.readdirSync(websiteDir);
    
    items.forEach(item => {
      const itemPath = path.join(websiteDir, item);
      const stat = fs.statSync(itemPath);
      
      files.push({
        name: item,
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        modifiedAt: stat.mtime
      });
    });
    
    console.log('[Response] GET /api/websites/' + id + '/files - 返回', files.length, '个文件');
    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('[Response Error] GET /api/websites/' + req.params.id + '/files - 获取文件列表失败:', error);
    res.status(500).json({ error: 'Failed to get website files' });
  }
});

// 更新网站配置
router.put('/:id/config', (req, res) => {
  console.log('[Request] PUT /api/websites/' + req.params.id + '/config - 更新网站配置');
  console.log('[Request Data] 配置更新数据:', JSON.stringify({name: req.body.name, description: req.body.description}));
  
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
      console.log('[Response Error] Website not found:', id);
      return res.status(404).json({ error: 'Website not found' });
    }
    
    // 读取现有配置
    const configPath = path.join(websiteDir, 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        // 如果配置文件损坏，使用默认配置
        config = { 
          id, 
          name: id, 
          createdAt: new Date().toISOString(),
          generator: qwenService.getCurrentModelInfo().name
        };
      }
    } else {
      // 如果没有配置文件，创建新的
      config = { 
        id, 
        name: id, 
        createdAt: new Date().toISOString(),
        generator: qwenService.getCurrentModelInfo().name
      };
    }
    
    // 更新配置
    if (name !== undefined) config.name = name;
    if (description !== undefined) config.description = description;
    config.updatedAt = new Date().toISOString();
    
    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('[Response] PUT /api/websites/' + id + '/config - 配置更新成功');
    res.json({
      success: true,
      config: config,
      message: 'Website config updated successfully'
    });
  } catch (error) {
    console.error('[Response Error] PUT /api/websites/' + req.params.id + '/config - 更新配置失败:', error);
    res.status(500).json({ error: 'Failed to update website config' });
  }
});

// 删除网站
router.delete('/:id', (req, res) => {
  console.log('[Request] DELETE /api/websites/' + req.params.id + ' - 删除网站');
  
  try {
    const { id } = req.params;
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (fs.existsSync(websiteDir)) {
      fs.rmSync(websiteDir, { recursive: true });
      console.log('[Response] DELETE /api/websites/' + id + ' - 网站删除成功');
      res.json({
        success: true,
        message: 'Website deleted successfully'
      });
    } else {
      console.log('[Response Error] Website not found for deletion:', id);
      res.status(404).json({ error: 'Website not found' });
    }
  } catch (error) {
    console.error('[Response Error] DELETE /api/websites/' + req.params.id + ' - 删除网站失败:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// 更新网站HTML内容
router.put('/:id', (req, res) => {
  console.log('[Request] PUT /api/websites/' + req.params.id + ' - 更新网站HTML内容');
  console.log('[Request Data] HTML长度:', req.body.html ? req.body.html.length : 0);
  
  try {
    const { id } = req.params;
    const { html } = req.body;
    
    if (!html) {
      console.log('[Validation Error] HTML content is required');
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
      console.log('[Response Error] Website not found:', id);
      return res.status(404).json({ error: 'Website not found' });
    }
    
    // 更新HTML文件
    const indexPath = path.join(websiteDir, 'index.html');
    fs.writeFileSync(indexPath, html);
    
    // 更新配置中的更新时间
    const configPath = path.join(websiteDir, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.updatedAt = new Date().toISOString();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      } catch (e) {
        console.error('Error updating config:', e);
      }
    }
    
    console.log('[Response] PUT /api/websites/' + id + ' - 网站内容更新成功');
    res.json({
      success: true,
      message: 'Website updated successfully'
    });
  } catch (error) {
    console.error('[Response Error] PUT /api/websites/' + req.params.id + ' - 更新网站失败:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

// 获取可用模型列表
router.get('/models/available', (req, res) => {
  console.log('[Request] GET /api/websites/models/available - 获取可用模型列表');
  
  try {
    const availableModels = qwenService.getAvailableModels();
    console.log('[Response] GET /api/websites/models/available - 返回', availableModels.length, '个模型');
    res.json({
      success: true,
      models: availableModels
    });
  } catch (error) {
    console.error('[Response Error] GET /api/websites/models/available - 获取模型列表失败:', error);
    res.status(500).json({ error: 'Failed to get available models' });
  }
});

// 获取当前模型信息
router.get('/models/current', (req, res) => {
  console.log('[Request] GET /api/websites/models/current - 获取当前模型信息');
  
  try {
    const currentModel = qwenService.getCurrentModelInfo();
    console.log('[Response] GET /api/websites/models/current - 当前模型:', currentModel.name);
    res.json({
      success: true,
      model: currentModel
    });
  } catch (error) {
    console.error('[Response Error] GET /api/websites/models/current - 获取当前模型失败:', error);
    res.status(500).json({ error: 'Failed to get current model' });
  }
});

// 切换模型
router.post('/models/switch', (req, res) => {
  console.log('[Request] POST /api/websites/models/switch - 切换模型请求');
  console.log('[Request Data] 目标模型:', req.body.provider);
  
  try {
    const { provider } = req.body;
    
    if (!provider) {
      console.log('[Validation Error] Provider is required');
      return res.status(400).json({ error: 'Provider is required' });
    }
    
    const result = qwenService.switchModel(provider);
    console.log('[Response] POST /api/websites/models/switch - 模型切换结果:', result.message);
    res.json(result);
  } catch (error) {
    console.error('[Response Error] POST /api/websites/models/switch - 模型切换失败:', error);
    res.status(500).json({ error: 'Failed to switch model' });
  }
});

// 流式生成HTML接口
router.post('/generate-stream', async (req, res) => {
  console.log('[Request] POST /api/websites/generate-stream - 流式生成请求开始');
  console.log('[Request Data] Prompt:', req.body.prompt ? req.body.prompt.substring(0, 100) + (req.body.prompt.length > 100 ? '...' : '') : 'undefined');
  
  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.log('[Validation Error] Prompt is required');
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Prompt is required' })}\n\n`);
      res.end();
      return;
    }
    
    // 发送开始消息
    res.write(`data: ${JSON.stringify({ type: 'info', message: '开始生成网站', step: 'start' })}\n\n`);
    
    // 第一步：生成需求文档
    res.write(`data: ${JSON.stringify({ type: 'info', message: '正在分析需求...', step: 'requirement' })}\n\n`);
    
    const requirementDoc = await qwenService.generateRequirementDoc(prompt);
    
    res.write(`data: ${JSON.stringify({ type: 'info', message: '需求分析完成', step: 'requirement-complete', content: requirementDoc.substring(0, 200) + (requirementDoc.length > 200 ? '...' : '') })}\n\n`);
    
    // 第二步：生成HTML代码
    res.write(`data: ${JSON.stringify({ type: 'info', message: '正在生成HTML代码...', step: 'html-generation' })}\n\n`);
    
    const htmlContent = await qwenService.generateHTMLFromRequirement(requirementDoc);
    
    // 提取HTML代码（去除可能的markdown包装）
    let cleanHtml = htmlContent;
    
    // 如果返回的内容包含markdown代码块，提取其中的HTML
    if (htmlContent.includes('```')) {
      const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
      if (match && match[1]) {
        cleanHtml = match[1].trim();
        console.log('[Processing] 提取HTML代码块完成');
      }
    }
    
    res.write(`data: ${JSON.stringify({ type: 'success', message: 'HTML生成完成', step: 'complete', content: cleanHtml })}\n\n`);
    
    // 发送完成消息
    res.write(`data: ${JSON.stringify({ type: 'info', message: '网站生成完成', step: 'finished' })}\n\n`);
    
    console.log('[Response] POST /api/websites/generate-stream - 流式响应完成，HTML长度:', cleanHtml.length);
    
  } catch (error) {
    console.error('[Response Error] POST /api/websites/generate-stream - 生成失败:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: '生成失败: ' + error.message, step: 'error' })}\n\n`);
  } finally {
    // 结束流
    res.end();
  }
});

module.exports = router;