import React, { useState, useEffect } from 'react';
import {
  IoWalletOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoClose,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminPricing = () => {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    features: [],
  });
  const [featureInput, setFeatureInput] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/pricing-plans');
      setPricingPlans(response.data);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewPlan({
        ...newPlan,
        features: [...newPlan.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setNewPlan({
      ...newPlan,
      features: newPlan.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        '/api/super-admin/pricing-plans',
        { plans: [...pricingPlans, newPlan] }
      );

      setPricingPlans([...pricingPlans, newPlan]);
      setNewPlan({ name: '', price: '', features: [] });
      setShowModal(false);
    } catch (err) {
      console.error('Failed to add pricing plan:', err);
      alert('Failed to add pricing plan');
    }
  };

  const handleDeletePlan = async (index) => {
    if (window.confirm('Are you sure you want to delete this pricing plan?')) {
      try {
        const updatedPlans = pricingPlans.filter((_, i) => i !== index);
        await api.put(
          '/api/super-admin/pricing-plans',
          { plans: updatedPlans }
        );
        setPricingPlans(updatedPlans);
      } catch (err) {
        console.error('Failed to delete pricing plan:', err);
        alert('Failed to delete pricing plan');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
          <p className="text-gray-600 mt-2">Manage subscription tiers and features</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <IoAddOutline className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-purple-500 transition-all p-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-purple-600">${plan.price}</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>
              <button
                onClick={() => handleDeletePlan(index)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <IoTrashOutline className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Features:</h4>
              {plan.features && plan.features.length > 0 ? (
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm italic">No features listed</p>
              )}
            </div>
          </div>
        ))}

        {pricingPlans.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
            <IoWalletOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pricing plans configured yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Create your first plan
            </button>
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Pricing Plan</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Pro, Enterprise, Starter"
                  style={{ caretColor: '#9333ea' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($/month) *
                </label>
                <input
                  type="number"
                  required
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="99"
                  style={{ caretColor: '#9333ea' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add a feature..."
                    style={{ caretColor: '#9333ea' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <IoAddOutline className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {newPlan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Add Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPricing;
