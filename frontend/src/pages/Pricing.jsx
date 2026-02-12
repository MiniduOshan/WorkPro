import React, { useState, useEffect } from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import api from '../api/axios';

const Pricing = () => {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/public/pricing-plans');
      setPricingPlans(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
      setPricingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const PricingCard = ({ plan, isRecommended, isCurrentPlan }) => (
    <div className={`rounded-2xl p-8 transition-all relative ${
      isRecommended 
        ? 'border-2 border-indigo-500 bg-gradient-to-br from-blue-50 to-white shadow-2xl transform scale-105' 
        : 'border border-gray-200 bg-white hover:shadow-lg'
    }`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            RECOMMENDED
          </span>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-600 text-sm">USD / month</span>
        </div>
        {plan.expiryDate && (
          <p className="text-sm text-gray-500 mt-2">until {plan.expiryDate}</p>
        )}
      </div>

      <p className="text-gray-700 font-medium mb-6">{plan.description}</p>

      <button className={`w-full py-3 rounded-full font-semibold mb-8 transition-all ${
        isCurrentPlan
          ? 'bg-gray-100 text-gray-700 cursor-default'
          : isRecommended
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'border border-gray-300 text-gray-900 hover:border-gray-400'
      }`}>
        {isCurrentPlan ? 'Your current plan' : `${plan.ctaText || 'Switch to ' + plan.name}`}
      </button>

      <div className="space-y-4">
        {plan.features && plan.features.length > 0 ? (
          plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No features specified</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Header Section */}
      <section className="pt-20 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Upgrade your plan
          </h1>
        </div>
      </section>

      {/* Pricing Cards Section */}
      {pricingPlans.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => {
                // Highlight middle plan (Plus) as recommended
                const isRecommended = idx === 1 || plan.name.toLowerCase().includes('plus');
                const isCurrentPlan = false;
                return (
                  <PricingCard 
                    key={idx} 
                    plan={plan} 
                    isRecommended={isRecommended}
                    isCurrentPlan={isCurrentPlan}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer discounts for annual billing?</h3>
              <p className="text-gray-600">
                Contact our sales team for information about annual billing discounts and enterprise pricing options.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for all plans. No credit card required to get started.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
