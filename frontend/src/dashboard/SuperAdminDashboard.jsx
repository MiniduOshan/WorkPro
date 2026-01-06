import React, { useState, useEffect } from 'react';
import {
  IoBarChartOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoClose,
  IoAddOutline,
} from 'react-icons/io5';
import api from '../api/axios';

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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [analData, compData, userData, pricingData] = await Promise.all([
        api.get('/api/super-admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/super-admin/analytics/companies', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/super-admin/analytics/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/super-admin/pricing-plans', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAnalytics(analData.data);
      setCompaniesAnalytics(compData.data);
      setUserAnalytics(userData.data);
      setPricingPlans(pricingData.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        '/api/super-admin/pricing-plans',
        { plans: [...pricingPlans, newPlan] },
        { headers: { Authorization: `Bearer ${token}` } }
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
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform analytics and management</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Companies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalCompanies}</p>
              </div>
              <IoBusinessOutline className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalUsers}</p>
              </div>
              <IoPeopleOutline className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalTasks}</p>
              </div>
              <IoCheckmarkCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalTeams}</p>
              </div>
              <IoBusinessOutline className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalDepartments}</p>
              </div>
              <IoBarChartOutline className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Announcements</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalAnnouncements}</p>
              </div>
              <IoClose className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Analytics */}
        {analyticsBreakdown && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Task Analytics</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">By Status</h3>
                <div className="space-y-2">
                  {Object.entries(analyticsBreakdown.tasksByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
                <div className="space-y-2">
                  {Object.entries(analyticsBreakdown.tasksByPriority || {}).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{priority}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Users By Role */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Users By Role</h3>
              <div className="space-y-2">
                {Object.entries(analyticsBreakdown.usersByRole || {}).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{role}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
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
      {companiesAnalytics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Companies Overview</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Owner</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Members</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Tasks</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Teams</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Departments</th>
                </tr>
              </thead>
              <tbody>
                {companiesAnalytics.slice(0, 10).map((company) => (
                  <tr key={company._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{company.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {company.owner?.firstName} {company.owner?.lastName}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900">{company.memberCount}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{company.taskCount}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{company.teamCount}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{company.departmentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {companiesAnalytics.length > 10 && (
            <p className="text-sm text-gray-500 mt-4">
              Showing 10 of {companiesAnalytics.length} companies
            </p>
          )}
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
