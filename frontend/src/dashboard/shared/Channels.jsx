import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoAddOutline,
  IoChatbubblesOutline,
  IoSendOutline,
  IoAttachOutline,
  IoEllipsisVerticalOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoRadioButtonOnOutline,
  IoLockClosedOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Channels() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [channels, setChannels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState('public');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  const loadChannels = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const { data } = await api.get('/api/channels', { params: { companyId } });
      setChannels(data);
      if (!selected && data[0]) setSelected(data[0]);
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ch) => {
    if (!companyId) return;
    try {
      const { data } = await api.get(`/api/channels/${ch._id}/messages`);
      setSelected({ ...ch, messages: data });
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => { loadChannels(); }, [companyId]);
  useEffect(() => { if (selected && companyId) loadMessages(selected); }, [selected?._id, companyId]);

  const send = async (e) => {
    e.preventDefault();
    if (!selected || !message.trim()) return;
    try {
      await api.post(`/api/channels/${selected._id}/messages`, { text: message });
      setMessage('');
      loadMessages(selected);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/channels', { 
        name: newChannelName, 
        companyId,
        type: newChannelType 
      });
      setNewChannelName('');
      setShowAddModal(false);
      loadChannels();
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Group Works</h1>
            <p className="text-slate-600">Collaborate with your team in real-time</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}
          >
            <IoAddOutline className="text-xl" />
            <span>New Channel</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow flex overflow-hidden">
        {/* Channels Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search channels..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="grow overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${theme.primary}`}></div>
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8">
                <IoChatbubblesOutline className="mx-auto text-4xl text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No channels yet</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className={`mt-4 text-sm text-${theme.primary} font-semibold hover:underline`}
                >
                  Create your first channel
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Channels</p>
                {channels.map((channel) => (
                  <button
                    key={channel._id}
                    onClick={() => setSelected(channel)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                      selected?._id === channel._id
                        ? `bg-${theme.primaryLight} text-${theme.primary} font-semibold`
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IoRadioButtonOnOutline className="text-lg shrink-0" />
                    <span className="truncate grow">{channel.name}</span>
                    {channel.type === 'private' && (
                      <IoLockClosedOutline className="text-sm text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="grow flex flex-col bg-slate-50">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <IoChatbubblesOutline className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {selected.name}
                      {selected.type === 'private' && (
                        <IoLockClosedOutline className="text-sm text-slate-400" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">
                      <IoPeopleOutline className="inline mr-1" />
                      {selected.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <IoEllipsisVerticalOutline className="text-xl text-slate-500" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {(selected.messages || []).length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <IoChatbubblesOutline className="mx-auto text-6xl text-slate-300 mb-3" />
                      <h4 className="text-lg font-semibold text-slate-600 mb-1">No messages yet</h4>
                      <p className="text-sm text-slate-500">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  (selected.messages || []).map((msg, i) => {
                    const currentUser = localStorage.getItem('userId');
                    const isOwnMessage = msg.user?._id === currentUser;
                    
                    return (
                      <div
                        key={i}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} animate-fadeIn`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white ${
                          isOwnMessage 
                            ? 'bg-linear-to-br from-green-500 to-emerald-600'
                            : 'bg-linear-to-br from-blue-500 to-purple-600'
                        }`}>
                          {msg.user?.profilePic ? (
                            <img src={msg.user.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getUserInitials(msg.user)
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-200'
                          }`}>
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold text-blue-600 mb-1">
                                {msg.user?.firstName} {msg.user?.lastName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 px-2">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <form onSubmit={send} className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-500"
                    title="Attach file"
                  >
                    <IoAttachOutline className="text-xl" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message #${selected.name}`}
                    className="grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    <IoSendOutline className="text-lg" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <IoChatbubblesOutline className="mx-auto text-6xl text-slate-300 mb-3" />
                <h4 className="text-lg font-semibold text-slate-600 mb-1">Select a channel</h4>
                <p className="text-sm text-slate-500">Choose a channel to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Channel</h2>
            <form onSubmit={createChannel}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., general, team-updates"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Channel Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('public')}
                    className={`px-4 py-3 rounded-xl border-2 transition-all font-semibold ${
                      newChannelType === 'public'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-blue-300 text-slate-700'
                    }`}
                  >
                    <IoRadioButtonOnOutline className="inline mr-2" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('private')}
                    className={`px-4 py-3 rounded-xl border-2 transition-all font-semibold ${
                      newChannelType === 'private'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-blue-300 text-slate-700'
                    }`}
                  >
                    <IoLockClosedOutline className="inline mr-2" />
                    Private
                  </button>
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
                  className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
