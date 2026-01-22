import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoAddOutline, IoCloseOutline, IoPeopleOutline, 
  IoLogOutOutline, IoEnterOutline, IoTrashOutline 
} from 'react-icons/io5';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [viewGroup, setViewGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  const companyRole = localStorage.getItem('companyRole');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const { data } = await api.get('/api/groups', { params: { companyId } });
      setGroups(data);
    } catch (err) { console.error("Error loading groups"); } finally { setLoading(false); }
  };

  const openView = async (group) => {
    try {
      const { data } = await api.get(`/api/groups/${group._id}`);
      setViewGroup(data);
    } catch (err) {
      alert(err.response?.data?.message || "Permission Denied: Cannot view group details");
    }
  };

  const handleMemberAction = async (action) => {
    try {
      await api.post(`/api/groups/${viewGroup._id}/${action}`);
      setViewGroup(null);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const removeMember = async (userId) => {
    if(!window.confirm("Kick this member from the group?")) return;
    try {
      await api.post(`/api/groups/${viewGroup._id}/remove-member`, { userId });
      // Refresh the group details after removing member
      const { data } = await api.get(`/api/groups/${viewGroup._id}`);
      setViewGroup(data);
    } catch (err) { alert("Failed to remove member"); }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert("Group name is required");
      return;
    }
    
    try {
      setCreatingGroup(true);
      const companyId = localStorage.getItem('companyId');
      await api.post('/api/groups', {
        name: newGroupName,
        description: newGroupDesc,
        companyId: companyId
      });
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateModal(false);
      fetchGroups();
      alert('Group created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">LOADING WORKSPACE...</div>;

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Project Groups</h1>
            <p className="text-slate-600">Coordinate your team and track collective progress</p>
          </div>
          {['owner', 'manager'].includes(companyRole) && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-95"
            >
              + Create New Group
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grow overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <div key={g._id} className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group">
              <div className="flex justify-between items-center mb-5">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  <IoPeopleOutline size={30}/>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Progress</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{g.progress}%</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{g.name}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{g.description || "Active collaboration squad for group projects."}</p>
              
              <button 
                onClick={() => openView(g)} 
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all"
              >
                VIEW DETAILS
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {viewGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight">{viewGroup.name}</h2>
                <p className="text-slate-500 mt-2">{viewGroup.description}</p>
              </div>
              <button onClick={() => setViewGroup(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={28}/>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <p className="text-2xl font-bold text-slate-800 leading-none">{viewGroup.taskStats?.total || 0}</p>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Tasks</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600 leading-none">{viewGroup.taskStats?.completed || 0}</p>
                <p className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wide mt-1">Done</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                <p className="text-2xl font-bold text-blue-600 leading-none">{viewGroup.taskStats?.inProgress || 0}</p>
                <p className="text-[11px] text-blue-500 font-semibold uppercase tracking-wide mt-1">Active</p>
              </div>
            </div>

            {/* Member Management */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-5 border-b pb-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Group Members</h4>
                <span className="text-xs font-black text-indigo-500">{viewGroup.members?.length} Total</span>
              </div>
              <div className="space-y-3 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {viewGroup.members?.map(m => (
                  <div key={m._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group/member hover:bg-indigo-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[11px]">
                        {(m.firstName?.[0] || '?')}{(m.lastName?.[0] || '')}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{m.firstName} {m.lastName}</span>
                    </div>
                    {['owner', 'manager'].includes(companyRole) && m._id !== currentUserId && (
                      <button onClick={() => removeMember(m._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <IoTrashOutline size={18}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Action */}
            <div className="flex gap-4">
              {viewGroup.members?.some(m => m._id === currentUserId) ? (
                <button 
                  onClick={() => handleMemberAction('leave')}
                  className="flex-1 py-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <IoLogOutOutline size={22}/> LEAVE TEAM
                </button>
              ) : (
                <button 
                  onClick={() => handleMemberAction('join')}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <IoEnterOutline size={22}/> JOIN TEAM
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Create New Group</h2>
                <p className="text-slate-500 mt-1">Build your team collaboration space</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={24}/>
              </button>
            </div>

            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Enter group description (optional)"
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingGroup}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 active:scale-95"
                >
                  <IoAddOutline size={22}/> {creatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}