import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LandingPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const { data } = await api.get('/api/companies/search', { params: { query: searchQuery } });
            setSearchResults(data);
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900">
            {/* Hero Section */}
            <header className="pt-24 md:pt-40 pb-20 hero-pattern border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6 tracking-wide border border-blue-100">THE OPEN PACKAGE FOR COMPANIES</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1]">
                        Your Company's
                        <span className="block mt-3 gradient-text">Unified Digital HQ</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Discover companies, join teams instantly, and manage everything from onboarding to execution—all in 60 seconds.
                    </p>

                    {/* Global Company Search */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6 relative">
                        <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <div className="pl-4 text-slate-400">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search for companies to join..." 
                                className="grow bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-800 font-medium" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={isSearching}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 italic">Example: "TechFlow Systems" or "Global Creative Lab"</p>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="max-w-2xl mx-auto mb-10 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">Found {searchResults.length} Companies</h3>
                            </div>
                            <ul className="divide-y divide-slate-100">
                                {searchResults.map((company) => (
                                    <li key={company._id} className="p-4 hover:bg-blue-50 transition-colors cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{company.name}</h4>
                                                <p className="text-sm text-slate-500">{company.description || 'No description'}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/companies/${company._id}`)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-4 justify-center mb-16">
                        <button 
                            onClick={() => navigate('/auth')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
                        >
                            Join Existing Company
                        </button>
                        <button 
                            onClick={() => navigate('/company/create')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold border-2 border-blue-600 hover:bg-blue-50 transition"
                        >
                            Create Your Company
                        </button>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-cyan-500 rounded-4xl blur opacity-25"></div>
                        <div className="relative bg-white rounded-4xl border border-slate-200 overflow-hidden dashboard-mockup">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                                    <span className="text-sm font-semibold text-slate-500">WorkPro / Project Dashboard</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 h-[500px]">
                                {/* Sidebar */}
                                <div className="col-span-12 md:col-span-3 border-r border-slate-100 bg-slate-50/50 p-6 text-left">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Projects</p>
                                            <div className="space-y-2">
                                                <div className="bg-blue-600/10 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                                    <i className="fa-solid fa-briefcase"></i> Q1 Launch
                                                </div>
                                                <div className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                                                    <i className="fa-solid fa-rocket"></i> Product V2
                                                </div>
                                                <div className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                                                    <i className="fa-solid fa-chart-line"></i> Analytics
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Channels</p>
                                            <div className="space-y-2">
                                                <div className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer flex items-center gap-2">
                                                    <span className="text-slate-300">#</span> general
                                                </div>
                                                <div className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer flex items-center gap-2">
                                                    <span className="text-slate-300">#</span> dev-team
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Main Panel */}
                                <div className="col-span-12 md:col-span-6 p-8 overflow-y-auto text-left">
                                    <h3 className="text-xl font-bold mb-6">Active Tasks</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">IN PROGRESS</span>
                                                <i className="fa-solid fa-ellipsis-v text-slate-300"></i>
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-1">Update Dashboard UI</h4>
                                            <p className="text-xs text-slate-500 mb-4">Review the latest design mockups and implement changes.</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
                                                    <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white"></div>
                                                </div>
                                                <span className="text-[10px] text-slate-400"><i className="fa-regular fa-clock mr-1"></i> Due Friday</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">TO DO</span>
                                                <i className="fa-solid fa-ellipsis-v text-slate-300"></i>
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-1">API Integration</h4>
                                            <p className="text-xs text-slate-500 mb-4">Connect frontend task board to backend endpoints.</p>
                                            <div className="flex justify-between items-center">
                                                <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white"></div>
                                                <span className="text-[10px] text-slate-400"><i className="fa-regular fa-clock mr-1"></i> Tomorrow</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Chat Panel */}
                                <div className="col-span-12 md:col-span-3 border-l border-slate-100 p-6 flex flex-col text-left">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                                        Team Chat
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    </h3>
                                    <div className="grow space-y-4 mb-4">
                                        <div className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                                            <div className="bg-slate-100 p-2 rounded-lg rounded-tl-none">
                                                <p className="text-[10px] font-bold text-blue-600">Sarah M.</p>
                                                <p className="text-[11px] text-slate-600">Tasks assigned for today?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-row-reverse">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 shrink-0"></div>
                                            <div className="bg-blue-600 p-2 rounded-lg rounded-tr-none">
                                                <p className="text-[11px] text-white">Check the board!</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                                            <input type="text" placeholder="Type..." className="bg-transparent border-none text-[10px] focus:ring-0 p-0 grow" />
                                            <i className="fa-solid fa-paper-plane text-blue-600 text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section id="features" className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard iconClass="fa-building" title="Company Workspace" text="Create your company's digital headquarters. Manage multiple projects, invite team members, and organize everything in one unified workspace." color="blue" />
                        <FeatureCard iconClass="fa-tasks" title="Smart Task Management" text="Assign tasks to team members with priorities, due dates, and categories. Track progress from to-do to completion with visual boards." color="emerald" />
                        <FeatureCard iconClass="fa-comments" title="Real-time Collaboration" text="Built-in channels for instant team communication. Share updates, discuss projects, and keep everyone aligned without email chains." color="purple" />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 md:py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 -mr-48 -mt-48"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Getting Started with WorkPro</h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">Launch your team workspace in minutes, not hours.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                        {[
                            { n: '01', t: 'Create Company', d: 'Sign up and establish your company profile with branding and basic info.' },
                            { n: '02', t: 'Invite Your Team', d: 'Generate secure invitation links and add members with specific roles.' },
                            { n: '03', t: 'Set Up Projects', d: 'Create projects, define tasks, set priorities, and assign to team members.' },
                            { n: '04', t: 'Collaborate Daily', d: 'Use channels for communication, update tasks, and track project progress in real-time.' },
                        ].map((s) => (
                            <div className="relative" key={s.n}>
                                <div className="text-5xl font-bold text-slate-800 mb-4">{s.n}</div>
                                <h4 className="text-xl font-bold mb-3">{s.t}</h4>
                                <p className="text-slate-400 text-sm">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 bg-blue-600">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to transform your workflow?</h2>
                    <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">Join teams using WorkPro to streamline project management and boost collaboration.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth" className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition shadow-xl">Get Started Free</a>
                        <a href="/about" className="bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg border border-blue-500 hover:bg-blue-800 transition">Learn More</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ iconClass, title, text, color }) => (
    <div className="text-left group p-8 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
        <div className={`w-16 h-16 bg-${color}-100 text-${color}-600 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>
            <i className={`fa-solid ${iconClass}`}></i>
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{text}</p>
    </div>
);

export default LandingPage;