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
    IoPeopleCircleOutline,
    IoCheckmarkOutline
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
    const [pricingPlans, setPricingPlans] = useState([]);
    const [content, setContent] = useState({
        hero: {
            badge: 'Trusted by Companies',
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
            companiesLabel: 'Global Companies',
            usersLabel: 'Active Users',
            tasksLabel: 'Tasks Completed',
        },
    });

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
        fetchPricingPlans();
    }, []);

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
            setContent(response.data);
        } catch (err) {
            console.error('Failed to fetch platform content:', err);
        }
    };

    const fetchPricingPlans = async () => {
        try {
            const response = await api.get('/api/super-admin/public/pricing-plans');
            setPricingPlans(response.data || []);
        } catch (err) {
            console.error('Failed to fetch pricing plans:', err);
            setPricingPlans([]);
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
            <header className="relative pt-24 pb-32 lg:pt-48 lg:pb-56 overflow-hidden bg-slate-50">
                {/* Visual Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        
                        {/* Left Column: Text Content */}
                        <div className="text-left opacity-0 animate-fade-up">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                {content.hero.badge} {stats.companies}
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

            {/* 3. Features Grid */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24 opacity-0 animate-fade-up">
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

            {/* 4. Stats Banner */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <StatItem value={stats.uptime} label={content.stats.uptimeLabel} />
                    <StatItem value={stats.companies} label={content.stats.companiesLabel} />
                    <StatItem value={stats.users} label={content.stats.usersLabel} />
                    <StatItem value={stats.tasksCompleted} label={content.stats.tasksLabel} />
                </div>
            </section>

            {/* 5. Pricing Section */}
            {pricingPlans.length > 0 && (
                <section className="py-32 bg-gradient-to-b from-white to-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                                Choose the perfect plan for your team. Scale up or down anytime.
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pricingPlans.map((plan, idx) => (
                                <PricingCard key={idx} plan={plan} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
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

// Pricing Card Component
const PricingCard = ({ plan, navigate }) => {
    const handleGetStarted = () => {
        // Store selected plan in localStorage
        localStorage.setItem('selectedPlan', JSON.stringify({
            name: plan.name,
            price: plan.price,
            features: plan.features || []
        }));
        // Redirect to payment page
        navigate('/payment');
    };

    return (
        <div className="rounded-2xl border border-slate-200 p-8 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 bg-white">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
            <div className="mb-8">
                <span className="text-5xl font-black text-blue-600">${plan.price}</span>
                <span className="text-slate-600 ml-2">/month</span>
            </div>
            <div className="space-y-4 mb-8">
                {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <IoCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{feature}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-sm">No features specified</p>
                )}
            </div>
            <button 
                onClick={handleGetStarted}
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
                Get Started
            </button>
        </div>
    );
};

export default LandingPage;
