import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoGridOutline,
  IoPeopleOutline,
  IoClipboardOutline,
  IoLayersOutline,
  IoChatbubblesOutline,
  IoMegaphoneOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoBriefcaseOutline,
  IoPersonAddOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoDocumentTextOutline,
  IoSparklesOutline
} from 'react-icons/io5';

const ManagerSidebar = ({ variant = 'desktop', className = '', onNavigate = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ firstName: 'User', lastName: 'Name', email: '', isSuperAdmin: false });
  const companyRole = localStorage.getItem('companyRole') || 'manager';

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

  const isLinkActive = (path) => {
    if (path === '/dashboard/manager') {
      return location.pathname === '/dashboard/manager' || location.pathname === '/dashboard/manager/';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    return `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase();
  };

  const managementLinks = [
    { name: 'Dashboard', icon: IoGridOutline, path: '/dashboard/manager' },
    { name: 'AI Insights', icon: IoSparklesOutline, path: '/dashboard/manager/ai-insights' },
    ...(companyRole === 'owner' ? [{ name: 'Team Members', icon: IoPeopleOutline, path: '/dashboard/manager/teams' }] : []),
    { name: 'Task Oversight', icon: IoClipboardOutline, path: '/dashboard/manager/tasks' },
    { name: 'Departments', icon: IoLayersOutline, path: '/dashboard/manager/departments' },
    { name: 'Documents', icon: IoDocumentTextOutline, path: '/dashboard/manager/documents' },
    { name: 'Notes', icon: IoDocumentTextOutline, path: '/dashboard/manager/notes' },
    { name: 'Invite Members', icon: IoPersonAddOutline, path: '/dashboard/manager/invite' },
  ];

  const communicationLinks = [
    { name: 'Groups', icon: IoPeopleOutline, path: '/dashboard/manager/groups' },
    { name: 'Channels', icon: IoChatbubblesOutline, path: '/dashboard/manager/channels', badge: '3' },
    { name: 'Announcements', icon: IoMegaphoneOutline, path: '/dashboard/manager/announcements' },
  ];

  const systemLinks = [
    { name: 'Settings', icon: IoSettingsOutline, path: '/dashboard/manager/settings' },
  ];

  const SidebarLink = ({ name, icon: Icon, path, badge, isActive }) => (
    <Link
      to={path}
      onClick={onNavigate}
      className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive
          ? 'active bg-blue-50 text-blue-600'
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

  const visibilityClass = variant === 'mobile' ? 'flex lg:hidden' : 'hidden lg:flex';

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 flex-col ${visibilityClass} ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
          <IoBriefcaseOutline className="text-sm" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">WorkPro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-6 overflow-y-auto">
        {/* Management Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Management
          </p>
          <div className="space-y-1">
            {managementLinks.map((link) => (
              <SidebarLink
                key={link.path}
                {...link}
                isActive={isLinkActive(link.path)}
              />
            ))}
          </div>
        </div>

        {/* Communication Section */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Communication
          </p>
          <div className="space-y-1">
            {communicationLinks.map((link) => (
              <SidebarLink
                key={link.path}
                {...link}
                isActive={isLinkActive(link.path)}
              />
            ))}
          </div>
        </div>

        {/* System Section */}
        <div className="px-4">
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
            
            {/* Super Admin Link */}
            {profile.isSuperAdmin && (
              <Link
                to="/dashboard/super-admin"
                onClick={onNavigate}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-purple-600 hover:bg-purple-50 border border-purple-200"
              >
                <IoShieldCheckmarkOutline className="w-5 h-5" />
                <span>Super Admin Panel</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
            {getInitials()}
          </div>
          <div className="overflow-hidden flex-grow">
            <p className="text-xs font-bold text-slate-800 truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-[10px] text-slate-500 truncate capitalize">
              {companyRole} @ WorkPro
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 transition"
            title="Logout"
          >
            <IoLogOutOutline className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        .sidebar-link.active {
          background: #eff6ff;
          color: #2563eb;
          border-right: 4px solid #2563eb;
        }
      `}</style>
    </aside>
  );
};

export default ManagerSidebar;
