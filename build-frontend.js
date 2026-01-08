#!/usr/bin/env node

// 构建前端并将其产物复制到正确位置以供 Vercel 使用
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('开始构建前端...');

try {
  // 确保 frontend 目录存在
  const frontendDir = path.join(__dirname, 'frontend');
  if (!fs.existsSync(frontendDir)) {
    throw new Error('frontend 目录不存在');
  }

  // 安装前端依赖并构建
  console.log('安装前端依赖...');
  execSync('npm ci', { 
    cwd: frontendDir,
    stdio: 'inherit' 
  });
  
  console.log('构建前端应用...');
  execSync('npm run build', { 
    cwd: frontendDir,
    stdio: 'inherit' 
  });
  
  console.log('前端构建完成');
  
  // 现在前端构建产物应该在 frontend/dist 目录中
  const sourceDir = path.join(__dirname, 'frontend', 'dist');
  const destDir = path.join(__dirname, 'dist');
  
  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    throw new Error('前端构建产物不存在，请检查构建过程');
  }
  
  // 删除旧的 dist 目录
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
    console.log('已清理旧的 dist 目录');
  }
  
  // 创建新的 dist 目录并复制文件
  fs.mkdirSync(destDir, { recursive: true });
  copyRecursiveSync(sourceDir, destDir);
  
  console.log('前端构建产物已复制到根目录 dist 文件夹');
} catch (error) {
  console.error('构建失败:', error.message);
  process.exit(1);
}

// 递归复制函数
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}