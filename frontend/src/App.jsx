import React, { useState, useEffect } from 'react';
import StreamingGenerator from './StreamingGenerator';
import WebsiteManager from './WebsiteManager';

const App = () => {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">AI网站生成器</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'generator'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                生成器
              </button>
              <button
                onClick={() => setActiveTab('websites')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'websites'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                网站管理
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' ? (
          <StreamingGenerator />
        ) : (
          <WebsiteManager />
        )}
      </main>
    </div>
  );
};

export default App;
