import React, { useState, useEffect } from 'react';
import {
    IoDocumentTextOutline,
    IoPrintOutline,
    IoArrowUpOutline,
    IoArrowDownOutline,
    IoTrendingUpOutline,
    IoStatsChartOutline,
    IoPeopleOutline,
    IoBusinessOutline
} from 'react-icons/io5';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const MonthlyReport = () => {
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const companyId = localStorage.getItem('companyId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch report and company in parallel
                const [reportRes, companyRes] = await Promise.all([
                    api.get('/api/ai/monthly-report', { headers: { 'x-company-id': companyId } }),
                    api.get(`/api/companies/${companyId}`)
                ]);

                setReport(reportRes.data);
                setCompany(companyRes.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                if (err.response?.status === 403) {
                    setError('upgrade');
                } else {
                    setError('failed');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error === 'upgrade') {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-100 max-w-2xl mx-auto my-12">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IoDocumentTextOutline className="text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Monthly Performance Analytics</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Comprehensive monthly company reports with PDF export and printable layouts are
                    available on our higher-tier plans. Upgrade to unlock this and other advanced features.
                </p>
                <button
                    onClick={() => window.location.href = '/dashboard/manager/billing'}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                    View Pricing Plans
                </button>
            </div>
        );
    }

    if (!report || error === 'failed') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-100">
                <p className="text-slate-500">Failed to load report data. Please try again later.</p>
            </div>
        );
    }

    const deptData = report.tasks.deptBreakdown.map(d => ({
        name: d.department,
        completed: d.completed,
        active: d.total - d.completed
    }));

    const projectData = Object.entries(report.projects).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    return (
        <div className="space-y-8 print:p-0 print:space-y-4">
            {/* Header - Hidden on Print */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <IoDocumentTextOutline className="w-8 h-8 text-blue-600" />
                        Monthly Analytics
                    </h1>
                    <p className="text-slate-600 mt-2">Comprehensive performance tracking for {company?.name || 'Company'}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
                    >
                        <IoDocumentTextOutline className="w-5 h-5" />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* Print Header - Only visible on print */}
            <div className="hidden print:block border-b-4 border-blue-600 pb-6 mb-8 text-left relative">
                <h1 className="text-4xl font-bold text-slate-900 mt-8">{company?.name || 'Company'}</h1>
                <h2 className="text-2xl font-bold text-slate-700 mt-2">Monthly Performance Analytics</h2>
                <p className="text-slate-500 mt-1">Generated for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <IoStatsChartOutline className="text-2xl" />
                        </div>
                        {report.tasks.growth >= 0 ? (
                            <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                                <IoArrowUpOutline className="mr-1" /> {report.tasks.growth}%
                            </span>
                        ) : (
                            <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
                                <IoArrowDownOutline className="mr-1" /> {Math.abs(report.tasks.growth)}%
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-500">Tasks Completed</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{report.tasks.completedThisMonth}</h3>
                    <p className="text-xs text-slate-400 mt-2">vs {report.tasks.completedLastMonth} last month</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <IoBusinessOutline className="text-2xl" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Departments Active</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{report.tasks.deptBreakdown.length}</h3>
                    <p className="text-xs text-slate-400 mt-2">Resources deployed across company</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <IoTrendingUpOutline className="text-2xl" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">New Announcements</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{report.announcementsCount}</h3>
                    <p className="text-xs text-slate-400 mt-2">Communications this month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Activity Chart */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 print:border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Department Task Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={deptData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="completed" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="active" fill="#e2e8f0" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-3 h-3 bg-blue-600 rounded-full"></span> Completed
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-3 h-3 bg-slate-300 rounded-full"></span> Active
                        </div>
                    </div>
                </div>

                {/* Project Distribution */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 print:border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Project Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={projectData}
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {projectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-slate-200">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <IoPeopleOutline className="text-blue-600" />
                        Standard Top Performers (This Month)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Based on total tasks completed to date</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                <th className="px-8 py-4">Employee</th>
                                <th className="px-8 py-4">Role</th>
                                <th className="px-8 py-4 text-right">Completions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {report.topContributors.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {c.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-bold text-slate-700">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-slate-500 text-sm">Team Member</td>
                                    <td className="px-8 py-4 text-right">
                                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full font-black text-sm">
                                            {c.count}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {report.topContributors.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-8 py-8 text-center text-slate-400">
                                        No task completions recorded this month yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
        @media print {
          body { font-size: 12pt; background: white !important; }
          .dashboard-theme { background: white !important; }
          main { padding: 0 !important; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
          aside, header { display: none !important; }
          .rounded-2xl { border-radius: 0 !important; shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .bg-white { background: white !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          canvas { max-width: 100% !important; height: auto !important; }
        }
      `}</style>
        </div>
    );
};

export default MonthlyReport;
