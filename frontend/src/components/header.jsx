import React from 'react';
import { Link } from 'react-router-dom';

// Define the primary color for consistent styling (using Tailwind's indigo as a placeholder)
const PRIMARY_COLOR = 'indigo'; // e.g., text-indigo-600, bg-indigo-600

function Header() {
    return (
        <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="flex justify-between items-center py-4 px-6 max-w-7xl mx-auto">
                {/* 1. Logo & App Name (Left-aligned) */}
                <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                    {/* Placeholder for a visually distinct logo */}
                    <img src="/logo.png" alt="WorkPro Logo" className="w-8 h-8" />
                    <span className="text-xl font-extrabold text-gray-900">WorkPro</span>
                </Link>

                {/* 2. Primary Navigation (Center/Right-aligned on desktop) */}
                <nav className="hidden md:flex items-center space-x-7">
                    <Link to="/" className="text-gray-600 hover:text-${PRIMARY_COLOR}-600 transition-colors font-medium">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-${PRIMARY_COLOR}-600 transition-colors font-medium">About</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-${PRIMARY_COLOR}-600 transition-colors font-medium">Contact</Link>
                </nav>

                {/* 3. Action Buttons (Right-aligned) */}
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-gray-700 hover:text-${PRIMARY_COLOR}-600 transition-colors font-medium hidden sm:inline">
                        Log in
                    </Link>
                    <Link 
                        to="/signup" 
                        className={`px-4 py-2 bg-${PRIMARY_COLOR}-600 text-white font-semibold rounded-lg shadow-md hover:bg-${PRIMARY_COLOR}-700 transition-all duration-200 ease-in-out transform hover:scale-105`}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;