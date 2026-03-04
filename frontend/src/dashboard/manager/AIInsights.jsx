import React, { useState, useEffect } from 'react';
import {
  IoRefreshOutline,
  IoStatsChartOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrendingUpOutline,
  IoRocketOutline,
  IoDocumentTextOutline,
  IoAnalyticsOutline, // Added IoAnalyticsOutline here
} from 'react-icons/io5';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import api from '../../api/axios';
import MonthlyReport from './MonthlyReport';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const AIInsights = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [features, setFeatures] = useState({});

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    fetchFeatures();
    fetchChartData();
  }, []);

  const fetchFeatures = async () => {
    if (!companyId) return;
    try {
      const { data } = await api.get(`/api/companies/${companyId}`);
      if (data.plan && data.plan.features) {
        setFeatures(data.plan.features);
        if (data.plan.features.aiInsights) {
          generateSummary();
        }
      }
    } catch (err) {
      console.error('Failed to fetch company features:', err);
    }
  };

  const generateSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ai/summarize', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setSummary(response.data.summary);
      setRawData(response.data.rawData);
      setLastGenerated(new Date(response.data.generatedAt));
    } catch (err) {
      console.error('Failed to generate analytics summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await api.get('/api/ai/daily-data', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setChartData(response.data);
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  };

  // Build chart-friendly data from the API response
  const priorityData = chartData?.tasksByPriority
    ? Object.entries(chartData.tasksByPriority).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    : [];

  const overviewBarData = chartData
    ? [
      { name: 'Completed', value: chartData.tasksCompleted || 0, fill: '#10b981' },
      { name: 'Active', value: chartData.activeTasks || 0, fill: '#3b82f6' },
      { name: 'Overdue', value: chartData.overdueTasks || 0, fill: '#ef4444' },
      { name: 'Announcements', value: chartData.announcements || 0, fill: '#8b5cf6' },
      { name: 'Channel Activity', value: chartData.channelActivity || 0, fill: '#f59e0b' },
    ]
    : [];

  // Donut data for task status distribution
  const statusDonutData = chartData
    ? [
      { name: 'Completed', value: chartData.tasksCompleted || 0 },
      { name: 'Active', value: chartData.activeTasks || 0 },
      { name: 'Overdue', value: chartData.overdueTasks || 0 },
    ].filter(d => d.value > 0)
    : [];

  const statusColors = ['#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <IoAnalyticsOutline className="w-8 h-8 text-purple-600" />
            Performance Analytics
          </h1>
          <p className="text-slate-600 mt-2">Real-time engagement and predictive modeling</p>
        </div>
        {features.aiInsights && (
          <button
            onClick={() => { generateSummary(); fetchChartData(); }}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Refresh'}
          </button>
        )}
      </div>

      {features.aiInsights ? (
        <>
          {/* Main Analytics Summary Card */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-purple-200 p-8 ai-summary-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <IoAnalyticsOutline className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">Analytics Intelligence Summary</h2>
                  {lastGenerated && (
                    <span className="text-xs text-slate-500">
                      Generated {lastGenerated.toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-transparent rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-transparent rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-indigo-200 to-transparent rounded animate-pulse w-3/4"></div>
                  </div>
                ) : summary ? (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line analytics-summary-text">
                      {summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">No data available for generation.</p>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          {rawData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* ... existing metrics cards ... */}
            </div>
          )}

          {/* Charts Section */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ... existing charts ... */}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-16 rounded-3xl shadow-sm text-center border border-slate-100 max-w-3xl mx-auto my-8">
          <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
            <IoAnalyticsOutline className="text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Analytics Intelligence</h2>
          <p className="text-slate-600 mb-10 text-lg leading-relaxed">
            Get professional analytics insights and real-time engagement monitoring
            of your company's workspace. Upgrade to unlock advanced analytics.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/manager/billing'}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-purple-200 transition-all text-lg"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Key Metrics */}
      {rawData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{rawData.tasksCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <IoTrendingUpOutline className="w-4 h-4 mr-1" />
              Last 24 hours
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Tasks</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{rawData.activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IoStatsChartOutline className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">In progress now</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{rawData.overdueTasks}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <IoAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-red-600">Needs attention</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Announcements</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{rawData.announcements}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <IoAnalyticsOutline className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Last 24 hours</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Overview Bar Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Activity Overview</h3>
            <p className="text-sm text-slate-500 mb-6">Last 24 hours breakdown</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overviewBarData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {overviewBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Donut */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Task Status Distribution</h3>
            <p className="text-sm text-slate-500 mb-6">Current task breakdown</p>
            {statusDonutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '13px', color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-slate-400">
                No task data available
              </div>
            )}
          </div>

          {/* Tasks by Priority Bar Chart */}
          {priorityData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Tasks by Priority</h3>
              <p className="text-sm text-slate-500 mb-6">Active tasks grouped by priority level</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Engagement Area Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Team Engagement</h3>
            <p className="text-sm text-slate-500 mb-6">Key metrics at a glance</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={[
                  { name: 'Completed', value: chartData.tasksCompleted || 0 },
                  { name: 'Active', value: chartData.activeTasks || 0 },
                  { name: 'Channels', value: chartData.channelActivity || 0 },
                  { name: 'Announcements', value: chartData.announcements || 0 },
                  { name: 'Overdue', value: chartData.overdueTasks || 0 },
                ]}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#colorGradient)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">How Analytics Work</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-bold text-xs">1</span>
            </div>
            <p>
              <strong className="text-slate-800">Data Aggregation:</strong> We collect tasks completed, announcements, and channel activity from the last 24 hours.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">2</span>
            </div>
            <p>
              <strong className="text-slate-800">Analytics Processing:</strong> We process the data to identify trends, achievements, and areas needing attention.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold text-xs">3</span>
            </div>
            <p>
              <strong className="text-slate-800">Visual Reports:</strong> Charts and metrics give you a clear, at-a-glance view of team performance and engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg ai-pro-tip">
        <div className="flex items-start gap-3">
          <IoAnalyticsOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 mb-1">Pro Tip</p>
            <p className="text-sm text-slate-700">
              Check your analytics every morning to stay on top of your team's progress and identify potential bottlenecks early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
