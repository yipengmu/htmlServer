import React, { useState, useRef, useEffect } from 'react';

const StreamingGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState([]);
  const [deploymentPath, setDeploymentPath] = useState('');
  const [deploymentName, setDeploymentName] = useState('');
  const [deploymentDescription, setDeploymentDescription] = useState('');
  const [deploymentSuccess, setDeploymentSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef(null);
  const stepsContainerRef = useRef(null);

  // 更新iframe内容
  const updateIframeContent = () => {
    try {
      if (!iframeRef.current || !generatedHtml) return;
      
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // 清空iframe内容
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <base target="_blank">
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>实时预览</title>
        </head>
        <body>
          ${generatedHtml}
        </body>
        </html>
      `);
      iframeDoc.close();
    } catch (error) {
      console.error('更新iframe内容失败:', error);
    }
  };

  // 滚动到最新步骤
  const scrollToLatestStep = () => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  };

  // 生成HTML
  const generateHTML = async () => {
    if (!prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    setIsGenerating(true);
    setGeneratedHtml('');
    setGenerationSteps([]);
    
    try {
      const response = await fetch('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedHtml(data.html);
        setGenerationSteps(prev => [...prev, { 
          step: '生成完成', 
          content: 'HTML代码已生成', 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (error) {
      console.error('生成错误:', error);
      setGenerationSteps(prev => [...prev, { 
        step: '错误', 
        content: `生成失败: ${error.message}`, 
        timestamp: new Date().toLocaleTimeString(),
        error: true 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 部署网站
  const deployWebsite = async () => {
    if (!generatedHtml) {
      alert('请先生成HTML内容');
      return;
    }

    try {
      const response = await fetch('/api/websites/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          html: generatedHtml,
          path: deploymentPath || undefined,
          name: deploymentName || deploymentPath || '新网站',
          description: deploymentDescription
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDeploymentSuccess({
          path: data.path,
          url: data.url,
          message: data.message
        });
        
        // 重置部署表单
        setDeploymentPath('');
        setDeploymentName('');
        setDeploymentDescription('');
        
        setGenerationSteps(prev => [...prev, { 
          step: '部署成功', 
          content: `网站已部署到: ${data.url}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        throw new Error(data.error || '部署失败');
      }
    } catch (error) {
      console.error('部署错误:', error);
      setDeploymentSuccess({
        error: true,
        message: error.message
      });
      
      setGenerationSteps(prev => [...prev, { 
        step: '部署错误', 
        content: `部署失败: ${error.message}`, 
        timestamp: new Date().toLocaleTimeString(),
        error: true 
      }]);
    }
  };

  // 当生成的HTML变化时，更新iframe
  useEffect(() => {
    if (generatedHtml && showPreview) {
      updateIframeContent();
    }
  }, [generatedHtml, showPreview]);

  // 滚动到最新步骤
  useEffect(() => {
    scrollToLatestStep();
  }, [generationSteps]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* 左侧：生成器和步骤显示 */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">AI网站生成器</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入您的网站需求
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：生成一个科技公司官网，包含首页、产品展示、联系我们等页面..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
              />
            </div>
            
            <button
              onClick={generateHTML}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isGenerating ? '生成中...' : '生成网站'}
            </button>
            
            {isGenerating && (
              <div className="flex items-center justify-center space-x-2 text-indigo-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span>AI正在生成网站...</span>
              </div>
            )}
          </div>
        </div>

        {/* 部署表单 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">部署网站</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                网站名称 (可选)
              </label>
              <input
                type="text"
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                placeholder="给网站起个名字"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                网站描述 (可选)
              </label>
              <input
                type="text"
                value={deploymentDescription}
                onChange={(e) => setDeploymentDescription(e.target.value)}
                placeholder="网站的简短描述"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自定义路径 (可选)
              </label>
              <input
                type="text"
                value={deploymentPath}
                onChange={(e) => setDeploymentPath(e.target.value)}
                placeholder="例如: my-website (留空则自动生成)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={deployWebsite}
              disabled={!generatedHtml}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              部署网站
            </button>
            
            {deploymentSuccess && (
              <div className={`p-3 rounded-md ${deploymentSuccess.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {deploymentSuccess.error 
                  ? `部署失败: ${deploymentSuccess.message}`
                  : `部署成功! 访问地址: ${deploymentSuccess.url}`
                }
              </div>
            )}
          </div>
        </div>

        {/* 生成步骤显示 */}
        <div className="bg-white rounded-lg shadow-md p-6 h-64">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">生成步骤</h3>
          <div 
            ref={stepsContainerRef}
            className="h-48 overflow-y-auto border rounded-md p-3 bg-gray-50"
          >
            {generationSteps.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无生成步骤</p>
            ) : (
              <div className="space-y-2">
                {generationSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm ${
                      step.error ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    <div className="font-medium">{step.step} <span className="text-xs text-gray-500">({step.timestamp})</span></div>
                    <div>{step.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：预览 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">实时预览</h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>
        
        {showPreview ? (
          <div className="bg-white rounded-lg shadow-md p-4 h-[calc(100%-2rem)]">
            {generatedHtml ? (
              <iframe
                ref={iframeRef}
                title="website-preview"
                className="w-full h-full border border-gray-300 rounded"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                生成的网站将在此预览
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 h-[calc(100%-2rem)] flex items-center justify-center text-gray-500">
            预览已隐藏
          </div>
        )}
        
        {/* 新窗口打开按钮 */}
        {generatedHtml && (
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>网站预览</title>
                  <base target="_blank">
                </head>
                <body>
                  ${generatedHtml}
                </body>
                </html>
              `);
              newWindow.document.close();
            }}
            className="w-full bg-indigo-100 text-indigo-800 py-2 px-4 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            在新窗口中打开预览
          </button>
        )}
      </div>
    </div>
  );
};

export default StreamingGenerator;