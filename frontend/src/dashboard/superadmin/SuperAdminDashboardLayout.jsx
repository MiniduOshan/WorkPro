import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import NotificationCenter from '../../components/NotificationCenter';
import { IoChevronDownOutline, IoMenuOutline } from 'react-icons/io5';

const SuperAdminDashboardLayout = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const getInitials = () => {
    const firstName = userProfile.firstName || 'S';
    const lastName = userProfile.lastName || 'A';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <SuperAdminSidebar />

      {/* Mobile Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl">
            <SuperAdminSidebar
              variant="mobile"
              className="h-full"
              onNavigate={() => setIsMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between sticky top-0 z-10">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-label="Open navigation"
            >
              <IoMenuOutline className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Platform-wide management and analytics</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboardLayout;
