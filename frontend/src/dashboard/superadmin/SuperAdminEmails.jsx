import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { IoMailOutline, IoSendOutline, IoPersonOutline, IoSearchOutline, IoCheckmarkCircleOutline, IoCopyOutline, IoDocumentTextOutline } from 'react-icons/io5';


const EMAIL_TEMPLATES = [
    {
        name: 'Welcome Email',
        icon: '👋',
        tag: 'Onboarding',
        tagColor: 'bg-blue-100 text-blue-700',
        description: 'Send to new users after they sign up.',
        subject: 'Welcome to WorkPro! 🎉',
        body: `Hi there,

Welcome to WorkPro! We're excited to have you on board.

Here are a few things to get you started:
• Set up your profile and invite your team
• Create your first project group
• Explore task management and channels

If you have any questions, feel free to reply to this email or reach out to our support team.

Best regards,
The WorkPro Team`,
    },
    {
        name: 'Scheduled Maintenance',
        icon: '🔧',
        tag: 'System',
        tagColor: 'bg-orange-100 text-orange-700',
        description: 'Notify users about upcoming planned maintenance.',
        subject: 'Scheduled Maintenance Notice — WorkPro',
        body: `Hi Team,

We wanted to let you know that WorkPro will undergo scheduled maintenance on [DATE] from [START TIME] to [END TIME] (IST).

During this period, the platform may be temporarily unavailable. We expect minimal downtime and will have everything back to normal as quickly as possible.

What you need to do:
• Save any work in progress before the maintenance window
• No action required — all your data is safe

We apologize for any inconvenience and appreciate your patience.

Best regards,
The WorkPro Team`,
    },
    {
        name: 'New Feature Update',
        icon: '🚀',
        tag: 'Product',
        tagColor: 'bg-purple-100 text-purple-700',
        description: 'Announce new features or product updates.',
        subject: "What's New in WorkPro — [Month] Update",
        body: `Hi there,

We've been busy building new features to make your WorkPro experience even better! Here's what's new:

✨ [Feature 1 Name]
[Brief description of the feature and how it helps]

✨ [Feature 2 Name]
[Brief description of the feature and how it helps]

✨ [Feature 3 Name]
[Brief description of the feature and how it helps]

Log in to your dashboard to try them out. We'd love to hear your feedback!

Best regards,
The WorkPro Team`,
    },
    {
        name: 'Payment Reminder',
        icon: '💳',
        tag: 'Billing',
        tagColor: 'bg-green-100 text-green-700',
        description: 'Remind users about upcoming or overdue payments.',
        subject: 'Payment Reminder — WorkPro Subscription',
        body: `Hi there,

This is a friendly reminder that your WorkPro subscription payment of $[AMOUNT] is due on [DATE].

To ensure uninterrupted access to all features, please update your payment method or complete the payment at your earliest convenience.

You can manage your billing here:
→ Dashboard → Billing → Payment Method

If you've already made the payment, please disregard this message.

Best regards,
The WorkPro Team`,
    },
    {
        name: 'Security Alert',
        icon: '🔒',
        tag: 'Security',
        tagColor: 'bg-red-100 text-red-700',
        description: 'Notify users about security-related updates.',
        subject: 'Important Security Update — WorkPro',
        body: `Hi there,

We're writing to inform you about an important security update to your WorkPro account.

[Describe the security update or action taken]

What we recommend:
• Change your password if you haven't recently
• Enable two-factor authentication
• Review your recent account activity

Your security is our top priority. If you notice any suspicious activity, please contact us immediately.

Best regards,
The WorkPro Security Team`,
    },
];

const SuperAdminEmails = () => {
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [notification, setNotification] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [availablePlans, setAvailablePlans] = useState([]);
    const [copiedEmail, setCopiedEmail] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedEmail(id);
            setTimeout(() => setCopiedEmail(null), 1500);
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopiedEmail(id);
            setTimeout(() => setCopiedEmail(null), 1500);
        });
    };

    const copyAllEmails = () => {
        const emails = filteredRecipients.map(u => u.email).join(', ');
        navigator.clipboard.writeText(emails).then(() => {
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = emails;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        });
    };

    useEffect(() => {
        fetchRecipients();
    }, []);

    const fetchRecipients = async () => {
        try {
            const { data } = await api.get('/api/super-admin/emails/recipients');
            setRecipients(data);

            // Extract unique plans
            const plans = new Set();
            data.forEach(user => {
                user.plans?.forEach(plan => plans.add(plan));
            });
            setAvailablePlans(Array.from(plans).sort());

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch recipients', err);
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(filteredRecipients.map(u => u._id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (selectedUsers.length === 0) return alert('Please select at least one recipient.');
        if (!subject.trim() || !message.trim()) return alert('Please fill in subject and message.');

        setSending(true);
        try {
            await api.post('/api/super-admin/emails/send', {
                userIds: selectedUsers,
                subject,
                message,
                isHtml: true // Sending as HTML by default for better formatting if needed
            });

            setNotification({ type: 'success', message: `Email sent successfully to ${selectedUsers.length} users!` });
            setSubject('');
            setMessage('');
            setSelectedUsers([]);

            // Clear notification after 3s
            setTimeout(() => setNotification(null), 5000);
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to send emails.' });
        } finally {
            setSending(false);
        }
    };

    const filteredRecipients = recipients.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' ||
            (filterRole === 'super_admin' && user.role === 'Super Admin') ||
            (filterRole === 'user' && user.role === 'User');

        const matchesPlan = filterPlan === 'all' ||
            (user.plans && user.plans.includes(filterPlan));

        return matchesSearch && matchesRole && matchesPlan;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <IoMailOutline className="text-purple-600" />
                        Email Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Send announcements and updates to platform users.</p>
                </div>
            </div>

            {notification && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <IoCheckmarkCircleOutline className="text-xl" />
                    {notification.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Helper / Composer Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Compose Email</h2>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="Important Update: ..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={10}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-sans"
                                    placeholder="Write your message here... HTML is supported."
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{message.length} characters</p>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    {selectedUsers.length} recipients selected
                                </span>
                                <button
                                    type="submit"
                                    disabled={sending || selectedUsers.length === 0}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all
                    ${sending || selectedUsers.length === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
                                >
                                    {sending ? 'Sending...' : (
                                        <>
                                            <IoSendOutline /> Send Email
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Email Templates */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <IoDocumentTextOutline className="text-purple-600 text-lg" />
                                <h2 className="text-lg font-bold text-gray-800">Email Templates</h2>
                            </div>
                            <span className="text-xs text-gray-400">{EMAIL_TEMPLATES.length} templates</span>
                        </div>
                        <div className="space-y-3">
                            {EMAIL_TEMPLATES.map((tpl, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{tpl.icon}</span>
                                                <h3 className="text-sm font-bold text-gray-800">{tpl.name}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tpl.tagColor}`}>{tpl.tag}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{tpl.description}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 mt-2 mb-3 max-h-28 overflow-y-auto">
                                        <p className="text-xs text-gray-600 font-medium mb-1">Subject: <span className="text-gray-800">{tpl.subject}</span></p>
                                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{tpl.body}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setSubject(tpl.subject); setMessage(tpl.body); }}
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                                        >
                                            <IoSendOutline className="w-3.5 h-3.5" />
                                            Use Template
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const text = `Subject: ${tpl.subject}\n\n${tpl.body}`;
                                                navigator.clipboard.writeText(text).then(() => {
                                                    setCopiedEmail(`tpl-${idx}`);
                                                    setTimeout(() => setCopiedEmail(null), 1500);
                                                }).catch(() => {
                                                    const ta = document.createElement('textarea');
                                                    ta.value = text;
                                                    document.body.appendChild(ta);
                                                    ta.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(ta);
                                                    setCopiedEmail(`tpl-${idx}`);
                                                    setTimeout(() => setCopiedEmail(null), 1500);
                                                });
                                            }}
                                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${copiedEmail === `tpl-${idx}`
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <IoCopyOutline className="w-3.5 h-3.5" />
                                            {copiedEmail === `tpl-${idx}` ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recipient Selector Column */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 space-y-3">
                            <h2 className="text-lg font-bold text-gray-800">Select Recipients</h2>

                            <div className="relative">
                                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-purple-300"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 flex-1 focus:outline-none"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">Users</option>
                                    <option value="super_admin">Admins</option>
                                </select>

                                <select
                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 flex-1 focus:outline-none"
                                    value={filterPlan}
                                    onChange={(e) => setFilterPlan(e.target.value)}
                                >
                                    <option value="all">All Plans</option>
                                    {availablePlans.map(plan => (
                                        <option key={plan} value={plan}>{plan}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 ml-1">
                                    <input
                                        type="checkbox"
                                        id="selectAll"
                                        onChange={handleSelectAll}
                                        checked={filteredRecipients.length > 0 && selectedUsers.length >= filteredRecipients.length}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="selectAll" className="text-sm text-gray-600 truncate cursor-pointer select-none">All</label>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyAllEmails}
                                    disabled={filteredRecipients.length === 0}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copiedAll
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    <IoCopyOutline className="w-3.5 h-3.5" />
                                    {copiedAll ? 'Copied!' : 'Copy All Emails'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">Loading users...</div>
                            ) : filteredRecipients.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">No users found.</div>
                            ) : (
                                filteredRecipients.map(user => (
                                    <label
                                        key={user._id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedUsers.includes(user._id) ? 'bg-purple-50 border-purple-200' : 'border-transparent hover:bg-gray-50'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => handleSelectUser(user._id)}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(user.email, user._id); }}
                                                    className={`flex-shrink-0 p-0.5 rounded transition-colors ${copiedEmail === user._id
                                                        ? 'text-green-600'
                                                        : 'text-gray-400 hover:text-purple-600'
                                                        }`}
                                                    title="Copy email"
                                                >
                                                    <IoCopyOutline className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{user.role}</span>
                                                {user.plans?.map(plan => (
                                                    <span key={plan} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-1">{plan}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-500 rounded-b-xl">
                            Showing {filteredRecipients.length} of {recipients.length} users
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminEmails;
