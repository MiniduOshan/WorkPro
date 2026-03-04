import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    IoPeopleOutline,
    IoCloudUploadOutline,
    IoLayersOutline,
    IoChatbubblesOutline,
    IoMegaphoneOutline
} from 'react-icons/io5';

const UsageStatsWidget = ({ companyId }) => {
    const [usage, setUsage] = useState({ users: 0, storage: 0, projects: 0, channels: 0, announcements: 0 });
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId && companyId !== 'null' && companyId !== 'undefined') {
            fetchUsageData();
        } else {
            setLoading(false);
        }
    }, [companyId]);

    const fetchUsageData = async () => {
        try {
            setLoading(true);
            const [companyRes, membersRes, usageGroupsRes, usageChannelsRes, usageAnnouncementsRes] = await Promise.allSettled([
                api.get(`/api/companies/${companyId}`),
                api.get(`/api/companies/${companyId}/members`),
                api.get('/api/groups', { params: { companyId } }),
                api.get('/api/channels', { params: { companyId } }),
                api.get('/api/announcements', { params: { companyId } }),
            ]);

            if (companyRes.status === 'fulfilled') {
                setCurrentPlan(companyRes.value.data.plan || null);
                setUsage(u => ({ ...u, storage: companyRes.value.data.usage?.storageUsed || 0 }));
            }

            if (membersRes.status === 'fulfilled') {
                setUsage(u => ({ ...u, users: membersRes.value.data.length }));
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
        } catch (err) {
            // Quietly fail
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 rounded"></div>)}
                </div>
            </div>
        );
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const UsageBar = ({ icon: Icon, label, current, max, colorClass }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <Icon className="text-slate-400" /> {label}
                </span>
                <span className="text-xs font-bold text-slate-900">
                    {typeof current === 'number' && label !== 'Storage' ? current : (label === 'Storage' ? formatBytes(current) : current)} / {max === -1 ? '∞' : (label === 'Storage' ? formatBytes(max) : max)}
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${max !== -1 && current >= max ? 'bg-red-500' : colorClass}`}
                    style={{ width: max === -1 || !max ? '5%' : `${Math.min((current / max) * 100, 100)}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Plan Usage</h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {currentPlan?.name || 'Free Plan'}
                </span>
            </div>

            <div className="space-y-5">
                <UsageBar
                    icon={IoPeopleOutline}
                    label="Users"
                    current={usage.users}
                    max={currentPlan?.limits?.maxUsers || 0}
                    colorClass="bg-blue-500"
                />
                <UsageBar
                    icon={IoCloudUploadOutline}
                    label="Storage"
                    current={usage.storage}
                    max={currentPlan?.limits?.maxStorageBytes || 0}
                    colorClass="bg-indigo-500"
                />
                <UsageBar
                    icon={IoLayersOutline}
                    label="Project Groups"
                    current={usage.projects}
                    max={currentPlan?.limits?.maxProjectGroups || currentPlan?.limits?.maxProjects || 0}
                    colorClass="bg-emerald-500"
                />
                <UsageBar
                    icon={IoChatbubblesOutline}
                    label="Channels"
                    current={usage.channels}
                    max={currentPlan?.limits?.maxChannels || 0}
                    colorClass="bg-blue-400"
                />
                <UsageBar
                    icon={IoMegaphoneOutline}
                    label="Announcements"
                    current={usage.announcements}
                    max={currentPlan?.limits?.maxAnnouncements || 0}
                    colorClass="bg-orange-500"
                />
            </div>
        </div>
    );
};

export default UsageStatsWidget;
