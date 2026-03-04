import React, { useState, useEffect } from 'react';
import {
  IoBarChartOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoStatsChartOutline,
  IoWalletOutline,
  IoRefreshOutline,
  IoServerOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      if (!analytics) setLoading(true);
      else setRefreshing(true);

      const response = await api.get('/api/super-admin/analytics');
      setAnalytics(response.data);
      const pricingResponse = await api.get('/api/super-admin/pricing-plans');
      setPricingPlans(pricingResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Gathering platform insights...</p>
      </div>
    );
  }

  const { overview, analytics: analyticsBreakdown } = analytics || {};

  const stats = [
    {
      label: "Total Companies",
      value: overview?.totalCompanies || 0,
      subtext: "Active organizations",
      icon: IoBusinessOutline,
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      label: "Total Users",
      value: overview?.totalUsers || 0,
      subtext: "Registered members",
      icon: IoPeopleOutline,
      color: "purple",
      gradient: "from-purple-500 to-fuchsia-600"
    },
    {
      label: "Total Tasks",
      value: overview?.totalTasks || 0,
      subtext: "Tasks created",
      icon: IoCheckmarkCircleOutline,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      label: "Departments",
      value: overview?.totalDepartments || 0,
      subtext: "Organized units",
      icon: IoStatsChartOutline,
      color: "orange",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      label: "Announcements",
      value: overview?.totalAnnouncements || 0,
      subtext: "Broadcast messages",
      icon: IoTrendingUpOutline,
      color: "rose",
      gradient: "from-rose-500 to-pink-600"
    },
    {
      label: "Pricing Plans",
      value: pricingPlans.length,
      subtext: "Active subscription tiers",
      icon: IoWalletOutline,
      color: "cyan",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Platform Overview</h1>
          <p className="text-slate-500 font-medium">Real-time insights on system performance and growth.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={refreshing}
          className={`px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <stat.icon className={`text-9xl text-${stat.color}-600 transform rotate-12 translate-x-4 -translate-y-4`} />
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg shadow-${stat.color}-200`}>
                <stat.icon className="text-2xl" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value.toLocaleString()}</h3>
                <p className={`text-xs font-bold mt-1 text-${stat.color}-600 flex items-center gap-1`}>
                  <IoTrendingUpOutline /> {stat.subtext}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Breakdowns */}
      {analyticsBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Analytics */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <IoBarChartOutline className="text-xl" />
              </div>
              Task Analytics
            </h2>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">By Status</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Total: {Object.values(analyticsBreakdown.tasksByStatus || {}).reduce((a, b) => a + b, 0)}</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(analyticsBreakdown.tasksByStatus || {}).map(([status, count], idx) => {
                    const total = Object.values(analyticsBreakdown.tasksByStatus).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];

                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-700 font-bold capitalize text-sm">{status}</span>
                          <span className="font-bold text-slate-900 text-sm">{count} <span className="text-slate-400 text-xs ml-1">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${colors[idx % colors.length]} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">By Priority</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analyticsBreakdown.tasksByPriority || {}).map(([priority, count]) => {
                    const colors = {
                      low: 'bg-slate-500',
                      medium: 'bg-blue-500',
                      high: 'bg-orange-500',
                      urgent: 'bg-red-500',
                    };
                    return (
                      <div key={priority} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${colors[priority.toLowerCase()] || 'bg-slate-400'}`}></div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{priority}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <IoPeopleOutline className="text-xl" />
              </div>
              User Distribution
            </h2>

            <div className="space-y-4">
              {Object.keys(analyticsBreakdown.usersByRole || {}).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <IoPeopleOutline className="mx-auto text-4xl mb-2 opacity-30" />
                  <p>No user data available</p>
                </div>
              ) : (
                Object.entries(analyticsBreakdown.usersByRole || {}).map(([role, count]) => {
                  const total = Object.values(analyticsBreakdown.usersByRole).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  const bgColors = {
                    owner: 'bg-purple-600',
                    manager: 'bg-blue-600',
                    employee: 'bg-emerald-600',
                  };
                  const icons = {
                    owner: IoShieldCheckmarkOutline,
                    manager: IoServerOutline,
                    employee: IoPeopleOutline,
                  };
                  const Icon = icons[role] || IoPeopleOutline;

                  return (
                    <div key={role} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <div className={`w-12 h-12 rounded-xl ${bgColors[role] || 'bg-slate-600'} flex items-center justify-center text-white shadow-md shrink-0`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="ml-4 grow">
                        <h4 className="font-bold text-slate-800 capitalize text-lg">{role}s</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{count} Accounts</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-700">{percentage}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAnalytics;
