import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

// ── Pastel KPI Card ───────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, bgColor, iconColor, isDarkMode }) => (
  <div className={`rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group hover:shadow-md ${isDarkMode
      ? 'bg-slate-800/40 border-white/10 shadow-sm shadow-black/20'
      : `${bgColor} border-transparent shadow-sm shadow-slate-100`
    }`}>
    {/* Subtle gradient glow in dark mode */}
    {isDarkMode && (
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl ${iconColor.replace('text-', 'bg-')}`} />
    )}

    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDarkMode ? 'bg-white/10 border-white/5' : 'bg-white/60 border-transparent'
      } backdrop-blur-sm border shadow-sm`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <p className={`text-2xl font-black tracking-tight leading-none mb-1 ${isDarkMode ? 'text-gray-50' : 'text-gray-800'}`}>
      {value}
    </p>
    <p className={`text-sm font-bold uppercase tracking-wider text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {label}
    </p>
  </div>
);

// ── Custom Tooltip for Area Chart ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`border shadow-xl rounded-xl px-4 py-3 text-sm animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
        <p className={`font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</p>
        <p className={`${isDarkMode ? 'text-purple-400' : 'text-purple-500'} font-semibold`}>
          MRR: ${payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// ── Donut Legend Item ─────────────────────────────────────────────────────────
const DonutLegendItem = ({ color, name, value, pct, isDarkMode }) => (
  <div className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
    }`}>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ background: color }} />
      <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{name}</span>
    </div>
    <div className="flex items-center gap-3 ml-4">
      <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
      <span className={`font-bold text-xs px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-800/80' : 'bg-gray-50'
        }`} style={{ color }}>{pct}%</span>
    </div>
  </div>
);

const DONUT_COLORS = ['#a855f7', '#fbbf24', '#6366f1', '#10b981'];

// ── Main Component ────────────────────────────────────────────────────────────
const SuperAdminRevenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('dashboardTheme') === 'dark');

  useEffect(() => {
    fetchRevenue();

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

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/super-admin/revenue');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-700 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Calculating revenue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>
        <button onClick={fetchRevenue} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-md">
          <IoRefreshOutline /> Retry
        </button>
      </div>
    );
  }

  const {
    mrr = 0,
    arr = 0,
    totalSubscribers = 0,
    avgOrderValue = 0,
    planBreakdown = [],
    monthlyData = [],
  } = data || {};

  // Build donut data from plan breakdown (paid plans only)
  const donutData = planBreakdown.length > 0
    ? planBreakdown.map((p, i) => ({ name: p.name, value: p.subscribers, revenue: p.revenue }))
    : [{ name: 'No subscribers', value: 1, revenue: 0 }];

  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Revenue Overview</h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Live subscription revenue from active plans</p>
        </div>
        <button
          onClick={fetchRevenue}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition ${isDarkMode
              ? 'bg-slate-800 text-gray-200 border border-slate-700 hover:bg-slate-700'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
        >
          <IoRefreshOutline className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Top Row: Area Chart + KPI cards ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Area Chart */}
        <div className={`lg:col-span-2 rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Total Revenue</h2>
              <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                ${mrr.toLocaleString()}
                <span className={`text-sm font-normal ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ month</span>
              </p>
            </div>
            <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> MRR
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`}
              />
              <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a855f7"
                strokeWidth={2.5}
                fill="url(#mrrGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#a855f7', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* KPI Cards 2×2 */}
        <div className="grid grid-cols-2 gap-4 content-start">
          <KpiCard
            icon={IoWalletOutline}
            label="Monthly Revenue"
            value={`$${mrr.toLocaleString()}`}
            bgColor="bg-purple-50"
            iconColor="text-purple-500"
            isDarkMode={isDarkMode}
          />
          <KpiCard
            icon={IoCalendarOutline}
            label="Annual Revenue"
            value={`$${arr.toLocaleString()}`}
            bgColor="bg-pink-50"
            iconColor="text-pink-500"
            isDarkMode={isDarkMode}
          />
          <KpiCard
            icon={IoPeopleOutline}
            label="Paid Subscribers"
            value={totalSubscribers}
            bgColor="bg-green-50"
            iconColor="text-green-500"
            isDarkMode={isDarkMode}
          />
          <KpiCard
            icon={IoTrendingUpOutline}
            label="Avg / Company"
            value={`$${avgOrderValue}`}
            bgColor="bg-amber-50"
            iconColor="text-amber-500"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* ── Bottom Row: Plan breakdown table + Donut ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Plan Breakdown Table */}
        <div className={`lg:col-span-2 rounded-2xl shadow-sm border p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Revenue by Plan</h2>
          </div>

          {planBreakdown.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <IoPeopleOutline className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No paid subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                    <th className={`text-left py-2 px-3 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan</th>
                    <th className={`text-center py-2 px-3 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price/mo</th>
                    <th className={`text-center py-2 px-3 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subscribers</th>
                    <th className={`text-right py-2 px-3 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</th>
                    <th className={`text-right py-2 px-3 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {planBreakdown.map((plan, i) => {
                    const totalRev = planBreakdown.reduce((s, p) => s + p.revenue, 0) || 1;
                    const pct = Math.round((plan.revenue / totalRev) * 100);
                    return (
                      <tr key={plan.name} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                        }`}>
                        <td className={`py-3 px-3 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{plan.name}</span>
                          </div>
                        </td>
                        <td className={`py-3 px-3 text-center border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-50'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>${plan.price}</td>
                        <td className={`py-3 px-3 text-center border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-50'}`}>
                          <span className={`inline-flex items-center justify-center font-bold rounded-full px-2.5 py-0.5 text-xs border ${isDarkMode
                              ? 'bg-purple-900/30 text-purple-400 border-purple-800/30'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                            }`}>
                            {plan.subscribers}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-bold border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-50'} ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>${plan.revenue.toLocaleString()}</td>
                        <td className={`py-3 px-3 text-right border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-50'} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          <div className="flex items-center justify-end gap-2">
                            <div className={`w-16 rounded-full h-1.5 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                              }`}>
                              <div
                                className="h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                              />
                            </div>
                            <span className={`text-xs font-bold w-8 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Donut Chart */}
        <div className={`rounded-2xl shadow-sm border p-6 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Plan Breakdown</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <PieChart width={180} height={180}>
                <Pie
                  data={donutData}
                  cx={85}
                  cy={85}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{donutTotal}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Subscribers</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-4 space-y-1.5">
              {donutData.map((d, i) => (
                <DonutLegendItem
                  key={d.name}
                  color={DONUT_COLORS[i % DONUT_COLORS.length]}
                  name={d.name}
                  value={d.value}
                  pct={donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRevenue;
