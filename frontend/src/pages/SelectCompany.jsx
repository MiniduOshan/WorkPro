import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoChevronForward, IoAddOutline } from 'react-icons/io5';
import api from '../api/axios';

const SelectCompany = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const companies = location.state?.companies || [];
  const defaultCompanyId = location.state?.defaultCompany;

  // Check if user is SuperAdmin
  React.useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        if (profile.isSuperAdmin === true) {
          console.log('SuperAdmin detected in SelectCompany, redirecting to admin dashboard');
          navigate('/dashboard/super-admin');
        }
      } catch (err) {
        console.error('Error parsing user profile', err);
      }
    }
  }, [navigate]);

  const handleSelectCompany = async (companyId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Switch to this company
      await api.post(
        '/api/companies/switch',
        { companyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selected = companies.find(c => c._id === companyId);
      localStorage.setItem('companyId', companyId);
      localStorage.setItem('companyName', selected?.name);
      localStorage.setItem('companyRole', selected?.role);

      // Route based on role
      if (selected?.role === 'employee') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard/manager');
      }
    } catch (err) {
      console.error('Failed to switch company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewCompany = () => {
    navigate('/dashboard?create-company=true');
  };

  if (companies.length === 0) {
    // Check if SuperAdmin
    const userProfile = localStorage.getItem('userProfile');
    let isSuperAdmin = false;
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        isSuperAdmin = profile.isSuperAdmin === true;
      } catch (err) {
        console.error('Error parsing profile');
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">No Companies</h1>
          <p className="text-gray-600 mb-6">
            You haven't joined any companies yet. {isSuperAdmin ? 'As a SuperAdmin, you can access the admin panel.' : 'Create your first one to get started!'}
          </p>
          {isSuperAdmin ? (
            <button
              onClick={() => navigate('/dashboard/super-admin')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold mb-3"
            >
              Go to SuperAdmin Dashboard
            </button>
          ) : null}
          <button
            onClick={handleCreateNewCompany}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            <IoAddOutline className="w-5 h-5" />
            Create Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-3">Select a Company</h1>
          <p className="text-primary-100 text-lg">You're part of multiple companies. Choose which one to access:</p>
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {companies.map((company) => (
            <button
              key={company._id}
              onClick={() => handleSelectCompany(company._id)}
              disabled={loading}
              className={`text-left p-6 rounded-lg border-2 transition-all hover:shadow-lg transform hover:scale-102 ${
                defaultCompanyId === company._id
                  ? 'bg-primary-100 border-primary-600'
                  : 'bg-white border-gray-200 hover:border-primary-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${
                    defaultCompanyId === company._id ? 'text-primary-600' : 'text-gray-900'
                  }`}>
                    {company.name}
                  </h3>

                  {company.description && (
                    <p className="text-gray-600 text-sm mt-1">{company.description}</p>
                  )}

                  {company.industry && (
                    <p className="text-gray-500 text-xs mt-2">
                      <strong>Industry:</strong> {company.industry}
                    </p>
                  )}

                  {defaultCompanyId === company._id && (
                    <div className="mt-3 inline-block px-3 py-1 bg-primary-200 text-primary-800 rounded-full text-xs font-semibold">
                      Default Company
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 ml-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    defaultCompanyId === company._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-primary-600 group-hover:text-white'
                  }`}>
                    <IoChevronForward className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create New Company */}
        <div className="text-center">
          <button
            onClick={handleCreateNewCompany}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-semibold border border-white border-opacity-30"
          >
            <IoAddOutline className="w-5 h-5" />
            Create New Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectCompany;
