import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoShieldCheckmarkOutline, IoBriefcaseOutline, IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

function Header() {
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check if user is logged in and is super admin
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                setIsSuperAdmin(profile.isSuperAdmin === true);
            } catch (err) {
                console.error('Error parsing user profile', err);
                setIsSuperAdmin(false);
            }
        } else {
            setIsSuperAdmin(false);
        }
        
        // Listen for profile updates
        const handleStorageChange = () => {
            const updatedProfile = localStorage.getItem('userProfile');
            if (updatedProfile) {
                try {
                    const profile = JSON.parse(updatedProfile);
                    setIsSuperAdmin(profile.isSuperAdmin === true);
                } catch (err) {
                    setIsSuperAdmin(false);
                }
            } else {
                setIsSuperAdmin(false);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profileUpdated', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleStorageChange);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="flex justify-between items-center py-4 px-6 max-w-7xl mx-auto">
                {/* 1. Logo & App Name (Left-aligned) */}
                <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                    {/* Work Logo Icon */}
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <IoBriefcaseOutline className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold text-gray-900">WorkPro</span>
                </Link>

                {/* 2. Primary Navigation (Center/Right-aligned on desktop) */}
                <nav className="hidden md:flex items-center space-x-7">
                    <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">About</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contact</Link>
                    {isSuperAdmin && (
                        <Link 
                            to="/dashboard/super-admin" 
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                        >
                            <IoShieldCheckmarkOutline className="w-4 h-4" />
                            Admin Panel
                        </Link>
                    )}
                </nav>

                {/* 3. Action Buttons (Right-aligned) */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="md:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                        aria-label="Toggle navigation"
                    >
                        {isMobileMenuOpen ? (
                            <IoCloseOutline className="w-5 h-5 text-gray-700" />
                        ) : (
                            <IoMenuOutline className="w-5 h-5 text-gray-700" />
                        )}
                    </button>
                    <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium hidden sm:inline">
                        Log in
                    </Link>
                    <Link 
                        to="/signup" 
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="flex flex-col gap-2 px-6 py-4">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-indigo-600 font-medium">
                            Home
                        </Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-indigo-600 font-medium">
                            About
                        </Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-indigo-600 font-medium">
                            Contact
                        </Link>
                        {isSuperAdmin && (
                            <Link
                                to="/dashboard/super-admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm w-fit"
                            >
                                <IoShieldCheckmarkOutline className="w-4 h-4" />
                                Admin Panel
                            </Link>
                        )}
                        <div className="pt-2 border-t border-gray-100">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-indigo-600 font-medium">
                                Log in
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;