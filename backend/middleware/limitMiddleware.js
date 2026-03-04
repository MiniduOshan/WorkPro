import PricingPlan from '../models/PricingPlan.js';
import fs from 'fs';

// Helper to get company and its plan
const getCompanyWithPlan = async (userId) => {
    // Find the company where the user is a member
    // Note: This logic assumes we are checking the limit for the *current* context. 
    // Ideally, valid requests should include `companyId` in params or body, OR we rely on user's default company.
    // For safety, let's assume we check limits on the user's Default Company if not specified.

    // Actually, better approach: 
    // Most creation actions happen in the context of a company. 
    // We need to know WHICH company we are checking limits for.
    // Let's assume req.params.companyId OR req.body.companyId is present, or fallback to user.defaultCompany.
    return null;
};

// Middleware factory to check limits
export const checkLimit = (limitName) => {
    return async (req, res, next) => {
        try {
            const companyId = req.params?.companyId || req.body?.companyId || req.query?.companyId || req.headers['x-company-id'] || req.user?.defaultCompany;

            if (!companyId) {
                // If no company context, we can't check limits. 
                // Depending on the route, maybe we should let it pass or fail.
                // For now, let's assume if it's a company-agnostic action, we don't check limit.
                // But if it creates something, it MUST belong to a company.
                return res.status(400).json({ message: 'Company context required for limit check' });
            }

            const company = await Company.findById(companyId).populate('plan');
            if (!company) return res.status(404).json({ message: 'Company not found' });

            if (!company.plan) {
                // If no plan assigned, fetch default plan or deny
                // For resilience, maybe fetch the 'Free' plan on the fly if missing
                const defaultPlan = await PricingPlan.findOne({ isDefault: true });
                if (defaultPlan) {
                    company.plan = defaultPlan;
                    // We don't save it here to avoid side effects in GET requests, but we use it for checking
                } else {
                    return res.status(500).json({ message: 'No pricing plan assigned and no default plan found.' });
                }
            }

            const plan = company.plan;
            const limits = plan.limits;
            const currentUsage = company.usage || {};

            if (limitName === 'maxUsers') {
                // Count actual members
                const count = company.members.length;
                if (limits.maxUsers !== -1 && count >= limits.maxUsers) {
                    return res.status(403).json({ message: `User limit reached (Max: ${limits.maxUsers}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxStorage') {
                // Check storage used
                const used = currentUsage.storageUsed || 0;
                const maxBytes = limits.maxStorageBytes || 0; // 0 usually means no storage, but let's handle -1 if we supported unlimited storage
                // If we have a file in request file/files
                const newFileBytes = req.file ? req.file.size : 0;

                if (maxBytes !== -1 && (used + newFileBytes) > maxBytes) {
                    // Cleanup: If a file was uploaded by multer, delete it immediately
                    if (req.file && fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(403).json({ message: `Storage limit reached. Please upgrade your plan.` });
                }
            } else if (limitName === 'maxProjects') {
                const Project = req.app.locals.Project || (await import('../models/Project.js')).default;
                const count = await Project.countDocuments({ company: companyId });
                if (limits.maxProjects !== -1 && count >= limits.maxProjects) {
                    return res.status(403).json({ message: `Project limit reached (Max: ${limits.maxProjects}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxProjectGroups') {
                const Group = req.app.locals.Group || (await import('../models/Group.js')).default;
                const count = await Group.countDocuments({ company: companyId });
                if (limits.maxProjectGroups !== -1 && count >= limits.maxProjectGroups) {
                    return res.status(403).json({ message: `Project Group limit reached (Max: ${limits.maxProjectGroups}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxDepartments') {
                const Department = req.app.locals.Department || (await import('../models/Department.js')).default;
                const count = await Department.countDocuments({ company: companyId });
                if (limits.maxDepartments !== -1 && count >= limits.maxDepartments) {
                    return res.status(403).json({ message: `Department limit reached (Max: ${limits.maxDepartments}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxChannels') {
                const Channel = req.app.locals.Channel || (await import('../models/Channel.js')).default;
                const count = await Channel.countDocuments({ company: companyId });
                if (limits.maxChannels !== -1 && count >= limits.maxChannels) {
                    return res.status(403).json({ message: `Channel limit reached (Max: ${limits.maxChannels}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxAnnouncements') {
                const Announcement = req.app.locals.Announcement || (await import('../models/Announcement.js')).default;
                const count = await Announcement.countDocuments({ company: companyId });
                if (limits.maxAnnouncements !== -1 && count >= limits.maxAnnouncements) {
                    return res.status(403).json({ message: `Announcement limit reached (Max: ${limits.maxAnnouncements}). Please upgrade your plan.` });
                }
            } else if (limitName === 'maxTasks') {
                const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
                const count = await Task.countDocuments({ company: companyId });
                if (limits.maxTasks !== -1 && count >= limits.maxTasks) {
                    return res.status(403).json({ message: `Task limit reached (Max: ${limits.maxTasks}). Please upgrade your plan.` });
                }
            }

            // Pass company with populated plan to next handler if needed
            req.company = company;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    };
};

export const checkFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const companyId = req.params?.companyId || req.body?.companyId || req.query?.companyId || req.headers['x-company-id'] || req.user?.defaultCompany;
            if (!companyId) return res.status(400).json({ message: 'Company context required' });

            const company = await Company.findById(companyId).populate('plan');
            if (!company) return res.status(404).json({ message: 'Company not found' });

            let plan = company.plan;
            if (!plan) {
                const defaultPlan = await PricingPlan.findOne({ isDefault: true });
                if (defaultPlan) plan = defaultPlan;
                else return res.status(500).json({ message: 'No plan found' });
            }

            if (!plan.features[featureName]) {
                return res.status(403).json({ message: `Feature '${featureName}' is not available in your current plan (${plan.name}).` });
            }

            req.company = company;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    };
};
