import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  IoBriefcaseOutline, 
  IoLinkOutline, 
  IoCopyOutline,
  IoCheckmarkCircleOutline,
  IoPeopleOutline,
  IoSendOutline,
  IoBusinessOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

export default function Invite() {
  const [companyId, setCompanyId] = useState('');
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState('employee');
  const [link, setLink] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      fetchCompany(storedCompanyId);
    }
  }, []);

  const fetchCompany = async (id) => {
    try {
      const { data } = await api.get(`/api/companies/${id}`);
      setCompany(data);
    } catch (err) {
      console.error('Failed to fetch company:', err);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    setMsg('');
    setLink('');
    setLoading(true);
    try {
      const { data } = await api.post(`/api/companies/${companyId}/invitations`, { 
        role
      });
      setLink(data.link);
      setMsg('Invitation created successfully! 🎉');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!link) return;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
        copyToClipboardFallback(link);
      }
    } catch (err) {
      console.error('Clipboard API failed:', err);
      // Use fallback method
      copyToClipboardFallback(link);
    }
  };

  const copyToClipboardFallback = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setMsg('Failed to copy link. Please copy manually.');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      setMsg('Failed to copy link. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <IoPeopleOutline className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Invite Team Members</h1>
              <p className="text-gray-600">Grow your team on WorkPro</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invite Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {company && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <IoBusinessOutline className="text-2xl text-indigo-600" />
                    <div>
                      <div className="text-sm text-indigo-600 font-medium">Inviting to</div>
                      <div className="text-lg font-semibold text-gray-800">{company.name}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={send} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <IoBriefcaseOutline className="inline mr-2 text-xl" />
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('employee')}
                      className={`px-6 py-4 rounded-xl border-2 transition-all font-medium text-left ${
                        role === 'employee'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                      }`}
                    >
                      <div className="font-semibold">Employee</div>
                      <div className="text-xs mt-1 opacity-75">Standard team member</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('manager')}
                      className={`px-6 py-4 rounded-xl border-2 transition-all font-medium text-left ${
                        role === 'manager'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                      }`}
                    >
                      <div className="font-semibold">Manager</div>
                      <div className="text-xs mt-1 opacity-75">Can manage team & tasks</div>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Creating Invite Link...
                    </>
                  ) : (
                    <>
                      <IoSendOutline className="text-xl" />
                      Generate Invite Link
                    </>
                  )}
                </button>
              </form>

              {/* Success/Error Message */}
              {msg && (
                <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
                  msg.includes('success') || msg.includes('🎉')
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {msg.includes('success') || msg.includes('🎉') ? (
                    <IoCheckmarkCircleOutline className="text-2xl text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <IoAlertCircleOutline className="text-2xl text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={msg.includes('success') || msg.includes('🎉') ? 'text-green-700' : 'text-red-700'}>
                    {msg}
                  </p>
                </div>
              )}

              {/* Generated Link */}
              {link && (
                <div className="mt-6 p-6 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <IoLinkOutline className="text-2xl text-indigo-600" />
                    <h3 className="font-semibold text-gray-800">Invitation Link Ready!</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-4">
                    <code className="text-sm text-indigo-600 break-all">{link}</code>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <IoCheckmarkCircleOutline className="text-xl" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <IoCopyOutline className="text-xl" />
                          Copy Link
                        </>
                      )}
                    </button>
                    <a
                      href={`mailto:?subject=Join our team on WorkPro&body=You've been invited to join our team! Click here: ${link}`}
                      className="flex-1 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <IoLinkOutline className="text-xl" />
                      Email Link
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Info */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Create Invite</div>
                    <div className="text-sm text-gray-600">Pick a role and generate a link</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Share Link</div>
                    <div className="text-sm text-gray-600">Copy and send via email or chat</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Auto-Sync</div>
                    <div className="text-sm text-gray-600">They join instantly with one click</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {company && (
              <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-semibold mb-4">Team Overview</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-indigo-100 text-sm">Total Members</div>
                    <div className="text-3xl font-bold">{company.members?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-indigo-100 text-sm">Departments</div>
                    <div className="text-2xl font-bold">{company.departments?.length || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-semibold text-amber-900 mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Links expire after 7 days</li>
                <li>• Manager accounts can only accept manager invites</li>
                <li>• Managers can invite other members</li>
                <li>• Employee accounts can only accept employee invites</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

