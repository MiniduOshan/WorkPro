import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  IoPersonAddOutline, 
  IoMailOutline, 
  IoCallOutline,
  IoBusinessOutline,
  IoSearchOutline,
  IoFilterOutline
} from 'react-icons/io5';

export default function Teams() {
  const [companyId, setCompanyId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      fetchTeamMembers(storedCompanyId);
    } else {
      // Sample members fallback when no company is selected
      setMembers([
        { _id: 'm1', firstName: 'Alice', lastName: 'Lopez', email: 'alice@example.com', role: 'manager', department: 'Engineering', mobileNumber: '555-1010', profilePic: '', },
        { _id: 'm2', firstName: 'Marcus', lastName: 'King', email: 'marcus@example.com', role: 'employee', department: 'Design', mobileNumber: '555-2020', profilePic: '', },
        { _id: 'm3', firstName: 'Sarah', lastName: 'Wong', email: 'sarah@example.com', role: 'employee', department: 'Marketing', mobileNumber: '555-3030', profilePic: '', },
      ]);
      setLoading(false);
    }
  }, []);

  const fetchTeamMembers = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/companies/${id}/members`);
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
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
    <div className="flex-grow flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Team Members</h1>
            <p className="text-slate-600">Manage and view your team members</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-95">
            <IoPersonAddOutline className="text-xl" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <IoFilterOutline className="text-slate-500 text-xl" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
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
      <div className="flex-grow overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group"
              >
                {/* Avatar and Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
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
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
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
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition text-sm">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition text-sm">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
