import Company from '../models/Company.js';
import PricingPlan from '../models/PricingPlan.js';

// Subscribe to a plan (called by company owner)
export const subscribe = async (req, res) => {
    const { companyId, planId } = req.body;

    try {
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Authorization check — must be the company owner
        const isOwner = company.owner.toString() === req.user._id.toString();
        const member = company.members.find(m => m.user.toString() === req.user._id.toString());
        if (!isOwner && (!member || member.role !== 'owner')) {
            return res.status(403).json({ message: 'Only the owner can change subscription plans' });
        }

        const plan = await PricingPlan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const isFree = plan.price === 0;

        company.plan = plan._id;
        company.subscriptionStatus = isFree ? 'free' : 'active';

        // Record payment history
        company.paymentHistory = company.paymentHistory || [];
        company.paymentHistory.unshift({
            planName: plan.name,
            amount: plan.price,
            status: isFree ? 'free' : 'paid',
            date: new Date(),
        });

        await company.save();
        await company.populate('plan');

        res.json({ message: `Subscribed to ${plan.name} successfully`, company });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Get billing history for a company
export const getBillingHistory = async (req, res) => {
    const { companyId } = req.params;
    try {
        const company = await Company.findById(companyId).select('paymentHistory owner members');
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const isOwner = company.owner.toString() === req.user._id.toString();
        const member = company.members.find(m => m.user.toString() === req.user._id.toString());
        if (!isOwner && (!member || !['owner', 'manager'].includes(member.role))) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(company.paymentHistory || []);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// SuperAdmin: assign any plan to any company
export const adminAssignPlan = async (req, res) => {
    const { companyId, planId } = req.body;

    try {
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const plan = await PricingPlan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const isFree = plan.price === 0;
        company.plan = plan._id;
        company.subscriptionStatus = isFree ? 'free' : 'active';

        // Record in history
        company.paymentHistory = company.paymentHistory || [];
        company.paymentHistory.unshift({
            planName: plan.name,
            amount: plan.price,
            status: isFree ? 'free' : 'paid',
            date: new Date(),
        });

        await company.save();

        res.json({ message: `Plan "${plan.name}" assigned to "${company.name}" successfully`, company });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    res.json({ message: 'Subscription cancelled' });
};
