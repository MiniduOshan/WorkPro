import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoMegaphoneOutline, 
  IoAddOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCloseCircleOutline,
  IoPinOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

export default function Announcements() {
  const [companyId, setCompanyId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
  const [companyRole, setCompanyRole] = useState(localStorage.getItem('companyRole') || '');
  const [viewItem, setViewItem] = useState(null);

  const canManageAnnouncements = companyRole === 'manager' || companyRole === 'owner';

  const sampleAnnouncements = () => ([]);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    const storedRole = localStorage.getItem('companyRole');
    if (storedRole) setCompanyRole(storedRole);
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      fetchAnnouncements(storedCompanyId);
    } else {
      setAnnouncements(sampleAnnouncements());
      setLoading(false);
    }
  }, []);

  const fetchAnnouncements = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/announcements', { params: { companyId: id } });
      setAnnouncements(data.map(a => ({
        _id: a._id,
        title: a.title,
        content: a.message,
        author: `${a.createdBy?.firstName || ''} ${a.createdBy?.lastName || ''}`.trim(),
        authorRole: 'Manager',
        priority: a.priority || 'normal',
        createdAt: a.createdAt,
        pinned: !!a.pinned,
      })));
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!canManageAnnouncements) return;
    try {
      await api.post('/api/announcements', { companyId, title: newAnnouncement.title, message: newAnnouncement.content, priority: newAnnouncement.priority });
      setShowAddModal(false);
      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      fetchAnnouncements(companyId);
    } catch (err) {
      console.error('Failed to add announcement:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!canManageAnnouncements) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const openView = async (id) => {
    try {
      const { data } = await api.get(`/api/announcements/${id}`);
      setViewItem({
        _id: data._id,
        title: data.title,
        content: data.message,
        author: `${data.createdBy?.firstName || ''} ${data.createdBy?.lastName || ''}`.trim(),
        priority: data.priority,
        createdAt: data.createdAt,
        pinned: !!data.pinned,
      });
    } catch (err) {
      console.error('Failed to load announcement:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'normal':
        return 'border-blue-300 bg-blue-50';
      case 'low':
        return 'border-slate-300 bg-slate-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Announcements</h1>
            <p className="text-slate-600">Company-wide updates and news</p>
          </div>
          {canManageAnnouncements && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-95"
            >
              <IoAddOutline className="text-xl" />
              <span>New Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grow overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16">
            <IoMegaphoneOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No announcements yet</h3>
            <p className="text-slate-500 mb-6">Create your first announcement to keep your team informed</p>
            {canManageAnnouncements && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <IoAddOutline className="text-xl" />
                <span>New Announcement</span>
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-2xl border-2 ${getPriorityColor(announcement.priority)} p-6 hover:shadow-xl transition-all duration-300 ${announcement.pinned ? 'ring-2 ring-blue-300' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {announcement.pinned && (
                      <IoPinOutline className="text-blue-600 text-xl mt-1" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <IoPersonOutline />
                          <span>{announcement.author}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{announcement.authorRole}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <IoTimeOutline />
                          <span>{formatTimeAgo(announcement.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 ${getPriorityBadge(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>

                {/* Content */}
                <p className="text-slate-700 leading-relaxed mb-4">
                  {announcement.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  <button onClick={() => openView(announcement._id)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm">
                    View
                  </button>
                  {canManageAnnouncements && (
                    <button onClick={() => handleDelete(announcement._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && canManageAnnouncements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Create Announcement</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <IoCloseCircleOutline className="text-2xl text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddAnnouncement}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Write your announcement here..."
                  rows="6"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['high', 'normal', 'low'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setNewAnnouncement({ ...newAnnouncement, priority })}
                      className={`px-4 py-3 rounded-xl border-2 transition-all font-semibold capitalize ${
                        newAnnouncement.priority === priority
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-blue-300 text-slate-700'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* View Announcement Modal */}
          {viewItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">{viewItem.title}</h2>
                  <button onClick={() => setViewItem(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <IoCloseCircleOutline className="text-2xl text-slate-400" />
                  </button>
                </div>
                <div className="text-sm text-slate-500 mb-4">By {viewItem.author} · {new Date(viewItem.createdAt).toLocaleString()}</div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{viewItem.content}</p>
              </div>
            </div>
          )}
    </div>
  );
}
