# HTML Server

一个基于 Express + React + Tailwind CSS 的现代化 HTML 托管平台。

## 环境配置

在运行此应用程序之前，您需要设置环境变量。

1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填写以下配置：
   ```env
   PORT=3001
   NODE_ENV=development
   ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id_here
   ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret_here
   QWEN_API_KEY=your_dashscope_api_key_here
   ```

### 配置说明

- `PORT`: 服务器运行端口，默认为3001
- `NODE_ENV`: Node.js环境，可选值为development或production
- `ALIBABA_CLOUD_ACCESS_KEY_ID`: 阿里云访问密钥ID（用于某些阿里云服务）
- `ALIBABA_CLOUD_ACCESS_KEY_SECRET`: 阿里云访问密钥Secret（用于某些阿里云服务）
- `QWEN_API_KEY`: DashScope API密钥（用于调用通义千问大模型）

### 获取阿里云密钥

1. 登录阿里云控制台
2. 进入[AccessKey管理页面](https://ram.console.aliyun.com/manage/ak)
3. 创建或获取已有的AccessKey ID和AccessKey Secret
4. 确保该密钥已启用并具有相应的权限

### 获取DashScope API密钥

1. 登录[DashScope控制台](https://dashscope.console.aliyun.com/)
2. 在API密钥页面获取或创建新的API密钥
3. 确保已开通相应的模型服务

## 安装和运行

### 后端服务

```bash
# 安装依赖
npm install

# 启动后端服务
npm start
```

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

## 安全注意事项

- **切勿将真实的API密钥提交到代码仓库**
- `.env` 文件已被添加到 `.gitignore` 中，不会被Git跟踪
- 生产环境中应使用更安全的密钥管理方式