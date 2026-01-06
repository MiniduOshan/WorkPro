import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  IoCheckmarkDoneOutline, 
  IoTimeOutline, 
  IoPeopleOutline, 
  IoWarningOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoSwapVerticalOutline,
  IoSendOutline,
  IoCopyOutline,
  IoLinkOutline,
  IoNotificationsOutline,
  IoAddOutline,
  IoCloseCircleOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoRocketOutline
} from 'react-icons/io5';

export default function ManagerDashboard() {
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('first-time') === 'true';
  
  const [companyData, setCompanyData] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(isFirstTime);
  const [stats, setStats] = useState({
    completedProjects: 124,
    avgCompletionTime: '3.4 Days',
    teamEngagement: '92%',
    overdueTasks: 4
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'to-do',
    priority: 'normal',
    assignedTo: ''
  });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    website: '',
    mission: '',
    vision: '',
    industry: '',
    departments: ['Tech', 'Marketing', 'HR']
  });
  const [newDept, setNewDept] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    department: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId || companyId === 'null' || companyId === 'undefined') {
        setCompanyData(null);
        return;
      }
      const [companyRes, managerRes] = await Promise.all([
        api.get(`/api/companies/${companyId}`),
        api.get('/api/dashboard/manager', { params: { companyId } })
      ]);
      setCompanyData(companyRes.data);
      const summary = managerRes.data;
      setStats((prev) => ({
        ...prev,
        overdueTasks: (summary.tasks.byStatus?.blocked || 0),
      }));
      setTeamMembers((companyRes.data.members || []).map(m => ({
        id: m.user?._id || m.user,
        name: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
        role: m.role,
        department: (m.department || 'GENERAL').toUpperCase(),
        capacity: Math.floor(Math.random()*60)+30,
        initials: `${(m.user?.firstName||'')[0]||'U'}${(m.user?.lastName||'')[0]||'S'}`,
        color: 'slate'
      })));
      setMessages([
        { dept: 'General', text: 'Welcome to the manager dashboard.', time: new Date().toLocaleTimeString(), isUser: false }
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/companies', companyForm);
      localStorage.setItem('companyId', data._id);
      localStorage.setItem('companyRole', 'owner');
      setShowCompanyModal(false);
      setCompanyData(data);
      // Update team members from created company
      setTeamMembers((data.members || []).map(m => ({
        id: m.user?._id || m.user,
        name: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
        role: m.role,
        department: (m.department || 'GENERAL').toUpperCase(),
        capacity: Math.floor(Math.random()*60)+30,
        initials: `${(m.user?.firstName||'')[0]||'U'}${(m.user?.lastName||'')[0]||'S'}`,
        color: 'slate'
      })));
      // Reset company form
      setCompanyForm({
        name: '',
        description: '',
        website: '',
        mission: '',
        vision: '',
        industry: '',
        departments: ['Tech', 'Marketing', 'HR']
      });
      alert('✓ Company created successfully! You can now add team members.');
    } catch (err) {
      console.error('Failed to create company:', err);
      alert(err.response?.data?.message || 'Failed to create company');
    }
  };

  const handleAddDepartment = () => {
    if (newDept.trim() && !companyForm.departments.includes(newDept.trim())) {
      setCompanyForm({
        ...companyForm,
        departments: [...companyForm.departments, newDept.trim()]
      });
      setNewDept('');
    }
  };

  const handleRemoveDepartment = (dept) => {
    setCompanyForm({
      ...companyForm,
      departments: companyForm.departments.filter(d => d !== dept)
    });
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    try {
      const companyId = localStorage.getItem('companyId');
      await api.post(`/api/companies/${companyId}/invitations`, inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'employee', department: '' });
      alert('Invitation sent successfully!');
    } catch (err) {
      console.error('Failed to send invitation:', err);
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const copyInviteLink = () => {
    const link = `join.workpro.io/${companyData?.name?.toLowerCase().replace(/\s+/g, '-') || 'company'}-2024`;
    navigator.clipboard.writeText(link);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem('companyId');
    try {
      await api.post('/api/tasks', {
        ...newTask,
        companyId
      });
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        status: 'to-do',
        priority: 'normal',
        assignedTo: ''
      });
      alert('Task created successfully!');
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task');
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity < 50) return 'bg-emerald-500';
    if (capacity < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDeptColor = (dept) => {
    const colors = {
      'DESIGN': 'bg-purple-50 text-purple-600',
      'TECH': 'bg-blue-50 text-blue-600',
      'MARKETING': 'bg-emerald-50 text-emerald-600'
    };
    return colors[dept] || 'bg-slate-50 text-slate-600';
  };

  const getAvatarColor = (color) => {
    const colors = {
      'orange': 'bg-orange-100 text-orange-600',
      'blue': 'bg-blue-100 text-blue-600',
      'slate': 'bg-slate-200 text-slate-600'
    };
    return colors[color] || 'bg-slate-100 text-slate-600';
  };

  // Company Creation Modal Component
  const CompanyCreationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <IoBusinessOutline className="w-7 h-7" />
            Create Your Company
          </h2>
          <p className="text-blue-100 mt-1">Set up your organization to get started</p>
        </div>
        
        <form onSubmit={handleCreateCompany} className="p-6 space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Company Name *</label>
            <input 
              type="text"
              required
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., TechFlow Systems"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Brief description of your company"
              rows="3"
              value={companyForm.description}
              onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <IoGlobeOutline className="w-5 h-5" />
              Website
            </label>
            <input 
              type="url"
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="https://example.com"
              value={companyForm.website}
              onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
            />
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mission</label>
              <input 
                type="text"
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Our mission..."
                value={companyForm.mission}
                onChange={(e) => setCompanyForm({...companyForm, mission: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <IoRocketOutline className="w-5 h-5" />
                Vision
              </label>
              <input 
                type="text"
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Our vision..."
                value={companyForm.vision}
                onChange={(e) => setCompanyForm({...companyForm, vision: e.target.value})}
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Industry</label>
            <input 
              type="text"
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., Technology, Healthcare"
              value={companyForm.industry}
              onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
            />
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Departments</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                className="flex-1 border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Add new department"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
              />
              <button 
                type="button"
                onClick={handleAddDepartment}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {companyForm.departments.map(dept => (
                <span key={dept} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  {dept}
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-bold"
            >
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Invite Employee Modal Component
  const InviteEmployeeModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Add Team Member</h2>
          <p className="text-blue-100 mt-1">Send invitation to join your company</p>
        </div>
        
        <form onSubmit={handleInviteEmployee} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
            <input 
              type="email"
              required
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="employee@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
            <select 
              required
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
            <select 
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={inviteForm.department}
              onChange={(e) => setInviteForm({...inviteForm, department: e.target.value})}
            >
              <option value="">Select Department</option>
              {companyData?.members && [...new Set(companyData.members.map(m => m.department))].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button 
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition-all font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {showCompanyModal && <CompanyCreationModal />}
      {showInviteModal && <InviteEmployeeModal />}
      <div className="grow flex flex-col overflow-hidden">
      {!companyData && !localStorage.getItem('companyId') ? (
        <div className="grow flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="max-w-md">
            <div className="mb-6">
              <i className="fa-solid fa-building text-6xl text-slate-300"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to WorkPro!</h2>
            <p className="text-slate-600 mb-6">To get started as a manager, create your company profile. You'll become the owner and can invite team members.</p>
            <div className="flex gap-3 justify-center">
              <a href="/company/create" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2">
                <i className="fa-solid fa-plus"></i>
                <span>Create Company</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Manager Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search tasks or members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="text-slate-500 hover:text-blue-600 relative">
            <IoNotificationsOutline className="text-xl" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200"
          >
            <IoAddOutline className="text-lg" />
            <span className="hidden md:inline">Assign New Task</span>
          </button>
        </div>
      </header>

      {/* Scrollable Dashboard Content */}
      <div className="grow overflow-y-auto p-8 bg-slate-50">
        {/* Company Profile Quick Info */}
        <div className="mb-10 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">{companyData?.name || 'TechFlow Systems'} HQ</h2>
            <p className="text-blue-100 flex items-center gap-2">
              <IoLinkOutline className="text-xs" /> 
              join.workpro.io/{companyData?.name?.toLowerCase().replace(/\s+/g, '-') || 'company'}-2024
              <button onClick={copyInviteLink} className="hover:text-white">
                <IoCopyOutline className="ml-1" />
              </button>
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
              <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Joiners Today</p>
              <p className="text-2xl font-bold">+12</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
              <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Active Tasks</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <IoCheckmarkDoneOutline className="text-xl" />
              </div>
              <span className="text-emerald-500 text-xs font-bold">+5.2%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Completed Projects</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.completedProjects}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <IoTimeOutline className="text-xl" />
              </div>
              <span className="text-slate-400 text-xs font-bold">Stable</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Avg. Completion Time</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.avgCompletionTime}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <IoPeopleOutline className="text-xl" />
              </div>
              <span className="text-purple-500 text-xs font-bold">High</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Team Engagement</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.teamEngagement}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <IoWarningOutline className="text-xl" />
              </div>
              <span className="text-red-500 text-xs font-bold">Critical</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Overdue Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.overdueTasks}</h3>
          </div>
        </div>

        {/* Bottom Layout: Team & Chat */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Team Oversight Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Team Oversight</h3>
              <div className="flex gap-2">
                <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
                  <IoFilterOutline className="text-xs" />
                </button>
                <button className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition">
                  <IoSwapVerticalOutline className="text-xs" />
                </button>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-xs font-semibold"
                >
                  <IoAddOutline className="text-sm" />
                  Add Member
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Capacity</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.color)} flex items-center justify-center font-bold text-xs`}>
                            {member.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{member.name}</p>
                            <p className="text-[10px] text-slate-400">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 ${getDeptColor(member.department)} text-[10px] font-bold rounded`}>
                          {member.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getCapacityColor(member.capacity)}`} style={{ width: `${member.capacity}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:underline text-xs font-bold">Assign</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All {companyData?.members?.length || 42} Members
              </button>
            </div>
          </div>

          {/* Active "Group Works" Chat Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">Group Works</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">4 Live Channels</p>
              </div>
              <IoPeopleOutline className="text-slate-300 text-xl" />
            </div>
            <div className="grow overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 ${msg.isUser ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                  <div className={`p-3 rounded-2xl ${msg.isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 rounded-tl-none'}`}>
                    <p className={`text-[10px] font-bold uppercase mb-1 ${msg.isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.dept}
                    </p>
                    <p className={`text-xs ${msg.isUser ? 'text-white' : 'text-slate-700'}`}>{msg.text}</p>
                    <p className={`text-[9px] mt-2 ${msg.isUser ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Send a global broadcast..." 
                className="grow bg-slate-100 border-none rounded-lg py-2 px-3 text-xs focus:ring-0"
              />
              <button className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition">
                <IoSendOutline className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Assign New Task</h2>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <IoCloseCircleOutline className="text-2xl text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Add task details..."
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="to-do">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign To
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
      </div>
    </>
  );
}
