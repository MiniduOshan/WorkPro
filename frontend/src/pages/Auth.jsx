import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoArrowBackOutline, 
  IoPersonOutline, 
  IoEyeOutline, 
  IoEyeOffOutline 
} from 'react-icons/io5';
import api from '../api/axios';

const AuthInput = ({ name, placeholder, type = 'text', icon: Icon, formData, handleChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative mb-4">
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={handleChange}
        required={name !== 'firstName' && name !== 'lastName'}
        className="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
      />
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      {type === 'password' && (
        <div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
        </div>
      )}
    </div>
  );
};

const Auth = ({ type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const endpoint = isLogin ? '/api/users/login' : '/api/users/signup';

    try {
      const { data } = await api.post(endpoint, formData);

      // 1. Save critical auth data
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('userProfile', JSON.stringify(data.user));
      }

      // 2. Redirect Super Admins
      if (data.user?.isSuperAdmin) {
        navigate('/dashboard/super-admin');
        return;
      }

      // 3. Handle Employee Redirection
      // Check for 'employee' role specifically
      if (data.user?.role === 'employee') {
        navigate('/dashboard/employee');
        return;
      }

      // 4. Handle Manager/Owner Redirection
      if (isLogin) {
        try {
          const { data: companiesData } = await api.get('/api/companies/my-companies', {
            headers: { Authorization: `Bearer ${data.token}` }
          });

          if (companiesData.companies && companiesData.companies.length > 1) {
            // Select screen for users with multiple companies
            navigate('/select-company', { 
              state: { 
                companies: companiesData.companies, 
                defaultCompany: companiesData.defaultCompany 
              } 
            });
          } else if (companiesData.companies && companiesData.companies.length === 1) {
            // Auto-select the only company and go to manager dashboard
            localStorage.setItem('companyId', companiesData.companies[0]._id);
            navigate('/dashboard/manager');
          } else {
            // Manager logged in but has no company yet
            navigate('/dashboard/manager?first-time=true');
          }
        } catch (err) {
          console.error('Company fetch failed, defaulting to manager dashboard:', err);
          navigate('/dashboard/manager');
        }
      } else {
        // 5. New Manager Signup
        // Redirect to manager dashboard with the 'create company' modal trigger
        navigate('/dashboard/manager?first-time=true');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Authentication failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md">
          <Link to="/" className="absolute top-4 left-4 p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
            <IoArrowBackOutline className="w-6 h-6" />
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h1>
            <p className="text-gray-500">
              {isLogin ? 'Sign in to access your dashboard.' : 'Enter your details to get started.'}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-pulse" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {!isLogin && (
              <div className="flex space-x-4">
                <AuthInput 
                  name="firstName" 
                  placeholder="First" 
                  icon={IoPersonOutline} 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                <AuthInput 
                  name="lastName" 
                  placeholder="Last" 
                  icon={IoPersonOutline} 
                  formData={formData} 
                  handleChange={handleChange} 
                />
              </div>
            )}

            <AuthInput 
              name="email" 
              placeholder="Email Address" 
              type="email" 
              icon={IoMailOutline} 
              formData={formData} 
              handleChange={handleChange} 
            />

            <AuthInput 
              name="password" 
              placeholder="Password" 
              type="password" 
              icon={IoLockClosedOutline} 
              formData={formData} 
              handleChange={handleChange} 
            />

            {!isLogin && (
              <AuthInput 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                type="password" 
                icon={IoLockClosedOutline} 
                formData={formData} 
                handleChange={handleChange} 
              />
            )}

            <button 
              type="submit" 
              className="w-full py-3 mt-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-none transition-all active:scale-[0.98]"
            >
              {isLogin ? 'Login Now' : 'Signup Now'}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink mx-4 text-gray-400 text-sm font-medium">OR</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <Link 
            to={isLogin ? '/signup' : '/login'} 
            className="w-full block text-center py-3 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all"
          >
            {isLogin ? 'Create Account' : 'Login to Existing Account'}
          </Link>
        </div>
      </div>

      {/* Right Section: Visual */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="text-white text-center max-w-sm">
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-lg mb-6 inline-block">
            <IoLockClosedOutline className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Enterprise-Grade Security</h2>
          <p className="text-blue-100 leading-relaxed">
            Your data is protected with end-to-end encryption and industry-standard security protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;