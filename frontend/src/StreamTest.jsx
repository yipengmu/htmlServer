import { useState } from 'react';

const StreamTest = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const testStream = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLogs([]);
    
    try {
      const response = await fetch('/api/websites/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: '创建一个简单的个人博客网站' 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLogs(prev => [...prev, { type: 'info', message: '流已完成' }]);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // 处理完整的事件
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // 保留不完整的最后一行
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setLogs(prev => [...prev, data]);
            } catch (e) {
              console.error('解析数据错误:', e);
            }
          }
        }
      }
    } catch (error) {
      setLogs(prev => [...prev, { type: 'error', message: `错误: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">流式API测试</h1>
      <button
        onClick={testStream}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? '测试中...' : '开始测试'}
      </button>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">日志:</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className={`p-2 rounded ${
              log.type === 'info' ? 'bg-blue-100' :
              log.type === 'error' ? 'bg-red-100' :
              log.type === 'success' ? 'bg-green-100' :
              'bg-gray-100'
            }`}>
              <span className="font-medium">{log.type}: </span>
              {log.message || log.content || JSON.stringify(log)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreamTest;