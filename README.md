# AI网站生成器

一个基于Qwen大模型的AI驱动网站生成和部署平台，支持生成、预览和管理多个独立的网站。

## 功能特性

- **AI驱动的网站生成**：使用Qwen大模型根据自然语言提示生成高质量的HTML网站
- **实时预览**：生成过程中提供实时预览功能
- **多网站管理**：支持创建和管理多个独立的网站
- **自定义部署路径**：支持为网站指定自定义URL路径
- **网站配置管理**：可编辑网站名称和描述
- **流式生成反馈**：提供生成过程的实时步骤反馈

## 系统架构

### 后端结构

```
backend/
├── app.js              # Express应用主入口
├── routes/
│   └── websites.js     # 网站生成和管理API路由
└── services/
    └── qwenService.js  # Qwen API服务封装
```

### 前端结构

```
frontend/
├── src/
│   ├── App.jsx             # 主应用组件
│   ├── StreamingGenerator.jsx  # 网站生成器组件
│   └── WebsiteManager.jsx  # 网站管理器组件
```

### 静态文件服务

```
public/
└── websites/              # 存放所有生成的网站
    ├── website1/          # 每个网站一个独立文件夹
    │   ├── index.html     # 网站主页面
    │   └── config.json    # 网站配置
    ├── website2/
    └── ...
```

## API接口

### 生成相关

- `POST /api/websites/generate` - 根据提示词生成HTML
- `POST /api/websites/deploy` - 部署网站到独立文件夹

### 网站管理

- `GET /api/websites/list` - 获取所有已部署网站列表
- `GET /api/websites/:id` - 获取特定网站信息
- `PUT /api/websites/:id` - 更新网站内容
- `PUT /api/websites/:id/config` - 更新网站配置
- `DELETE /api/websites/:id` - 删除网站
- `GET /api/websites/:id/files` - 获取网站文件列表

## 部署方式

网站以独立文件夹形式部署在 `/public/websites/` 目录下，每个网站占用一个独立的子文件夹，通过Express的静态文件服务进行访问。

## 环境配置

创建 `.env` 文件：

```
PORT=3001
NODE_ENV=development
QWEN_API_KEY=your_dashscope_api_key_here
```

## 运行项目

1. 安装依赖：
   ```bash
   npm install
   cd frontend && npm install
   ```

2. 构建前端：
   ```bash
   npm run build
   ```

3. 启动服务：
   ```bash
   npm start
   ```

## 技术栈

- **后端**: Node.js, Express
- **前端**: React, Tailwind CSS
- **AI服务**: 阿里云Qwen大模型
- **部署**: 静态文件服务

## 安全说明

- API密钥请妥善保管，不要提交到版本控制系统
- 系统已配置适当的沙箱限制以确保预览安全