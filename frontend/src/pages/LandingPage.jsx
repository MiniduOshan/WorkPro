import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IoShieldCheckmarkOutline, 
    IoArrowForwardOutline, 
    IoChevronForward,
    IoCheckmarkCircleOutline,
    IoStatsChartOutline,
    IoLayersOutline,
    IoFlashOutline,
    IoPeopleCircleOutline
} from 'react-icons/io5';
import api from '../api/axios';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [stats, setStats] = useState({
        companies: '500+',
        users: '50K+',
        tasksCompleted: '100K+',
        uptime: '99.9%'
    });
    const defaultContent = {
        siteName: 'WorkPro',
        hero: {
            badge: ' ',
            headline: 'Everything you need to scale your company.',
            subheadline: 'WorkPro is the unified operating system for your team. Track tasks, manage people, and drive growth from one intuitive platform.',
        },
        features: [
            { title: 'Task Boards', description: 'Organize work visually with drag-and-drop Kanban boards that keep everyone in sync.', icon: 'IoLayersOutline' },
            { title: 'Instant Sync', description: 'Real-time updates mean your team is always working on the most current version.', icon: 'IoFlashOutline' },
            { title: 'Team Hub', description: 'Centralize communications and documents in a unified workspace for your whole company.', icon: 'IoPeopleCircleOutline' },
            { title: 'Analytics', description: 'Get deep insights into team productivity and project progress with automated reports.', icon: 'IoStatsChartOutline' }
        ],
        stats: {
            uptime: '99.9%',
            uptimeLabel: 'System Uptime',
            companiesValue: '',
            companiesLabel: 'Global Companies',
            usersValue: '',
            usersLabel: 'Active Users',
            tasksValue: '',
            tasksLabel: 'Tasks Completed',
        },
    };

    const normalizePlatformContent = (data) => ({
        siteName: data?.siteName ?? defaultContent.siteName,
        hero: {
            badge: data?.hero?.badge ?? defaultContent.hero.badge,
            headline: data?.hero?.headline ?? defaultContent.hero.headline,
            subheadline: data?.hero?.subheadline ?? defaultContent.hero.subheadline,
        },
        features: Array.isArray(data?.features) ? data.features : defaultContent.features,
        stats: {
            uptime: data?.stats?.uptime ?? defaultContent.stats.uptime,
            uptimeLabel: data?.stats?.uptimeLabel ?? defaultContent.stats.uptimeLabel,
            companiesValue: data?.stats?.companiesValue ?? defaultContent.stats.companiesValue,
            companiesLabel: data?.stats?.companiesLabel ?? defaultContent.stats.companiesLabel,
            usersValue: data?.stats?.usersValue ?? defaultContent.stats.usersValue,
            usersLabel: data?.stats?.usersLabel ?? defaultContent.stats.usersLabel,
            tasksValue: data?.stats?.tasksValue ?? defaultContent.stats.tasksValue,
            tasksLabel: data?.stats?.tasksLabel ?? defaultContent.stats.tasksLabel,
        },
    });

    const [content, setContent] = useState(defaultContent);

    useEffect(() => {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                setIsSuperAdmin(profile.isSuperAdmin === true);
            } catch (err) {
                console.error("Error parsing user profile", err);
                setIsSuperAdmin(false);
            }
        } else {
            setIsSuperAdmin(false);
        }

        // Fetch public stats and platform content
        fetchPublicStats();
        fetchPlatformContent();
    }, []);

    useEffect(() => {
        if (content.siteName) {
            document.title = `${content.siteName} - Company Project Management`;
        }
    }, [content.siteName]);

    const fetchPublicStats = async () => {
        try {
            const response = await api.get('/api/super-admin/public/stats');
            const data = response.data;
            setStats({
                companies: data.companies >= 1000 ? `${(data.companies / 1000).toFixed(1)}K+` : `${data.companies}+`,
                users: data.users >= 1000 ? `${(data.users / 1000).toFixed(1)}K+` : `${data.users}+`,
                tasksCompleted: data.tasksCompleted >= 1000 ? `${(data.tasksCompleted / 1000).toFixed(1)}K+` : `${data.tasksCompleted}+`,
                uptime: data.uptime || '99.9%'
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchPlatformContent = async () => {
        try {
            const response = await api.get('/api/super-admin/public/platform-content');
            setContent(normalizePlatformContent(response.data));
        } catch (err) {
            console.error('Failed to fetch platform content:', err);
        }
    };

    const getIconComponent = (iconName) => {
        const iconMap = {
            IoLayersOutline,
            IoFlashOutline,
            IoPeopleCircleOutline,
            IoStatsChartOutline,
        };
        const Icon = iconMap[iconName] || IoLayersOutline;
        return <Icon className="w-8 h-8" />;
    };

    return (
        <div className="bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
            {/* Custom Animations Style Block */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(2deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(2deg); }
                }
                .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
            `}} />

            {/* 1. Super Admin Banner */}
            {isSuperAdmin && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 sticky top-0 z-40 shadow-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-200" />
                            <span className="font-medium text-sm">Super Admin Access Active</span>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/super-admin')}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-white/20 transition-all text-xs flex items-center gap-2"
                        >
                            Admin Panel <IoChevronForward />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Hero Section */}
            <header className="relative pt-16 pb-20 lg:pt-28 lg:pb-32 overflow-hidden bg-slate-50">
                {/* Visual Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Left Column: Text Content */}
                        <div className="text-left opacity-0 animate-fade-up">
                            <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-500 mb-3">
                                {content.siteName}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                {content.hero.badge} {content.stats.companiesValue || stats.companies}
                            </div>
                            
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                                {content.hero.headline.split(' ').slice(0, 2).join(' ')} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    {content.hero.headline.split(' ').slice(2, 6).join(' ')}
                                </span>
                                <br />{content.hero.headline.split(' ').slice(6).join(' ')}
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-600 mb-12 max-w-lg leading-relaxed">
                                {content.hero.subheadline}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5">
                                <button 
                                    onClick={() => navigate('/signup')}
                                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    Start Free Trial <IoArrowForwardOutline />
                                </button>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="bg-white text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                    Sign In
                                </button>
                            </div>

                            <div className="mt-10 flex items-center gap-8 text-sm text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5"><IoCheckmarkCircleOutline className="text-green-500 w-5 h-5" /> No credit card</div>
                                <div className="flex items-center gap-1.5"><IoCheckmarkCircleOutline className="text-green-500 w-5 h-5" /> 14-day trial</div>
                            </div>
                        </div>

                        {/* Right Column: Animated Mockup */}
                        <div className="relative hidden lg:block opacity-0 animate-fade-up delay-1">
                            <div className="animate-float">
                                <div className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden transform rotate-2">
                                    {/* Browser Header */}
                                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        </div>
                                        <div className="mx-auto bg-white border border-slate-200 rounded-lg px-4 py-1 text-[11px] text-slate-400 w-64 text-center font-medium">
                                            dashboard.workpro.app
                                        </div>
                                    </div>
                                    {/* Mockup Body Content */}
                                    <div className="p-8 bg-slate-50/50">
                                        <div className="grid grid-cols-12 gap-6">
                                            <div className="col-span-5 space-y-4">
                                                <div className="h-32 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                                    <div className="h-3 w-16 bg-blue-100 rounded-full mb-4"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
                                                        <div className="h-2.5 w-4/5 bg-slate-100 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="h-32 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                                    <div className="h-3 w-12 bg-indigo-100 rounded-full mb-4"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-2.5 w-full bg-slate-100 rounded-full"></div>
                                                        <div className="h-2.5 w-2/3 bg-slate-100 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full min-h-[300px]">
                                                <div className="flex justify-between items-center mb-8">
                                                    <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
                                                </div>
                                                <div className="space-y-6">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="flex gap-4 items-center">
                                                            <div className="w-5 h-5 rounded-md border-2 border-slate-100"></div>
                                                            <div className="h-2.5 flex-1 bg-slate-50 rounded-full"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. Visual Transition Section */}
            <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Visual Graphics */}
                        <div className="relative h-72 flex items-center justify-center opacity-0 animate-fade-up">
                            {/* Animated background shapes */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Large circle background */}
                                <div className="absolute w-72 h-72 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-full blur-3xl opacity-40"></div>
                                
                                {/* Floating cards */}
                                <div className="absolute top-10 -left-10 w-40 h-32 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-6 transform -rotate-6 hover:shadow-lg transition-all">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg mb-4"></div>
                                    <div className="h-2 w-20 bg-slate-200 rounded-full mb-3"></div>
                                    <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                                </div>

                                <div className="absolute bottom-10 right-0 w-44 h-36 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-6 transform rotate-3 hover:shadow-lg transition-all">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg mb-4"></div>
                                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-3"></div>
                                    <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                                </div>

                                {/* Center floating element */}
                                <div className="absolute w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl shadow-2xl transform rotate-45 opacity-80"></div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="opacity-0 animate-fade-up delay-1">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                Streamline your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">workflow</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                From task management to team collaboration, handle everything in one unified platform designed for productivity.
                            </p>
                            <ul className="space-y-4">
                                {['Real-time collaboration', 'Smart task automation', 'Advanced analytics'].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Features Grid */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 opacity-0 animate-fade-up">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Tools built for high-performing teams
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to manage your business without the complexity of traditional enterprise software.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {content.features.map((feature, idx) => (
                            <FeatureCard 
                                key={idx}
                                icon={getIconComponent(feature.icon)} 
                                title={feature.title} 
                                desc={feature.description}
                                delay={idx % 2 === 0 ? "delay-1" : "delay-2"}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Why Choose WorkPro Section */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 opacity-0 animate-fade-up">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Why Choose WorkPro?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Built for teams that value speed, collaboration, and clarity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Unified Platform',
                                desc: 'Bring all your work tools together. No more switching between apps or losing track of updates.',
                                icon: '🎯'
                            },
                            {
                                title: 'Real-Time Collaboration',
                                desc: 'See changes instantly. Comments, updates, and progress tracked in one place for your entire team.',
                                icon: '⚡'
                            },
                            {
                                title: 'Deep Insights',
                                desc: 'Understand your team performance with automated analytics and actionable reports.',
                                icon: '📊'
                            },
                            {
                                title: 'Intuitive Design',
                                desc: "No training needed. Onboard your team in minutes with an interface they'll love.",
                                icon: '✨'
                            },
                            {
                                title: 'Flexible & Scalable',
                                desc: "Grows with your business. From startups to enterprises, we've got you covered.",
                                icon: '📈'
                            },
                            {
                                title: 'Enterprise Security',
                                desc: 'Your data is protected with industry-standard encryption and compliance standards.',
                                icon: '🔒'
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="text-5xl mb-4">{benefit.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. How It Works Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 opacity-0 animate-fade-up">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Get Started in Minutes
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Simple setup process designed to get your team productive right away
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { num: '1', title: 'Sign Up', desc: 'Create your account in seconds' },
                            { num: '2', title: 'Invite Team', desc: 'Add teammates with one click' },
                            { num: '3', title: 'Create Projects', desc: 'Organize work into projects' },
                            { num: '4', title: 'Start Collaborating', desc: 'Begin managing tasks together' }
                        ].map((step, idx) => (
                            <div key={idx} className="relative opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4">
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-slate-600 text-sm">{step.desc}</p>
                                {idx < 3 && (
                                    <div className="absolute top-8 -right-8 text-blue-400 text-3xl hidden md:block">→</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Use Cases Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 opacity-0 animate-fade-up">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Perfect For...
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: 'Product Teams', desc: 'Streamline sprints, manage backlogs, and ship faster' },
                            { title: 'Marketing Teams', desc: 'Campaigns, content calendars, and creative projects' },
                            { title: 'Design Teams', desc: 'Design workflows, feedback loops, and asset management' },
                            { title: 'Remote Teams', desc: 'Stay connected across time zones with real-time updates' }
                        ].map((useCase, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                                    <span className="text-2xl font-black text-blue-600">→</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{useCase.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{useCase.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-0 animate-fade-up">
                    <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                        Ready to transform your team?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of teams using WorkPro to collaborate smarter, work faster, and deliver more.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => navigate('/signup')}
                            className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition shadow-lg"
                        >
                            Start Free Trial
                        </button>
                        <button 
                            onClick={() => navigate('/pricing')}
                            className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition"
                        >
                            View Pricing
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. Stats Banner */}
            <section className="py-12 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <StatItem value={stats.uptime} label={content.stats.uptimeLabel} />
                    <StatItem value={content.stats.companiesValue || stats.companies} label={content.stats.companiesLabel} />
                    <StatItem value={content.stats.usersValue || stats.users} label={content.stats.usersLabel} />
                    <StatItem value={content.stats.tasksValue || stats.tasksCompleted} label={content.stats.tasksLabel} />
                </div>
            </section>
        </div>
    );
};

// Sub-component for Feature Cards with animation
const FeatureCard = ({ icon, title, desc, delay }) => (
    <div className={`p-10 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-blue-200 transition-all duration-500 group opacity-0 animate-fade-up ${delay}`}>
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
);

const StatItem = ({ value, label }) => (
    <div className="opacity-0 animate-fade-up">
        <div className="text-4xl lg:text-5xl font-black mb-3 text-blue-400 tracking-tighter">{value}</div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{label}</div>
    </div>
);

export default LandingPage;
