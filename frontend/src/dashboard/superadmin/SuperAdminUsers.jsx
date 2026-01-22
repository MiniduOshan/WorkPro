import React, { useState, useEffect } from 'react';
import {
  IoPeopleOutline,
  IoSearchOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminUsers = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/analytics/users');
      setUserAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const { users = [], totalUsers = 0, usersByRole = {} } = userAnalytics || {};

  const filteredUsers = users.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">All registered users across the platform</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
          {totalUsers} Users
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(usersByRole).map(([role, count]) => {
          const colors = {
            owner: 'from-purple-500 to-purple-600',
            manager: 'from-blue-500 to-blue-600',
            employee: 'from-green-500 to-green-600',
          };
          const icons = {
            owner: IoShieldCheckmarkOutline,
            manager: IoPeopleOutline,
            employee: IoPersonOutline,
          };
          const Icon = icons[role] || IoPersonOutline;
          return (
            <div key={role} className={`bg-gradient-to-r ${colors[role] || 'from-gray-500 to-gray-600'} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 capitalize font-medium">{role}s</p>
                  <p className="text-3xl font-bold mt-2">{count}</p>
                </div>
                <Icon className="w-10 h-10 opacity-30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Email</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Companies</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Super Admin</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoMailOutline className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                      {user.companies?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {user.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        <IoShieldCheckmarkOutline className="w-4 h-4" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <IoPeopleOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminUsers;
