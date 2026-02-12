import React, { useState, useEffect } from 'react';
import {
  IoSettingsOutline,
  IoSaveOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
} from 'react-icons/io5';
import api from '../../api/axios';

const defaultPlatformContent = {
  siteName: 'WorkPro',
  hero: {
    badge: '',
    headline: '',
    subheadline: '',
  },
  features: [],
  stats: {
    uptime: '',
    uptimeLabel: '',
    companiesValue: '',
    companiesLabel: '',
    usersValue: '',
    usersLabel: '',
    tasksValue: '',
    tasksLabel: '',
  },
};

const normalizePlatformContent = (data) => ({
  siteName: data?.siteName ?? defaultPlatformContent.siteName,
  hero: {
    badge: data?.hero?.badge ?? defaultPlatformContent.hero.badge,
    headline: data?.hero?.headline ?? defaultPlatformContent.hero.headline,
    subheadline: data?.hero?.subheadline ?? defaultPlatformContent.hero.subheadline,
  },
  features: Array.isArray(data?.features) ? data.features : defaultPlatformContent.features,
  stats: {
    uptime: data?.stats?.uptime ?? defaultPlatformContent.stats.uptime,
    uptimeLabel: data?.stats?.uptimeLabel ?? defaultPlatformContent.stats.uptimeLabel,
    companiesValue: data?.stats?.companiesValue ?? defaultPlatformContent.stats.companiesValue,
    companiesLabel: data?.stats?.companiesLabel ?? defaultPlatformContent.stats.companiesLabel,
    usersValue: data?.stats?.usersValue ?? defaultPlatformContent.stats.usersValue,
    usersLabel: data?.stats?.usersLabel ?? defaultPlatformContent.stats.usersLabel,
    tasksValue: data?.stats?.tasksValue ?? defaultPlatformContent.stats.tasksValue,
    tasksLabel: data?.stats?.tasksLabel ?? defaultPlatformContent.stats.tasksLabel,
  },
});

const PlatformContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [platformContent, setPlatformContent] = useState(defaultPlatformContent);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlatformContent();
  }, []);

  const fetchPlatformContent = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/platform-content');
      setPlatformContent(normalizePlatformContent(response.data));
    } catch (err) {
      console.error('Failed to fetch platform content:', err);
      showMessage('error', 'Failed to load platform content');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(
        '/api/super-admin/platform-content',
        platformContent
      );
      showMessage('success', 'Platform content updated successfully! Changes are now live on the landing page.');
    } catch (err) {
      console.error('Failed to save platform content:', err);
      showMessage('error', 'Failed to save platform content');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Content</h1>
          <p className="text-gray-600 mt-2">Edit hero section, features, and statistics displayed on the public landing page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoSaveOutline className="w-5 h-5" />
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <IoCheckmarkCircle className="w-5 h-5" />
          ) : (
            <IoAlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Hero Section Settings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoSettingsOutline className="w-6 h-6 text-purple-600" />
          Hero Section
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={platformContent.siteName}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  siteName: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., WorkPro"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Badge Text
            </label>
            <input
              type="text"
              value={platformContent.hero.badge}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  hero: { ...platformContent.hero, badge: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Trusted by Companies"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Headline
            </label>
            <input
              type="text"
              value={platformContent.hero.headline}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  hero: { ...platformContent.hero, headline: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Everything you need to scale your company."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subheadline
            </label>
            <textarea
              value={platformContent.hero.subheadline}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  hero: { ...platformContent.hero, subheadline: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., WorkPro is the unified operating system for your team..."
            />
          </div>
        </div>
      </div>

      {/* Stats Labels Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <IoSettingsOutline className="w-6 h-6 text-purple-600" />
          Statistics Labels
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure how statistics are displayed. The actual numbers (companies, users, tasks) are calculated automatically.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Companies Label
            </label>
            <input
              type="text"
              value={platformContent.stats.companiesLabel}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, companiesLabel: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Global Companies"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Companies Value
            </label>
            <input
              type="text"
              value={platformContent.stats.companiesValue}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, companiesValue: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 4+"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Users Label
            </label>
            <input
              type="text"
              value={platformContent.stats.usersLabel}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, usersLabel: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Active Users"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Users Value
            </label>
            <input
              type="text"
              value={platformContent.stats.usersValue}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, usersValue: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 12+"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tasks Completed Label
            </label>
            <input
              type="text"
              value={platformContent.stats.tasksLabel}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, tasksLabel: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Tasks Completed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tasks Completed Value
            </label>
            <input
              type="text"
              value={platformContent.stats.tasksValue}
              onChange={(e) =>
                setPlatformContent({
                  ...platformContent,
                  stats: { ...platformContent.stats, tasksValue: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 0+"
            />
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Preview Landing Page
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          <IoSaveOutline className="w-6 h-6" />
          {saving ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>
    </div>
  );
};

export default PlatformContent;
