import { Outlet, useNavigate } from 'react-router-dom';
import ManagerSidebar from '../../components/ManagerSidebar';
import CompanySwitcher from '../../components/CompanySwitcher';
import NotificationCenter from '../../components/NotificationCenter';
import { 
    IoNotificationsOutline, 
    IoChevronDown,
    IoCloseCircleOutline,
    IoPencilOutline,
    IoMenuOutline
} from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 

const ProfileDropdown = ({ profile, onLogout, onClose, onGoToProfile }) => (
    <div className="absolute right-0 top-14 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
        <div className="flex items-center pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                {profile.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-800">{`${profile.firstName} ${profile.lastName}`}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
        </div>
        
        <button 
            onClick={() => { onClose(); onGoToProfile(); }}
            className="w-full flex items-center text-primary-500 hover:text-primary-700 mt-3 p-2 rounded-lg hover:bg-primary-50 transition-colors text-sm"
        >
            <IoPencilOutline className="w-5 h-5 mr-2" />
            <span>Go to Profile</span>
        </button>
    </div>
);

const ManagerDashboardLayout = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [profile, setProfile] = useState({ firstName: 'User', lastName: 'Name', email: 'user@example.com', profilePic: '' });
    const [companyId, setCompanyId] = useState(localStorage.getItem('companyId') || '');

    useEffect(() => {
        if (showNotifications) {
            setShowProfile(false);
        }
    }, [showNotifications]);

    useEffect(() => {
        if (showProfile) {
            setShowNotifications(false);
        }
    }, [showProfile]);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/api/users/profile', config);
                setProfile(data);
                localStorage.setItem('userProfile', JSON.stringify(data));
            } catch (err) {
                console.error("Failed to fetch user profile for header:", err);
            }
        };
        fetchProfile();

        const handleProfileUpdate = () => {
            fetchProfile();
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
    
    const handleGoToProfile = () => {
        // Navigate to the manager profile route, not the employee dashboard
        navigate('/dashboard/manager/profile');
    };

    return (
        <div className="flex min-h-screen bg-app-bg transition-colors duration-300 w-full overflow-hidden"> 
            <ManagerSidebar />

            {/* Mobile Sidebar Drawer */}
            {isMobileNavOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl">
                        <ManagerSidebar
                            variant="mobile"
                            className="h-full"
                            onNavigate={() => setIsMobileNavOpen(false)}
                        />
                    </div>
                </div>
            )}
            
            <div className="flex flex-col grow min-w-0">
                {/* Top Header Bar */}
                <header className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center bg-white p-4 border-b border-gray-200 shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setIsMobileNavOpen(true)}
                            className="lg:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                            aria-label="Open navigation"
                        >
                            <IoMenuOutline className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manager Dashboard</h1>
                        <div className="w-full sm:w-auto">
                            <CompanySwitcher currentCompanyId={companyId} />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 relative">
                        {/* Notifications */}
                        <NotificationCenter />
                        
                        {/* User Profile Button & Dropdown */}
                        <button
                             onClick={() => setShowProfile(!showProfile)}
                             className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-gray-800 font-medium text-sm mx-2 whitespace-nowrap hidden sm:inline">
                                {profile.firstName} {profile.lastName}
                            </span>

                            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-sm">
                                {profile.firstName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <IoChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                        </button>

                        {showProfile && (
                            <ProfileDropdown 
                                profile={profile} 
                                onLogout={handleLogout} 
                                onClose={() => setShowProfile(false)}
                                onGoToProfile={handleGoToProfile}
                            />
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="grow p-4 sm:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ManagerDashboardLayout;
