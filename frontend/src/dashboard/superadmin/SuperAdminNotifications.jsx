import React, { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoTrashOutline,
  IoPencilOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'maintenance',
    title: '',
    message: '',
    severity: 'medium',
    endDate: '',
    actionUrl: '',
    actionLabel: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/super-admin/notifications/all?isActive=true');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      alert('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Title and message are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/super-admin/notifications/${editingId}`, formData);
        alert('Notification updated successfully');
      } else {
        await api.post('/api/super-admin/notifications', formData);
        alert('Maintenance message created successfully');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        type: 'maintenance',
        title: '',
        message: '',
        severity: 'medium',
        endDate: '',
        actionUrl: '',
        actionLabel: '',
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to save notification:', err);
      alert('Failed to save notification: ' + err.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await api.delete(`/api/super-admin/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      alert('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleEdit = (notif) => {
    setEditingId(notif._id);
    setFormData({
      type: notif.type,
      title: notif.title,
      message: notif.message,
      severity: notif.severity,
      endDate: notif.endDate ? new Date(notif.endDate).toISOString().split('T')[0] : '',
      actionUrl: notif.actionUrl || '',
      actionLabel: notif.actionLabel || '',
    });
    setShowModal(true);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <IoAlertCircleOutline className="text-red-500 text-xl" />;
      case 'high':
        return <IoWarningOutline className="text-orange-500 text-xl" />;
      case 'medium':
        return <IoCheckmarkCircleOutline className="text-blue-500 text-xl" />;
      default:
        return <IoCheckmarkCircleOutline className="text-green-500 text-xl" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Messages</h1>
          <p className="text-gray-600 mt-2">Create and manage notifications for all users</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: 'maintenance',
              title: '',
              message: '',
              severity: 'medium',
              endDate: '',
              actionUrl: '',
              actionLabel: '',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <IoAddOutline className="text-xl" />
          New Message
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No active notifications</p>
            <p className="text-sm">Create a new maintenance message to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Severity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expires</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <tr key={notif._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{notif.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{notif.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(notif.severity)}
                        <span className="capitalize text-sm text-gray-700">{notif.severity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {notif.endDate ? new Date(notif.endDate).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(notif)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <IoPencilOutline className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(notif._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <IoTrashOutline className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Message' : 'Create Maintenance Message'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Server Maintenance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter the maintenance message"
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="alert">Alert</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.actionLabel}
                  onChange={(e) => setFormData({ ...formData, actionLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Learn More"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
