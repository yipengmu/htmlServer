import { useState, useEffect } from 'react'
import './App.css'
import StreamingGenerator from './StreamingGenerator'

function App() {
  const [prompt, setPrompt] = useState('')
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [customPath, setCustomPath] = useState('')
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('streaming') // 'streaming' or 'classic'

  // 获取已部署的网站列表
  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites/list')
      const data = await response.json()
      if (data.success) {
        setWebsites(data.websites)
      }
    } catch (error) {
      console.error('Fetch websites error:', error)
    }
  }

  // 组件加载时获取网站列表
  useEffect(() => {
    fetchWebsites()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      
      const data = await response.json()
      if (data.success) {
        setGeneratedHtml(data.html)
      } else {
        alert('生成失败: ' + data.error)
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('生成过程中出现错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    if (!generatedHtml) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/websites/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          html: generatedHtml,
          path: customPath || undefined
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setDeployedUrl(data.url)
        alert('部署成功!')
        // 刷新网站列表
        fetchWebsites()
        // 清空表单
        setCustomPath('')
      } else {
        alert('部署失败: ' + data.error)
      }
    } catch (error) {
      console.error('Deployment error:', error)
      alert('部署过程中出现错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (websiteId) => {
    if (!window.confirm('确定要删除这个网站吗？')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.success) {
        alert('删除成功!')
        // 刷新网站列表
        fetchWebsites()
      } else {
        alert('删除失败: ' + data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('删除过程中出现错误')
    } finally {
      setLoading(false)
    }
  }

  const handleStreamingGenerateComplete = (html) => {
    setGeneratedHtml(html)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
            现代化HTML托管平台
          </h1>
          <p className="text-gray-600 mb-4">
            基于AI提示词快速生成美观的HTML网站并一键部署
          </p>
        </header>

        {/* 标签页切换 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('streaming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'streaming'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                流式生成器（推荐）
              </button>
              <button
                onClick={() => setActiveTab('classic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classic'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                经典生成器
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'streaming' ? (
          /* 流式生成器界面 */
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <StreamingGenerator onGenerateComplete={handleStreamingGenerateComplete} />
          </div>
        ) : (
          /* 经典生成器界面 */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 左侧：输入和生成区域 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">生成HTML</h2>
              
              <div className="mb-6">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  输入您的需求提示词
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如：创建一个展示科技产品的网站，包含产品介绍、特性说明和联系方式..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  prompt.trim() && !loading
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } transition duration-300`}
              >
                {loading ? '生成中...' : '生成HTML'}
              </button>
            </div>

            {/* 右侧：预览和部署区域 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">预览与部署</h2>
              
              {generatedHtml ? (
                <>
                  <div className="mb-6">
                    <label htmlFor="customPath" className="block text-sm font-medium text-gray-700 mb-2">
                      自定义访问路径（可选）
                    </label>
                    <input
                      type="text"
                      id="customPath"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例如：my-awesome-site"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => {
                        const newWindow = window.open()
                        newWindow.document.write(generatedHtml)
                      }}
                      disabled={loading}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        loading 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      } transition duration-300`}
                    >
                      {loading ? '处理中...' : '预览'}
                    </button>
                    
                    <button
                      onClick={handleDeploy}
                      disabled={loading}
                      className={`flex-1 py-2 px-4 rounded-lg ${
                        loading 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } transition duration-300`}
                    >
                      {loading ? '部署中...' : '部署网站'}
                    </button>
                  </div>
                  
                  {deployedUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">网站部署成功!</p>
                      <a 
                        href={deployedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline mt-2 inline-block"
                      >
                        访问您的网站
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    请输入提示词并生成HTML内容
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 已部署网站列表 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">已部署网站</h2>
          
          {websites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {websites.map((website) => (
                <div key={website.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{website.path}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        创建时间: {new Date(website.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        文件大小: {Math.round(website.fileSize / 1024 * 100) / 100} KB
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(website.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <a 
                      href={`/websites/${website.path}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      访问网站
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无已部署的网站
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App