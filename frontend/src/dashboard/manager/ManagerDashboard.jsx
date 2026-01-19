import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import CalendarWidget from '../shared/CalendarWidget.jsx';
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
  IoCheckmarkCircleOutline,
  IoNotificationsOutline,
  IoAddOutline,
  IoCloseCircleOutline,
  IoBusinessOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoPersonCircleOutline,
  IoSparklesOutline
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

const InviteEmployeeModal = ({ inviteForm, setInviteForm, handleInviteEmployee, setShowInviteModal, companyData, inviteLink, inviteGenerating, onCopyLink, copied }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Create Invite Link</h2>
        <p className="text-blue-100 mt-1">Generate a link to join your company</p>
      </div>

      {!inviteLink ? (
        <form onSubmit={handleInviteEmployee} className="p-6 space-y-4">
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
              disabled={inviteGenerating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {inviteGenerating ? 'Generating…' : 'Generate Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <IoCheckmarkCircleOutline className="text-2xl text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Link Created!</p>
              <p className="text-sm text-green-700">Share this link to join the team</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase">Invite Link</p>
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 break-all max-h-24 overflow-y-auto">
              <code className="text-sm text-slate-700">{inviteLink}</code>
            </div>
          </div>

          <button 
            onClick={onCopyLink}
            className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${copied ? 'bg-blue-600 text-white' : 'border-2 border-slate-200 text-slate-700 hover:border-slate-300'}`}
          >
            <IoCopyOutline className="text-xl" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button 
            onClick={() => { setShowInviteModal(false); }}
            className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
          >
            Done
          </button>
        </div>
      )}
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteGenerating, setInviteGenerating] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '', description: '', website: '', mission: '', vision: '', industry: '', departments: ['Tech', 'Marketing', 'HR']
  });
  const [newDept, setNewDept] = useState('');
  const [inviteForm, setInviteForm] = useState({
    role: 'employee', department: ''
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
      fetchProgressSummary(companyId);
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

  const fetchProgressSummary = async (companyId) => {
    if (!companyId) return;
    try {
      setAiSummaryLoading(true);
      const { data } = await api.get('/api/ai/progress-summary', { headers: { 'x-company-id': companyId } });
      setAiSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      setAiSummary('AI summary unavailable right now.');
    } finally {
      setAiSummaryLoading(false);
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
      setInviteGenerating(true);
      const companyId = localStorage.getItem('companyId');
      const { data } = await api.post(`/api/companies/${companyId}/invitations`, {
        email: `invite-${Date.now()}@internal.workpro`,
        role: inviteForm.role,
        department: inviteForm.department || ''
      });
      setInviteLink(data.link);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invitation link');
    } finally {
      setInviteGenerating(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
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
          inviteLink={inviteLink}
          inviteGenerating={inviteGenerating}
          onCopyLink={copyInviteLink}
          copied={copiedInvite}
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
            </div>
          </header>

          <div className="grow overflow-y-auto p-8 bg-slate-50">
            {/* Dashboard Header */}
            <div className="mb-10 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl">
               <div>
                  <h2 className="text-3xl font-bold mb-2">{companyData?.name || 'My Company'} HQ</h2>
                  <p className="flex items-center gap-2">join.workpro.io/{companyData?.name?.toLowerCase().replace(/\s+/g, '-') || 'company'}-2024</p>
               </div>
               <button onClick={copyInviteLink} className="bg-white/20 p-2 rounded-lg hover:bg-white/30"><IoCopyOutline /></button>
            </div>

            {/* Main Grid: Summary on left, Calendar on right */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
              {/* Left: Summary & Stats */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">Executive Summary</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Last 24h AI Briefing</h3>
                    <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">
                      {aiSummaryLoading ? 'Generating summary…' : aiSummary || 'No recent activity yet.'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <button
                      onClick={() => fetchProgressSummary(localStorage.getItem('companyId'))}
                      disabled={aiSummaryLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 justify-center"
                    >
                      <IoSparklesOutline /> {aiSummaryLoading ? 'Refreshing...' : 'Refresh AI'}
                    </button>
                    <span className="text-xs text-slate-500 text-center">Uses recent tasks & announcements</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-[10px] font-semibold uppercase">Team Members</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">{teamMembers.length}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <i className="fa-solid fa-people-group text-green-600 text-sm"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-[10px] font-semibold uppercase">Avg Completion</p>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.avgCompletionTime}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <i className="fa-solid fa-clock text-orange-600 text-sm"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Calendar */}
              <div className="space-y-8">
                <CalendarWidget />
              </div>
            </div>
          </div>
        </>
      )}
      </div>


    </>
  );
}