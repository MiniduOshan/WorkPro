import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoLayersOutline, 
  IoAddOutline,
  IoPeopleOutline,
  IoFolderOpenOutline,
  IoCreateOutline,
  IoTrashOutline
} from 'react-icons/io5';

export default function Departments() {
  const [companyId, setCompanyId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [viewDept, setViewDept] = useState(null);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
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
      setDepartments(data.map(d => ({ _id: d._id, name: d.name, description: d.description })));
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
      const { data: teams } = await api.get('/api/teams', { params: { companyId, department: dept._id } });
      setViewDept({ ...dept, teams });
    } catch (err) {
      setViewDept({ ...dept, teams: [] });
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

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Departments</h1>
            <p className="text-slate-600">Organize teams into departments</p>
          </div>
          {companyId && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-95"
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
            <a href="/dashboard/manager?first-time=true" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition">
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
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <IoAddOutline className="text-xl" />
              <span>Create Department</span>
            </button>
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
                      <p className="text-2xl font-bold text-slate-800">—</p>
                      <p className="text-xs text-slate-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <IoFolderOpenOutline className="mx-auto text-2xl text-purple-600 mb-1" />
                      <p className="text-2xl font-bold text-slate-800">—</p>
                      <p className="text-xs text-slate-600">Projects</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openView(dept)} className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm">
                      View Details
                    </button>
                    <button onClick={() => handleDelete(dept._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
                      <IoTrashOutline />
                    </button>
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{viewDept.name}</h2>
              <button onClick={() => setViewDept(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                <IoCreateOutline className="text-2xl text-slate-400" />
              </button>
            </div>
            <p className="text-slate-700 mb-6">{viewDept.description}</p>
            <h4 className="text-sm font-bold text-slate-600 mb-2">Teams in this department</h4>
            {viewDept.teams?.length ? (
              <ul className="space-y-2">
                {viewDept.teams.map(t => (
                  <li key={t._id} className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                    {t.name} · {t.members?.length || 0} members
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No teams found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
