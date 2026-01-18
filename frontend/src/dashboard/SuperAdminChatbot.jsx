import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { IoAddOutline, IoTrashOutline, IoSaveOutline, IoReloadOutline } from 'react-icons/io5';

const SuperAdminChatbot = () => {
  const [configs, setConfigs] = useState([]);
  const [selectedType, setSelectedType] = useState('landing');
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (configs.length > 0) {
      const config = configs.find(c => c.type === selectedType);
      setCurrentConfig(config || createEmptyConfig(selectedType));
    }
  }, [selectedType, configs]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/chatbot/admin/configs');
      setConfigs(data);
      if (data.length > 0) {
        setCurrentConfig(data.find(c => c.type === selectedType) || createEmptyConfig(selectedType));
      } else {
        setCurrentConfig(createEmptyConfig('landing'));
      }
    } catch (error) {
      console.error('Failed to fetch chatbot configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyConfig = (type) => ({
    type,
    greeting: '',
    responses: [],
    fallbackResponse: '',
    isActive: true,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/api/chatbot/admin/config/${selectedType}`, currentConfig);
      await fetchConfigs();
      alert('Chatbot configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addResponse = () => {
    setCurrentConfig({
      ...currentConfig,
      responses: [
        ...currentConfig.responses,
        { keywords: [], response: '', priority: 5 }
      ]
    });
  };

  const updateResponse = (index, field, value) => {
    const updatedResponses = [...currentConfig.responses];
    if (field === 'keywords') {
      updatedResponses[index][field] = value.split(',').map(k => k.trim()).filter(Boolean);
    } else {
      updatedResponses[index][field] = value;
    }
    setCurrentConfig({ ...currentConfig, responses: updatedResponses });
  };

  const removeResponse = (index) => {
    const updatedResponses = currentConfig.responses.filter((_, i) => i !== index);
    setCurrentConfig({ ...currentConfig, responses: updatedResponses });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Chatbot Management</h1>
          <p className="text-slate-600">Configure chatbot responses for different user types</p>
        </div>

        {/* Type Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">Chatbot Type</label>
          <div className="flex gap-3">
            {['landing', 'manager', 'employee'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Page
              </button>
            ))}
          </div>
        </div>

        {currentConfig && (
          <>
            {/* Basic Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Basic Settings</h2>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <input
                    type="checkbox"
                    checked={currentConfig.isActive}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Active
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Greeting Message
                </label>
                <input
                  type="text"
                  value={currentConfig.greeting || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, greeting: e.target.value })}
                  placeholder="Hi! How can I help you today?"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Fallback Response
                </label>
                <textarea
                  value={currentConfig.fallbackResponse || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, fallbackResponse: e.target.value })}
                  placeholder="I'm not sure about that. Can you try rephrasing your question?"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This message is shown when no keyword matches are found
                </p>
              </div>
            </div>

            {/* Responses */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Keyword Responses</h2>
                <button
                  onClick={addResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <IoAddOutline /> Add Response
                </button>
              </div>

              <div className="space-y-4">
                {currentConfig.responses.map((response, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-700">Response #{index + 1}</h3>
                      <button
                        onClick={() => removeResponse(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={response.keywords.join(', ')}
                        onChange={(e) => updateResponse(index, 'keywords', e.target.value)}
                        placeholder="price, pricing, cost"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Response Message
                      </label>
                      <textarea
                        value={response.response}
                        onChange={(e) => updateResponse(index, 'response', e.target.value)}
                        placeholder="Our pricing starts at..."
                        rows="3"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Priority (higher = matches first)
                      </label>
                      <input
                        type="number"
                        value={response.priority}
                        onChange={(e) => updateResponse(index, 'priority', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}

                {currentConfig.responses.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No responses configured yet.</p>
                    <p className="text-sm">Click "Add Response" to create keyword-based responses.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={fetchConfigs}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center gap-2"
              >
                <IoReloadOutline /> Reload
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <IoSaveOutline /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminChatbot;
