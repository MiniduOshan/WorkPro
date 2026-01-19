import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState({ tasks: { total: 0, byStatus: {} } });
  const [companyId, setCompanyId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    setCompanyId(storedCompanyId || '');
    if (storedCompanyId && storedCompanyId !== 'null') {
      fetchDashboardData(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (cid) => {
    try {
      setLoading(true);
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const userId = userProfile._id;

      const [summaryRes, tasksRes, announcementsRes] = await Promise.all([
        api.get('/api/dashboard/user', { params: { companyId: cid } }),
        api.get('/api/tasks', { params: { companyId: cid, assignee: userId } }),
        api.get('/api/announcements', { params: { companyId: cid } })
      ]);

      setSummary(summaryRes.data);
      setTasks(tasksRes.data || []);
      setAnnouncements(announcementsRes.data || []);
    } catch (err) {
      console.error('Dashboard Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!companyId && !loading) return <EmptyStateView />;

  return (
    <div className="flex flex-col h-full bg-[#f8faf9] font-sans">
      <div className="grow overflow-y-auto p-6 lg:p-10">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{getGreeting()}!</h2>
            <p className="text-slate-500 mt-1 text-lg">
              You have <span className="font-semibold text-green-600">{summary.tasks.total} active tasks</span> assigned to you.
            </p>
          </div>

        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon="fa-leaf" color="emerald" label="Current Streak" value="5 Days" />
          <StatCard icon="fa-check-circle" color="teal" label="Completed" value={`${summary.tasks.byStatus?.done || 0} Tasks`} />
          <StatCard icon="fa-briefcase" color="green" label="Workload" value={`${tasks.length} Assigned`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Priority Tasks</h3>
              <button className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1 rounded-lg transition-colors">View All</button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-green-100 p-12 text-center shadow-sm">
                <p className="text-slate-400">No pending tasks for today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tasks.slice(0, 4).map((task) => (
                  <TaskCardCompact key={task._id} task={task} />
                ))}
              </div>
            )}

            {/* News/Updates Section */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-[#fcfdfc]">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <i className="fa-solid fa-bullhorn text-green-600 text-sm"></i>
                </div>
                <h3 className="font-bold text-slate-800">Announcements</h3>
              </div>
              <div className="p-5 divide-y divide-slate-100">
                {announcements.length === 0 ? (
                  <p className="text-center py-4 text-slate-400 text-sm">No recent updates</p>
                ) : (
                  announcements.slice(0, 3).map((ann) => (
                    <AnnouncementItem key={ann._id} announcement={ann} />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            <CalendarWidget />
            <PerformanceWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Refined Components --- */

const StatCard = ({ icon, color, label, value }) => {
  const themes = {
    emerald: 'bg-green-50 text-green-600',
    teal: 'bg-green-50 text-green-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${themes[color]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
};

const CalendarWidget = () => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-5 bg-green-600 text-white flex justify-between items-center">
      <div>
        <h3 className="font-bold text-lg">Event Schedule</h3>
        <p className="text-green-300 text-xs italic">Jan 2026</p>
      </div>
      <i className="fa-solid fa-calendar-check text-green-500/50 text-xl"></i>
    </div>
    <div className="p-5 space-y-4">
      <EventItem time="10:00 AM" title="Weekly Sync" type="Team" color="emerald" />
      <EventItem time="02:30 PM" title="Project Update" type="Review" color="teal" />
      <EventItem time="05:00 PM" title="Sprint End" type="Deadline" color="green" />
    </div>
  </div>
);

const EventItem = ({ time, title, type, color }) => {
  const dotColors = { emerald: 'bg-green-600', teal: 'bg-green-600', green: 'bg-green-600' };
  return (
    <div className="flex gap-4 items-start group cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors">
      <div className="text-[10px] font-bold text-slate-400 w-14 pt-1">{time}</div>
      <div className="grow">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[color]}`}></span>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">{title}</h4>
        </div>
        <p className="text-[10px] text-slate-500 ml-4 uppercase font-medium">{type}</p>
      </div>
    </div>
  );
};

const TaskCardCompact = ({ task }) => {
  const isDone = task.status?.toLowerCase() === 'done';
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-300 transition-all flex flex-col group relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase ${
            task.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
        }`}>
          {task.priority || 'Medium'}
        </span>
        <div className="w-7 h-7 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
          {task.createdBy?.firstName?.[0] || 'A'}
        </div>
      </div>
      <h4 className="font-bold text-slate-800 mb-1 group-hover:text-green-600 transition-colors leading-snug">{task.title}</h4>
      <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8 leading-relaxed">{task.description || 'No description provided.'}</p>
      
      <div className="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
        <span className="text-[10px] font-bold text-slate-400">
          <i className="fa-regular fa-clock mr-1"></i> 
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Set Date'}
        </span>
        <button className={`text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all ${
          isDone ? 'bg-slate-50 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
        }`}>
          {isDone ? 'Finished' : 'Launch'}
        </button>
      </div>
    </div>
  );
};

const AnnouncementItem = ({ announcement }) => (
  <div className="py-4 first:pt-0 last:pb-0 group cursor-pointer">
    <div className="flex justify-between items-baseline mb-1">
      <h4 className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">{announcement.title}</h4>
      <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 rounded">NEW</span>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed">{announcement.message}</p>
  </div>
);

const PerformanceWidget = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <h4 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
      <i className="fa-solid fa-seedling text-green-600"></i> My Growth
    </h4>
    <div className="space-y-5">
      <ProgressBar label="Task Accuracy" percent="94%" color="bg-green-600" />
      <ProgressBar label="Response Time" percent="82%" color="bg-green-600" />
    </div>
  </div>
);

const ProgressBar = ({ label, percent, color }) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
      <span>{label}</span>
      <span className="text-green-800">{percent}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full">
      <div className={`h-full ${color} rounded-full transition-all duration-700 shadow-sm`} style={{ width: percent }}></div>
    </div>
  </div>
);

const EmptyStateView = () => (
  <div className="flex flex-col items-center justify-center h-full p-10 text-center">
    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
      <i className="fa-solid fa-leaf text-3xl text-green-300"></i>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Your Workspace</h2>
    <p className="text-slate-500 text-sm mb-8 max-w-sm">Connect with your team to start tracking your daily progress and tasks.</p>
    <a href="/join" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
      Join Company
    </a>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
  </div>
);

export default EmployeeDashboard;