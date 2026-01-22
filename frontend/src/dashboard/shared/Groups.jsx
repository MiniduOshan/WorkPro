import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  IoPeopleCircleOutline, IoAddOutline, IoTrashOutline, IoCreateOutline,
  IoCloseOutline, IoPersonAddOutline, IoPersonRemoveOutline, IoPeopleOutline
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
  const [taskStats, setTaskStats] = useState(null);

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
      setGroups(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openView = async (group) => {
    try {
      const [groupRes, companyRes] = await Promise.all([
        api.get(`/api/groups/${group._id}`),
        api.get(`/api/companies/${companyId}`)
      ]);

      const fetchedGroup = groupRes.data;
      const members = fetchedGroup.members || [];
      
      setGroupMembers(members);
      setTaskStats(fetchedGroup.taskStats || null);

      const groupMemberIds = members.map(m => String(m._id || m));
      const available = (companyRes.data.members || []).filter(m => {
        const userId = String(m.user?._id || m.user);
        return !groupMemberIds.includes(userId);
      });
      
      setAvailableMembers(available);
      setViewGroup(fetchedGroup);
    } catch (err) {
      console.error('View error:', err);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/groups', { ...newGroup, companyId });
      setShowAddModal(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups(companyId);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error');
    } finally {
      setCreating(false);
    }
  };

  const joinGroup = async () => {
    try {
      await api.post(`/api/groups/${viewGroup._id}/join`);
      fetchGroups(companyId);
      openView(viewGroup);
    } catch (err) {
      alert('Join failed');
    }
  };

  const leaveGroup = async () => {
    try {
      await api.post(`/api/groups/${viewGroup._id}/leave`);
      fetchGroups(companyId);
      openView(viewGroup);
    } catch (err) {
      alert('Leave failed');
    }
  };

  const isUserInGroup = () => {
    const currentUserId = localStorage.getItem('userId');
    return groupMembers.some(m => String(m._id || m) === String(currentUserId));
  };

  const getMemberId = (m) => m._id || m;
  const getMemberName = (m) => m.firstName ? `${m.firstName} ${m.lastName}` : 'User';

  return (
    <div className="grow flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-slate-500">Manage your team units</p>
        </div>
        {companyId && (
          <button onClick={() => setShowAddModal(true)} className={`${theme.bgPrimary} text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg`}>
            <IoAddOutline /> Create Group
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map(g => (
            <div key={g._id} className="bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all">
               <h3 className="text-xl font-bold mb-2">{g.name}</h3>
               <p className="text-slate-500 text-sm mb-4">{g.description}</p>
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
                  <span className="text-sm font-bold">{g.progress}%</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full mb-6">
                  <div className={`${theme.bgPrimary} h-2 rounded-full`} style={{ width: `${g.progress}%` }}></div>
               </div>
               <button onClick={() => openView(g)} className="w-full py-2 bg-slate-50 text-indigo-600 rounded-lg font-bold flex items-center justify-center gap-2">
                 <IoPeopleOutline /> View Details
               </button>
            </div>
          ))}
        </div>
      </div>

      {/* View Modal */}
      {viewGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">{viewGroup.name}</h2>
              <button onClick={() => setViewGroup(null)}><IoCloseOutline size={28} /></button>
            </div>

            {taskStats && (
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <p className="text-xl font-bold">{taskStats.total}</p>
                  <p className="text-xs text-slate-500">Tasks</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-green-600">{taskStats.completed}</p>
                  <p className="text-xs text-green-500">Done</p>
                </div>
                {/* ... other stats */}
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-bold mb-4">Members ({groupMembers.length})</h4>
              <div className="space-y-2 mb-4">
                {groupMembers.map(m => (
                  <div key={getMemberId(m)} className="p-3 bg-indigo-50 rounded-xl flex justify-between">
                    <span>{getMemberName(m)}</span>
                    {['owner', 'manager'].includes(companyRole) && (
                      <button className="text-red-500"><IoPersonRemoveOutline /></button>
                    )}
                  </div>
                ))}
              </div>

              {isUserInGroup() ? (
                <button onClick={leaveGroup} className="w-full py-2 bg-red-50 text-red-600 rounded-xl font-bold">Leave Group</button>
              ) : (
                <button onClick={joinGroup} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold">Join Group</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}