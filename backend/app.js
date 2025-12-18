const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供前端构建文件
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 静态文件服务 - 提供已部署的网站
app.use('/websites', express.static(path.join(__dirname, '../public/websites')));

// 基础路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HTML Server is running' });
});

// API路由
app.use('/api', require('./routes'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404处理 - 对于非API请求，返回前端应用
app.use('*', (req, res) => {
  // 如果是API请求，返回404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  // 否则返回前端应用
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;