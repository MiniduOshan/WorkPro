import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoLayersOutline, IoAddOutline, IoPeopleOutline, IoCloseOutline,
  IoPersonAddOutline, IoPersonRemoveOutline, IoTrashOutline, IoCheckmarkOutline,
  IoBusinessOutline
} from 'react-icons/io5';

export default function Departments() {
  const [companyId, setCompanyId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [viewDept, setViewDept] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('companyId');
    const role = localStorage.getItem('companyRole');
    setCompanyRole(role || '');
    if (id && id !== 'null') {
      setCompanyId(id);
      fetchDepartments(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/departments', { params: { companyId: id } });
      setDepartments(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.name.trim()) {
      alert('Department name is required');
      return;
    }

    try {
      setCreatingDept(true);
      await api.post('/api/departments', {
        name: newDepartment.name,
        description: newDepartment.description,
        companyId
      });
      setNewDepartment({ name: '', description: '' });
      setShowCreateModal(false);
      fetchDepartments(companyId);
      alert('Department created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department');
    } finally {
      setCreatingDept(false);
    }
  };

  const openView = async (dept) => {
    try {
      const [detailRes, companyRes] = await Promise.all([
        api.get(`/api/departments/${dept._id}`),
        api.get(`/api/companies/${companyId}`)
      ]);
      const detail = detailRes.data;
      const currentMembers = detail.members || [];
      setDeptMembers(currentMembers);

      const deptMemberUserIds = currentMembers.map(m => String(m.user?._id || m.user));
      const available = (companyRes.data.members || []).filter(m => {
        const userId = String(m.user?._id || m.user);
        return !deptMemberUserIds.includes(userId);
      });

      setAvailableMembers(available);
      setViewDept(detail);
    } catch (err) { console.error(err); }
  };

  const isUserInDepartment = () => {
    const currentUserId = String(localStorage.getItem('userId'));
    return deptMembers.some(m => String(m.user?._id || m.user) === currentUserId);
  };

  const joinDepartment = async () => {
    try {
      await api.post(`/api/departments/${viewDept._id}/join`);
      openView(viewDept);
    } catch (err) { alert('Join failed'); }
  };

  const leaveDepartment = async () => {
    try {
      await api.post(`/api/departments/${viewDept._id}/leave`);
      openView(viewDept);
    } catch (err) { alert('Leave failed'); }
  };

  const addMemberToDepartment = async () => {
    if (!selectedMember) return;
    try {
      setAddingMember(true);
      await api.post(`/api/departments/${viewDept._id}/members/add`, { userId: selectedMember });
      setSelectedMember('');
      openView(viewDept);
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const removeMemberFromDepartment = async (userId) => {
    if (!window.confirm('Remove this member from the department?')) return;
    try {
      await api.post(`/api/departments/${viewDept._id}/members/remove`, { userId });
      openView(viewDept);
    } catch (err) { alert('Failed to remove member'); }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">LOADING DEPARTMENTS...</div>;

  return (
    <div className="grow bg-[#F8FAFC] min-h-screen p-6 lg:p-12">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Departments</h1>
          <p className="text-slate-500 font-medium">Organize teams and manage departmental collaboration</p>
        </div>
        {['owner', 'manager'].includes(companyRole) && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            + Create New Department
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departments.map(dept => (
          <div key={dept._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <IoBusinessOutline size={30}/>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Members</p>
                <p className="text-xl font-black text-slate-700 leading-none mt-1">{dept.memberCount || 0}</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">{dept.name}</h3>
            <p className="text-slate-400 text-sm mb-10 line-clamp-2 h-10">{dept.description || "Department workspace for team collaboration."}</p>
            
            <button 
              onClick={() => openView(dept)} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all tracking-wide"
            >
              VIEW DETAILS
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {viewDept && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 leading-none">{viewDept.name}</h2>
                <p className="text-slate-400 font-bold mt-2">{viewDept.description}</p>
              </div>
              <button onClick={() => setViewDept(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={36}/>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100">
                <p className="text-3xl font-black text-slate-800 leading-none">{viewDept.taskStats?.total || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Tasks</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-[2rem] text-center border border-emerald-100">
                <p className="text-3xl font-black text-emerald-600 leading-none">{viewDept.taskStats?.completed || 0}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-2">Done</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-[2rem] text-center border border-blue-100">
                <p className="text-3xl font-black text-blue-600 leading-none">{viewDept.taskStats?.inProgress || 0}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-2">Active</p>
              </div>
            </div>

            {/* Members List */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-5 border-b pb-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Department Members</h4>
                <span className="text-xs font-black text-indigo-500">{deptMembers.length} Total</span>
              </div>
              <div className="space-y-3 max-h-44 overflow-y-auto pr-2 custom-scrollbar">
                {deptMembers.map(m => (
                  <div key={m.user?._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group/member hover:bg-amber-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-[10px]">
                        {(m.user?.firstName?.[0] || '?')}{(m.user?.lastName?.[0] || '')}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700">{m.user?.firstName} {m.user?.lastName}</span>
                        {String(m.user?._id) === String(localStorage.getItem('userId')) && <span className="text-xs text-indigo-600 font-bold ml-2">(You)</span>}
                      </div>
                    </div>
                    {['owner', 'manager'].includes(companyRole) && String(m.user?._id) !== String(localStorage.getItem('userId')) && (
                      <button onClick={() => removeMemberFromDepartment(m.user?._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <IoTrashOutline size={20}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Member Section */}
            {['owner', 'manager'].includes(companyRole) && availableMembers.length > 0 && (
              <div className="mb-10 pb-10 border-b">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Add Members</h4>
                <div className="flex gap-2">
                  <select 
                    value={selectedMember} 
                    onChange={(e) => setSelectedMember(e.target.value)} 
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-semibold bg-white"
                  >
                    <option value="">Select a member...</option>
                    {availableMembers.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.firstName} {m.user?.lastName}</option>)}
                  </select>
                  <button 
                    onClick={addMemberToDepartment} 
                    disabled={!selectedMember || addingMember}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {addingMember ? '...' : '+'}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isUserInDepartment() ? (
                <button 
                  onClick={leaveDepartment}
                  className="flex-1 py-5 bg-red-50 text-red-600 rounded-[2rem] font-black hover:bg-red-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <IoPersonRemoveOutline size={22}/> LEAVE DEPARTMENT
                </button>
              ) : (
                <button 
                  onClick={joinDepartment}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                >
                  <IoPersonAddOutline size={22}/> JOIN DEPARTMENT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">Create Department</h2>
                <p className="text-slate-400 font-bold mt-2">Build a new organizational unit</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <IoCloseOutline size={28}/>
              </button>
            </div>

            <form onSubmit={createDepartment} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Department Name *</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="e.g., Engineering, Marketing"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Enter department description (optional)"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:outline-none font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingDept}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[2rem] font-black hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDept}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-2xl shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
                >
                  <IoAddOutline size={22}/> {creatingDept ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}