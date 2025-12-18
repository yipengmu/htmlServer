const express = require('express');
const router = express.Router();

// 导入路由模块
const websiteRoutes = require('./websites');

// 挂载路由
router.use('/websites', websiteRoutes);

// 测试路由
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to HTML Server API' });
});

module.exports = router;