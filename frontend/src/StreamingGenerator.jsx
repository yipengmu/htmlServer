import { useState, useRef, useEffect } from 'react';

const StreamingGenerator = ({ onGenerateComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const logsEndRef = useRef(null);
  const iframeRef = useRef(null);

  // 自动滚动到最新的日志
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 更新iframe内容
  useEffect(() => {
    if (generatedHtml && iframeRef.current) {
      updateIframeContent();
    }
  }, [generatedHtml]);

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

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setLogs([{ type: 'info', message: '开始处理请求...', timestamp: new Date() }]);
    setGeneratedHtml('');

    try {
      const response = await fetch('/api/websites/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) {
        throw new Error('浏览器不支持流式响应');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // 处理完整的事件
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // 保留不完整的最后一行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamData(data);
            } catch (e) {
              console.error('解析流数据错误:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('流式请求错误:', error);
      addLog('error', `请求错误: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleStreamData = (data) => {
    switch (data.type) {
      case 'start':
        addLog('info', data.message);
        break;
      case 'step':
        addLog('info', data.message);
        break;
      case 'stream':
        // 实时更新生成的内容（可选）
        break;
      case 'result':
        setGeneratedHtml(data.html);
        addLog('success', 'HTML生成完成');
        if (onGenerateComplete) {
          onGenerateComplete(data.html);
        }
        break;
      case 'error':
        addLog('error', data.message);
        setIsLoading(false);
        break;
      case 'end':
        addLog('info', '处理完成');
        setIsLoading(false);
        break;
      default:
        console.log('未知数据类型:', data);
    }
  };

  const addLog = (type, message) => {
    const timestamp = new Date();
    setLogs(prevLogs => [
      ...prevLogs,
      { type, message, timestamp }
    ]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 输入区域 */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow">
        <div className="mb-3">
          <label htmlFor="streaming-prompt" className="block text-sm font-medium text-gray-700 mb-2">
            输入您的需求提示词
          </label>
          <textarea
            id="streaming-prompt"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="例如：创建一个展示科技产品的网站，包含产品介绍、特性说明和联系方式..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              prompt.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
            } transition duration-300`}
          >
            {isLoading ? '生成中...' : '生成HTML'}
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className={`px-4 py-2 rounded-lg font-medium ${
              logs.length > 0
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } transition duration-300`}
          >
            清空日志
          </button>
        </div>
      </div>

      {/* 主内容区域 - 分为左右两列 */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4">
        {/* 左侧：AI生成过程日志 */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">AI生成过程</h3>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start">
                        <div className="text-xs text-gray-500 w-16 mr-2 mt-1">
                          {formatTime(log.timestamp)}
                        </div>
                        <div className={`flex-1 p-2 rounded ${
                          log.type === 'info' ? 'bg-blue-50 text-blue-800' :
                          log.type === 'success' ? 'bg-green-50 text-green-800' :
                          log.type === 'error' ? 'bg-red-50 text-red-800' :
                          'bg-gray-50 text-gray-800'
                        }`}>
                          <span className="font-medium">
                            {log.type === 'info' ? '信息: ' :
                             log.type === 'success' ? '成功: ' :
                             log.type === 'error' ? '错误: ' : ''}
                          </span>
                          {log.message}
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>等待开始生成...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：实时HTML预览 */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">实时预览</h3>
              {generatedHtml && (
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    newWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <base target="_blank">
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      </head>
                      <body>
                        ${generatedHtml}
                      </body>
                      </html>
                    `);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  在新窗口打开
                </button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              {generatedHtml ? (
                <iframe
                  ref={iframeRef}
                  title="preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  onLoad={updateIframeContent}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-600">生成的HTML将在此处预览</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingGenerator;