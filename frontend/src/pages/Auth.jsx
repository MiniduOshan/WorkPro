import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoArrowBackOutline, 
  IoPersonOutline, 
  IoEyeOutline, 
  IoEyeOffOutline,
  IoLogoGoogle,
  IoCloseOutline
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    try {
      await api.post('/api/users/forgot-password', { email: forgotEmail });
      setForgotPasswordMessage('Password reset link sent to your email!');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setForgotPasswordMessage('');
      }, 3000);
    } catch (err) {
      setForgotPasswordMessage(err.response?.data?.message || 'Failed to send reset link');
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${api.defaults.baseURL || 'http://localhost:5000'}/api/users/auth/google`;
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
        localStorage.setItem('userId', data.user._id);
      }

      console.log('Login response:', data);
      console.log('User data:', data.user);
      console.log('User email:', data.user?.email);
      console.log('Is SuperAdmin from data.user?', data.user?.isSuperAdmin);
      console.log('Is SuperAdmin from data?', data.isSuperAdmin);

      // 2. Check if user is SuperAdmin - ONLY admin.workpro@gmail.com
      const userEmail = data.user?.email?.toLowerCase() || '';
      const isSuperAdmin = userEmail === 'admin.workpro@gmail.com';
      
      console.log('Computed isSuperAdmin:', isSuperAdmin);
      
      if (isSuperAdmin) {
        console.log('SuperAdmin detected, navigating to admin dashboard');
        // Still fetch company data for SuperAdmins in case they need it
        try {
          const { data: companiesData } = await api.get('/api/companies/my-companies', {
            headers: { Authorization: `Bearer ${data.token}` }
          });
          
          // Store company info but navigate to SuperAdmin dashboard
          if (companiesData.companies && companiesData.companies.length > 0) {
            const defaultCompany = companiesData.defaultCompany || companiesData.companies[0];
            localStorage.setItem('companyId', defaultCompany._id);
            localStorage.setItem('companyRole', defaultCompany.role);
          }
        } catch (err) {
          console.log('SuperAdmin has no companies, proceeding to admin dashboard');
        }
        navigate('/dashboard/super-admin');
        return;
      }

      // 3. Check for pending invitation redirect
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectAfterLogin);
        return;
      }

      // 4. Handle Company-based Redirection for regular users
      if (isLogin) {
        try {
          const { data: companiesData } = await api.get('/api/companies/my-companies', {
            headers: { Authorization: `Bearer ${data.token}` }
          });

          if (companiesData.companies && companiesData.companies.length > 1) {
            // Multiple companies - let user select
            navigate('/select-company', { 
              state: { 
                companies: companiesData.companies, 
                defaultCompany: companiesData.defaultCompany 
              } 
            });
          } else if (companiesData.companies && companiesData.companies.length === 1) {
            // Single company - auto-select and route based on role
            const company = companiesData.companies[0];
            localStorage.setItem('companyId', company._id);
            localStorage.setItem('companyRole', company.role);
            
            // Route based on role
            if (company.role === 'employee') {
              navigate('/dashboard');
            } else {
              navigate('/dashboard/manager');
            }
          } else {
            // No companies yet - go directly to company creation page
            navigate('/company/create');
          }
        } catch (err) {
          console.error('Company fetch failed:', err);
          // On error, assume no companies and go to create
          navigate('/company/create');
        }
      } else {
        // 5. New User Signup - go directly to company creation
        navigate('/company/create');
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

            {isLogin && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

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

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 mb-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            <IoLogoGoogle className="w-6 h-6 text-red-500" />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail('');
                setForgotPasswordMessage('');
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoCloseOutline className="w-6 h-6 text-gray-500" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {forgotPasswordMessage && (
              <div className={`p-4 mb-4 text-sm rounded-lg ${
                forgotPasswordMessage.includes('sent') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                />
                <IoMailOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-none transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;