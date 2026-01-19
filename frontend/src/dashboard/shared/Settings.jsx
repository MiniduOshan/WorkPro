import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  IoSettingsOutline,
  IoBusinessOutline,
  IoNotificationsOutline,
  IoLockClosedOutline,
  IoColorPaletteOutline,
  IoSaveOutline,
  IoPersonOutline,
  IoGlobeOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Settings() {
  const theme = useThemeColors();
  const isManager = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard/manager');
  const [activeTab, setActiveTab] = useState(isManager ? 'company' : 'notifications');
  const [companySettings, setCompanySettings] = useState({
    name: '',
    description: '',
    website: '',
    industry: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    teamMessages: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'team',
    showEmail: true,
    showPhone: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      try {
        const { data } = await api.get(`/api/companies/${companyId}`);
        setCompanySettings({
          name: data.name || '',
          description: data.description || '',
          website: data.website || '',
          industry: data.industry || ''
        });
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    }
  };

  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem('companyId');
    setLoading(true);
    try {
      await api.put(`/api/companies/${companyId}`, companySettings);
      alert('Company settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await api.put('/api/users/notification-settings', notificationSettings);
      alert('Notification settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacySettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await api.put('/api/users/privacy-settings', privacySettings);
      alert('Privacy settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    ...(isManager ? [{ id: 'company', label: 'Company', icon: IoBusinessOutline }] : []),
    { id: 'notifications', label: 'Notifications', icon: IoNotificationsOutline },
    { id: 'privacy', label: 'Privacy', icon: IoLockClosedOutline },
    { id: 'appearance', label: 'Appearance', icon: IoColorPaletteOutline }
  ];

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${theme.bgPrimary} rounded-xl flex items-center justify-center`}>
            <IoSettingsOutline className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            <p className="text-slate-600">Manage your workspace preferences</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? `${theme.bgPrimary} text-white shadow-lg`
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
                  }`}
                >
                  <Icon className="text-xl" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Company Settings (Managers only) */}
          {isManager && activeTab === 'company' && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Company Information</h2>
              <form onSubmit={handleSaveCompanySettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={companySettings.description}
                    onChange={(e) => setCompanySettings({ ...companySettings, description: e.target.value })}
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none resize-none`}
                    placeholder="Brief description of your company"
                    rows="4"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none`}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={companySettings.industry}
                      onChange={(e) => setCompanySettings({ ...companySettings, industry: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${theme.bgPrimary} text-white px-6 py-3 rounded-xl font-semibold ${theme.bgPrimaryHover} transition flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <IoSaveOutline className="text-xl" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Notification Preferences</h2>
              <form onSubmit={handleSaveNotificationSettings} className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-slate-600">
                          Receive updates about {key.toLowerCase()}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${theme.primaryRing} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${theme.primary}`}></div>
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${theme.bgPrimary} text-white px-6 py-3 rounded-xl font-semibold ${theme.bgPrimaryHover} transition flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <IoSaveOutline className="text-xl" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Privacy Settings</h2>
              <form onSubmit={handleSavePrivacySettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-800">Show Email Address</p>
                      <p className="text-sm text-slate-600">Let team members see your email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                        className="sr-only peer"
                      />
                        <div className={`w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${theme.primaryRing} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${theme.primary}`}></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-800">Show Phone Number</p>
                      <p className="text-sm text-slate-600">Let team members see your phone</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${theme.primaryRing} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${theme.primary}`}></div>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${theme.bgPrimary} text-white px-6 py-3 rounded-xl font-semibold ${theme.bgPrimaryHover} transition flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <IoSaveOutline className="text-xl" />
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </form>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className={`p-6 border-2 border-${theme.primary} bg-${theme.primaryLight} rounded-xl text-center hover:shadow-lg transition`}>
                      <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-2"></div>
                      <p className={`font-semibold text-${theme.primary}`}>Light</p>
                    </button>
                    <button className="p-6 border-2 border-slate-200 rounded-xl text-center hover:shadow-lg transition">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg mx-auto mb-2"></div>
                      <p className="font-semibold text-slate-600">Dark</p>
                    </button>
                    <button className="p-6 border-2 border-slate-200 rounded-xl text-center hover:shadow-lg transition">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-800 rounded-lg mx-auto mb-2"></div>
                      <p className="font-semibold text-slate-600">Auto</p>
                    </button>
                  </div>
                </div>
                <p className={`text-sm text-slate-500 bg-${theme.primaryLight} border border-${theme.primaryBorderLight} rounded-xl p-4`}>
                  🎨 More appearance customization options coming soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
