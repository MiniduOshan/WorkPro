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
    <div className="grow bg-[#F8FAFC] min-h-screen p-6 lg:p-12">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Project Groups</h1>
          <p className="text-slate-500 font-medium">Coordinate your team and track collective progress</p>
        </div>
        {['owner', 'manager'].includes(companyRole) && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            + Create New Group
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map(g => (
          <div key={g._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <IoPeopleOutline size={30}/>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Status</p>
                <p className="text-xl font-black text-slate-700 leading-none mt-1">{g.progress}%</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">{g.name}</h3>
            <p className="text-slate-400 text-sm mb-10 line-clamp-2 h-10">{g.description || "Active collaboration squad."}</p>
            
            <button 
              onClick={() => openView(g)} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all tracking-wide"
            >
              VIEW DETAILS
            </button>
          </div>
        ))}
      </div>

      {/* Focus Modal */}
      {viewGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 leading-none">{viewGroup.name}</h2>
                <p className="text-slate-400 font-bold mt-2">{viewGroup.description}</p>
              </div>
              <button onClick={() => setViewGroup(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={36}/>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100">
                <p className="text-3xl font-black text-slate-800 leading-none">{viewGroup.taskStats?.total || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Tasks</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-[2rem] text-center border border-emerald-100">
                <p className="text-3xl font-black text-emerald-600 leading-none">{viewGroup.taskStats?.completed || 0}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-2">Done</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-[2rem] text-center border border-blue-100">
                <p className="text-3xl font-black text-blue-600 leading-none">{viewGroup.taskStats?.inProgress || 0}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-2">Active</p>
              </div>
            </div>

            {/* Member Management */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-5 border-b pb-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Group Members</h4>
                <span className="text-xs font-black text-indigo-500">{viewGroup.members?.length} Total</span>
              </div>
              <div className="space-y-3 max-h-44 overflow-y-auto pr-2 custom-scrollbar">
                {viewGroup.members?.map(m => (
                  <div key={m._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group/member hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                        {(m.firstName?.[0] || '?')}{(m.lastName?.[0] || '')}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{m.firstName} {m.lastName}</span>
                    </div>
                    {['owner', 'manager'].includes(companyRole) && m._id !== currentUserId && (
                      <button onClick={() => removeMember(m._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <IoTrashOutline size={20}/>
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
                  className="flex-1 py-5 bg-red-50 text-red-600 rounded-[2rem] font-black hover:bg-red-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <IoLogOutOutline size={22}/> LEAVE TEAM
                </button>
              ) : (
                <button 
                  onClick={() => handleMemberAction('join')}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
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
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">Create New Group</h2>
                <p className="text-slate-400 font-bold mt-2">Build your team collaboration space</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={28}/>
              </button>
            </div>

            <form onSubmit={createGroup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Enter group description (optional)"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:outline-none font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingGroup}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[2rem] font-black hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-2xl shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
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