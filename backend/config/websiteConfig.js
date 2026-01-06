// 网站生成和管理配置
const websiteConfig = {
  // 网站文件夹路径验证规则
  pathValidation: {
    minLength: 1,
    maxLength: 100,
    invalidChars: /[<>:"|?*]/,
    allowedPattern: /^[a-zA-Z0-9_-]+$/ // 只允许字母、数字、下划线和连字符
  },
  
  // 默认网站配置
  defaultConfig: {
    name: '新生成的网站',
    description: '由AI生成的网站',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    generator: 'qwen3-coder-plus'
  },
  
  // 文件大小限制 (字节)
  fileSizeLimits: {
    html: 10 * 1024 * 1024, // 10MB
    total: 50 * 1024 * 1024  // 50MB
  },
  
  // 支持的文件类型
  allowedFileTypes: [
    '.html', '.htm', '.css', '.js', '.json', '.txt',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.woff', '.woff2', '.ttf', '.eot'
  ],
  
  // 网站部署目录
  websitesDir: '../../public/websites',
  
  // 默认HTML模板
  defaultTemplate: (title = 'AI生成的网站') => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto p-8">
        <h1 class="text-3xl font-bold text-center text-indigo-600 mb-6">${title}</h1>
        <p class="text-center text-gray-600">这是一个由AI根据您的提示词生成的网站。</p>
    </div>
</body>
</html>`
};

module.exports = websiteConfig;