import React, { useState, useEffect } from 'react';

const WebsiteManager = ({ refreshWebsites }) => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // 获取网站列表
  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/websites/list');
      const data = await response.json();
      if (data.success) {
        setWebsites(data.websites);
      }
    } catch (error) {
      console.error('获取网站列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除网站
  const deleteWebsite = async (websiteId) => {
    if (window.confirm('确定要删除这个网站吗？此操作不可撤销。')) {
      try {
        const response = await fetch(`/api/websites/${websiteId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchWebsites();
          if (selectedWebsite && selectedWebsite.id === websiteId) {
            setSelectedWebsite(null);
          }
        }
      } catch (error) {
        console.error('删除网站失败:', error);
      }
    }
  };

  // 打开编辑模态框
  const openEditModal = (website) => {
    setEditForm({
      name: website.name,
      description: website.description
    });
    setSelectedWebsite(website);
    setShowEditModal(true);
  };

  // 更新网站配置
  const updateWebsiteConfig = async () => {
    try {
      const response = await fetch(`/api/websites/${selectedWebsite.id}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        fetchWebsites();
      }
    } catch (error) {
      console.error('更新网站配置失败:', error);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">已部署的网站</h2>
          <button
            onClick={fetchWebsites}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            刷新
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">暂无已部署的网站</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map((website) => (
              <div key={website.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800 truncate">{website.name}</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{website.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(website.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      查看
                    </a>
                    <button
                      onClick={() => openEditModal(website)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteWebsite(website.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 编辑网站模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">编辑网站</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站名称
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站描述
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={updateWebsiteConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManager;