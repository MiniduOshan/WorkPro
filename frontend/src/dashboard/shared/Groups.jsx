import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  IoPeopleCircleOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoCloseOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Groups() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [companyRole, setCompanyRole] = useState('');

  const [viewGroup, setViewGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    const role = localStorage.getItem('companyRole');
    setCompanyRole(role || '');
    if (storedCompanyId && storedCompanyId !== 'null' && storedCompanyId !== 'undefined') {
      setCompanyId(storedCompanyId);
      fetchGroups(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGroups = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/groups', { params: { companyId: id } });
      setGroups(data.map(g => ({ _id: g._id, name: g.name, description: g.description, members: g.members || [] })));
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    try {
      await api.post('/api/groups', { ...newGroup, companyId });
      setShowAddModal(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups(companyId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create group';
      setErrorMsg(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/groups/${id}`);
      setGroups(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const openView = async (group) => {
    try {
      const [groupRes, companyRes] = await Promise.all([
        api.get(`/api/groups/${group._id}`),
        api.get(`/api/companies/${companyId}`)
      ]);

      const members = groupRes.data.members || [];
      setGroupMembers(members);

      // Get available members (company members not in group)
      const groupMemberIds = members.map(m => m._id || m);
      const available = (companyRes.data.members || []).filter(m => !groupMemberIds.includes(m.user?._id || m.user));
      setAvailableMembers(available);

      setViewGroup(group);
    } catch (err) {
      console.error('Failed to load group details:', err);
      setViewGroup(group);
      setGroupMembers([]);
      setAvailableMembers([]);
    }
  };

  const addMemberToGroup = async () => {
    if (!selectedMember || !viewGroup) return;
    try {
      const { data } = await api.post(`/api/groups/${viewGroup._id}/members/add`, { userId: selectedMember });
      const member = availableMembers.find(m => m.user._id === selectedMember);
      setGroupMembers([...groupMembers, member.user]);
      setAvailableMembers(availableMembers.filter(m => m.user._id !== selectedMember));
      setSelectedMember('');
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const removeMemberFromGroup = async (userId) => {
    if (!viewGroup) return;
    try {
      await api.post(`/api/groups/${viewGroup._id}/members/remove`, { userId });
      const member = groupMembers.find(m => m._id === userId);
      setGroupMembers(groupMembers.filter(m => m._id !== userId));
      if (member) {
        setAvailableMembers([...availableMembers, { user: member, role: 'employee' }]);
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const getMemberName = (member) => {
    if (typeof member === 'string') return 'Unknown';
    return `${member.firstName || ''} ${member.lastName || ''}`.trim();
  };

  const getMemberEmail = (member) => {
    if (typeof member === 'string') return '';
    return member.email || '';
  };

  const getMemberId = (member) => {
    if (typeof member === 'string') return member;
    return member._id || '';
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Groups</h1>
            <p className="text-slate-600">Create and manage company groups</p>
          </div>
          {companyId && (
            <button 
              onClick={() => { setShowAddModal(true); setErrorMsg(''); }}
              className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}
            >
              <IoAddOutline className="text-xl" />
              <span>Create Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grow overflow-y-auto p-8">
        {!companyId ? (
          <div className="text-center py-16">
            <IoPeopleCircleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Company Found</h3>
            <p className="text-slate-500 mb-6">You need to create or join a company first</p>
            <a href="/dashboard/manager?first-time=true" className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 ${theme.bgPrimaryHover} transition`}>
              <IoAddOutline className="text-xl" />
              <span>Create Company</span>
            </a>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <IoPeopleCircleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No groups yet</h3>
            <p className="text-slate-500 mb-6">Create your first group to collaborate</p>
            <button 
              onClick={() => { setShowAddModal(true); setErrorMsg(''); }}
              className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 ${theme.bgPrimaryHover} transition`}
            >
              <IoAddOutline className="text-xl" />
              <span>Create Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div className="bg-linear-to-r from-indigo-500 to-blue-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <IoPeopleCircleOutline className="text-2xl" />
                    </div>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition">
                      <IoCreateOutline className="text-lg" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                  <p className="text-white/80 text-sm">{group.description}</p>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">Members</p>
                    <p className="text-2xl font-bold text-slate-800">{group.members?.length || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openView(group)} className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition text-sm flex items-center justify-center gap-2">
                      <IoPeopleOutline /> View Members
                    </button>
                    {['owner', 'manager'].includes(companyRole) && (
                      <button onClick={() => handleDelete(group._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
                        <IoTrashOutline />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Group Modal */}
            {/* View Group Modal */}
            {viewGroup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{viewGroup.name}</h2>
                      <p className="text-slate-600 text-sm mt-1">{viewGroup.description}</p>
                    </div>
                    <button onClick={() => setViewGroup(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                      <IoCloseOutline className="text-2xl text-slate-400" />
                    </button>
                  </div>

                  {/* Members Section (Manager) */}
                  {['owner', 'manager'].includes(companyRole) && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <IoPeopleCircleOutline className="text-indigo-600" />
                        Members ({groupMembers?.length || 0})
                      </h4>

                      {groupMembers?.length ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                          {groupMembers.map(member => (
                            <div key={getMemberId(member)} className="px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{getMemberName(member)}</p>
                                <p className="text-xs text-slate-600">{getMemberEmail(member)}</p>
                              </div>
                              <button
                                onClick={() => removeMemberFromGroup(getMemberId(member))}
                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Remove from group"
                              >
                                <IoPersonRemoveOutline className="text-lg" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl mb-4">No members in this group yet.</p>
                      )}

                      {availableMembers.length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                          <label className="block text-xs font-semibold text-slate-600 mb-2">Add Member</label>
                          <div className="flex gap-2">
                            <select
                              value={selectedMember}
                              onChange={(e) => setSelectedMember(e.target.value)}
                              className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="">Select employee...</option>
                              {availableMembers.map(m => (
                                <option key={m.user._id} value={m.user._id}>
                                  {m.user.firstName} {m.user.lastName}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={addMemberToGroup}
                              disabled={!selectedMember}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
                            >
                              <IoPersonAddOutline /> Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Members Section (Employee) */}
                  {!['owner', 'manager'].includes(companyRole) && (
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <IoPeopleCircleOutline className="text-indigo-600" />
                        Members ({groupMembers?.length || 0})
                      </h4>

                      {groupMembers?.length ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {groupMembers.map(member => (
                            <div key={getMemberId(member)} className="px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-200">
                              <p className="font-semibold text-slate-800">{getMemberName(member)}</p>
                              <p className="text-xs text-slate-600">{getMemberEmail(member)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No members in this group yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Group</h2>
            <form onSubmit={handleAddGroup}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., QA Group"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Group purpose or details"
                  rows="3"
                  required
                />
              </div>
              {errorMsg && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{errorMsg}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setErrorMsg(''); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={creating} className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition disabled:opacity-50`}>{creating ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
