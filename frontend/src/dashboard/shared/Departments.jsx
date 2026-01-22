import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoLayersOutline, IoAddOutline, IoPeopleOutline, IoCloseOutline,
  IoPersonAddOutline, IoPersonRemoveOutline, IoClipboardOutline, IoCheckmarkOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Departments() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [viewDept, setViewDept] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [companyRole, setCompanyRole] = useState('');

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

  const openView = async (dept) => {
    try {
      const [membersRes, companyRes] = await Promise.all([
        api.get(`/api/departments/${dept._id}/members`),
        api.get(`/api/companies/${companyId}`)
      ]);
      
      const currentMembers = membersRes.data.members || [];
      setDeptMembers(currentMembers);
      
      const deptMemberUserIds = currentMembers.map(m => String(m.user?._id || m.user));
      const available = (companyRes.data.members || []).filter(m => {
        const userId = String(m.user?._id || m.user);
        return !deptMemberUserIds.includes(userId);
      });

      setAvailableMembers(available);
      setViewDept(dept);
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
    try {
      await api.post(`/api/departments/${viewDept._id}/members/add`, { userId: selectedMember });
      setSelectedMember('');
      openView(viewDept);
    } catch (err) { console.error(err); }
  };

  const removeMemberFromDepartment = async (userId) => {
    try {
      await api.post(`/api/departments/${viewDept._id}/members/remove`, { userId });
      openView(viewDept);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      <div className="bg-white border-b p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Departments</h1>
        {['owner', 'manager'].includes(companyRole) && (
          <button onClick={() => setShowAddModal(true)} className={`${theme.bgPrimary} text-white px-4 py-2 rounded-xl`}>Create Department</button>
        )}
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        {departments.map(dept => (
          <div key={dept._id} className="bg-white p-6 rounded-2xl border-2 hover:shadow-lg transition">
            <h3 className="text-xl font-bold">{dept.name}</h3>
            <p className="text-slate-500 mb-4">{dept.description}</p>
            <button onClick={() => openView(dept)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold">View Details</button>
          </div>
        ))}
      </div>

      {viewDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">{viewDept.name}</h2>
              <button onClick={() => setViewDept(null)}><IoCloseOutline size={28} /></button>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-3">Members ({deptMembers.length})</h4>
              <div className="space-y-2 mb-4">
                {deptMembers.map(m => (
                  <div key={m.user?._id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                    <span>{m.user?.firstName} {m.user?.lastName} {String(m.user?._id) === String(localStorage.getItem('userId')) && "(You)"}</span>
                    {['owner', 'manager'].includes(companyRole) && (
                      <button onClick={() => removeMemberFromDepartment(m.user?._id)} className="text-red-500"><IoPersonRemoveOutline /></button>
                    )}
                  </div>
                ))}
              </div>

              {['owner', 'manager'].includes(companyRole) && availableMembers.length > 0 && (
                <div className="flex gap-2 mb-4">
                  <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="flex-1 border p-2 rounded-lg">
                    <option value="">Add member...</option>
                    {availableMembers.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.firstName} {m.user?.lastName}</option>)}
                  </select>
                  <button onClick={addMemberToDepartment} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Add</button>
                </div>
              )}

              {isUserInDepartment() ? (
                <button onClick={leaveDepartment} className="w-full py-2 bg-red-50 text-red-600 rounded-xl font-bold">Leave Department</button>
              ) : (
                <button onClick={joinDepartment} className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold">Join Department</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}