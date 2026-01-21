import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  IoBusinessOutline, 
  IoPersonOutline, 
  IoLocationOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline
} from 'react-icons/io5';

export default function InviteJoin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const { data } = await api.get('/api/companies/invitations/details', { params: { token } });
      setInvitation(data);
      if (data.department) setSelectedDepartment(data.department);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invitation');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    const userToken = localStorage.getItem('token');
    if (!userToken) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate('/signup'); // Direct to signup page for new users joining via invitation
      return;
    }

    if (!selectedDepartment && invitation?.company?.departments?.length > 0) {
      setError('Please select a department');
      return;
    }

    setJoining(true);
    setError('');
    try {
      const { data } = await api.post('/api/companies/invitations/accept', { 
        token, 
        department: selectedDepartment 
      });
      
      localStorage.setItem('companyId', data.companyId);
      localStorage.setItem('companyRole', data.role);
      setSuccess(true);
      
      setTimeout(() => {
        // Navigate based on role
        if (data.role === 'employee') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard/manager');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <IoAlertCircleOutline className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <IoCheckmarkCircleOutline className="text-6xl text-green-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Aboard!</h2>
          <p className="text-gray-600 mb-4">You've successfully joined {invitation?.company?.name}</p>
          <div className="text-sm text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">You're Invited! 🎉</h1>
          <p className="text-gray-600">Join your team on WorkPro</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Company Header with Gradient */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <IoBusinessOutline className="text-4xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{invitation?.company?.name}</h2>
                {invitation?.company?.description && (
                  <p className="text-indigo-100">{invitation?.company?.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Role */}
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <IoBriefcaseOutline className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Your Role</div>
                  <div className="text-lg font-semibold text-gray-800 capitalize">
                    {invitation?.role}
                  </div>
                </div>
              </div>

              {/* Industry */}
              {invitation?.company?.industry && (
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <IoLocationOutline className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Industry</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {invitation?.company?.industry}
                    </div>
                  </div>
                </div>
              )}

              {/* Invited By */}
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <IoPersonOutline className="text-2xl text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Invited By</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {invitation?.inviter?.firstName} {invitation?.inviter?.lastName}
                  </div>
                </div>
              </div>

              {/* Expires */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <IoTimeOutline className="text-2xl text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Expires</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {new Date(invitation?.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Department Selection */}
            {invitation?.company?.departments?.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Your Department
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {invitation.company.departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        selectedDepartment === dept
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <IoAlertCircleOutline className="text-2xl text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAccept}
                disabled={joining}
                className="flex-1 px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="text-2xl" />
                    Accept & Join Team
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                disabled={joining}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline
              </button>
            </div>

            {/* Login Prompt */}
            {!localStorage.getItem('token') && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Note:</strong> You'll be redirected to signup/login before joining
                </p>
                <p className="text-xs text-blue-700">
                  This invitation was sent to: <strong>{invitation?.email}</strong>
                  <br />
                  Please signup or login with this email address.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This invitation link is unique and can only be used once</p>
        </div>
      </div>
    </div>
  );
}
