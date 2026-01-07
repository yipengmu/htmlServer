// Vercel API 路由 - 处理后端 API 请求

// CORS 头部
const corsHeaders = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

// 模拟可用模型列表
const availableModels = [
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', provider: 'Alibaba Cloud', hasApiKey: true },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', hasApiKey: false },
  { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', hasApiKey: false }
];

// 处理获取可用模型列表请求
function handleGetModels(req, res) {
  return res.json({ 
    success: true, 
    models: availableModels 
  });
}

// 处理获取当前模型请求
function handleGetCurrentModel(req, res) {
  const currentModel = availableModels[0]; // 默认返回第一个模型
  
  return res.json({ 
    success: true, 
    model: currentModel 
  });
}

// 处理切换模型请求
function handleSwitchModel(req, res) {
  const { provider } = req.body || {};
  
  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  
  const model = availableModels.find(m => m.provider === provider);
  
  if (!model) {
    return res.status(400).json({ message: 'Model not found' });
  }
  
  return res.json({ 
    success: true, 
    message: `已切换到 ${model.name} 模型` 
  });
}

// 处理流式生成网站请求
async function handleStreamGenerate(req, res) {
  const { prompt } = req.body || {};
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // 设置流式响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  try {
    // 模拟流式生成过程
    const steps = [
      { step: '分析需求', content: '正在分析您的网站需求...', type: 'info' },
      { step: '生成结构', content: '正在生成页面结构...', type: 'info' },
      { step: '添加样式', content: '正在添加样式和布局...', type: 'info' },
      { step: '完善细节', content: '正在完善页面细节...', type: 'info' }
    ];

    for (const step of steps) {
      res.write(`data: ${JSON.stringify(step)}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟
    }

    // 生成最终的HTML内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-3xl font-bold text-center text-indigo-600 mb-6">AI生成的网站</h1>
        <p class="text-center text-gray-600 mb-6">根据您的提示词生成的网站</p>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">内容摘要</h2>
            <p class="text-gray-600">您的网站内容基于提示词："${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"</p>
        </div>
    </div>
</body>
</html>`;

    // 发送完成的消息
    res.write(`data: ${JSON.stringify({ 
      step: 'complete', 
      content: htmlContent, 
      type: 'success' 
    })}\n\n`);

    res.end();
  } catch (error) {
    console.error('流式生成错误:', error);
    res.write(`data: ${JSON.stringify({ 
      step: 'error', 
      content: error.message, 
      type: 'error' 
    })}\n\n`);
    res.end();
  }
}

// 处理生成网站请求
async function handleGenerate(req, res) {
  const { prompt } = req.body || {};
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 模拟 AI 生成延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成基于提示词的 HTML 内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的网站</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-3xl font-bold text-center text-indigo-600 mb-6">AI生成的网站</h1>
        <p class="text-center text-gray-600 mb-6">根据您的提示词生成的网站</p>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">内容摘要</h2>
            <p class="text-gray-600">您的网站内容基于提示词："${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"</p>
        </div>
    </div>
</body>
</html>`;

    return res.json({ 
      success: true, 
      html: htmlContent,
      message: '网站生成成功'
    });
  } catch (error) {
    console.error('生成错误:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 处理部署网站请求
async function handleDeploy(req, res) {
  const { html, path: customPath, name, description } = req.body || {};
  
  if (!html) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  try {
    // 在 Vercel 环境中，我们不能直接写入文件系统
    // 实际部署可能需要使用 Vercel 的静态生成或其他存储方案
    // 这里只是模拟部署过程
    
    // 生成网站路径
    const websitePath = customPath || Date.now().toString();
    
    return res.json({ 
      success: true, 
      message: '网站部署成功', 
      url: `/websites/${websitePath}`,
      path: websitePath
    });
  } catch (error) {
    console.error('部署错误:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 处理 OPTIONS 预检请求
function handleOptions(req, res) {
  res.writeHead(200, corsHeaders);
  res.end();
}

export default function handler(req, res) {
  // 添加 CORS 头
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // 如果是 OPTIONS 请求，处理 CORS 预检
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // 根据请求路径处理不同 API
  const url = new URL(req.url, `https://example.com`);
  const pathname = url.pathname;
  
  // 处理模型相关API
  if (pathname === '/api/websites/models/available' && req.method === 'GET') {
    return handleGetModels(req, res);
  } else if (pathname === '/api/websites/models/current' && req.method === 'GET') {
    return handleGetCurrentModel(req, res);
  } else if (pathname === '/api/websites/models/switch' && req.method === 'POST') {
    return handleSwitchModel(req, res);
  }
  // 处理生成相关API
  else if (pathname === '/api/websites/generate' && req.method === 'POST') {
    return handleGenerate(req, res);
  } else if (pathname === '/api/websites/generate-stream' && req.method === 'POST') {
    return handleStreamGenerate(req, res);
  }
  // 处理部署相关API
  else if (pathname === '/api/websites/deploy' && req.method === 'POST') {
    return handleDeploy(req, res);
  }
  // 处理健康检查API
  else if (pathname === '/api/health' && req.method === 'GET') {
    return res.json({ status: 'OK', message: 'HTML Server is running' });
  }
  // 处理根API路径
  else if (pathname === '/api' && req.method === 'GET') {
    return res.json({ message: 'Welcome to HTML Server API' });
  }
  // 其他路径返回404
  else {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};