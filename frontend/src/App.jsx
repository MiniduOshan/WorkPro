import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import About from './pages/about.jsx';
import Contact from './pages/contact.jsx';

import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';
import Payment from './pages/Payment.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import EmployeeDashboardLayout from './dashboard/employee/EmployeeDashboardLayout.jsx';
import ManagerDashboardLayout from './dashboard/manager/ManagerDashboardLayout.jsx';
import SuperAdminDashboardLayout from './dashboard/superadmin/SuperAdminDashboardLayout.jsx';
import EmployeeDashboard from './dashboard/employee/EmployeeDashboard.jsx';
import ManagerDashboard from './dashboard/manager/ManagerDashboard.jsx';
import SuperAdminDashboard from './dashboard/superadmin/SuperAdminDashboard.jsx';
import SuperAdminAnalytics from './dashboard/superadmin/SuperAdminAnalytics.jsx';
import SuperAdminCompanies from './dashboard/superadmin/SuperAdminCompanies.jsx';
import SuperAdminUsers from './dashboard/superadmin/SuperAdminUsers.jsx';
import SuperAdminPricing from './dashboard/superadmin/SuperAdminPricing.jsx';
import SuperAdminSettings from './dashboard/superadmin/SuperAdminSettings.jsx';
import SuperAdminNotifications from './dashboard/superadmin/SuperAdminNotifications.jsx';
import PlatformContent from './dashboard/superadmin/PlatformContent.jsx';
import Profile from './dashboard/shared/Profile.jsx';
import TasksBoard from './dashboard/shared/TasksBoard.jsx';
import Channels from './dashboard/shared/Channels.jsx';
import Teams from './dashboard/shared/Teams.jsx';
import Departments from './dashboard/shared/Departments.jsx';
import Groups from './dashboard/shared/Groups.jsx';
import Announcements from './dashboard/shared/Announcements.jsx';
import Notes from './dashboard/shared/Notes.jsx';
import Settings from './dashboard/shared/Settings.jsx';
import DocumentLibrary from './dashboard/shared/DocumentLibrary.jsx';
import AIInsights from './dashboard/manager/AIInsights.jsx';
import CompanyCreate from './pages/CompanyCreate.jsx';
import InviteJoin from './pages/InviteJoin.jsx';
import Invite from './dashboard/shared/Invite.jsx';
import SelectCompany from './pages/SelectCompany.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';


const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

const ProtectedRoute = ({ children, requireCompany = false, allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        try {
            const profile = JSON.parse(userProfile);
            if (profile.isSuperAdmin) {
                return children;
            }
        } catch (err) {
            console.error('Error parsing user profile', err);
        }
    }
    
    if (requireCompany && !localStorage.getItem('companyId')) {
        return <Navigate to="/select-company" />;
    }

    // Enforce role-based routing - users CANNOT access wrong dashboard by typing URL
    if (allowedRoles && allowedRoles.length > 0 && allowedRoles.length < 3) {
        const role = localStorage.getItem('companyRole');
        
        // If companyRole is not set, user must select a company first
        if (!role) {
            return <Navigate to="/select-company" />;
        }
        
        // If role doesn't match allowed roles for this route, redirect to their correct dashboard
        if (!allowedRoles.includes(role)) {
            // Managers/Owners trying to access employee routes → redirect to manager dashboard
            if (role === 'manager' || role === 'owner') {
                return <Navigate to="/dashboard/manager" replace />;
            }
            // Employees trying to access manager routes → redirect to employee dashboard
            if (role === 'employee') {
                return <Navigate to="/dashboard" replace />;
            }
            // Fallback: send to employee dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }
    
    return children;
};

const PublicLayout = () => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow">
            <Outlet />
        </main>
        <Footer />
    </div>
);

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    // Global route guard - enforce role-based routing on EVERY navigation
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('companyRole');
        const companyId = localStorage.getItem('companyId');
        
        // Only enforce on dashboard routes
        if (!location.pathname.startsWith('/dashboard')) return;
        
        // Must be authenticated
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        
        // SuperAdmins bypass company selection - they view global analytics
        const userProfile = localStorage.getItem('userProfile');
        let isSuperAdmin = false;
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                isSuperAdmin = profile.isSuperAdmin === true;
            } catch (err) {
                console.error('Error parsing user profile', err);
            }
        }
        
        if (isSuperAdmin) {
            return; // SuperAdmins don't need company selection
        }
        
        // Must have company selected (except for create-company route)
        if (!companyId && !location.pathname.includes('create-company') && !location.pathname.includes('select-company')) {
            navigate('/select-company', { replace: true });
            return;
        }
        
        // STRICT ROLE ENFORCEMENT - prevent URL manipulation
        if (role && companyId) {
            // Managers/Owners trying to access /dashboard → redirect to /dashboard/manager
            if ((role === 'manager' || role === 'owner') && 
                location.pathname.startsWith('/dashboard') && 
                !location.pathname.startsWith('/dashboard/manager')) {
                navigate('/dashboard/manager', { replace: true });
                return;
            }
            
            // Employees trying to access /dashboard/manager → redirect to /dashboard
            if (role === 'employee' && location.pathname.startsWith('/dashboard/manager')) {
                navigate('/dashboard', { replace: true });
                return;
            }
        }
    }, [location.pathname, navigate]);

    return (
        <> 
            <Routes>
                
                {/* 1. INDEPENDENT AUTH PAGES (NO Header/Footer Layout) */}
                
                {/* Login Page: Independent */}
                <Route path="/login" element={<Auth type="login" />} />
                
                {/* Signup Page: Now independent, outside the PublicLayout */}
                <Route path="/signup" element={<Auth type="signup" />} />
                
                {/* Payment Page: Independent */}
                <Route path="/payment" element={<Payment />} />
                
                {/* Reset Password Page: Independent */}
                <Route path="/reset-password" element={<ResetPassword />} />
                
                
                {/* 2. PUBLIC PAGES (Routes that **SHOULD** have the Header and Footer via PublicLayout) */}
                <Route element={<PublicLayout />}>
                    {/* These pages use the Header and Footer */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<About />} /> 
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/invite/join" element={<InviteJoin />} />
                </Route>

                {/* Company Create (Protected - accessible from dashboard) */}
                <Route
                    path="/company/create"
                    element={
                        <ProtectedRoute>
                            <CompanyCreate />
                        </ProtectedRoute>
                    }
                />

                {/* Select Company (Protected but independent) */}
                <Route
                    path="/select-company"
                    element={
                        <ProtectedRoute>
                            <SelectCompany />
                        </ProtectedRoute>
                    }
                />

                {/* 3. PROTECTED ROUTES - Employee Dashboard (EMPLOYEES ONLY) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requireCompany={true} allowedRoles={['employee']}>
                            <EmployeeDashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<EmployeeDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="tasks" element={<TasksBoard />} />
                    <Route path="channels" element={<Channels />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="documents" element={<DocumentLibrary />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="create-company" element={<CompanyCreate />} />
                </Route>

                {/* 4. PROTECTED ROUTES - Manager Dashboard (MANAGERS AND OWNERS ONLY) */}
                <Route
                    path="/dashboard/manager"
                    element={
                        <ProtectedRoute requireCompany={true} allowedRoles={['owner','manager']}>
                            <ManagerDashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ManagerDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="tasks" element={<TasksBoard />} />
                    <Route path="channels" element={<Channels />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="invite" element={<Invite />} />
                    <Route path="documents" element={<DocumentLibrary />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="ai-insights" element={<AIInsights />} />
                    <Route path="create-company" element={<CompanyCreate />} />
                </Route>

                {/* 5. PROTECTED ROUTES - Super Admin Dashboard */}
                <Route
                    path="/dashboard/super-admin"
                    element={
                        <ProtectedRoute>
                            <SuperAdminDashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="analytics" element={<SuperAdminAnalytics />} />
                    <Route path="companies" element={<SuperAdminCompanies />} />
                    <Route path="users" element={<SuperAdminUsers />} />
                    <Route path="pricing" element={<SuperAdminPricing />} />
                    <Route path="platform-content" element={<PlatformContent />} />
                    <Route path="settings" element={<SuperAdminSettings />} />
                    <Route path="notifications" element={<SuperAdminNotifications />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
        </>
    );
}

export default App;