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
  IoPersonAddOutline
} from 'react-icons/io5';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ firstName: 'User', lastName: 'Name', email: '' });
  const companyRole = localStorage.getItem('companyRole') || 'employee';

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    // Listen for profile updates
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
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    return `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase();
  };

  const managementLinks = [
    { name: 'Dashboard', icon: IoGridOutline, path: '/dashboard' },
    { name: 'Team Members', icon: IoPeopleOutline, path: '/dashboard/teams' },
    { name: 'Task Oversight', icon: IoClipboardOutline, path: '/dashboard/tasks' },
    { name: 'Departments', icon: IoLayersOutline, path: '/dashboard/departments' },
    { name: 'Invite Members', icon: IoPersonAddOutline, path: '/dashboard/invite' },
  ];

  const communicationLinks = [
    { name: 'Group Works', icon: IoChatbubblesOutline, path: '/dashboard/channels', badge: '3' },
    { name: 'Announcements', icon: IoMegaphoneOutline, path: '/dashboard/announcements' },
  ];

  const systemLinks = [
    { name: 'Settings', icon: IoSettingsOutline, path: '/dashboard/settings' },
  ];

  const SidebarLink = ({ name, icon: Icon, path, badge, isActive }) => (
    <Link
      to={path}
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
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
          </div>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200 overflow-hidden">
            {profile.profilePic && profile.profilePic !== '/images/default_avatar.png' ? (
              <img 
                src={profile.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              getInitials()
            )}
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

      {/* Custom Styles */}
      <style>{`
        .sidebar-link.active {
          background: #eff6ff;
          color: #2563eb;
          border-right: 4px solid #ffffff;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
