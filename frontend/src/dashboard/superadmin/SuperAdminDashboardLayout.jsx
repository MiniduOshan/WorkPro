import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import NotificationCenter from '../../components/NotificationCenter';
import { IoChevronDownOutline, IoMenuOutline, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

const SuperAdminDashboardLayout = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dashboardTheme') === 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dashboardTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const getInitials = () => {
    const firstName = userProfile.firstName || 'S';
    const lastName = userProfile.lastName || 'A';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className={`dashboard-theme ${isDarkMode ? 'dark' : ''} flex min-h-screen bg-app-bg overflow-hidden`}>
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
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <IoSunnyOutline className="w-4 h-4 text-amber-500" />
              ) : (
                <IoMoonOutline className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>
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
