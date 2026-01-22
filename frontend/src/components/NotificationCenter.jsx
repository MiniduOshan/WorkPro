import React, { useState, useEffect } from 'react';
import { 
  IoNotificationsOutline, 
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import api from '../api/axios';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      const { data } = await api.get('/api/super-admin/notifications');
      const notifArray = Array.isArray(data) ? data : [];
      setNotifications(notifArray);
      const unread = notifArray.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await api.post(`/api/super-admin/notifications/${notificationId}/read`, {});
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getIcon = (severity) => {
    switch(severity) {
      case 'critical':
        return <IoAlertCircleOutline className="text-2xl text-red-500" />;
      case 'high':
        return <IoWarningOutline className="text-2xl text-orange-500" />;
      case 'medium':
        return <IoInformationCircleOutline className="text-2xl text-blue-500" />;
      default:
        return <IoCheckmarkCircleOutline className="text-2xl text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <IoNotificationsOutline className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoCloseOutline className="text-xl text-gray-600" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <IoNotificationsOutline className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                    notif.severity === 'critical' ? 'border-red-500' :
                    notif.severity === 'high' ? 'border-orange-500' :
                    notif.severity === 'medium' ? 'border-blue-500' :
                    'border-green-500'
                  } ${!notif.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 truncate">
                            {notif.title}
                            {!notif.isRead && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      {notif.actionUrl && (
                        <a
                          href={notif.actionUrl}
                          className="inline-block mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notif.actionLabel || 'Learn More'}
                        </a>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
