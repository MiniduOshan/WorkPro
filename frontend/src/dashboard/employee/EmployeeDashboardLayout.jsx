import { Outlet, useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../../components/EmployeeSidebar';
import CompanySwitcher from '../../components/CompanySwitcher';
import ChatAssistant from '../../components/ChatAssistant';
import { 
    IoNotificationsOutline, 
    IoChevronDown,
    IoCloseCircleOutline,
    IoPencilOutline 
} from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 

const ProfileDropdown = ({ profile, onLogout, onClose, onGoToProfile }) => (
    <div className="absolute right-0 top-14 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
        <div className="flex items-center pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3 overflow-hidden">
                <img 
                    src={profile.profilePic || '/images/default_avatar.png'} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                />
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

const EmployeeDashboardLayout = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
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
        navigate('/dashboard/profile');
    };

    return (
        <div className="flex min-h-screen bg-app-bg transition-colors duration-300 w-full"> 
            <EmployeeSidebar />
            
            <div className="flex flex-col grow">
                {/* Top Header Bar */}
                <header className="flex justify-between items-center bg-white p-4 border-b border-gray-200 shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
                        <CompanySwitcher currentCompanyId={companyId} />
                    </div>
                    
                    <div className="flex items-center space-x-4 relative">
                        {/* Notifications Button & Popup */}
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <IoNotificationsOutline className="w-6 h-6" />
                        </button>
                        
                        {showNotifications && (
                            <div className="absolute right-0 top-14 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <p className="font-semibold text-gray-800">Notifications</p>
                                    <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-red-500">
                                        <IoCloseCircleOutline className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Notification system is currently **OFF**.</p>
                            </div>
                        )}
                        
                        {/* User Profile Button & Dropdown */}
                        <button
                             onClick={() => setShowProfile(!showProfile)}
                             className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-gray-800 font-medium text-sm mx-2 whitespace-nowrap hidden sm:inline">
                                {profile.firstName} {profile.lastName}
                            </span>

                            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                <img 
                                    src={profile.profilePic || '/images/default_avatar.png'} 
                                    alt={profile.firstName ? profile.firstName[0] : 'U'} 
                                    className="w-full h-full object-cover" 
                                />
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
                <main className="grow p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
            
            {/* Chat Assistant - Persistent across all pages */}
            <ChatAssistant 
                userType="employee" 
                companyId={companyId} 
            />
        </div>
    );
};

export default EmployeeDashboardLayout;
