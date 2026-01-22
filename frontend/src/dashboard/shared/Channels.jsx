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
  IoRadioButtonOnOutline
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
  const [userProfile, setUserProfile] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [companyMembers, setCompanyMembers] = useState([]);
  const [companyRole, setCompanyRole] = useState('');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    const role = localStorage.getItem('companyRole');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      setCompanyRole(role || '');
      loadUserProfile();
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      loadChannels();
      loadCompanyMembers();
    }
  }, [companyId]);

  const loadUserProfile = async () => {
    try {
      const { data } = await api.get('/api/users/profile');
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadCompanyMembers = async () => {
    if (!companyId) return;
    try {
      const { data } = await api.get(`/api/companies/${companyId}`);
      setCompanyMembers(data.members || []);
    } catch (err) {
      console.error('Failed to load company members:', err);
    }
  };

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
    const isMember = ch.members?.some(m => m === userProfile?._id || m._id === userProfile?._id);
    
    if (!isMember) {
      // User is not a member - show join option
      setSelected({ ...ch, messages: [], isMember: false });
      return;
    }
    
    try {
      const { data } = await api.get(`/api/channels/${ch._id}`);
      setSelected({ ...ch, messages: data.messages || [], isMember: true });
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selected?.isMember) return;
    try {
      await api.post(`/api/channels/${selected._id}/messages`, { text: message });
      setMessage('');
      loadMessages(selected);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const requestJoin = async () => {
    if (!selected) return;
    try {
      await api.post(`/api/channels/${selected._id}/request-join`);
      alert('Join request submitted! Wait for approval from channel members.');
      loadChannels();
    } catch (err) {
      console.error('Failed to request join:', err);
      alert(err.response?.data?.message || 'Failed to request join');
    }
  };

  const approveJoinRequest = async (userId) => {
    if (!selected) return;
    try {
      await api.post(`/api/channels/${selected._id}/approve-join`, { userId });
      alert('Join request approved!');
      
      // Immediately update the selected channel state
      setSelected(prev => ({
        ...prev,
        joinRequests: prev.joinRequests?.filter(req => {
          const reqUserId = req.user?._id || req.user;
          return reqUserId !== userId;
        }) || [],
        members: [...(prev.members || []), userId]
      }));
      
      // Only refresh channel list, not messages (to avoid overwriting state)
      loadChannels();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to approve request';
      console.error('Failed to approve request:', err);
      alert(errorMsg);
    }
  };

  const rejectJoinRequest = async (userId) => {
    if (!selected) return;
    try {
      await api.post(`/api/channels/${selected._id}/reject-join`, { userId });
      alert('Join request rejected');
      
      // Immediately update the selected channel state
      setSelected(prev => ({
        ...prev,
        joinRequests: prev.joinRequests?.filter(req => {
          const reqUserId = req.user?._id || req.user;
          return reqUserId !== userId;
        }) || []
      }));
      
      // Only refresh channel list, not messages (to avoid overwriting state)
      loadChannels();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject request';
      console.error('Failed to reject request:', err);
      alert(errorMsg);
    }
  };

  const addMember = async (userId) => {
    if (!selected) return;
    try {
      await api.post(`/api/channels/${selected._id}/add-member`, { userId });
      alert('Member added!');
      loadChannels();
      loadMessages(selected);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const removeMember = async (userId) => {
    if (!selected) return;
    if (!window.confirm('Remove this member from the channel?')) return;
    try {
      await api.post(`/api/channels/${selected._id}/remove-member`, { userId });
      alert('Member removed');
      loadChannels();
      loadMessages(selected);
    } catch (err) {
      console.error('Failed to remove member:', err);
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
        type: 'public'
      });
      setNewChannelName('');
      setShowAddModal(false);
      loadChannels();
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  const deleteChannel = async (channelId) => {
    if (!window.confirm('Are you sure you want to delete this channel? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/channels/${channelId}`);
      if (selected?._id === channelId) setSelected(null);
      loadChannels();
    } catch (err) {
      console.error('Failed to delete channel:', err);
      alert('Failed to delete channel: ' + (err.response?.data?.message || err.message));
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
                  <div key={channel._id} className="relative group">
                    <button
                      onClick={() => setSelected(channel)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                        selected?._id === channel._id
                          ? `bg-blue-100 text-blue-600 font-semibold`
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IoRadioButtonOnOutline className="text-lg shrink-0" />
                      <span className="truncate grow">{channel.name}</span>
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteChannel(channel._id)}
                      className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded transition-all"
                      title="Delete channel"
                    >
                      ×
                    </button>
                  </div>
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
                    </h3>
                    <p className="text-xs text-slate-500">
                      <IoPeopleOutline className="inline mr-1" />
                      {selected.members?.length || 0} members
                      {selected.joinRequests?.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">
                          {selected.joinRequests.length} pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.isMember && (selected.members?.[0]?._id === userProfile?._id || selected.members?.[0] === userProfile?._id || companyRole === 'owner') && (
                    <button
                      onClick={() => setShowMembersModal(true)}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-semibold"
                    >
                      Manage Members
                    </button>
                  )}
                  {selected.isMember && (
                    <button 
                      onClick={() => deleteChannel(selected._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 hover:text-red-700"
                      title="Delete channel"
                    >
                      <IoEllipsisVerticalOutline className="text-xl" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area or Join Button */}
              {!selected.isMember ? (
                <div className="grow flex items-center justify-center p-6">
                  <div className="text-center max-w-md">
                    <IoPeopleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
                    <h4 className="text-xl font-bold text-slate-700 mb-2">Join this channel</h4>
                    <p className="text-slate-600 mb-6">
                      You need to join this channel to see messages and participate in conversations.
                    </p>
                    <button
                      onClick={requestJoin}
                      className={`px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition shadow-lg`}
                    >
                      Request to Join
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grow overflow-y-auto p-6 space-y-4 custom-scrollbar">{(selected.messages || []).length === 0 ? (
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
                            ? 'bg-linear-to-br from-green-500 to-green-600'
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
              )}
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

      {/* Manage Members Modal */}
      {showMembersModal && selected && (selected.members?.[0]?._id === userProfile?._id || selected.members?.[0] === userProfile?._id || companyRole === 'owner') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Manage Channel Members</h2>
              <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition">✕</button>
            </div>
            
            {/* Join Requests */}
            {selected.joinRequests?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Pending Requests</h3>
                <div className="space-y-2">
                  {selected.joinRequests.map((req) => {
                    const userId = req.user?._id || req.user;
                    const member = companyMembers.find(m => m.user._id === userId);
                    return (
                      <div key={userId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="font-semibold">
                          {member ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveJoinRequest(userId)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectJoinRequest(userId)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Members */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Current Members ({selected.members?.length || 0})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selected.members?.map((memberId) => {
                  const member = companyMembers.find(m => m.user._id === memberId || m.user._id === memberId._id);
                  return (
                    <div key={memberId._id || memberId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-semibold">
                        {member ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown User'}
                      </span>
                      {userProfile?._id !== (memberId._id || memberId) && (
                        <button
                          onClick={() => removeMember(memberId._id || memberId)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Members */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Add Members</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {companyMembers.filter(m => 
                  !selected.members?.some(memberId => 
                    (memberId._id || memberId) === m.user._id
                  )
                ).map((member) => (
                  <div key={member.user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                    <button
                      onClick={() => addMember(member.user._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
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
