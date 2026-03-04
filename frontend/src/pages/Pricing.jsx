import React, { useState, useEffect } from 'react';
import { IoCheckmarkCircleOutline, IoCheckmarkCircle, IoStarOutline } from 'react-icons/io5';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);   // ID of company's active plan
  const [currentPlanPrice, setCurrentPlanPrice] = useState(0); // price for comparison
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [plansRes, userRes] = await Promise.allSettled([
        api.get('/api/pricing-plans/public'),
        api.get('/api/users/profile'),
      ]);

      const plans = plansRes.status === 'fulfilled' ? (plansRes.value.data || []) : [];
      setPricingPlans(plans);

      if (userRes.status === 'fulfilled') {
        const user = userRes.value.data;
        // Fetch user's companies to find current plan
        try {
          const companiesRes = await api.get('/api/companies/mine');
          const companies = companiesRes.data || [];
          // prefer defaultCompany, fall back to first
          const activeCompany =
            companies.find(c => c._id === user.defaultCompany) || companies[0];

          if (activeCompany) {
            setCompany(activeCompany);
            const planField = activeCompany.plan;
            if (planField) {
              const planId = typeof planField === 'object' ? planField._id : planField;
              setCurrentPlanId(planId?.toString());
              // find the price
              const matched = plans.find(p => p._id?.toString() === planId?.toString());
              setCurrentPlanPrice(matched?.price ?? 0);
            }
          }
        } catch (_) { }
      }
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    // Already on this plan — no-op
    if (currentPlanId && plan._id?.toString() === currentPlanId) return;

    setMessage(null);

    // Determine company upfront
    let targetCompany = company;
    if (!targetCompany) {
      try {
        const userRes = await api.get('/api/users/profile');
        const companiesRes = await api.get('/api/companies/mine');
        const companies = companiesRes.data || [];
        targetCompany =
          companies.find(c => c._id === userRes.data.defaultCompany) || companies[0];
        setCompany(targetCompany);
      } catch {
        setMessage({ type: 'error', text: 'No company found. Please create a company first.' });
        return;
      }
    }

    if (!targetCompany) {
      setMessage({ type: 'error', text: 'No company found. Please create a company first.' });
      return;
    }

    // Free plan → direct API call
    if (plan.price === 0) {
      try {
        setActionLoading(plan._id);
        await api.post('/api/subscriptions/subscribe', {
          companyId: targetCompany._id,
          planId: plan._id,
        });
        setCurrentPlanId(plan._id?.toString());
        setCurrentPlanPrice(0);
        setMessage({ type: 'success', text: `You are now on the ${plan.name} plan.` });
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to switch plan.' });
      } finally {
        setActionLoading(null);
      }
      return;
    }

    // Paid plan → go to payment page
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    localStorage.setItem('selectedCompanyId', targetCompany._id);
    navigate('/payment');
  };

  // ── Determine button label & style for a plan ────────────────────────────
  const getPlanButton = (plan) => {
    const isCurrentPlan = currentPlanId && plan._id?.toString() === currentPlanId;
    const isLoading = actionLoading === plan._id;

    if (isCurrentPlan) {
      return {
        label: '✓ Current Plan',
        disabled: true,
        className: 'bg-green-50 border-2 border-green-400 text-green-700 font-bold cursor-default',
      };
    }
    if (isLoading) {
      return {
        label: 'Processing...',
        disabled: true,
        className: 'bg-gray-200 text-gray-500 cursor-wait',
      };
    }

    const isPlanFree = plan.price === 0;
    const isCurrentFree = currentPlanPrice === 0;

    if (isPlanFree) {
      // Only show downgrade option if currently on a paid plan
      return {
        label: 'Downgrade to Free',
        disabled: false,
        className: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50',
      };
    }

    // Paid plan
    if (currentPlanPrice === 0 || !currentPlanId) {
      return {
        label: `Upgrade to ${plan.name}`,
        disabled: false,
        className: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
      };
    }
    if (plan.price > currentPlanPrice) {
      return {
        label: `Upgrade to ${plan.name}`,
        disabled: false,
        className: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
      };
    }
    return {
      label: `Downgrade to ${plan.name}`,
      disabled: false,
      className: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Header */}
      <section className="pt-20 pb-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Choose your plan</h1>
          {currentPlanId && (
            <p className="text-gray-500 text-lg">
              Your company is currently on the{' '}
              <span className="font-semibold text-indigo-600">
                {pricingPlans.find(p => p._id?.toString() === currentPlanId)?.name ?? 'Free'} plan
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <div className={`p-4 rounded-xl text-sm font-semibold ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      {pricingPlans.length > 0 && (
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid gap-8 ${pricingPlans.length === 1 ? 'max-w-sm mx-auto'
                : pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto'
                  : 'md:grid-cols-3'
              }`}>
              {pricingPlans.map((plan, idx) => {
                const isCurrentPlan = currentPlanId && plan._id?.toString() === currentPlanId;
                // Mark middle plan as recommended if not on any plan
                const isRecommended = !isCurrentPlan &&
                  (idx === Math.floor(pricingPlans.length / 2) || plan.name.toLowerCase().includes('plus') || plan.name.toLowerCase().includes('pro'));
                const btn = getPlanButton(plan);

                return (
                  <div
                    key={plan._id || idx}
                    className={`rounded-2xl p-8 relative flex flex-col transition-all ${isCurrentPlan
                        ? 'border-2 border-green-400 bg-gradient-to-br from-green-50 to-white shadow-xl'
                        : isRecommended
                          ? 'border-2 border-indigo-500 bg-gradient-to-br from-blue-50 to-white shadow-2xl transform scale-105 z-10'
                          : 'border border-gray-200 bg-white hover:shadow-lg'
                      }`}
                  >
                    {/* Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                          <IoCheckmarkCircle className="w-3.5 h-3.5" /> CURRENT PLAN
                        </span>
                      </div>
                    )}
                    {!isCurrentPlan && isRecommended && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                          <IoStarOutline className="w-3.5 h-3.5" /> RECOMMENDED
                        </span>
                      </div>
                    )}

                    {/* Plan name & price */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-500 text-sm">/ {plan.billingCycle || 'month'}</span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-2 min-h-[36px]">{plan.description}</p>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="space-y-2 pb-4 border-b border-gray-100 mb-4">
                      {plan.limits?.maxUsers !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <span>{plan.limits.maxUsers === -1 ? 'Unlimited' : plan.limits.maxUsers} Users</span>
                        </div>
                      )}
                      {plan.limits?.maxStorageStr && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <span>{plan.limits.maxStorageStr} Storage</span>
                        </div>
                      )}
                      {plan.limits?.maxProjects !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <span>{plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects} Projects</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 flex-grow mb-8">
                      {plan.features && Object.keys(plan.features).length > 0
                        ? Object.entries(plan.features)
                          .filter(([, v]) => v)
                          .map(([key]) => (
                            <div key={key} className="flex items-start gap-3">
                              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-sm capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))
                        : <p className="text-gray-400 text-sm italic">Core features included</p>
                      }
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={btn.disabled}
                      className={`w-full py-3 rounded-full font-semibold transition-all mt-auto text-sm ${btn.className}`}
                    >
                      {btn.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {pricingPlans.length === 0 && !loading && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-xl">No plans available right now.</p>
        </div>
      )}

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change my plan anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
              { q: 'Do you offer discounts for annual billing?', a: 'Contact our sales team for information about annual billing discounts and enterprise pricing options.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.' },
              { q: 'Is there a free trial available?', a: 'Yes, we offer a 14-day free trial for all plans. No credit card required to get started.' },
            ].map(({ q, a }) => (
              <div key={q} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
