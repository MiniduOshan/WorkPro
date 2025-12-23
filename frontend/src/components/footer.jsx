// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1: Company */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
                            
                        </ul>
                    </div>
                    {/* Column 2: Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/contact" className="hover:text-blue-400">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400">Support</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400">Terms of Service</Link></li>
                        </ul>
                    </div>
                    {/* Column 3: Social */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            {/* Placeholder for social media icons */}
                            <a href="/contact" className="hover:text-blue-400">FB</a>
                            <a href="/contact" className="hover:text-blue-400">X</a>
                            <a href="/contact" className="hover:text-blue-400">In</a>
                        </div>
                    </div>
                    {/* Column 4: Newsletter/Branding */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">WorkPro</h3>
                        <p className="text-sm text-gray-400">Your complete project management and team collaboration platform.</p>
                    </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} WorkPro. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;