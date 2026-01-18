import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState({ tasks: { total: 0, byStatus: {}, upcoming: [] } });
  const [companyId, setCompanyId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    setCompanyId(storedCompanyId || '');
    if (!storedCompanyId || storedCompanyId === 'null' || storedCompanyId === 'undefined') {
      setLoading(false);
      return;
    }
    
    fetchDashboardData(storedCompanyId);
  }, []);

  const fetchDashboardData = async (cid) => {
    try {
      setLoading(true);
      
      // Get current user ID
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const userId = userProfile._id;
      
      // Fetch dashboard summary
      const summaryRes = await api.get('/api/dashboard/user', { params: { companyId: cid } });
      setSummary(summaryRes.data);

      // Fetch tasks assigned to the current user
      const tasksRes = await api.get('/api/tasks', { 
        params: { 
          companyId: cid,
          assignee: userId // Only get tasks assigned to this user
        } 
      });
      setTasks(tasksRes.data || []);

      // Fetch company announcements
      const announcementsRes = await api.get('/api/announcements', { params: { companyId: cid } });
      setAnnouncements(announcementsRes.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="max-w-md">
          <div className="mb-6">
            <i className="fa-solid fa-building text-6xl text-slate-300"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to WorkPro!</h2>
          <p className="text-slate-600 mb-6">To get started, create your company profile or wait for an invitation to join an existing company.</p>
          <div className="flex gap-3 justify-center">
            <a href="/dashboard/manager?first-time=true" className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-2">
              <i className="fa-solid fa-plus"></i>
              <span>Create Company</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header inside layout already renders; keep content only */}

      {/* Scrollable Content */}
      <div className="grow overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gradient-to-br from-slate-50 to-green-50/30">
        {/* Welcome Card */}
        <div className="mb-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 border border-green-500/20 shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
          <div className="z-10 text-left text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
              <i className="fa-solid fa-hand-wave text-yellow-300"></i>
              Good morning!
            </h2>
            <p className="text-green-100">You have <span className="text-yellow-300 font-bold">{summary.tasks.total} tasks</span> to focus on today.</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3 z-10">
            <button className="bg-white text-green-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">
              <i className="fa-solid fa-clock mr-2"></i>Clock In
            </button>
            <button className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-800 transition border border-green-500">
              <i className="fa-solid fa-users mr-2"></i>View Team
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon="fa-fire-flame-curved" color="green" label="Weekly Streak" value="5 Days" />
          <StatCard icon="fa-circle-check" color="emerald" label="Completed" value={`${summary.tasks.byStatus?.done || 0} Tasks`} />
          <StatCard icon="fa-trophy" color="teal" label="Total Tasks" value={`${tasks.length} Tasks`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* My Tasks Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">My Priority Tasks</h3>
              <button className="text-sm font-bold text-green-600 hover:underline">View All</button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <i className="fa-solid fa-clipboard-list text-5xl text-slate-300 mb-4"></i>
                <p className="text-slate-500 font-semibold">No tasks assigned yet</p>
                <p className="text-slate-400 text-sm mt-2">Tasks assigned to you will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.slice(0, 4).map((task) => (
                  <TaskCardDynamic key={task._id} task={task} />
                ))}
              </div>
            )}

            {/* Announcements Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-green-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-bell text-green-600"></i>
                  Company Announcements
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-megaphone text-4xl text-slate-300 mb-3"></i>
                    <p className="text-slate-500 text-sm">No announcements yet</p>
                  </div>
                ) : (
                  announcements.slice(0, 5).map((announcement) => (
                    <AnnouncementItem key={announcement._id} announcement={announcement} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="space-y-8">
            {/* Group Works Chat */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[500px] hover:shadow-xl transition-shadow">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-comments text-emerald-600"></i>
                    Group Works
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    #tech-frontend
                  </p>
                </div>
                <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                  <i className="fa-solid fa-expand"></i>
                </button>
              </div>
              <div className="grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <ChatMessage initials="SL" left textClass="text-slate-700" name="Sarah L." content="Marcus, can you check the PR for the nav fixes?" />
                <ChatMessage me initials="MK" right content="On it right now. Will push by noon." />
                <ChatMessage initials="JD" left textClass="text-slate-700" name="John D. (Manager)" content="Great work team. The client loved the last demo." />
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-green-300 transition-colors">
                  <button className="text-slate-400 hover:text-green-600 p-1 transition-colors"><i className="fa-solid fa-paperclip text-sm"></i></button>
                  <input type="text" placeholder="Reply to #tech-frontend..." className="grow bg-transparent border-none text-xs focus:ring-0" />
                  <button className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg">
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Performance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-left hover:shadow-xl transition-shadow">
              <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-green-600"></i>
                My Productivity
              </h4>
              <Progress label="Task Accuracy" value="94%" barColor="green" />
              <Progress label="Punctuality" value="88%" barColor="blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-left hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer group">
    <div className={`w-14 h-14 bg-gradient-to-br from-${color}-400 to-${color}-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-green-600 transition-colors">{value}</h3>
    </div>
  </div>
);

const TaskCard = ({ badge, badgeColor, leftBorder, title, due, by, action, muted }) => (
  <div className={`task-card bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-md border-l-4 ${leftBorder ? `border-l-${leftBorder}-500` : ''} text-left hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
    <div className="flex justify-between mb-4">
      <span className={`px-3 py-1 bg-${badgeColor}-100 text-${badgeColor}-700 text-[10px] font-bold rounded-lg uppercase tracking-wide`}>{badge}</span>
      <span className="text-[11px] text-slate-400 flex items-center gap-1">
        <i className="fa-regular fa-clock"></i>
        {due}
      </span>
    </div>
    <h4 className="font-bold text-slate-800 mb-2 text-lg group-hover:text-green-600 transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 mb-6 leading-relaxed">The burger menu isn't triggering on iOS Safari. Needs a CSS fix.</p>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
          JD
        </div>
        <span className="text-[10px] font-bold text-slate-600">{by}</span>
      </div>
      <button className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${muted ? 'text-slate-400 bg-slate-50' : 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md'}`}>
        {action} {!muted && <i className="fa-solid fa-play ml-1"></i>}
      </button>
    </div>
  </div>
);

const DeptUpdate = ({ icon, iconBg, iconColor, title, desc, time }) => (
  <div className="flex gap-4 text-left hover:bg-slate-50 p-3 rounded-xl -mx-3 transition-colors cursor-pointer group">
    <div className={`w-11 h-11 rounded-xl bg-${iconBg} shrink-0 flex items-center justify-center text-${iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div className="grow">
      <p className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
        <i className="fa-regular fa-clock"></i>
        {time}
      </p>
    </div>
  </div>
);

const ChatMessage = ({ initials, name, content, left, right, me, textClass }) => (
  <div className={`flex gap-3 ${right ? 'flex-row-reverse' : ''} animate-fadeIn`}>
    <div className={`w-9 h-9 rounded-full ${me ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'} shrink-0 flex items-center justify-center text-[11px] font-bold`}>{initials}</div>
    <div className={`${me ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl rounded-tr-none shadow-md' : 'bg-slate-100 text-slate-700 rounded-2xl rounded-tl-none shadow-sm'} p-3 text-left max-w-[75%]`}>
      {name && <p className={`text-[10px] font-bold mb-1 ${me ? 'text-green-100' : 'text-slate-500'}`}>{name}</p>}
      <p className={`text-xs ${textClass || ''}`}>{content}</p>
    </div>
  </div>
);

const Progress = ({ label, value, barColor }) => (
  <div className="space-y-3 mb-5 last:mb-0">
    <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wide">
      <span>{label}</span>
      <span className={`text-${barColor}-600`}>{value}</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <div className={`h-full bg-gradient-to-r from-${barColor}-400 to-${barColor}-600 rounded-full transition-all duration-500 shadow-md`} style={{ width: value }}></div>
    </div>
  </div>
);

const TaskCardDynamic = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return { badge: 'red', border: 'red' };
      case 'high': return { badge: 'orange', border: 'orange' };
      case 'medium': return { badge: 'blue', border: 'blue' };
      case 'low': return { badge: 'green', border: 'green' };
      default: return { badge: 'slate', border: 'slate' };
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'to-do': return 'Start';
      case 'in-progress': return 'Continue';
      case 'blocked': return 'Blocked';
      case 'done': return 'Completed';
      default: return 'View';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return due.toLocaleDateString();
  };

  const colors = getPriorityColor(task.priority);
  const isDone = task.status?.toLowerCase() === 'done';

  return (
    <div className={`task-card bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-md border-l-4 border-l-${colors.border}-500 text-left hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
      <div className="flex justify-between mb-4">
        <span className={`px-3 py-1 bg-${colors.badge}-100 text-${colors.badge}-700 text-[10px] font-bold rounded-lg uppercase tracking-wide`}>
          {task.priority || 'Medium'}
        </span>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <i className="fa-regular fa-clock"></i>
          {formatDueDate(task.dueDate)}
        </span>
      </div>
      <h4 className="font-bold text-slate-800 mb-2 text-lg group-hover:text-green-600 transition-colors">{task.title}</h4>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-2">{task.description || 'No description provided.'}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {task.createdBy?.firstName?.[0] || 'M'}{task.createdBy?.lastName?.[0] || 'G'}
          </div>
          <span className="text-[10px] font-bold text-slate-600">
            Assigned by {task.createdBy?.firstName || 'Manager'}
          </span>
        </div>
        <button className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isDone ? 'text-slate-400 bg-slate-50' : 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md'}`}>
          {getStatusText(task.status)} {!isDone && <i className="fa-solid fa-play ml-1"></i>}
        </button>
      </div>
    </div>
  );
};

const AnnouncementItem = ({ announcement }) => {
  const formatTime = (date) => {
    if (!date) return 'Recently';
    const announcementDate = new Date(date);
    const now = new Date();
    const diffTime = now - announcementDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return announcementDate.toLocaleDateString();
  };

  return (
    <div className="flex gap-4 text-left hover:bg-slate-50 p-3 rounded-xl -mx-3 transition-colors cursor-pointer group">
      <div className="w-11 h-11 rounded-xl bg-green-50 shrink-0 flex items-center justify-center text-green-500 shadow-sm group-hover:scale-110 transition-transform">
        <i className="fa-solid fa-megaphone"></i>
      </div>
      <div className="grow">
        <p className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">{announcement.title}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{announcement.message}</p>
        <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
          <i className="fa-regular fa-clock"></i>
          {formatTime(announcement.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
