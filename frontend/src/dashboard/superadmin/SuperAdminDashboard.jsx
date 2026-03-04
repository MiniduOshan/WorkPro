import React, { useState, useEffect, useCallback } from 'react';
import {
  IoBarChartOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoWalletOutline,
  IoClose,
  IoAddOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import api, { baseURL } from '../../api/axios'; // Ensure baseURL is exported from axios.js
import { io } from 'socket.io-client';

const SuperAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [companiesAnalytics, setCompaniesAnalytics] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('dashboardTheme') === 'dark');
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    features: [],
  });

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.querySelector('.dashboard-theme')?.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    const themeNode = document.querySelector('.dashboard-theme');
    if (themeNode) {
      observer.observe(themeNode, { attributes: true });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Socket.io connection for real-time active users
    const socket = io(baseURL || 'http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('activeUsers', (count) => {

      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true);
        console.log('Fetching SuperAdmin analytics...');

        const results = await Promise.allSettled([
          api.get('/api/super-admin/analytics'),
          api.get('/api/super-admin/analytics/companies'),
          api.get('/api/super-admin/analytics/users'),
          api.get('/api/super-admin/pricing-plans'),
        ]);

        // Handle results individually
        if (results[0].status === 'fulfilled') {
          console.log('Analytics data:', results[0].value.data);
          setAnalytics(results[0].value.data);
        } else {
          console.error('Analytics failed:', results[0].reason);
          setAnalytics(null);
        }

        if (results[1].status === 'fulfilled') {
          console.log('Companies data:', results[1].value.data);
          setCompaniesAnalytics(results[1].value.data);
        } else {
          console.error('Companies failed:', results[1].reason);
          setCompaniesAnalytics([]);
        }

        if (results[2].status === 'fulfilled') {
          console.log('Users data:', results[2].value.data);
          setUserAnalytics(results[2].value.data);
        } else {
          console.error('Users failed:', results[2].reason);
          setAnalytics(null);
        }

        if (results[3].status === 'fulfilled') {
          console.log('Pricing data:', results[3].value.data);
          setPricingPlans(results[3].value.data);
        } else {
          console.error('Pricing failed:', results[3].reason);
          setPricingPlans([]);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/pricing-plans', newPlan); // Use POST to create
      setPricingPlans([...pricingPlans, res.data]);
      setNewPlan({ name: '', price: '', features: [] });
      setShowPricingModal(false);
    } catch (err) {
      console.error('Failed to add pricing plan:', err);
      alert('Failed to add plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/api/pricing-plans/${planId}`);
      setPricingPlans(pricingPlans.filter(p => p._id !== planId));
    } catch (err) {
      console.error('Failed to delete pricing plan:', err);
      alert('Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${isDarkMode ? 'border-slate-700 border-t-purple-500' : 'border-gray-300 border-t-purple-600'
            }`}></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, analytics: analyticsBreakdown } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-2xl p-8 text-white shadow-xl transition-all duration-500 ${isDarkMode
          ? 'bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/5 backdrop-blur-md'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600'
        }`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Super Admin Dashboard</h1>
            <p className={`${isDarkMode ? 'text-purple-300' : 'text-purple-100'} mt-2 text-lg font-medium`}>
              Platform-wide analytics and management
            </p>
          </div>
          <div className={`text-right px-6 py-4 rounded-2xl backdrop-blur-md border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'
            }`}>
            <p className={`text-xs uppercase tracking-widest font-black ${isDarkMode ? 'text-purple-300' : 'text-purple-200'}`}>
              Active Users Now
            </p>
            <div className="flex items-center justify-end gap-3 mt-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.6)]"></div>
              <span className="text-4xl font-black font-mono leading-none">{activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 text-xs font-bold flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'
            }`}>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : analytics ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`}></div>
            <span className="uppercase tracking-wider">{loading ? 'Loading...' : analytics ? 'System Online' : 'Partial Data'}</span>
          </div>
          <div className={`px-4 py-2 rounded-full border ${isDarkMode ? 'bg-white/5 border-white/10 text-purple-300' : 'bg-white/20 border-white/30 text-white'
            }`}>
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[
            { label: 'Total Companies', val: overview.totalCompanies || 0, sub: 'Organizations joined', icon: IoBusinessOutline, grad: 'from-blue-500 to-blue-600', iconColor: 'text-blue-200' },
            { label: 'Total Users', val: overview.totalUsers || 0, sub: 'Active platform users', icon: IoPeopleOutline, grad: 'from-green-500 to-green-600', iconColor: 'text-green-200' },
            { label: 'Total Tasks', val: overview.totalTasks || 0, sub: 'Tasks created', icon: IoCheckmarkCircle, grad: 'from-yellow-500 to-yellow-600', iconColor: 'text-yellow-200' },
            { label: 'Pricing Plans', val: pricingPlans.length, sub: 'Active plans', icon: IoWalletOutline, grad: 'from-indigo-500 to-indigo-600', iconColor: 'text-indigo-200' },
            { label: 'Departments', val: overview.totalDepartments || 0, sub: 'Across all companies', icon: IoBarChartOutline, grad: 'from-orange-500 to-orange-600', iconColor: 'text-orange-200' },
            { label: 'Announcements', val: overview.totalAnnouncements || 0, sub: 'Platform-wide posts', icon: IoClose, grad: 'from-red-500 to-red-600', iconColor: 'text-red-200' },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl relative overflow-hidden group border ${isDarkMode
                  ? 'bg-slate-800 border-white/5'
                  : `bg-gradient-to-br ${card.grad} border-transparent`
                }`}
            >
              {isDarkMode && (
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl bg-white`} />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-white/80'}`}>{card.label}</p>
                  <p className="text-3xl font-black mt-1 leading-tight">{card.val}</p>
                  <p className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-gray-500' : 'text-white/70'}`}>{card.sub}</p>
                </div>
                <card.icon className={`w-10 h-10 transition-transform group-hover:scale-110 ${isDarkMode ? 'text-gray-600' : `${card.iconColor} opacity-80`}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Analytics */}
        {analyticsBreakdown && (
          <div className={`lg:col-span-2 rounded-2xl shadow-sm border p-6 transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
            <h2 className={`text-2xl font-black mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
              <IoBarChartOutline className="w-7 h-7 text-purple-600" />
              Task Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`rounded-2xl p-6 transition-colors ${isDarkMode ? 'bg-slate-900/50 border border-white/5' : 'bg-blue-50/50 border border-blue-100'
                }`}>
                <h3 className={`text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'
                  }`}>
                  <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                  By Status
                </h3>
                <div className="space-y-3">
                  {Object.keys(analyticsBreakdown.tasksByStatus || {}).length > 0 ? (
                    Object.entries(analyticsBreakdown.tasksByStatus).map(([status, count]) => (
                      <div key={status} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-blue-50 shadow-sm border border-blue-50/50'
                        }`}>
                        <span className={`capitalize font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{status}</span>
                        <span className={`font-black text-xl transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center italic">No task data available</p>
                  )}
                </div>
              </div>

              <div className={`rounded-2xl p-6 transition-colors ${isDarkMode ? 'bg-slate-900/50 border border-white/5' : 'bg-emerald-50/50 border border-emerald-100'
                }`}>
                <h3 className={`text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-900'
                  }`}>
                  <div className="w-2 h-2 bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.5)]"></div>
                  By Priority
                </h3>
                <div className="space-y-3">
                  {Object.keys(analyticsBreakdown.tasksByPriority || {}).length > 0 ? (
                    Object.entries(analyticsBreakdown.tasksByPriority).map(([priority, count]) => (
                      <div key={priority} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-emerald-50 shadow-sm border border-emerald-50/50'
                        }`}>
                        <span className={`capitalize font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{priority}</span>
                        <span className={`font-black text-xl transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center italic">No priority data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Users By Role */}
            <div className={`rounded-2xl p-6 transition-colors ${isDarkMode ? 'bg-slate-900/50 border border-white/5' : 'bg-purple-50/50 border border-purple-100'
              }`}>
              <h3 className={`text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-900'
                }`}>
                <div className="w-2 h-2 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.5)]"></div>
                Users By Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(analyticsBreakdown.usersByRole || {}).length > 0 ? (
                  Object.entries(analyticsBreakdown.usersByRole).map(([role, count]) => (
                    <div key={role} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-purple-50 shadow-sm border border-purple-50/50'
                      }`}>
                      <span className={`capitalize font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{role}</span>
                      <span className={`font-black text-xl transition-colors ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center italic col-span-3">No role data available</p>
                )}
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Companies List */}
      {/* ... (Existing Companies List code remains same, omitted for brevity if unchanged, but for replacement tool I must include what I want to keep or use multi_replace. Since I am replacing the whole file content in this tool call (implied by previous usage patterns), I must be careful. 
      WAIT, I should use multi_replace or ensure I include the rest of the file. 
      The tool `replace_file_content` replaces a BLOCK. I need to be careful.
      {companiesAnalytics && companiesAnalytics.length > 0 ? (
        <div className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className={`text-2xl font-black flex items-center gap-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <IoBusinessOutline className="w-7 h-7 text-blue-600" />
              Recent Companies <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full ml-2">{companiesAnalytics.length}</span>
            </h2>
            <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Real-time synchronization active
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-gray-50 border-gray-100'} border-b transition-colors`}>
                  <th className={`text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>#</th>
                  <th className={`text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Company</th>
                  <th className={`text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ownership</th>
                  <th className={`text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Stats</th>
                  <th className={`text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Created</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                {companiesAnalytics.map((company, index) => (
                  <tr key={company._id} className={`transition-colors group ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-blue-50/30'
                  }`}>
                    <td className={`py-4 px-4 text-xs font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className={`font-bold transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{company.name}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{company._id}</div>
                    </td>
                    <td className="py-4 px-4">
                      {company.owner ? (
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>{company.owner.firstName} {company.owner.lastName}</span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{company.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Unowned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Users</span>
                          <span className={`text-sm font-black ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{company.memberCount || 0}</span>
                        </div>
                        <div className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Tasks</span>
                          <span className={`text-sm font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{company.taskCount || 0}</span>
                        </div>
                        <div className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Depts</span>
                          <span className={`text-sm font-black ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{company.departmentCount || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-4 text-center text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border border-dashed p-20 transition-all ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        }`}>
          <div className="text-center">
            <IoBusinessOutline className={`w-20 h-20 mx-auto mb-6 opacity-30 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-2xl font-black mb-2 uppercase tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>No Companies Yet</h3>
            <p className={`text-lg font-medium max-w-md mx-auto mb-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              The platform is waiting for its first registered organization to join the network.
            </p>
            <div className={`border rounded-2xl p-6 max-w-md mx-auto transition-colors ${
              isDarkMode ? 'bg-blue-900/10 border-blue-900/30 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-900'
            }`}>
              <p className="text-sm font-medium">
                <strong>System Tip:</strong> You can monitor self-registrations and direct company creation from the Companies management tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 transition-all scale-100 ${isDarkMode ? 'bg-slate-800 border border-white/10' : 'bg-white'
            }`}>
            <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Pricing Plan</h2>

            <form onSubmit={handleAddPlan} className="space-y-6">
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className={`w-full px-5 py-3 rounded-xl border outline-none focus:ring-4 transition-all font-bold ${isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-purple-900 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-50 focus:border-purple-400'
                    }`}
                  placeholder="e.g., Pro, Enterprise"
                />
              </div>

              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Price ($/month) *
                </label>
                <input
                  type="number"
                  required
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, price: e.target.value })
                  }
                  className={`w-full px-5 py-3 rounded-xl border outline-none focus:ring-4 transition-all font-bold ${isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-purple-900 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-purple-50 focus:border-purple-400'
                    }`}
                  placeholder="99"
                />
              </div>

              <div className="flex gap-4 justify-end pt-6">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${isDarkMode
                      ? 'bg-slate-700 text-gray-200 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-400/20 active:scale-95"
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
