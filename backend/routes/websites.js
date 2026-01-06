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
    // 第一步：将用户提示词转换为详细需求文档
    const requirementDoc = await qwenService.generateRequirementDoc(prompt);
    
    // 第二步：根据需求文档生成HTML代码
    const htmlContent = await qwenService.generateHTMLFromRequirement(requirementDoc);
    
    // 提取HTML代码（去除可能的markdown包装）
    let cleanHtml = htmlContent;
    
    // 如果返回的内容包含markdown代码块，提取其中的HTML
    if (htmlContent.includes('```')) {
      const match = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
      if (match && match[1]) {
        cleanHtml = match[1].trim();
      }
    }
    
    return cleanHtml;
  } catch (error) {
    console.error('Qwen API调用失败，使用默认模板:', error);
    
    // 如果API调用失败，回退到默认模板
    return websiteConfig.defaultTemplate(prompt);
  }
};

// 生成HTML接口
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // 生成HTML内容
    const htmlContent = await generateHTMLFromPrompt(prompt);
    
    res.json({
      success: true,
      html: htmlContent,
      message: 'HTML generated successfully'
    });
  } catch (error) {
    console.error('Generate HTML error:', error);
    res.status(500).json({ error: 'Failed to generate HTML' });
  }
});

// 部署网站接口
router.post('/deploy', (req, res) => {
  try {
    const { html, path: customPath, name, description } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // 验证自定义路径
    if (customPath && !isValidPath(customPath)) {
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
      generator: 'qwen3-coder-plus'
    };
    
    const configPath = path.join(websiteDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    res.json({
      success: true,
      path: websitePath,
      url: `/websites/${websitePath}/`,
      message: 'Website deployed successfully'
    });
  } catch (error) {
    console.error('Deploy website error:', error);
    res.status(500).json({ error: 'Failed to deploy website' });
  }
});

// 获取已部署网站列表
router.get('/list', (req, res) => {
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
    
    res.json({
      success: true,
      websites: websites
    });
  } catch (error) {
    console.error('List websites error:', error);
    res.status(500).json({ error: 'Failed to list websites' });
  }
});

// 获取特定网站信息
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const websiteInfo = getWebsiteInfo(id);
    
    if (!websiteInfo) {
      return res.status(404).json({ error: 'Website not found' });
    }
    
    res.json({
      success: true,
      website: websiteInfo
    });
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({ error: 'Failed to get website info' });
  }
});

// 获取网站文件列表
router.get('/:id/files', (req, res) => {
  try {
    const { id } = req.params;
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
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
    
    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Get website files error:', error);
    res.status(500).json({ error: 'Failed to get website files' });
  }
});

// 更新网站配置
router.put('/:id/config', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
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
          generator: 'qwen3-coder-plus'
        };
      }
    } else {
      // 如果没有配置文件，创建新的
      config = { 
        id, 
        name: id, 
        createdAt: new Date().toISOString(),
        generator: 'qwen3-coder-plus'
      };
    }
    
    // 更新配置
    if (name !== undefined) config.name = name;
    if (description !== undefined) config.description = description;
    config.updatedAt = new Date().toISOString();
    
    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    res.json({
      success: true,
      config: config,
      message: 'Website config updated successfully'
    });
  } catch (error) {
    console.error('Update website config error:', error);
    res.status(500).json({ error: 'Failed to update website config' });
  }
});

// 删除网站
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (fs.existsSync(websiteDir)) {
      fs.rmSync(websiteDir, { recursive: true });
      res.json({
        success: true,
        message: 'Website deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'Website not found' });
    }
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// 更新网站HTML内容
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    const websiteDir = path.join(__dirname, websiteConfig.websitesDir, id);
    
    if (!fs.existsSync(websiteDir)) {
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
    
    res.json({
      success: true,
      message: 'Website updated successfully'
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

module.exports = router;