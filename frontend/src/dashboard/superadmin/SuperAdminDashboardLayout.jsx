import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import NotificationCenter from '../../components/NotificationCenter';
import { IoChevronDownOutline } from 'react-icons/io5';

const SuperAdminDashboardLayout = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const getInitials = () => {
    const firstName = userProfile.firstName || 'S';
    const lastName = userProfile.lastName || 'A';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <SuperAdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Platform-wide management and analytics</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <NotificationCenter />
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {userProfile.firstName} {userProfile.lastName}
                </span>
                <IoChevronDownOutline className="w-4 h-4 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                  <a href="/dashboard/super-admin/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboardLayout;
