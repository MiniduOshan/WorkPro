import React, { useState, useEffect } from 'react';
import {
  IoBusinessOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoTrashOutline,
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
  const token = localStorage.getItem('token');

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
      alert('Company deleted successfully');
    } catch (err) {
      console.error('Failed to delete company:', err);
      alert(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-2">Manage all organizations on the platform</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
          {companies.length} Total
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by company name or owner email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company._id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IoBusinessOutline className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.industry || 'General'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Owner</span>
                <span className="font-medium text-gray-900">
                  {company.owner?.firstName} {company.owner?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {company.owner?.email}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{company.memberCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{company.taskCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{company.departmentCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Departments</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                      {/* Add view option */}        
                  </button>
                  <button
                    onClick={() => handleDeleteClick(company)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 p-1.5 hover:bg-red-50 rounded transition"
                    title="Delete company"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <IoBusinessOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No companies found matching your search.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <IoTrashOutline className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Company?</h2>
            <p className="text-gray-600 text-center mb-4">
              You are about to permanently delete <strong>{selectedCompany.name}</strong> and all associated data.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-3">
                <strong>Warning:</strong> This action cannot be undone. All tasks, teams, members, and related data will be deleted.
              </p>
              <p className="text-sm text-red-800">
                Type <strong className="font-mono">DELETE MY COMPANY</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type confirmation text..."
                className="w-full mt-3 px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCompany(null);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmation !== 'DELETE MY COMPANY'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCompanies;
