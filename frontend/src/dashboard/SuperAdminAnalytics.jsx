import React, { useState, useEffect } from 'react';
import {
  IoBarChartOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoTrendingUpOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';
import api from '../api/axios';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, analytics: analyticsBreakdown } = analytics || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights and statistics</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Companies</p>
                <p className="text-4xl font-bold mt-2">{overview.totalCompanies}</p>
                <p className="text-blue-100 text-xs mt-2">Active organizations</p>
              </div>
              <IoBusinessOutline className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">{overview.totalUsers}</p>
                <p className="text-green-100 text-xs mt-2">Registered members</p>
              </div>
              <IoPeopleOutline className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Tasks</p>
                <p className="text-4xl font-bold mt-2">{overview.totalTasks}</p>
                <p className="text-purple-100 text-xs mt-2">Tasks created</p>
              </div>
              <IoCheckmarkCircle className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Teams</p>
                <p className="text-4xl font-bold mt-2">{overview.totalTeams}</p>
                <p className="text-orange-100 text-xs mt-2">Collaborative teams</p>
              </div>
              <IoPeopleOutline className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Departments</p>
                <p className="text-4xl font-bold mt-2">{overview.totalDepartments}</p>
                <p className="text-pink-100 text-xs mt-2">Organized units</p>
              </div>
              <IoStatsChartOutline className="w-12 h-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Announcements</p>
                <p className="text-4xl font-bold mt-2">{overview.totalAnnouncements}</p>
                <p className="text-indigo-100 text-xs mt-2">Broadcast messages</p>
              </div>
              <IoTrendingUpOutline className="w-12 h-12 opacity-30" />
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics */}
      {analyticsBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Analytics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <IoBarChartOutline className="w-6 h-6 text-purple-600" />
              Task Analytics
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  By Status
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsBreakdown.tasksByStatus || {}).map(([status, count]) => {
                    const total = Object.values(analyticsBreakdown.tasksByStatus).reduce((a, b) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 capitalize font-medium">{status}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  By Priority
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsBreakdown.tasksByPriority || {}).map(([priority, count]) => {
                    const colors = {
                      low: 'bg-green-600',
                      medium: 'bg-yellow-600',
                      high: 'bg-orange-600',
                      urgent: 'bg-red-600',
                    };
                    const total = Object.values(analyticsBreakdown.tasksByPriority).reduce((a, b) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={priority}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600 capitalize font-medium">{priority}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors[priority] || 'bg-gray-600'} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* User Analytics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <IoPeopleOutline className="w-6 h-6 text-purple-600" />
              User Distribution
            </h2>

            <div className="space-y-3">
              {Object.entries(analyticsBreakdown.usersByRole || {}).map(([role, count]) => {
                const total = Object.values(analyticsBreakdown.usersByRole).reduce((a, b) => a + b, 0);
                const percentage = ((count / total) * 100).toFixed(1);
                const colors = {
                  owner: 'from-purple-500 to-purple-600',
                  manager: 'from-blue-500 to-blue-600',
                  employee: 'from-green-500 to-green-600',
                };
                return (
                  <div key={role} className={`bg-gradient-to-r ${colors[role] || 'from-gray-500 to-gray-600'} rounded-lg p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 capitalize">{role}</p>
                        <p className="text-2xl font-bold mt-1">{count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold opacity-50">{percentage}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAnalytics;
