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
import api from '../api/axios'; // Axios instance

// AuthInput with Show/Hide password toggle
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
        className="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
      />
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      {type === 'password' && (
        <div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
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

    // Backend routes expect /api/users/...
    const endpoint = isLogin ? '/api/users/login' : '/api/users/signup';

    try {
      const { data } = await api.post(endpoint, formData);

      localStorage.setItem('token', data.token); // Save token
      
      // Store user profile if available
      if (data.user) {
        localStorage.setItem('userProfile', JSON.stringify(data.user));
      }

      // Check if user is super admin and redirect accordingly
      if (data.user?.isSuperAdmin) {
        navigate('/dashboard/super-admin');
        return;
      }

      // Check if user has multiple companies
      if (isLogin) {
        try {
          const { data: companiesData } = await api.get('/api/companies/my-companies', {
            headers: { Authorization: `Bearer ${data.token}` }
          });

          if (companiesData.companies && companiesData.companies.length > 1) {
            // User has multiple companies - show company selection
            navigate('/select-company', { state: { companies: companiesData.companies, defaultCompany: companiesData.defaultCompany } });
          } else if (companiesData.companies && companiesData.companies.length === 1) {
            // User has one company - set it and navigate
            localStorage.setItem('companyId', companiesData.companies[0]._id);
            navigate('/dashboard');
          } else {
            // No companies - show company creation flow
            navigate('/dashboard?create-company=true');
          }
        } catch (err) {
          console.error('Failed to fetch companies:', err);
          navigate('/dashboard');
        }
      } else {
        // New signup - go directly to manager dashboard
        navigate('/dashboard/manager?first-time=true');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error request:', err.request);
      const errorMessage = err.response?.data?.message || err.message || 'Network Error';
      setError(`Authentication failed: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md">
          <Link to="/" className="absolute top-4 left-4 p-2 rounded-full text-blue-600 hover:bg-gray-100">
            <IoArrowBackOutline className="w-6 h-6" />
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mt-10 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create an Account'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isLogin ? 'Sign in to access your dashboard.' : 'Enter your details to get started.'}
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="flex space-x-4">
                <AuthInput 
                  name="firstName" 
                  placeholder="First Name" 
                  icon={IoPersonOutline} 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                <AuthInput 
                  name="lastName" 
                  placeholder="Last Name" 
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
              placeholder="Enter your password" 
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

            {/* Forgot Password in here */}

            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              {isLogin ? 'Login Now' : 'Signup Now'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="grow border-t border-gray-300"></div>
            <span className="shrink mx-4 text-gray-500">OR</span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          <Link 
            to={isLogin ? '/signup' : '/login'} 
            className="w-full block text-center py-3 border border-blue-600 text-blue-600 text-lg font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            {isLogin ? 'Create Account' : 'Login to Existing Account'}
          </Link>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-8">
        <div className="text-blue-600 text-center">
          <IoLockClosedOutline className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Secure Authentication</h2>
          <p className="text-gray-600">Your privacy and data security are our priority.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
