import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBusinessOutline, IoGlobeOutline, IoDocumentTextOutline, IoPeopleOutline, IoRocketOutline, IoEyeOutline, IoAddCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import api from '../api/axios';

export default function CompanyCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [departments, setDepartments] = useState(['Tech', 'Marketing', 'HR']);
  const [newDept, setNewDept] = useState('');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCompanyId, setCreatedCompanyId] = useState('');

  // Check if user is authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const addDepartment = () => {
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  const removeDepartment = (dept) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('Creating your digital HQ...');
    setIsSuccess(false);
    try {
      const { data } = await api.post('/api/companies', { 
        name, 
        description, 
        website,
        industry,
        departments
      });
      setStatus(`✓ Company "${data.name}" created successfully! Redirecting to dashboard...`);
      setIsSuccess(true);
      setCreatedCompanyId(data._id);
      localStorage.setItem('companyId', data._id);
      localStorage.setItem('companyRole', 'owner');
      
      // Get current role to determine which dashboard to redirect to
      const currentPath = window.location.pathname;
      const isFromManagerDashboard = currentPath.includes('/manager');
      
      setTimeout(() => {
        // Redirect based on role - owner can access manager dashboard
        if (isFromManagerDashboard) {
          navigate('/dashboard/manager');
        } else {
          navigate('/dashboard/manager'); // New company owners go to manager dashboard
        }
        window.location.reload(); // Reload to update company context
      }, 2000);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to create company');
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <IoBusinessOutline className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Establish Your Digital HQ
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Define your organization's identity and create a unified workspace for your entire team
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-8 md:p-12 space-y-8">
          
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 pb-4 border-b-2 border-slate-100">
              <IoBusinessOutline className="w-7 h-7 text-blue-600" />
              Basic Information
            </h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
              <input 
                className="w-full border-2 border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-semibold" 
                placeholder="e.g., TechFlow Systems" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <IoGlobeOutline className="w-4 h-4" />
                Website (Optional)
              </label>
              <input 
                className="w-full border-2 border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="https://yourcompany.com" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
              <select 
                className="w-full border-2 border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media & Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <IoDocumentTextOutline className="w-4 h-4" />
                Company Description
              </label>
              <textarea 
                className="w-full border-2 border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" 
                placeholder="Tell the world what your company does..." 
                rows="4"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 pb-4 border-b-2 border-slate-100">
              <IoPeopleOutline className="w-7 h-7 text-emerald-600" />
              Departmental Structure
            </h2>
            <p className="text-sm text-slate-600">Define departments for automatic team categorization</p>

            <div className="flex gap-2">
              <input 
                className="grow border-2 border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="Add department (e.g., Sales, Design)" 
                value={newDept} 
                onChange={(e) => setNewDept(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
              />
              <button 
                type="button"
                onClick={addDepartment}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {departments.map((dept) => (
                <div 
                  key={dept} 
                  className="bg-blue-50 border-2 border-blue-200 px-4 py-2 rounded-xl flex items-center gap-2 group hover:bg-blue-100 transition-all"
                >
                  <span className="font-semibold text-blue-700">{dept}</span>
                  <button 
                    type="button"
                    onClick={() => removeDepartment(dept)}
                    className="text-blue-400 hover:text-red-600 transition-colors"
                  >
                    <IoCloseCircleOutline className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button 
            className="w-full py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3" 
            type="submit"
          >
            <IoRocketOutline className="w-6 h-6" />
            Launch Your Digital HQ
          </button>

          {status && (
            <div className={`mt-6 p-5 rounded-xl border-2 text-center font-semibold ${isSuccess ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
