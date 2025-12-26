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

import DashboardLayout from './dashboard/Dashboard.jsx';
import EmployeeDashboard from './dashboard/EmployeeDashboard.jsx';
import ManagerDashboard from './dashboard/ManagerDashboard.jsx';
import Profile from './dashboard/Profile.jsx';
import TasksBoard from './dashboard/TasksBoard.jsx';
import Channels from './dashboard/Channels.jsx';
import Teams from './dashboard/Teams.jsx';
import Departments from './dashboard/Departments.jsx';
import Groups from './dashboard/Groups.jsx';
import Announcements from './dashboard/Announcements.jsx';
import Settings from './dashboard/Settings.jsx';
import CompanyCreate from './pages/CompanyCreate.jsx';
import InviteJoin from './pages/InviteJoin.jsx';
import Invite from './dashboard/Invite.jsx';


// Simple Auth Check Simulation
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
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
                    <Route path="/company/create" element={<CompanyCreate />} />
                    <Route path="/invite/join" element={<InviteJoin />} />
                </Route>

                {/* 3. PROTECTED ROUTES (Routes using DashboardLayout - No public Header/Footer) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested Routes inside the DashboardLayout */}
                    <Route index element={<EmployeeDashboard />} /> 
                    <Route path="manager" element={<ManagerDashboard />} />
                    {/* WorkPro dashboard routes */}
                    <Route path="profile" element={<Profile />} />
                    <Route path="tasks" element={<TasksBoard />} />
                    <Route path="channels" element={<Channels />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="invite" element={<Invite />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
        </>
    );
}

export default App;