import React, { useState, useEffect } from 'react';
import {
  IoBusinessOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/analytics/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
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
                  <p className="text-2xl font-bold text-green-600">{company.teamCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Teams</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600">Departments: </span>
                  <span className="font-semibold text-gray-900">{company.departmentCount}</span>
                </div>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                  <IoEyeOutline className="w-4 h-4" />
                  View Details
                </button>
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
    </div>
  );
};

export default SuperAdminCompanies;
