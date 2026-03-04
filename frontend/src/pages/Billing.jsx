import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    IoCheckmarkCircle,
    IoRocketOutline,
    IoCloudUploadOutline,
    IoPeopleOutline,
    IoReceiptOutline,
    IoTimeOutline,
    IoCardOutline,
    IoShieldCheckmarkOutline,
    IoAlertCircleOutline,
    IoStarOutline,
    IoCloseOutline,
    IoDocumentTextOutline,
    IoDownloadOutline,
    IoWarningOutline,
    IoPrintOutline,
    IoLayersOutline,
    IoChatbubblesOutline,
    IoMegaphoneOutline,
} from 'react-icons/io5';
import api from '../api/axios';

const Billing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [company, setCompany] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [usage, setUsage] = useState({ users: 0, storage: 0, projects: 0, channels: 0, announcements: 0 });
    const [availablePlans, setAvailablePlans] = useState([]);
    const [billingHistory, setBillingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [showInvoices, setShowInvoices] = useState(false);
    const [savedCard, setSavedCard] = useState(null);
    const [downgradeTarget, setDowngradeTarget] = useState(null);
    const [downgradeConfirmText, setDowngradeConfirmText] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Stable invoice number — computed once when selectedInvoice changes
    const invoiceNumber = useMemo(
        () => selectedInvoice ? String(Math.floor(Math.random() * 90000) + 10000) : null,
        [selectedInvoice?._id ?? selectedInvoice?.date]
    );

    // Get companyId from localStorage
    const rawId = localStorage.getItem('companyId') || localStorage.getItem('activeCompanyId');
    const companyId = (rawId && rawId !== 'null' && rawId !== 'undefined') ? rawId : null;

    useEffect(() => {
        if (companyId) {
            fetchBillingData();
        } else {
            fetchCompanyFromProfile();
        }
        // Load saved card from localStorage
        const stored = localStorage.getItem('savedPaymentCard');
        if (stored) setSavedCard(JSON.parse(stored));
    }, []);

    const goToPaymentMethod = () => {
        localStorage.setItem('paymentMethodReturnPath', location.pathname);
        navigate('/payment-method');
    };

    const fetchCompanyFromProfile = async () => {
        try {
            setLoading(true);
            const userRes = await api.get('/api/users/profile');
            const companiesRes = await api.get('/api/companies/mine');
            const companies = companiesRes.data || [];
            const active = companies.find(c => c._id === userRes.data?.defaultCompany) || companies[0];
            if (active) {
                localStorage.setItem('companyId', active._id);
                await fetchBillingDataById(active._id);
            }
        } catch (err) {
            console.error('Failed to get company from profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBillingData = async () => {
        await fetchBillingDataById(companyId);
    };

    const fetchBillingDataById = async (cid) => {
        try {
            setLoading(true);

            const [companyRes, membersRes, plansRes, historyRes, usageGroupsRes, usageChannelsRes, usageAnnouncementsRes] = await Promise.allSettled([
                api.get(`/api/companies/${cid}`),
                api.get(`/api/companies/${cid}/members`),
                api.get('/api/pricing-plans/public'),
                api.get(`/api/subscriptions/history/${cid}`),
                api.get('/api/groups', { params: { companyId: cid } }),
                api.get('/api/channels', { params: { companyId: cid } }),
                api.get('/api/announcements', { params: { companyId: cid } }),
            ]);

            if (companyRes.status === 'fulfilled') {
                const compData = companyRes.value.data;
                setCompany(compData);
                // plan is populated by backend; could be object or null
                setCurrentPlan(compData.plan || null);
            }

            if (membersRes.status === 'fulfilled') {
                setUsage(u => ({ ...u, users: membersRes.value.data.length }));
            }
            if (companyRes.status === 'fulfilled') {
                const storageUsed = companyRes.value.data.usage?.storageUsed || 0;
                setUsage(u => ({ ...u, storage: storageUsed }));
            }
            if (usageGroupsRes?.status === 'fulfilled') {
                setUsage(u => ({ ...u, projects: usageGroupsRes.value.data.length }));
            }
            if (usageChannelsRes?.status === 'fulfilled') {
                setUsage(u => ({ ...u, channels: usageChannelsRes.value.data.length }));
            }
            if (usageAnnouncementsRes?.status === 'fulfilled') {
                setUsage(u => ({ ...u, announcements: usageAnnouncementsRes.value.data.length }));
            }

            if (plansRes.status === 'fulfilled') {
                setAvailablePlans(plansRes.value.data || []);
            }

            if (historyRes.status === 'fulfilled') {
                setBillingHistory(historyRes.value.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch billing data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan) => {
        if (!company) return;
        const isCurrent = currentPlan?._id?.toString() === plan._id?.toString();
        if (isCurrent) return;

        setMessage(null);

        // Free plan → require confirmation first
        if (plan.price === 0) {
            setDowngradeTarget(plan);
            setDowngradeConfirmText('');
            return;
        }

        // Paid plan → payment page
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        localStorage.setItem('selectedCompanyId', company._id);
        navigate('/payment');
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };


    const confirmDowngrade = async () => {
        if (!downgradeTarget || !company) return;
        try {
            setActionLoading(downgradeTarget._id);
            const res = await api.post('/api/subscriptions/subscribe', {
                companyId: company._id,
                planId: downgradeTarget._id,
            });
            setCurrentPlan(res.data.company?.plan || downgradeTarget);
            const histRes = await api.get(`/api/subscriptions/history/${company._id}`);
            setBillingHistory(histRes.data || []);
            setMessage({ type: 'success', text: `Downgraded to ${downgradeTarget.name} plan.` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to downgrade.' });
        } finally {
            setActionLoading(null);
            setDowngradeTarget(null);
            setDowngradeConfirmText('');
        }
    };

    const printInvoice = () => {
        const win = window.open('', '_blank', 'width=860,height=700');
        if (!win) return;
        const inv = selectedInvoice;
        const num = invoiceNumber;
        const date = inv.date
            ? new Date(inv.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const amount = inv.amount === 0 ? '$0.00' : `$${Number(inv.amount).toFixed(2)}`;
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice #${num}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#fff;color:#111;padding:48px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px}
.brand{font-size:26px;font-weight:900;color:#4338ca}.sub{font-size:11px;color:#9ca3af;margin-top:4px}
.ititle{font-size:32px;font-weight:900;text-align:right}.inum{font-size:13px;color:#9ca3af;text-align:right;margin-top:4px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
.lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:6px}
.val{font-size:15px;font-weight:700}.val2{font-size:13px;color:#6b7280;margin-top:2px}
.rt{text-align:right}
table{width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
thead{background:#f9fafb}
th{padding:12px 16px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;border-bottom:1px solid #e5e7eb}
td{padding:16px;font-size:13px;border-bottom:1px solid #f3f4f6}
.dm{font-weight:600}.ds{font-size:11px;color:#9ca3af;margin-top:3px}
.totw{display:flex;justify-content:flex-end;margin-bottom:32px}
.tot{width:220px}.trow{display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:8px}
.trow.big{font-weight:900;font-size:15px;color:#111;border-top:1px solid #e5e7eb;padding-top:10px;margin-top:4px}
.trow.big span:last-child{color:#4338ca}
.ftr{display:flex;justify-content:space-between;align-items:center;padding-top:24px;border-top:1px solid #f3f4f6}
.badge{padding:6px 16px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.paid{background:#dcfce7;color:#15803d}.freet{background:#f3f4f6;color:#9ca3af}
.contact{text-align:center;font-size:11px;color:#d1d5db;margin-top:40px}
@media print{body{padding:24px 32px}@page{size:A4;margin:0}}
</style></head><body>
<div class="hdr"><div><div class="brand">WorkPro</div><div class="sub">Workspace Management Platform</div></div>
<div><div class="ititle">INVOICE</div><div class="inum">#${num}</div></div></div>
<div class="meta">
<div><div class="lbl">Bill To</div><div class="val">${inv.company?.name || 'Your Company'}</div><div class="val2">${inv.company?.email || ''}</div></div>
<div class="rt"><div class="lbl">Invoice Date</div><div class="val">${date}</div><div class="val2">Due: Upon receipt</div></div>
</div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
<tbody><tr>
<td><div class="dm">${inv.planName} Plan &mdash; Monthly Subscription</div><div class="ds">WorkPro workspace subscription</div></td>
<td style="text-align:center">1</td><td style="text-align:right;font-weight:700">${amount}</td>
</tr></tbody></table>
<div class="totw"><div class="tot">
<div class="trow"><span>Subtotal</span><span>${amount}</span></div>
<div class="trow"><span>Tax</span><span>$0.00</span></div>
<div class="trow big"><span>Total</span><span>${amount}</span></div>
</div></div>
<div class="ftr">
<span class="badge ${inv.status === 'paid' ? 'paid' : 'freet'}">${inv.status === 'paid' ? '&#x2713; Paid' : 'Free Tier'}</span>
<span style="font-size:11px;color:#9ca3af">Thank you for using WorkPro!</span>
</div>
<div class="contact">WorkPro &middot; support@workpro.app &middot; workpro.app</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`);
        win.document.close();
    };
    const getPlanButton = (plan) => {
        const isCurrent = currentPlan?._id?.toString() === plan._id?.toString()
            || (!currentPlan && plan.price === 0); // treat "no plan" as free
        const isLoading = actionLoading === plan._id;

        if (isCurrent) {
            return { label: '✓ Current Plan', disabled: true, style: 'bg-gray-100 text-gray-500 cursor-default' };
        }
        if (isLoading) {
            return { label: 'Processing...', disabled: true, style: 'bg-gray-200 text-gray-400 cursor-wait' };
        }
        const currentPrice = currentPlan?.price ?? 0;
        if (plan.price === 0) {
            return { label: 'Downgrade to Free', disabled: false, style: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50' };
        }
        if (plan.price > currentPrice) {
            return { label: 'Upgrade Now', disabled: false, style: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' };
        }
        return { label: 'Downgrade', disabled: false, style: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading billing details...</p>
                </div>
            </div>
        );
    }

    const isOnFreePlan = !currentPlan || currentPlan.price === 0;

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
                        <p className="text-gray-500 mt-1">Manage your plan, check usage, and view billing history.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowInvoices(true)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <IoReceiptOutline className="w-5 h-5" />
                            Invoices
                        </button>
                        <button
                            onClick={goToPaymentMethod}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <IoCardOutline className="w-5 h-5" />
                            Update Payment Method
                        </button>
                    </div>
                </div>

                {/* Status message */}
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.type === 'success' ? <IoCheckmarkCircle className="w-5 h-5" /> : <IoAlertCircleOutline className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Current Plan + Usage */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Plan Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-10 -mb-10 pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                            Current Plan
                                        </span>
                                        {!isOnFreePlan && (
                                            <span className="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-400/30">
                                                Active
                                            </span>
                                        )}
                                        {isOnFreePlan && (
                                            <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                                                Free
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-4xl font-extrabold mb-1">
                                        {currentPlan?.name || 'Free Plan'}
                                    </h2>
                                    <p className="text-indigo-100 text-lg">
                                        {isOnFreePlan ? 'Free Forever' : `$${currentPlan?.price || 0} / ${currentPlan?.billingCycle || 'month'}`}
                                    </p>
                                </div>
                                {!isOnFreePlan && currentPlan && (
                                    <div className="text-right">
                                        <p className="text-indigo-200 text-sm font-medium mb-1">Next renewal</p>
                                        <p className="text-xl font-bold flex items-center gap-2 justify-end">
                                            <IoTimeOutline />
                                            {company?.subscriptionExpiresAt
                                                ? new Date(company.subscriptionExpiresAt).toLocaleDateString()
                                                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex gap-4 flex-wrap">
                                <button
                                    onClick={() => document.getElementById('available-plans').scrollIntoView({ behavior: 'smooth' })}
                                    className="px-5 py-2 bg-white text-indigo-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg"
                                >
                                    {isOnFreePlan ? 'Upgrade Plan' : 'Change Plan'}
                                </button>
                                {!isOnFreePlan && (
                                    <button
                                        onClick={() => handleSubscribe(availablePlans.find(p => p.price === 0))}
                                        className="px-5 py-2 bg-indigo-800/50 text-white rounded-lg font-bold text-sm hover:bg-indigo-800/70 transition-colors border border-white/10"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <IoRocketOutline className="text-indigo-600" />
                                Usage Statistics
                            </h3>
                            <div className="space-y-6">
                                {/* Users */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <IoPeopleOutline className="text-gray-400" /> Users
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {usage.users}{' '}
                                            <span className="text-gray-400 font-normal">
                                                / {currentPlan?.limits?.maxUsers === -1 ? '∞' : (currentPlan?.limits?.maxUsers ?? '—')}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${currentPlan?.limits?.maxUsers !== -1 && usage.users >= (currentPlan?.limits?.maxUsers || Infinity)
                                                ? 'bg-red-500'
                                                : 'bg-indigo-500'
                                                }`}
                                            style={{
                                                width: currentPlan?.limits?.maxUsers === -1 || !currentPlan?.limits?.maxUsers
                                                    ? '5%'
                                                    : `${Math.min((usage.users / (currentPlan?.limits?.maxUsers || 1)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Storage */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <IoCloudUploadOutline className="text-gray-400" /> Storage
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatBytes(usage.storage)}{' '}
                                            <span className="text-gray-400 font-normal">/ {currentPlan?.limits?.maxStorageStr || '—'}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                            style={{
                                                width: `${Math.min((usage.storage / (currentPlan?.limits?.maxStorageBytes || 1073741824)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Project Groups */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <IoLayersOutline className="text-gray-400" /> Project Groups
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {usage.projects}{' '}
                                            <span className="text-gray-400 font-normal">
                                                / {currentPlan?.limits?.maxProjectGroups === -1 ? '∞' : (currentPlan?.limits?.maxProjectGroups ?? currentPlan?.limits?.maxProjects ?? '—')}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${currentPlan?.limits?.maxProjectGroups !== -1 && usage.projects >= (currentPlan?.limits?.maxProjectGroups || currentPlan?.limits?.maxProjects || Infinity)
                                                ? 'bg-red-500'
                                                : 'bg-emerald-500'
                                                }`}
                                            style={{
                                                width: currentPlan?.limits?.maxProjectGroups === -1 || !currentPlan?.limits?.maxProjectGroups
                                                    ? '5%'
                                                    : `${Math.min((usage.projects / (currentPlan?.limits?.maxProjectGroups || currentPlan?.limits?.maxProjects || 1)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Channels */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <IoChatbubblesOutline className="text-gray-400" /> Channels
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {usage.channels}{' '}
                                            <span className="text-gray-400 font-normal">
                                                / {currentPlan?.limits?.maxChannels === -1 ? '∞' : (currentPlan?.limits?.maxChannels ?? '—')}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${currentPlan?.limits?.maxChannels !== -1 && usage.channels >= (currentPlan?.limits?.maxChannels || Infinity)
                                                ? 'bg-red-500'
                                                : 'bg-blue-500'
                                                }`}
                                            style={{
                                                width: currentPlan?.limits?.maxChannels === -1 || !currentPlan?.limits?.maxChannels
                                                    ? '5%'
                                                    : `${Math.min((usage.channels / (currentPlan?.limits?.maxChannels || 1)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Announcements */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <IoMegaphoneOutline className="text-gray-400" /> Announcements
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {usage.announcements}{' '}
                                            <span className="text-gray-400 font-normal">
                                                / {currentPlan?.limits?.maxAnnouncements === -1 ? '∞' : (currentPlan?.limits?.maxAnnouncements ?? '—')}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${currentPlan?.limits?.maxAnnouncements !== -1 && usage.announcements >= (currentPlan?.limits?.maxAnnouncements || Infinity)
                                                ? 'bg-red-500'
                                                : 'bg-orange-500'
                                                }`}
                                            style={{
                                                width: currentPlan?.limits?.maxAnnouncements === -1 || !currentPlan?.limits?.maxAnnouncements
                                                    ? '5%'
                                                    : `${Math.min((usage.announcements / (currentPlan?.limits?.maxAnnouncements || 1)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Method + History */}
                    <div className="space-y-6">
                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
                                <button
                                    onClick={goToPaymentMethod}
                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                                >
                                    {savedCard ? 'Edit' : 'Add Card'}
                                </button>
                            </div>
                            {savedCard ? (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-white text-[8px] font-bold tracking-wider">
                                        {savedCard.brand?.slice(0, 4).toUpperCase() || 'CARD'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">•••• •••• •••• {savedCard.last4}</p>
                                        <p className="text-xs text-gray-500">Expires {savedCard.expiry} · {savedCard.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={goToPaymentMethod}
                                    className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                                >
                                    <IoCardOutline className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Click to add a payment method
                                </div>
                            )}
                        </div>

                        {/* Billing History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Billing History</h3>
                            </div>
                            <div className="space-y-2">
                                {billingHistory.length > 0 ? (
                                    billingHistory.slice(0, 5).map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    <IoReceiptOutline />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.planName} Plan</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">
                                                    {item.amount === 0 ? 'Free' : `$${item.amount}`}
                                                </span>
                                                <p className={`text-xs mt-0.5 ${item.status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {item.status === 'paid' ? 'Paid' : 'Free'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-6">No billing history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Plans */}
                <div id="available-plans" className="pt-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h3>
                    <div className={`grid gap-6 ${availablePlans.length <= 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-3'}`}>
                        {availablePlans.map((plan, idx) => {
                            const isCurrent = currentPlan?._id?.toString() === plan._id?.toString()
                                || (!currentPlan && plan.price === 0);
                            const isPopular = idx === 1 || plan.name.toLowerCase().includes('plus');
                            const btn = getPlanButton(plan);

                            return (
                                <div
                                    key={plan._id}
                                    className={`rounded-2xl p-6 flex flex-col transition-all duration-300 relative ${isCurrent
                                        ? 'bg-white border-2 border-green-400 shadow-lg ring-4 ring-green-50'
                                        : isPopular
                                            ? 'bg-white border-2 border-indigo-400 shadow-xl hover:-translate-y-1'
                                            : 'bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <IoCheckmarkCircle className="w-3 h-3" /> CURRENT PLAN
                                            </span>
                                        </div>
                                    )}
                                    {!isCurrent && isPopular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                                <IoStarOutline className="w-3 h-3" /> Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                                            <span className="text-gray-500 text-sm font-medium">/{plan.billingCycle || 'month'}</span>
                                        </div>
                                        {plan.description && (
                                            <p className="text-sm text-gray-500 mt-2 leading-relaxed min-h-[36px]">{plan.description}</p>
                                        )}
                                    </div>

                                    <div className="flex-grow space-y-3 mb-6">
                                        <div className="h-px bg-gray-100" />
                                        <ul className="space-y-2.5">
                                            <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <IoShieldCheckmarkOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                <span>
                                                    <strong className="text-gray-900">
                                                        {plan.limits?.maxUsers === -1 ? 'Unlimited' : plan.limits?.maxUsers ?? '—'}
                                                    </strong>{' '}
                                                    Team Members
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <IoShieldCheckmarkOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                <span>
                                                    <strong className="text-gray-900">{plan.limits?.maxStorageStr ?? '—'}</strong> Storage
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <IoShieldCheckmarkOutline className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                <span>
                                                    <strong className="text-gray-900">
                                                        {plan.limits?.maxProjects === -1 ? 'Unlimited' : plan.limits?.maxProjects ?? '—'}
                                                    </strong>{' '}
                                                    Projects
                                                </span>
                                            </li>
                                            {plan.features && Object.entries(plan.features)
                                                .filter(([, v]) => v)
                                                .slice(0, 3)
                                                .map(([key]) => (
                                                    <li key={key} className="flex items-start gap-2.5 text-sm text-gray-600 capitalize">
                                                        <IoCheckmarkCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={btn.disabled}
                                        className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${btn.style}`}
                                    >
                                        {btn.label}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Invoices Modal */}
            {showInvoices && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInvoices(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <IoReceiptOutline className="w-5 h-5 text-indigo-600" />
                                Invoices
                            </h2>
                            <button onClick={() => setShowInvoices(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IoCloseOutline className="w-6 h-6" />
                            </button>
                        </div>

                        {billingHistory.length > 0 ? (
                            <div className="space-y-3">
                                {billingHistory.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <IoDocumentTextOutline className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{item.planName} Plan</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {item.amount === 0 ? 'Free' : `$${item.amount}`}
                                                </span>
                                                <p className={`text-xs ${item.status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {item.status === 'paid' ? 'Paid' : 'Free tier'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedInvoice({ ...item, company, currentPlan })}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600 flex items-center gap-1 text-xs"
                                            >
                                                <IoPrintOutline className="w-4 h-4" />
                                                Print
                                            </button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <IoReceiptOutline className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">No invoices yet</p>
                                <p className="text-sm mt-1">Invoices will appear here once you subscribe to a plan.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Downgrade Confirmation Modal ─────────────────────────────── */}
            {downgradeTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDowngradeTarget(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-7">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                <IoWarningOutline className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Downgrade to Free?</h2>
                                <p className="text-gray-500 text-sm mt-1">You are about to lose your current plan benefits.</p>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 space-y-2">
                            <p className="text-sm font-semibold text-red-700">You will lose:</p>
                            <ul className="text-sm text-red-600 space-y-1 list-inside">
                                {currentPlan?.limits?.maxUsers > 0 && currentPlan.limits.maxUsers !== -1 && (
                                    <li>✕ Team limit reduced (Free plan may have fewer seats)</li>
                                )}
                                {currentPlan?.limits?.maxStorageStr && (
                                    <li>✕ Storage reduced to Free tier limits</li>
                                )}
                                {currentPlan?.limits?.maxProjects > 0 && (
                                    <li>✕ Project limit reduced</li>
                                )}
                                <li>✕ All premium features included in {currentPlan?.name || 'current plan'}</li>
                                <li>✕ Priority support</li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                            Type <span className="font-mono font-bold text-red-600">downgrade</span> to confirm:
                        </p>
                        <input
                            type="text"
                            placeholder="Type 'downgrade' to confirm"
                            value={downgradeConfirmText}
                            onChange={e => setDowngradeConfirmText(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 font-mono mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setDowngradeTarget(null); setDowngradeConfirmText(''); }}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Keep Current Plan
                            </button>
                            <button
                                onClick={confirmDowngrade}
                                disabled={downgradeConfirmText.toLowerCase() !== 'downgrade' || !!actionLoading}
                                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${downgradeConfirmText.toLowerCase() === 'downgrade' && !actionLoading
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {actionLoading ? 'Processing...' : 'Confirm Downgrade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Invoice Print Preview Modal ──────────────────────────────── */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <IoDocumentTextOutline className="w-5 h-5 text-indigo-600" />
                                Invoice Preview
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={printInvoice}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
                                >
                                    <IoPrintOutline className="w-4 h-4" /> Print / Save PDF
                                </button>
                                <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                                    <IoCloseOutline className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        {/* Printable invoice */}
                        <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
                            <div id="invoice-print" className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-xl mx-auto">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <div className="text-2xl font-extrabold text-indigo-700 tracking-tight">WorkPro</div>
                                        <p className="text-xs text-gray-400 mt-1">Workspace Management Platform</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-extrabold text-gray-800">INVOICE</p>
                                        <p className="text-sm text-gray-400 mt-1">#{invoiceNumber}</p>
                                    </div>
                                </div>

                                {/* Bill to */}
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
                                        <p className="font-bold text-gray-900">{selectedInvoice.company?.name || 'Your Company'}</p>
                                        <p className="text-sm text-gray-500">{selectedInvoice.company?.email || ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Invoice Date</p>
                                        <p className="font-semibold text-gray-900">
                                            {selectedInvoice.date
                                                ? new Date(selectedInvoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Due: Upon receipt</p>
                                    </div>
                                </div>

                                {/* Line items */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left px-4 py-3 font-bold text-gray-600">Description</th>
                                                <th className="text-center px-4 py-3 font-bold text-gray-600">Qty</th>
                                                <th className="text-right px-4 py-3 font-bold text-gray-600">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-gray-900">{selectedInvoice.planName} Plan — Monthly Subscription</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">WorkPro workspace subscription</p>
                                                </td>
                                                <td className="px-4 py-4 text-center text-gray-700">1</td>
                                                <td className="px-4 py-4 text-right font-bold text-gray-900">
                                                    {selectedInvoice.amount === 0 ? '$0.00' : `$${selectedInvoice.amount.toFixed ? selectedInvoice.amount.toFixed(2) : selectedInvoice.amount}`}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-56 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{selectedInvoice.amount === 0 ? '$0.00' : `$${selectedInvoice.amount}`}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Tax</span><span>$0.00</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-gray-900 border-t border-gray-200 pt-2">
                                            <span>Total</span>
                                            <span className="text-indigo-600">
                                                {selectedInvoice.amount === 0 ? '$0.00' : `$${selectedInvoice.amount}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className="mt-8 flex justify-between items-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {selectedInvoice.status === 'paid' ? '✓ Paid' : 'Free Tier'}
                                    </span>
                                    <p className="text-xs text-gray-400">Thank you for using WorkPro!</p>
                                </div>

                                {/* Footer */}
                                <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                                    WorkPro · support@workpro.app · workpro.app
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Billing;
