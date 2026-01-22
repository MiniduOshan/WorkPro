import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoLayersOutline, 
  IoAddOutline,
  IoPeopleOutline,
  IoFolderOpenOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoClipboardOutline,
  IoCloseOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoCheckmarkOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Departments() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [viewDept, setViewDept] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [companyRole, setCompanyRole] = useState('');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    const role = localStorage.getItem('companyRole');
    setCompanyRole(role || '');
    if (storedCompanyId && storedCompanyId !== 'null' && storedCompanyId !== 'undefined') {
      setCompanyId(storedCompanyId);
      fetchDepartments(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/departments', { params: { companyId: id } });
      
      // Fetch member and task counts for each department
      const departmentsWithCounts = await Promise.all(data.map(async (d) => {
        try {
          const [membersRes, tasksRes] = await Promise.all([
            api.get(`/api/departments/${d._id}/members`),
            api.get('/api/tasks', { params: { companyId: id, department: d._id } })
          ]);
          return {
            _id: d._id,
            name: d.name,
            description: d.description,
            memberCount: membersRes.data.members?.length || 0,
            taskCount: tasksRes.data?.length || 0
          };
        } catch (err) {
          console.error(`Failed to fetch counts for department ${d.name}:`, err);
          return { _id: d._id, name: d.name, description: d.description, memberCount: 0, taskCount: 0 };
        }
      }));
      
      setDepartments(departmentsWithCounts);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setErrorMsg('Company ID is missing. Please refresh and try again.');
      return;
    }
    if (!newDepartment.name.trim()) {
      setErrorMsg('Department name is required.');
      return;
    }
    setCreating(true);
    setErrorMsg('');
    try {
      const payload = {
        name: newDepartment.name.trim(),
        description: newDepartment.description.trim(),
        companyId: companyId
      };
      await api.post('/api/departments', payload);
      setShowAddModal(false);
      setNewDepartment({ name: '', description: '' });
      fetchDepartments(companyId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add department';
      setErrorMsg(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const openView = async (dept) => {
    try {
      setLoadingMembers(true);
      const [teamsRes, tasksRes, membersRes, companyRes] = await Promise.all([
        api.get('/api/teams', { params: { companyId, department: dept._id } }),
        api.get('/api/tasks', { params: { companyId, department: dept._id } }),
        api.get(`/api/departments/${dept._id}/members`),
        api.get(`/api/companies/${companyId}`)
      ]);
      
      setDeptMembers(membersRes.data.members || []);
      
      // Get available members (company members not in department)
      const deptMemberIds = (membersRes.data.members || []).map(m => m.user?._id || m.user);
      const available = (companyRes.data.members || []).filter(m => !deptMemberIds.includes(m.user?._id || m.user));
      setAvailableMembers(available);
      
      setViewDept({ 
        ...dept, 
        teams: teamsRes.data,
        tasks: tasksRes.data
      });
    } catch (err) {
      console.error('Failed to load department details:', err);
      setViewDept({ ...dept, teams: [], tasks: [] });
    } finally {
      setLoadingMembers(false);
    }
  };

  const getDepartmentColor = (index) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  const addMemberToDepartment = async () => {
    if (!selectedMember || !viewDept) return;
    try {
      const { data } = await api.post(`/api/departments/${viewDept._id}/members/add`, { userId: selectedMember });
      const updatedMember = data.company.members.find(m => m.user._id === selectedMember);
      setDeptMembers([...deptMembers, updatedMember]);
      setAvailableMembers(availableMembers.filter(m => m.user._id !== selectedMember));
      setSelectedMember('');
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const removeMemberFromDepartment = async (userId) => {
    if (!viewDept) return;
    try {
      await api.post(`/api/departments/${viewDept._id}/members/remove`, { userId });
      const member = deptMembers.find(m => m.user._id === userId);
      setDeptMembers(deptMembers.filter(m => m.user._id !== userId));
      setAvailableMembers([...availableMembers, member]);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const joinDepartment = async () => {
    if (!viewDept) return;
    try {
      await api.post(`/api/departments/${viewDept._id}/join`);
      alert('Successfully joined department!');
      fetchDepartments(companyId);
      openView(viewDept);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to join department';
      alert(errorMsg);
      console.error('Failed to join department:', err);
    }
  };

  const leaveDepartment = async () => {
    if (!viewDept) return;
    try {
      await api.post(`/api/departments/${viewDept._id}/leave`);
      alert('Successfully left department!');
      fetchDepartments(companyId);
      openView(viewDept);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to leave department';
      alert(errorMsg);
      console.error('Failed to leave department:', err);
    }
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Departments</h1>
            <p className="text-slate-600">Organize teams into departments</p>
          </div>
          {companyId && ['owner', 'manager'].includes(companyRole) && (
            <button 
              onClick={() => setShowAddModal(true)}
              className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}
            >
              <IoAddOutline className="text-xl" />
              <span>Create Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grow overflow-y-auto p-8">
        {!companyId ? (
          <div className="text-center py-16">
            <IoLayersOutline className="mx-auto text-6xl text-slate-300 mb-4" />
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
        ) : departments.length === 0 ? (
          <div className="text-center py-16">
            <IoLayersOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No departments yet</h3>
            <p className="text-slate-500 mb-6">Create your first department to organize your team</p>
            {['owner', 'manager'].includes(companyRole) && (
              <button 
                onClick={() => setShowAddModal(true)}
                className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 ${theme.bgPrimaryHover} transition`}
              >
                <IoAddOutline className="text-xl" />
                <span>Create Department</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div
                key={dept._id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group"
              >
                {/* Department Header with Gradient */}
                <div className={`bg-linear-to-r ${getDepartmentColor(index)} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IoLayersOutline className="text-2xl" />
                    </div>
                    <button className="p-2 hover:bg-white/20 rounded-lg transition">
                      <IoCreateOutline className="text-lg" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{dept.name}</h3>
                  <p className="text-white/80 text-sm">{dept.description}</p>
                </div>

                {/* Department Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <IoPeopleOutline className="mx-auto text-2xl text-blue-600 mb-1" />
                      <p className="text-2xl font-bold text-slate-800">{dept.memberCount || 0}</p>
                      <p className="text-xs text-slate-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <IoClipboardOutline className="mx-auto text-2xl text-purple-600 mb-1" />
                      <p className="text-2xl font-bold text-slate-800">{dept.taskCount || 0}</p>
                      <p className="text-xs text-slate-600">Tasks</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openView(dept)} className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm">
                      View Details
                    </button>
                    {['owner', 'manager'].includes(companyRole) && (
                      <button onClick={() => handleDelete(dept._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
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

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Department</h2>
            <form onSubmit={handleAddDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Engineering"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Brief description of the department"
                  rows="3"
                  required
                />
              </div>
              {errorMsg && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{errorMsg}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setErrorMsg(''); }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition disabled:opacity-50`}
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Department Modal */}
      {viewDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{viewDept.name}</h2>
                <p className="text-slate-600 text-sm mt-1">{viewDept.description}</p>
              </div>
              <button onClick={() => setViewDept(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                <IoCloseOutline className="text-2xl text-slate-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Teams Section */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <IoPeopleOutline className="text-blue-600" />
                  Teams ({viewDept.teams?.length || 0})
                </h4>
                {viewDept.teams?.length ? (
                  <div className="space-y-2">
                    {viewDept.teams.map(t => (
                      <div key={t._id} className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="font-semibold text-slate-800">{t.name}</p>
                        <p className="text-xs text-slate-600">{t.members?.length || 0} members</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No teams in this department yet.</p>
                )}
              </div>

              {/* Tasks Section */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <IoClipboardOutline className="text-purple-600" />
                  Tasks ({viewDept.tasks?.length || 0})
                </h4>
                {viewDept.tasks?.length ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {viewDept.tasks.map(task => (
                      <div key={task._id} className="px-4 py-3 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.status === 'done' ? 'bg-green-100 text-green-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {task.status}
                          </span>
                          {task.assignee && (
                            <span>👤 {task.assignee.firstName}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No tasks assigned to this department yet.</p>
                )}
              </div>

              {/* Members Section (Manager only) */}
              {['owner', 'manager'].includes(companyRole) && (
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <IoPeopleOutline className="text-emerald-600" />
                    Members ({deptMembers?.length || 0})
                  </h4>
                  
                  {deptMembers?.length ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                      {deptMembers.map(member => (
                        <div key={member.user._id} className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 text-sm">{member.user.firstName} {member.user.lastName}</p>
                            <p className="text-xs text-slate-600">{member.user.email}</p>
                          </div>
                          <button
                            onClick={() => removeMemberFromDepartment(member.user._id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                            title="Remove from department"
                          >
                            <IoPersonRemoveOutline className="text-lg" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl mb-4">No members in this department yet.</p>
                  )}

                  {availableMembers.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Add Member</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="">Select employee...</option>
                          {availableMembers.map(m => (
                            <option key={m.user._id} value={m.user._id}>
                              {m.user.firstName} {m.user.lastName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={addMemberToDepartment}
                          disabled={!selectedMember}
                          className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-semibold text-sm flex items-center gap-1"
                        >
                          <IoPersonAddOutline /> Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Members Section (Employee view only) */}
              {!['owner', 'manager'].includes(companyRole) && (
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <IoPeopleOutline className="text-emerald-600" />
                    Members ({deptMembers?.length || 0})
                  </h4>
                  
                  {deptMembers?.length ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {deptMembers.map(member => (
                        <div key={member.user._id} className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="font-semibold text-slate-800 text-sm">{member.user.firstName} {member.user.lastName}</p>
                          <p className="text-xs text-slate-600">{member.user.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No members in this department yet.</p>
                  )}
                  
                  {deptMembers?.some(m => {
                    const memberId = m.user?._id?.toString() || m.user?.toString();
                    const currentUserId = localStorage.getItem('userId');
                    return memberId === currentUserId;
                  }) ? (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                        <IoCheckmarkOutline /> You are a member of this department
                      </p>
                      <button
                        onClick={leaveDepartment}
                        className="mt-2 w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm flex items-center justify-center gap-2"
                      >
                        <IoPersonRemoveOutline /> Leave Department
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <button
                        onClick={joinDepartment}
                        className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition text-sm flex items-center justify-center gap-2"
                      >
                        <IoPersonAddOutline /> Join Department
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
