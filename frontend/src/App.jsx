// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Header, Footer, and Page components
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import About from './pages/about.jsx';
import Contact from './pages/contact.jsx';

import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';

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
import TaskReassignmentApprovals from './dashboard/manager/TaskReassignmentApprovals.jsx';
import CompanyCreate from './pages/CompanyCreate.jsx';
import InviteJoin from './pages/InviteJoin.jsx';
import Invite from './dashboard/shared/Invite.jsx';
import SelectCompany from './pages/SelectCompany.jsx';


// Simple Auth Check Simulation
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, requireCompany = false }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    
    // Check if user is SuperAdmin - they don't need a company
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        try {
            const profile = JSON.parse(userProfile);
            if (profile.isSuperAdmin) {
                return children; // SuperAdmins can access everything
            }
        } catch (err) {
            console.error('Error parsing user profile', err);
        }
    }
    
    // For non-SuperAdmin users, check company requirement
    if (requireCompany && !localStorage.getItem('companyId')) {
        return <Navigate to="/select-company" />;
    }
    
    return children;
};

// Layout component to wrap public pages with both Header AND Footer
const PublicLayout = () => (
    <div className="flex flex-col min-h-screen">
        <Header />
        {/* The main content area that renders the child route */}
        <main className="grow">
            <Outlet />
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <> 
            <Routes>
                
                {/* 1. INDEPENDENT AUTH PAGES (NO Header/Footer Layout) */}
                
                {/* Login Page: Independent */}
                <Route path="/login" element={<Auth type="login" />} />
                
                {/* Signup Page: Now independent, outside the PublicLayout */}
                <Route path="/signup" element={<Auth type="signup" />} />
                
                
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

                {/* 3. PROTECTED ROUTES - Employee Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requireCompany={true}>
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

                {/* 4. PROTECTED ROUTES - Manager Dashboard */}
                <Route
                    path="/dashboard/manager"
                    element={
                        <ProtectedRoute requireCompany={true}>
                            <ManagerDashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ManagerDashboard />} />
                                        <Route path="task-approvals" element={<TaskReassignmentApprovals />} />
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
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
        </>
    );
}

export default App;