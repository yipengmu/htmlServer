const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QwenService = require('../services/qwenService');
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
  // 检查是否包含非法字符
  const invalidChars = /[<>:"|?*]/;
  return pathStr && !invalidChars.test(pathStr) && pathStr.length > 0 && pathStr.length <= 100;
};

// 获取网站信息
const getWebsiteInfo = (websitePath) => {
  try {
    const websitesDir = path.join(__dirname, '../../public/websites');
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
    
    return {
      id: websitePath,
      path: websitePath,
      createdAt: stat.birthtime,
      fileSize: fileSize
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
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-3xl font-bold text-center text-indigo-600 mb-6">${prompt}</h1>
        <p class="text-center text-gray-600">这是一个根据您的提示词生成的网站。</p>
    </div>
</body>
</html>`;
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
    const { html, path: customPath } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // 验证自定义路径
    if (customPath && !isValidPath(customPath)) {
      return res.status(400).json({ error: 'Invalid path. Path contains illegal characters or is too long.' });
    }
    
    // 确保public/websites目录存在
    const websitesDir = path.join(__dirname, '../../public/websites');
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
    const websitesDir = path.join(__dirname, '../../public/websites');
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

// 删除网站
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const websiteDir = path.join(__dirname, '../../public/websites', id);
    
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

module.exports = router;