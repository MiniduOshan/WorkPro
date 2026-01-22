import React, { useState, useEffect, useCallback } from 'react';
import {
  IoBarChartOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoClose,
  IoAddOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [companiesAnalytics, setCompaniesAnalytics] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    features: [],
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const fetchAllAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching SuperAdmin analytics...');
      
      const [analData, compData, userData, pricingData] = await Promise.all([
        api.get('/api/super-admin/analytics'),
        api.get('/api/super-admin/analytics/companies'),
        api.get('/api/super-admin/analytics/users'),
        api.get('/api/super-admin/pricing-plans'),
      ]);

      console.log('Analytics data:', analData.data);
      console.log('Companies data:', compData.data);
      console.log('Users data:', userData.data);
      console.log('Pricing data:', pricingData.data);

      setAnalytics(analData.data);
      setCompaniesAnalytics(compData.data);
      setUserAnalytics(userData.data);
      setPricingPlans(pricingData.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Show error message to user
      if (err.response?.status === 403) {
        alert('Access denied. Please ensure you are logged in as a Super Admin. You may need to log out and log back in.');
      } else {
        alert('Failed to load analytics data. Please check console for details.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        '/api/super-admin/pricing-plans',
        { plans: [...pricingPlans, newPlan] }
      );

      setPricingPlans([...pricingPlans, newPlan]);
      setNewPlan({ name: '', price: '', features: [] });
      setShowPricingModal(false);
    } catch (err) {
      console.error('Failed to add pricing plan:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, analytics: analyticsBreakdown } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
        <p className="text-purple-100 mt-2 text-lg">Platform-wide analytics and management</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-full">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Companies</p>
                <p className="text-4xl font-bold mt-2">{overview.totalCompanies || 0}</p>
                <p className="text-xs text-blue-100 mt-1">Organizations joined</p>
              </div>
              <IoBusinessOutline className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">{overview.totalUsers || 0}</p>
                <p className="text-xs text-green-100 mt-1">Active platform users</p>
              </div>
              <IoPeopleOutline className="w-12 h-12 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Tasks</p>
                <p className="text-4xl font-bold mt-2">{overview.totalTasks || 0}</p>
                <p className="text-xs text-yellow-100 mt-1">Tasks created</p>
              </div>
              <IoCheckmarkCircle className="w-12 h-12 text-yellow-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Teams</p>
                <p className="text-4xl font-bold mt-2">{overview.totalTeams || 0}</p>
                <p className="text-xs text-purple-100 mt-1">Teams formed</p>
              </div>
              <IoBusinessOutline className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Departments</p>
                <p className="text-4xl font-bold mt-2">{overview.totalDepartments || 0}</p>
                <p className="text-xs text-orange-100 mt-1">Across all companies</p>
              </div>
              <IoBarChartOutline className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Announcements</p>
                <p className="text-4xl font-bold mt-2">{overview.totalAnnouncements || 0}</p>
                <p className="text-xs text-red-100 mt-1">Platform-wide posts</p>
              </div>
              <IoClose className="w-12 h-12 text-red-200 opacity-80" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Analytics */}
        {analyticsBreakdown && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <IoBarChartOutline className="w-6 h-6 text-purple-600" />
              Task Analytics
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5">
                <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  By Status
                </h3>
                <div className="space-y-3">
                  {Object.keys(analyticsBreakdown.tasksByStatus || {}).length > 0 ? (
                    Object.entries(analyticsBreakdown.tasksByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-gray-700 capitalize font-medium">{status}</span>
                        <span className="font-bold text-blue-600 text-lg">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No task data available</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5">
                <h3 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  By Priority
                </h3>
                <div className="space-y-3">
                  {Object.keys(analyticsBreakdown.tasksByPriority || {}).length > 0 ? (
                    Object.entries(analyticsBreakdown.tasksByPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-gray-700 capitalize font-medium">{priority}</span>
                        <span className="font-bold text-green-600 text-lg">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No priority data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Users By Role */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5">
              <h3 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                Users By Role
              </h3>
              <div className="space-y-3">
                {Object.keys(analyticsBreakdown.usersByRole || {}).length > 0 ? (
                  Object.entries(analyticsBreakdown.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                      <span className="text-gray-700 capitalize font-medium">{role}</span>
                      <span className="font-bold text-purple-600 text-lg">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No role data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pricing Plans</h2>
            <button
              onClick={() => setShowPricingModal(true)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {pricingPlans.length > 0 ? (
              pricingPlans.map((plan, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-primary-600 font-bold mt-1">${plan.price}/mo</p>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pricing plans configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Companies List */}
      {companiesAnalytics && companiesAnalytics.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <IoBusinessOutline className="w-6 h-6 text-blue-600" />
              Companies Joined ({companiesAnalytics.length})
            </h2>
            <div className="text-sm text-gray-500">
              Showing all registered companies
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">#</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Company Name</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Owner</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Members</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Tasks</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Teams</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Departments</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody>
                {companiesAnalytics.map((company, index) => (
                  <tr key={company._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="py-4 px-4 text-gray-600 font-medium">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">ID: {company._id.substring(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {company.owner ? (
                        <div>
                          <div className="font-medium">{company.owner.firstName} {company.owner.lastName}</div>
                          <div className="text-xs text-gray-500">{company.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No owner</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center bg-green-100 text-green-800 font-bold rounded-full px-3 py-1">
                        {company.memberCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full px-3 py-1">
                        {company.taskCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center bg-purple-100 text-purple-800 font-bold rounded-full px-3 py-1">
                        {company.teamCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center bg-orange-100 text-orange-800 font-bold rounded-full px-3 py-1">
                        {company.departmentCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <IoBusinessOutline className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Companies Yet</h3>
            <p className="text-gray-500 text-lg">Companies will appear here when users create them</p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-900">
                <strong>Getting Started:</strong> Users need to sign up and create their first company to appear on this dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Pricing Plan</h2>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Pro, Enterprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($/month) *
                </label>
                <input
                  type="number"
                  required
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="99"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
