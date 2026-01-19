import React, { useState, useEffect } from 'react';
import { IoChevronDown, IoSwapHorizontal, IoAddCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CompanySwitcher = ({ currentCompanyId, onCompanySwitch }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('companyRole') || 'employee');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/companies/my-companies', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompanies(data.companies || []);
      
      if (currentCompanyId) {
        const current = data.companies?.find(c => c._id === currentCompanyId);
        setCurrentCompany(current);
      } else if (data.defaultCompany) {
        const defaultComp = data.companies?.find(c => c._id === data.defaultCompany);
        setCurrentCompany(defaultComp);
      } else if (data.companies?.length > 0) {
        setCurrentCompany(data.companies[0]);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/companies/switch',
        { companyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selected = companies.find(c => c._id === companyId);
      setCurrentCompany(selected);
      localStorage.setItem('companyId', companyId);
      setShowDropdown(false);
      
      if (onCompanySwitch) {
        onCompanySwitch(companyId);
      }

      // Reload window to update dashboard with new company context
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch company:', err);
    }
  };

  if (!currentCompany && companies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors"
      >
        <IoSwapHorizontal className="w-5 h-5" />
        <span className="text-sm font-medium max-w-[150px] truncate">{currentCompany?.name}</span>
        <IoChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Switch Company</p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company._id}
                onClick={() => handleCompanySelect(company._id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  company._id === currentCompany._id
                    ? 'bg-primary-50 border-l-4 border-l-primary-600'
                    : ''
                }`}
              >
                <p className="font-medium text-gray-800">{company.name}</p>
                <p className="text-xs text-gray-500">{company.industry || 'Company'}</p>
              </button>
            ))}
          </div>

          {/* Create New Company Button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                setShowDropdown(false);
                // Navigate based on current dashboard
                const isManager = currentRole === 'manager' || currentRole === 'owner';
                if (isManager) {
                  navigate('/dashboard/manager/create-company');
                } else {
                  navigate('/dashboard/create-company');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-sm"
            >
              <IoAddCircleOutline className="w-5 h-5" />
              <span>Create New Company</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySwitcher;
