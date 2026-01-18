import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
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
  IoRocketOutline,
  IoPersonCircleOutline
} from 'react-icons/io5';

// --- SUB-COMPONENTS MOVED OUTSIDE TO FIX INPUT FOCUS ISSUE ---

const CompanyCreationModal = ({ 
  companyForm, 
  setCompanyForm, 
  handleCreateCompany, 
  isCreatingCompany, 
  newDept, 
  setNewDept, 
  handleAddDepartment, 
  handleRemoveDepartment 
}) => (
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

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Departments</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text"
              className="flex-1 border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Add new department"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
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

        <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
          <button 
            type="submit"
            disabled={isCreatingCompany}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-bold disabled:opacity-50"
          >
            {isCreatingCompany ? 'Creating...' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const InviteEmployeeModal = ({ inviteForm, setInviteForm, handleInviteEmployee, setShowInviteModal, companyData }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Add Team Member</h2>
        <p className="text-blue-100 mt-1">Send invitation to join your company</p>
      </div>
      
      <form onSubmit={handleInviteEmployee} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
          <input 
            type="email"
            required
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="employee@example.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
          <select 
            required
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
          <select 
            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={inviteForm.department}
            onChange={(e) => setInviteForm({...inviteForm, department: e.target.value})}
          >
            <option value="">Select Department</option>
            {companyData?.members && [...new Set(companyData.members.map(m => m.department))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
          <button 
            type="button" 
            onClick={() => setShowInviteModal(false)}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg"
          >
            Send Invitation
          </button>
        </div>
      </form>
    </div>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---

export default function ManagerDashboard() {
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('first-time') === 'true';
  
  const [companyData, setCompanyData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
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
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'to-do', priority: 'medium', assignedTo: [], dueDate: ''
  });
  const [companyForm, setCompanyForm] = useState({
    name: '', description: '', website: '', mission: '', vision: '', industry: '', departments: ['Tech', 'Marketing', 'HR']
  });
  const [newDept, setNewDept] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '', role: 'employee', department: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/api/users/profile');
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

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
    if (isCreatingCompany) return;
    setIsCreatingCompany(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsCreatingCompany(false);
      alert('Authentication lost. Please login again.');
      window.location.href = '/login';
      return;
    }

    try {
      const { data } = await api.post('/api/companies', companyForm);
      localStorage.setItem('companyId', data._id);
      localStorage.setItem('companyRole', 'owner');
      setCompanyData(data);
      setShowCompanyModal(false);
      setIsCreatingCompany(false);
      alert('✓ Company created successfully!');
    } catch (err) {
      setIsCreatingCompany(false);
      alert(err.response?.data?.message || 'Failed to create company.');
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
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const copyInviteLink = () => {
    const link = `join.workpro.io/${companyData?.name?.toLowerCase().replace(/\s+/g, '-') || 'company'}-2024`;
    navigator.clipboard.writeText(link);
    alert('Link copied!');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const companyId = localStorage.getItem('companyId');
    
    if (newTask.assignedTo.length === 0) {
      alert('Please select at least one employee to assign the task to');
      return;
    }

    try {
      // Create task for each assigned employee
      const taskPromises = newTask.assignedTo.map(employeeId => 
        api.post('/api/tasks', { 
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          assignee: employeeId,
          companyId 
        })
      );
      
      const createdTasks = await Promise.all(taskPromises);

      // If multiple employees are assigned, create a channel for them
      if (newTask.assignedTo.length > 1) {
        try {
          const channelName = `${newTask.title.substring(0, 30)} Team`;
          await api.post('/api/channels', {
            name: channelName,
            description: `Collaboration channel for: ${newTask.title}`,
            companyId,
            members: newTask.assignedTo,
            isPrivate: false
          });
          alert(`Task created successfully for ${newTask.assignedTo.length} employees! A team channel "${channelName}" has been created for collaboration.`);
        } catch (channelErr) {
          console.error('Failed to create channel:', channelErr);
          alert(`Task created successfully for ${newTask.assignedTo.length} employees! However, channel creation failed.`);
        }
      } else {
        alert('Task created successfully!');
      }

      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'to-do', priority: 'medium', assignedTo: [], dueDate: '' });
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to create task:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to create task. Please try again.');
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity < 50) return 'bg-emerald-500';
    if (capacity < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDeptColor = (dept) => {
    const colors = { 'DESIGN': 'bg-purple-50 text-purple-600', 'TECH': 'bg-blue-50 text-blue-600', 'MARKETING': 'bg-emerald-50 text-emerald-600' };
    return colors[dept] || 'bg-slate-50 text-slate-600';
  };

  const getAvatarColor = (color) => {
    const colors = { 'orange': 'bg-orange-100 text-orange-600', 'blue': 'bg-blue-100 text-blue-600', 'slate': 'bg-slate-200 text-slate-600' };
    return colors[color] || 'bg-slate-100 text-slate-600';
  };

  return (
    <>
      {showCompanyModal && (
        <CompanyCreationModal 
          companyForm={companyForm}
          setCompanyForm={setCompanyForm}
          handleCreateCompany={handleCreateCompany}
          isCreatingCompany={isCreatingCompany}
          newDept={newDept}
          setNewDept={setNewDept}
          handleAddDepartment={handleAddDepartment}
          handleRemoveDepartment={handleRemoveDepartment}
        />
      )}
      
      {showInviteModal && (
        <InviteEmployeeModal 
          inviteForm={inviteForm}
          setInviteForm={setInviteForm}
          handleInviteEmployee={handleInviteEmployee}
          setShowInviteModal={setShowInviteModal}
          companyData={companyData}
        />
      )}

      <div className="grow flex flex-col overflow-hidden">
      {!companyData && !localStorage.getItem('companyId') ? (
        <div className="grow flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to WorkPro!</h2>
            <button onClick={() => setShowCompanyModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">
              Create Company
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
            <h1 className="text-xl font-bold text-slate-800">Manager Dashboard</h1>
            <div className="flex items-center gap-6">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-100 rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
              <button 
                onClick={() => setShowTaskModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <IoAddOutline /> Assign Task
              </button>
            </div>
          </header>

          <div className="grow overflow-y-auto p-8 bg-slate-50">
            {/* Dashboard Content Here (Stats, Team Table, etc.) */}
            <div className="mb-10 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl">
               <div>
                  <h2 className="text-3xl font-bold mb-2">{companyData?.name || 'My Company'} HQ</h2>
                  <p className="flex items-center gap-2">join.workpro.io/{companyData?.name?.toLowerCase().replace(/\s+/g, '-') || 'company'}-2024</p>
               </div>
               <button onClick={copyInviteLink} className="bg-white/20 p-2 rounded-lg hover:bg-white/30"><IoCopyOutline /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <p className="text-slate-500 text-sm">Completed Projects</p>
                    <h3 className="text-2xl font-bold">{stats.completedProjects}</h3>
                </div>
                {/* Add other stats cards here... */}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b flex justify-between items-center">
                  <h3 className="font-bold">Team Oversight</h3>
                  <button onClick={() => setShowInviteModal(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs">Add Member</button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-400">
                    <tr><th className="px-6 py-3">Member</th><th className="px-6 py-3">Department</th><th className="px-6 py-3">Capacity</th></tr>
                  </thead>
                  <tbody>
                    {teamMembers.map(member => (
                      <tr key={member.id} className="border-t border-slate-100">
                        <td className="px-6 py-4 text-sm font-bold">{member.name}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] ${getDeptColor(member.department)}`}>{member.department}</span></td>
                        <td className="px-6 py-4">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getCapacityColor(member.capacity)}`} style={{ width: `${member.capacity}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  style={{ caretColor: '#2563eb' }}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  style={{ caretColor: '#2563eb' }}
                  placeholder="Add task details..."
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
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

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign To * (Select one or multiple employees)
                </label>
                <div className="border-2 border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto bg-slate-50">
                  {teamMembers.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No team members available</p>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <label 
                          key={member.id} 
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={newTask.assignedTo.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, member.id] });
                              } else {
                                setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter(id => id !== member.id) });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.color)} flex items-center justify-center font-bold text-xs`}>
                            {member.initials}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.role} - {member.department}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {newTask.assignedTo.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    {newTask.assignedTo.length} employee{newTask.assignedTo.length > 1 ? 's' : ''} selected
                    {newTask.assignedTo.length > 1 && ' - A team channel will be created automatically'}
                  </p>
                )}
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
  );
}