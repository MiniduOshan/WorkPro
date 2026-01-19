import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  IoPersonAddOutline, 
  IoMailOutline, 
  IoCallOutline,
  IoBusinessOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoPeopleOutline,
  IoLinkOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { useThemeColors } from '../../utils/themeHelper';

export default function Teams() {
  const theme = useThemeColors();
  const [companyId, setCompanyId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [company, setCompany] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteDept, setInviteDept] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId && storedCompanyId !== 'null' && storedCompanyId !== 'undefined') {
      setCompanyId(storedCompanyId);
      fetchTeamMembers(storedCompanyId);
      fetchCompany(storedCompanyId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeamMembers = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/companies/${id}/members`);
      setMembers(data.map(m => ({
        _id: m.user?._id || m.user,
        firstName: m.user?.firstName || '',
        lastName: m.user?.lastName || '',
        email: m.user?.email || '',
        role: m.role,
        department: m.department || '',
        mobileNumber: m.user?.mobileNumber || '',
        profilePic: m.user?.profilePic || ''
      })));
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async (id) => {
    try {
      const { data } = await api.get(`/api/companies/${id}`);
      setCompany(data);
    } catch (err) {
      console.error('Failed to fetch company details:', err);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!companyId) return;
    setSendingInvite(true);
    setInviteResult(null);
    try {
      const { data } = await api.post(`/api/companies/${companyId}/invitations`, {
        email: `invite-${Date.now()}@internal.workpro`, // Internal temporary email for link generation
        role: inviteRole,
        department: inviteDept || ''
      });
      setInviteResult({ link: data.link });
      setInviteDept('');
      setInviteRole('employee');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create invitation link';
      setInviteResult({ error: msg });
    } finally {
      setSendingInvite(false);
    }
  };

  const copyLink = () => {
    if (inviteResult?.link) {
      navigator.clipboard.writeText(inviteResult.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Team Members</h1>
            <p className="text-slate-600">Manage and view your team members</p>
          </div>
          <button onClick={()=>setShowInvite(true)} className={`${theme.bgPrimary} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${theme.bgPrimaryHover} transition shadow-lg hover:shadow-xl active:scale-95`}>
            <IoPersonAddOutline className="text-xl" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative grow">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none transition-colors`}
            />
          </div>
          <div className="flex items-center gap-2">
            <IoFilterOutline className="text-slate-500 text-xl" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none transition-colors bg-white`}
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grow overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${theme.primary}`}></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <IoPeopleOutline className="mx-auto text-6xl text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No team members found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className={`bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-${theme.primaryBorderLight} transition-all duration-300 cursor-pointer group`}
              >
                {/* Avatar and Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${theme.primary} to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                    {member.profilePic ? (
                      <img
                        src={member.profilePic}
                        alt={member.firstName}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      getInitials(member.firstName, member.lastName)
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>

                {/* Member Info */}
                <div className="mb-4">
                  <h3 className={`text-lg font-bold text-slate-800 mb-1 group-hover:text-${theme.primary} transition-colors`}>
                    {member.firstName} {member.lastName}
                  </h3>
                  {member.department && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <IoBusinessOutline className="text-slate-400" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <IoMailOutline className="text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.mobileNumber && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <IoCallOutline className="text-slate-400" />
                      <span>{member.mobileNumber}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <button className={`flex-1 px-4 py-2 bg-${theme.primaryLight} text-${theme.primary} rounded-lg font-semibold hover:bg-${theme.primaryLighter} transition text-sm`}>
                    View Profile
                  </button>
                  <button onClick={async ()=>{
                    try {
                      await api.delete(`/api/companies/${companyId}/members/${member._id}`);
                      setMembers(prev=>prev.filter(m=>m._id!==member._id));
                    } catch(e){
                      console.error('Failed to remove member', e);
                    }
                  }} className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <IoLinkOutline className="text-2xl text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-800">Create Invite Link</h2>
              </div>
              <button onClick={()=>{setShowInvite(false); setInviteResult(null);}} className="p-2 hover:bg-slate-100 rounded-lg transition">✕</button>
            </div>
            
            {!inviteResult?.link ? (
              <form onSubmit={sendInvite}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <select value={inviteRole} onChange={(e)=>setInviteRole(e.target.value)} className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select value={inviteDept} onChange={(e)=>setInviteDept(e.target.value)} className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl ${theme.focusBorderPrimary} focus:outline-none bg-white`}>
                    <option value="">None</option>
                    {(company?.departments||[]).map((d)=>(
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {inviteResult?.error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{inviteResult.error}</div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={()=>{setShowInvite(false); setInviteResult(null);}} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
                  <button type="submit" disabled={sendingInvite} className={`flex-1 px-6 py-3 ${theme.bgPrimary} text-white rounded-xl font-semibold ${theme.bgPrimaryHover} transition disabled:opacity-50`}>{sendingInvite? 'Creating…':'Generate Link'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <IoCheckmarkCircleOutline className="text-2xl text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Link Created!</p>
                    <p className="text-sm text-green-700">Share this link to join the team</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Invite Link</p>
                  <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200 break-all max-h-24 overflow-y-auto">
                    <code className="text-sm text-slate-700 font-mono">{inviteResult.link}</code>
                  </div>
                </div>

                <button 
                  onClick={copyLink}
                  className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                    copied 
                      ? `${theme.bgPrimary} text-white` 
                      : `border-2 border-slate-200 text-slate-700 hover:border-slate-300`
                  }`}
                >
                  {copied ? (
                    <>
                      <IoCheckmarkCircleOutline className="text-xl" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <IoCopyOutline className="text-xl" />
                      Copy Link
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">The recipient can click the link to create an account and join your team</p>

                <button 
                  onClick={()=>{setShowInvite(false); setInviteResult(null);}}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
