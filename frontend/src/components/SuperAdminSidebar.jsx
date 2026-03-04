import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoGridOutline,
  IoBusinessOutline,
  IoStatsChartOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoNotificationsOutline,
  IoTrendingUpOutline,
  IoMailOutline
} from 'react-icons/io5';

const SuperAdminSidebar = ({ variant = 'desktop', className = '', onNavigate = () => { } }) => {
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
    { name: 'Pricing Plans', icon: IoWalletOutline, path: '/dashboard/super-admin/pricing' },
    { name: 'Revenue', icon: IoTrendingUpOutline, path: '/dashboard/super-admin/revenue' },
    { name: 'Platform Content', icon: IoDocumentTextOutline, path: '/dashboard/super-admin/platform-content' },
    { name: 'Email Management', icon: IoMailOutline, path: '/dashboard/super-admin/emails' },
    { name: 'Notifications', icon: IoNotificationsOutline, path: '/dashboard/super-admin/notifications' },
  ];

  const SidebarLink = ({ name, icon: Icon, path, badge, isActive }) => (
    <Link
      to={path}
      onClick={onNavigate}
      className={`relative flex items-center gap-3 px-4 py-3 m-1 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
        : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
        }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'}`} />
      <span className="tracking-wide">{name}</span>
      {badge && (
        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${isActive ? 'bg-white text-purple-600' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {badge}
        </span>
      )}
    </Link>
  );

  const visibilityClass = variant === 'mobile' ? 'flex lg:hidden' : 'hidden lg:flex';

  return (
    <aside className={`w-72 bg-white border-r border-gray-100 flex-col ${visibilityClass} ${className}`}>
      {/* Header */}
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
          <IoShieldCheckmarkOutline className="text-xl" />
        </div>
        <div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight block leading-none">SuperAdmin</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-0.5">Control Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-4 px-3 overflow-y-auto scrollbar-hide">
        {/* Admin Section */}
        <div className="mb-8">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-3">
            Administration
          </p>
          <div className="space-y-0.5">
            {adminLinks.map((link) => (
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
          <div className="mt-auto px-1">
            <button
              onClick={() => {
                onNavigate();
                handleBackToDashboard();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 m-1 rounded-xl text-sm font-semibold transition-all duration-200 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:shadow-md"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span>Back to My Dashboard</span>
            </button>
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="p-4 mx-3 mb-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold border-2 border-white shadow-sm">
            {getInitials()}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-purple-600 font-medium truncate">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors shadow-sm"
            title="Logout"
          >
            <IoLogOutOutline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
