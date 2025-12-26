import React, { useEffect, useState } from 'react';
import api from '../api/axios';
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

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      fetchDepartments(storedCompanyId);
    }
  }, []);

  const fetchDepartments = async (id) => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      // const { data } = await api.get(`/api/companies/${id}/departments`);
      const mockData = [
        { _id: '1', name: 'Engineering', description: 'Software development and technical operations', memberCount: 24, projectCount: 8 },
        { _id: '2', name: 'Design', description: 'UI/UX design and creative work', memberCount: 12, projectCount: 5 },
        { _id: '3', name: 'Marketing', description: 'Marketing campaigns and brand management', memberCount: 15, projectCount: 10 },
        { _id: '4', name: 'Sales', description: 'Customer acquisition and business development', memberCount: 18, projectCount: 6 },
        { _id: '5', name: 'HR', description: 'Human resources and talent management', memberCount: 6, projectCount: 3 },
        { _id: '6', name: 'Finance', description: 'Financial planning and accounting', memberCount: 8, projectCount: 4 }
      ];
      setDepartments(mockData);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      // await api.post(`/api/companies/${companyId}/departments`, newDepartment);
      setShowAddModal(false);
      setNewDepartment({ name: '', description: '' });
      fetchDepartments(companyId);
    } catch (err) {
      console.error('Failed to add department:', err);
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
    <div className="flex-grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Departments</h1>
            <p className="text-slate-600">Organize teams into departments</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-95"
          >
            <IoAddOutline className="text-xl" />
            <span>Create Department</span>
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="flex-grow overflow-y-auto p-8">
        {loading ? (
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
                <div className={`bg-gradient-to-r ${getDepartmentColor(index)} p-6 text-white`}>
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
                      <p className="text-2xl font-bold text-slate-800">{dept.memberCount}</p>
                      <p className="text-xs text-slate-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <IoFolderOpenOutline className="mx-auto text-2xl text-purple-600 mb-1" />
                      <p className="text-2xl font-bold text-slate-800">{dept.projectCount}</p>
                      <p className="text-xs text-slate-600">Projects</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
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
              <div className="mb-6">
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
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
