import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  IoPeopleCircleOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline
} from 'react-icons/io5';

export default function Groups() {
  const [companyId, setCompanyId] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-95"
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
            <a href="/company/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition">
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition"
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
                    <button onClick={() => handleDelete(group._id)} className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
                      <IoTrashOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Group Modal */}
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
                <button type="submit" disabled={creating} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">{creating ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
