import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle, IoRocketOutline, IoSparklesOutline } from 'react-icons/io5';
import api from '../api/axios';

const PostSignupPlanSelection = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const companyId = localStorage.getItem('companyId');

    useEffect(() => {
        if (!companyId) {
            navigate('/select-company');
            return;
        }
        fetchPlans();
    }, [companyId, navigate]);

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/api/pricing-plans/public');
            setPlans(data);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        if (processing) return;

        const isFree = plan.price === 0 || plan.name.toLowerCase().includes('free');

        if (isFree) {
            setProcessing(true);
            setTimeout(() => {
                navigate('/dashboard/manager');
                window.location.reload();
            }, 1000);
        } else {
            localStorage.setItem('selectedPlan', JSON.stringify(plan));
            navigate('/payment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-6 ring-1 ring-blue-100">
                    <IoRocketOutline className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    Choose Your Growth Plan
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Scale your company with the right tools. Upgrade, downgrade, or cancel at any time.
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4 w-full relative z-10">
                {plans.map((plan, idx) => {
                    const isFree = plan.price === 0 || plan.name.toLowerCase().includes('free');
                    const isPopular = idx === 1;

                    return (
                        <div
                            key={plan._id}
                            className={`relative bg-white rounded-[2rem] p-8 flex flex-col transition-all duration-500 group ${isPopular
                                    ? 'shadow-2xl ring-2 ring-blue-600 scale-105 z-10'
                                    : 'shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-gray-100'
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide shadow-lg flex items-center gap-2">
                                    <IoSparklesOutline />
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-2xl font-bold mb-4 ${isPopular ? 'text-blue-600' : 'text-gray-900'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">${plan.price}</span>
                                    <span className="text-gray-500 font-medium text-lg">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                                <p className="text-gray-500 mt-6 text-sm leading-relaxed h-10">
                                    {plan.description || "The perfect starting point for your business."}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 pt-8 mb-8 grow">
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <IoCheckmarkCircle className="w-6 h-6 flex-shrink-0 text-blue-600" />
                                        <span className="font-medium">
                                            {plan.limits.maxUsers === -1 ? 'Unlimited' : <strong className="text-gray-900">{plan.limits.maxUsers}</strong>} Users
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <IoCheckmarkCircle className="w-6 h-6 flex-shrink-0 text-blue-600" />
                                        <span className="font-medium">
                                            <strong className="text-gray-900">{plan.limits.maxStorageStr}</strong> Storage
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <IoCheckmarkCircle className="w-6 h-6 flex-shrink-0 text-blue-600" />
                                        <span className="font-medium">
                                            {plan.limits.maxProjects === -1 ? 'Unlimited' : <strong className="text-gray-900">{plan.limits.maxProjects}</strong>} Projects
                                        </span>
                                    </li>
                                    {Object.entries(plan.features)
                                        .filter(([k, v]) => v)
                                        .slice(0, 4)
                                        .map(([key]) => (
                                            <li key={key} className="flex items-start gap-3 text-gray-600 capitalize">
                                                <IoCheckmarkCircle className="w-6 h-6 flex-shrink-0 text-blue-600" />
                                                <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={processing}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md ${isFree
                                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02]'
                                    }`}
                            >
                                {processing ? 'Processing...' : (isFree ? 'Start for Free' : `Choose ${plan.name}`)}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PostSignupPlanSelection;
