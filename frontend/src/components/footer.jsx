// src/components/Footer.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoShieldCheckmarkOutline, IoCallOutline, IoMailOutline, IoLocationOutline } from 'react-icons/io5';

function Footer() {
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            const profile = JSON.parse(userProfile);
            setIsSuperAdmin(profile.isSuperAdmin || false);
        }
    }, []);

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
                            {isSuperAdmin && (
                                <li>
                                    <Link to="/dashboard/super-admin" className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                                        <IoShieldCheckmarkOutline className="w-4 h-4" />
                                        Super Admin
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                    {/* Column 2: Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/faq" className="hover:text-blue-400">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400">Support</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
                        </ul>
                    </div>
                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <div className="flex space-x-4">
                            <a href="tel:+94762288794" className="hover:text-blue-400 transition-colors" title="Call Us">
                                <IoCallOutline className="w-6 h-6" />
                            </a>
                            <a href="mailto:support@workpro.app" className="hover:text-blue-400 transition-colors" title="Email Us">
                                <IoMailOutline className="w-6 h-6" />
                            </a>
                            <a href="https://maps.google.com/?q=Homagama,Sri+Lanka" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="Visit Us">
                                <IoLocationOutline className="w-6 h-6" />
                            </a>
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