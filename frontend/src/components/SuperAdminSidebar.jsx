import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoGridOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoBriefcaseOutline,
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoChatbubblesOutline,
  IoNotificationsOutline
} from 'react-icons/io5';

const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ firstName: 'Super', lastName: 'Admin', email: '' });
  const companyRole = localStorage.getItem('companyRole');

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    const handleProfileUpdate = () => {
      const updatedProfile = localStorage.getItem('userProfile');
      if (updatedProfile) {
        setProfile(JSON.parse(updatedProfile));
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyRole');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
      alert('You are not currently associated with any company.');
      return;
    }
    
    // Go back to user's company dashboard based on their role
    if (companyRole === 'employee') {
      navigate('/dashboard');
    } else if (companyRole === 'manager' || companyRole === 'owner') {
      navigate('/dashboard/manager');
    } else {
      // If role is not clear, show select company page
      navigate('/select-company');
    }
  };

  const isLinkActive = (path) => {
    if (path === '/dashboard/super-admin') {
      return location.pathname === '/dashboard/super-admin' || location.pathname === '/dashboard/super-admin/';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    return `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase();
  };

  const adminLinks = [
    { name: 'Dashboard', icon: IoGridOutline, path: '/dashboard/super-admin' },
    { name: 'Analytics', icon: IoStatsChartOutline, path: '/dashboard/super-admin/analytics' },
    { name: 'Companies', icon: IoBusinessOutline, path: '/dashboard/super-admin/companies' },
    { name: 'Users', icon: IoPeopleOutline, path: '/dashboard/super-admin/users' },
    { name: 'Pricing Plans', icon: IoWalletOutline, path: '/dashboard/super-admin/pricing' },
    { name: 'Platform Content', icon: IoDocumentTextOutline, path: '/dashboard/super-admin/platform-content' },
    { name: 'Notifications', icon: IoNotificationsOutline, path: '/dashboard/super-admin/notifications' },
  ];

  const systemLinks = [
    { name: 'Settings', icon: IoSettingsOutline, path: '/dashboard/super-admin/settings' },
  ];

  const SidebarLink = ({ name, icon: Icon, path, badge, isActive }) => (
    <Link
      to={path}
      className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive
          ? 'active bg-purple-50 text-purple-600'
          : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{name}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
          <IoShieldCheckmarkOutline className="text-sm" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">SuperAdmin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-6 overflow-y-auto">
        {/* Admin Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Administration
          </p>
          <div className="space-y-1">
            {adminLinks.map((link) => (
              <SidebarLink
                key={link.path}
                {...link}
                isActive={isLinkActive(link.path)}
              />
            ))}
          </div>
        </div>

        {/* System Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            System
          </p>
          <div className="space-y-1">
            {systemLinks.map((link) => (
              <SidebarLink
                key={link.path}
                {...link}
                isActive={isLinkActive(link.path)}
              />
            ))}
          </div>
        </div>

        {/* Back to Dashboard */}
        {companyRole && (
          <div className="px-4">
            <button
              onClick={handleBackToDashboard}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-blue-600 hover:bg-blue-50 border border-blue-200"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span>Back to My Dashboard</span>
            </button>
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
            {getInitials()}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition"
            title="Logout"
          >
            <IoLogOutOutline className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
