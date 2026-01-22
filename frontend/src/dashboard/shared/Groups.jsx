import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  IoPeopleCircleOutline, IoAddOutline, IoTrashOutline, IoCloseOutline, 
  IoPersonAddOutline, IoPersonRemoveOutline, IoPeopleOutline, IoStatsChartOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Groups() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
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
    if (storedCompanyId && storedCompanyId !== 'null') {
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
      const groupRes = await api.get(`/api/groups/${group._id}`);
      const fetchedGroup = groupRes.data;
      
      setViewGroup(fetchedGroup);
      setGroupMembers(fetchedGroup.members || []);
      setTaskStats(fetchedGroup.taskStats || null);

      // Only fetch available members if user is owner/manager
      if (['owner', 'manager'].includes(companyRole)) {
        const companyRes = await api.get(`/api/companies/${companyId}`);
        const groupMemberIds = (fetchedGroup.members || []).map(m => String(m._id));
        const available = (companyRes.data.members || []).filter(m => 
          !groupMemberIds.includes(String(m.user?._id))
        );
        setAvailableMembers(available);
      }
    } catch (err) {
      alert('Could not open group details');
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      await api.post(`/api/groups/${viewGroup._id}/members`, { userId: selectedMember });
      setSelectedMember('');
      openView(viewGroup);
    } catch (err) {
      alert('Failed to add member');
    }
  };

  const isUserInGroup = () => {
    const currentUserId = localStorage.getItem('userId');
    return groupMembers.some(m => String(m._id) === String(currentUserId));
  };

  if (loading) return <div className="p-10 text-center font-medium">Loading Workspace...</div>;

  return (
    <div className="grow flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Team Groups</h1>
          <p className="text-slate-500 text-sm">Organize projects and department workflows</p>
        </div>
        {['owner', 'manager'].includes(companyRole) && (
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <IoAddOutline size={20} /> <span className="font-semibold">Create New Group</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <div key={g._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <IoPeopleCircleOutline size={24} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                  <p className="text-lg font-bold text-slate-700">{g.progress}%</p>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{g.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{g.description || 'No description provided.'}</p>
              
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${g.progress}%` }}
                ></div>
              </div>

              <button 
                onClick={() => openView(g)} 
                className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-indigo-100"
              >
                <IoPeopleOutline /> View Group
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* View Modal */}
      {viewGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{viewGroup.name}</h2>
                  <p className="text-slate-500">{viewGroup.description}</p>
                </div>
                <button onClick={() => setViewGroup(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <IoCloseOutline size={28} />
                </button>
              </div>

              {/* Stats Bar */}
              {taskStats && (
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Tasks', val: taskStats.total, color: 'bg-slate-50 text-slate-700' },
                    { label: 'Completed', val: taskStats.completed, color: 'bg-green-50 text-green-700' },
                    { label: 'In Progress', val: taskStats.inProgress, color: 'bg-blue-50 text-blue-700' },
                    { label: 'To Do', val: taskStats.todo, color: 'bg-amber-50 text-amber-700' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-4 rounded-2xl text-center`}>
                      <p className="text-xl font-black">{stat.val}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tight opacity-70">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Members Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <IoPeopleOutline /> Members ({groupMembers.length})
                  </h4>
                  {['owner', 'manager'].includes(companyRole) && (
                    <div className="flex gap-2">
                      <select 
                        className="text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 ring-indigo-500"
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                      >
                        <option value="">Add member...</option>
                        {availableMembers.map(m => (
                          <option key={m.user?._id} value={m.user?._id}>
                            {m.user?.firstName} {m.user?.lastName}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleAddMember} className="bg-indigo-600 text-white p-2 rounded-lg"><IoPersonAddOutline /></button>
                    </div>
                  )}
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {groupMembers.map(m => (
                    <div key={m._id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center group/member">
                      <span className="font-medium text-slate-700">{m.firstName} {m.lastName}</span>
                      {['owner', 'manager'].includes(companyRole) && (
                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                          <IoPersonRemoveOutline size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t">
                {isUserInGroup() ? (
                  <button onClick={() => {/* logic */}} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors">
                    Leave This Group
                  </button>
                ) : (
                  <button onClick={() => {/* logic */}} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200">
                    Join Group
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}