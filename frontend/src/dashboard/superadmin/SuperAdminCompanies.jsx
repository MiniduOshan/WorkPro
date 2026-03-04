import React, { useState, useEffect } from 'react';
import {
  IoBusinessOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoStatsChartOutline,
  IoMailOutline,
  IoCloseCircleOutline,
  IoListOutline,
  IoGridOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('companyViewMode') || 'grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/analytics/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (company) => {
    setSelectedCompany(company);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'DELETE MY COMPANY') {
      alert('Please enter the correct confirmation text');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/api/companies/${selectedCompany._id}`, {
        data: { confirmation: 'DELETE MY COMPANY' }
      });

      setCompanies(companies.filter(c => c._id !== selectedCompany._id));
      setShowDeleteModal(false);
      setSelectedCompany(null);
      setDeleteConfirmation('');
    } catch (err) {
      console.error('Failed to delete company:', err);
      alert(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredCompanies = companies
    .filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'members': valA = a.memberCount; valB = b.memberCount; break;
        case 'tasks': valA = a.taskCount; valB = b.taskCount; break;
        case 'depts': valA = a.departmentCount; valB = b.departmentCount; break;
        default: valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('companyViewMode', mode);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Companies Management</h1>
          <p className="text-slate-500 font-medium">Oversee and manage independent organizations.</p>
        </div>
        <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-600 shadow-sm flex items-center gap-2">
          <IoBusinessOutline className="text-blue-500 text-xl" />
          <span>{companies.length} Total Organizations</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative group flex-1 max-w-xl">
          <IoSearchOutline className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-medium text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center shadow-sm">
            <button
              onClick={() => toggleViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <IoGridOutline className="text-xl" />
            </button>
            <button
              onClick={() => toggleViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <IoListOutline className="text-xl" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-5 pr-10 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-bold text-slate-600 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="members">Sort by Members</option>
              <option value="tasks">Sort by Tasks</option>
              <option value="depts">Sort by Depts</option>
            </select>
            <IoChevronDownOutline className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? <IoArrowUpOutline className="text-xl" /> : <IoArrowDownOutline className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white h-64 rounded-3xl border border-slate-100" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoBusinessOutline className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">No companies found</h3>
          <p className="text-slate-400 font-medium">Try adjusting your search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <span className="text-2xl font-black">{company.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{company.name}</h3>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {company.industry || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                      <IoPeopleOutline />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Owner</p>
                      <p className="text-sm font-bold text-slate-700">{company.owner?.firstName} {company.owner?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                      <IoMailOutline />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{company.owner?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <p className="text-xl font-black text-blue-600">{company.memberCount}</p>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Members</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <p className="text-xl font-black text-purple-600">{company.taskCount}</p>
                    <p className="text-[10px] font-bold text-purple-400 uppercase">Tasks</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <p className="text-xl font-black text-emerald-600">{company.departmentCount}</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Depts</p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteClick(company)}
                    className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <IoTrashOutline className="text-lg" />
                    Delete Organization
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Owner / Contact</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Depts</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md shadow-blue-100">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{company.name}</p>
                          <p className="text-xs text-slate-400 font-medium lowercase">{company.industry || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-700">{company.owner?.firstName} {company.owner?.lastName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <IoMailOutline className="text-[10px]" /> {company.owner?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border border-blue-100">
                        {company.memberCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border border-purple-100">
                        {company.taskCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border border-emerald-100">
                        {company.departmentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(company)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Organization"
                      >
                        <IoTrashOutline className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoWarningOutline className="text-4xl text-red-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Delete Company?</h2>
            <p className="text-slate-500 text-center mb-8 font-medium">
              You are about to permanently delete <strong className="text-slate-800">{selectedCompany.name}</strong> and all associated data. This action cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">
                Confirmation Required
              </p>
              <p className="text-sm text-red-600 mb-4 font-medium">
                Type <strong className="font-mono bg-red-100 px-1 rounded">DELETE MY COMPANY</strong> below:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type confirmation text..."
                className="w-full px-4 py-3 border border-red-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all font-bold text-red-800 placeholder-red-300 bg-white"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCompany(null);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmation !== 'DELETE MY COMPANY'}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCompanies;
