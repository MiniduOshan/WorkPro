import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { IoMailOutline, IoSendOutline, IoPersonOutline, IoSearchOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

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
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
