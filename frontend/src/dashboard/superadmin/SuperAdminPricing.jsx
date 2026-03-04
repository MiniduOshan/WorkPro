import React, { useState, useEffect } from 'react';
import {
  IoWalletOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoClose,
  IoPencil,
  IoBusinessOutline,
  IoSwapHorizontalOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminPricing = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'companies'
  const [pricingPlans, setPricingPlans] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [assigningCompanyId, setAssigningCompanyId] = useState(null);
  const [assignMessage, setAssignMessage] = useState(null);

  const initialPlanState = {
    name: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    description: '',
    isPublic: true,
    isDefault: false,
    features: {
      support: false,
      emailNotifications: true,
      fileUpload: true,
      aiInsights: false,
    },
    limits: {
      maxUsers: 5,
      maxStorageStr: '200MB',
      maxStorageBytes: 209715200,
      maxProjectGroups: 3,
      maxDepartments: 2,
      maxChannels: 5,
      maxAnnouncements: 10,
      maxTasks: 50,
    },
    paypalPlanId: '',
  };

  const [newPlan, setNewPlan] = useState(initialPlanState);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'companies') fetchCompanies();
  }, [activeTab]);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pricing-plans');
      setPricingPlans(response.data);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const response = await api.get('/api/companies/all'); // superadmin endpoint
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleAdminAssignPlan = async (companyId, planId) => {
    if (!planId) return;
    try {
      setAssigningCompanyId(companyId);
      setAssignMessage(null);
      await api.post('/api/subscriptions/admin-assign', { companyId, planId });
      setAssignMessage({ type: 'success', text: 'Plan assigned successfully!' });
      fetchCompanies(); // refresh
    } catch (err) {
      setAssignMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign plan.' });
    } finally {
      setAssigningCompanyId(null);
    }
  };

  const calculateBytes = (str) => {
    const match = str.match(/^(\d+)(GB|MB|KB)$/i);
    if (!match) return 0;
    const val = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'GB') return val * 1024 * 1024 * 1024;
    if (unit === 'MB') return val * 1024 * 1024;
    if (unit === 'KB') return val * 1024;
    return 0;
  };

  const handleStorageChange = (val) => {
    const bytes = calculateBytes(val);
    setNewPlan({ ...newPlan, limits: { ...newPlan.limits, maxStorageStr: val, maxStorageBytes: bytes } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlanId) {
        await api.put(`/api/pricing-plans/${editingPlanId}`, newPlan);
      } else {
        await api.post('/api/pricing-plans', newPlan);
      }
      fetchPricingPlans();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save pricing plan:', err);
      alert('Failed to save pricing plan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan._id);
    setNewPlan({ ...plan });
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setNewPlan(initialPlanState);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlanId(null);
    setNewPlan(initialPlanState);
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing plan? Companies on this plan might be affected.')) {
      try {
        await api.delete(`/api/pricing-plans/${id}`);
        fetchPricingPlans();
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
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage subscription tiers, limits, features and assign plans to companies.</p>
        </div>
        {activeTab === 'plans' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <IoAddOutline className="w-5 h-5" />
            Add Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'plans'
            ? 'border-purple-600 text-purple-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <IoWalletOutline className="w-4 h-4" />
          Plans
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'companies'
            ? 'border-purple-600 text-purple-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <IoBusinessOutline className="w-4 h-4" />
          Manage Company Plans
        </button>
      </div>

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 relative ${plan.isDefault ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200'}`}
            >
              {plan.isDefault && (
                <span className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">
                  Default
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-purple-600">${plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.billingCycle}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">{plan.description || 'No description'}</p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-gray-900">Limits</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Users: <b>{plan.limits.maxUsers === -1 ? 'Unlimited' : plan.limits.maxUsers}</b></div>
                  <div>Storage: <b>{plan.limits.maxStorageStr}</b></div>
                  <div>Project Groups: <b>{plan.limits.maxProjectGroups === -1 ? 'Unlimited' : (plan.limits.maxProjectGroups || plan.limits.maxProjects)}</b></div>
                  <div>Depts: <b>{plan.limits.maxDepartments === -1 ? 'Unlimited' : plan.limits.maxDepartments}</b></div>
                  <div>Channels: <b>{plan.limits.maxChannels === -1 ? 'Unlimited' : plan.limits.maxChannels}</b></div>
                  <div>Announce: <b>{plan.limits.maxAnnouncements === -1 ? 'Unlimited' : plan.limits.maxAnnouncements}</b></div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900">Features</h4>
                <ul className="text-sm space-y-1">
                  {Object.entries(plan.features).filter(([key]) => key !== 'analytics').map(([key, enabled]) => (
                    <li key={key} className={`flex items-center gap-2 ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      {enabled ? <IoCheckmarkCircle className="text-green-500" /> : <IoClose className="text-red-300" />}
                      <span className="capitalize">
                        {key === 'support' ? 'Customer Support 24/7' : key === 'aiInsights' ? 'Analytics' : key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.paypalPlanId && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                  PayPal ID: <code className="font-mono">{plan.paypalPlanId}</code>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <IoPencil /> Edit
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                >
                  <IoTrashOutline /> Delete
                </button>
              </div>
            </div>
          ))}

          {pricingPlans.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
              <IoWalletOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pricing plans configured.</p>
            </div>
          )}
        </div>
      )}

      {/* ── COMPANIES TAB ── */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          {assignMessage && (
            <div className={`p-4 rounded-xl text-sm font-semibold ${assignMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {assignMessage.text}
            </div>
          )}

          {companiesLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <IoBusinessOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No companies found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Company</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Current Plan</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Assign Plan</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((company) => (
                    <CompanyRow
                      key={company._id}
                      company={company}
                      plans={pricingPlans}
                      assigning={assigningCompanyId === company._id}
                      onAssign={handleAdminAssignPlan}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PLAN CREATE/EDIT MODAL (Slide-over) ── */}
      <div className={`fixed inset-0 z-50 overflow-hidden ${showModal ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleCloseModal}
        />
        <div className={`absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${showModal ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlanId ? 'Edit Pricing Plan' : 'Create New Plan'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure subscription details, limits, and features.</p>
            </div>
            <button onClick={handleCloseModal} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="pricing-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Professional"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                        className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PayPal Plan ID</label>
                  <input
                    type="text"
                    placeholder="e.g. P-1234567890"
                    value={newPlan.paypalPlanId}
                    onChange={(e) => setNewPlan({ ...newPlan, paypalPlanId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID from PayPal Developer Dashboard for this plan.</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Usage Limits */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Usage Limits
                </h3>
                <p className="text-xs text-gray-500 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg inline-block">
                  Set a value of <b>-1</b> for unlimited access.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {[
                    { label: 'Max Users', key: 'maxUsers' },
                    { label: 'Max Project Groups', key: 'maxProjectGroups' },
                    { label: 'Max Tasks', key: 'maxTasks' },
                    { label: 'Max Departments', key: 'maxDepartments' },
                    { label: 'Max Channels', key: 'maxChannels' },
                    { label: 'Max Announcements', key: 'maxAnnouncements' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">{field.label}</label>
                      <input
                        type="number"
                        value={newPlan.limits[field.key]}
                        onChange={(e) => setNewPlan({ ...newPlan, limits: { ...newPlan.limits, [field.key]: Number(e.target.value) } })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Storage Limit</label>
                    <input
                      type="text"
                      value={newPlan.limits.maxStorageStr}
                      onChange={(e) => handleStorageChange(e.target.value)}
                      placeholder="e.g. 5GB"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Feature Access
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(newPlan.features).filter((f) => f !== 'analytics').map((feature) => (
                    <label key={feature} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${newPlan.features[feature] ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${newPlan.features[feature] ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        {newPlan.features[feature] && <IoCheckmarkCircle className="w-4 h-4" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={newPlan.features[feature]}
                        onChange={(e) => setNewPlan({ ...newPlan, features: { ...newPlan.features, [feature]: e.target.checked } })}
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize select-none">
                        {feature === 'support' ? 'Customer Support 24/7' : feature === 'aiInsights' ? 'Analytics' : feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Visibility */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Visibility & Defaults
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${newPlan.isPublic ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={newPlan.isPublic}
                      onChange={(e) => setNewPlan({ ...newPlan, isPublic: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="block text-sm font-bold text-gray-900">Publicly Listed</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Visible on the pricing page for all users.</span>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${newPlan.isDefault ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={newPlan.isDefault}
                      onChange={(e) => setNewPlan({ ...newPlan, isDefault: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="block text-sm font-bold text-gray-900">Default Plan</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Auto-assigned to new companies.</span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5"
            >
              {editingPlanId ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CompanyRow sub-component for the manage tab
const CompanyRow = ({ company, plans, assigning, onAssign }) => {
  const [selectedPlan, setSelectedPlan] = useState('');

  const currentPlanName = company.plan?.name || company.planName || 'Unknown';
  const statusColor =
    company.subscriptionStatus === 'active' ? 'text-green-600 bg-green-50' :
      company.subscriptionStatus === 'free' ? 'text-blue-600 bg-blue-50' :
        'text-gray-600 bg-gray-100';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-900">{company.name}</div>
        <div className="text-xs text-gray-500">{company.members?.length ?? 0} member(s)</div>
      </td>
      <td className="px-6 py-4">
        <span className="font-medium text-gray-700">{currentPlanName}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusColor}`}>
          {company.subscriptionStatus || 'unknown'}
        </span>
      </td>
      <td className="px-6 py-4">
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
        >
          <option value="">Select a plan...</option>
          {plans.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} (${p.price})
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onAssign(company._id, selectedPlan)}
          disabled={!selectedPlan || assigning}
          className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <IoSwapHorizontalOutline className="w-4 h-4" />
          {assigning ? 'Assigning...' : 'Assign'}
        </button>
      </td>
    </tr>
  );
};

export default SuperAdminPricing;
