import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoBusinessOutline,
  IoListOutline,
  IoServerOutline,
  IoRocketOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoArrowForwardOutline
} from 'react-icons/io5';
import api from '../api/axios';

export default function CompanyCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '1-10'
  });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const { data } = await api.post('/api/companies', formData);

      setStatus(`Organization "${data.name}" established successfully!`);
      setStatusType('success');
      localStorage.setItem('companyId', data._id);
      localStorage.setItem('companyRole', 'owner');

      // Get current role to determine which dashboard to redirect to
      const currentPath = window.location.pathname;
      const isFromManagerDashboard = currentPath.includes('/manager');

      setTimeout(() => {
        if (isFromManagerDashboard) {
          navigate('/dashboard/manager');
        } else {
          navigate('/select-plan');
        }
      }, 1500);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to create company. Please try again.');
      setStatusType('error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">

        {/* Left Side: Visual/Context */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <IoBusinessOutline className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Setup Your HQ</h2>
            <p className="text-blue-100 leading-relaxed font-light">
              Create a unified workspace to manage projects, tasks, and your team's success.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium opacity-80">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><IoCheckmarkCircleOutline /></div>
              <span>Centralized Management</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium opacity-80">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><IoCheckmarkCircleOutline /></div>
              <span>Team Collaboration</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium opacity-80">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><IoCheckmarkCircleOutline /></div>
              <span>Advanced Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-3 p-10 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Organization Details</h1>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Company Name</label>
                <div className="relative">
                  <IoBusinessOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold outline-none"
                    placeholder="e.g., Acme Corp"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Industry</label>
                  <div className="relative">
                    <IoListOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none appearance-none"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {status && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${statusType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {statusType === 'success' ? <IoCheckmarkCircleOutline className="w-5 h-5" /> : <IoAlertCircleOutline className="w-5 h-5" />}
                <span className="font-medium text-sm">{status}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Launch Organization</span>
                  <IoArrowForwardOutline className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
