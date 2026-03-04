import PricingPlan from '../models/PricingPlan.js';

// Get all plans (Public - for landing page/billing)
export const getPublicPlans = async (req, res) => {
    try {
        const plans = await PricingPlan.find({ isPublic: true }).sort({ price: 1 });
        res.json(plans);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Get all plans (Admin - includes hidden plans)
export const getAllPlans = async (req, res) => {
    try {
        const plans = await PricingPlan.find({}).sort({ price: 1 });
        res.json(plans);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Create a new plan (Admin)
export const createPlan = async (req, res) => {
    const { name, price, limits, features, isDefault, paypalPlanId } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    try {
        // If setting as default, unset other defaults
        if (isDefault) {
            await PricingPlan.updateMany({}, { isDefault: false });
        }

        const plan = await PricingPlan.create(req.body);
        res.status(201).json(plan);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Update a plan (Admin)
export const updatePlan = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.isDefault) {
            await PricingPlan.updateMany({ _id: { $ne: id } }, { isDefault: false });
        }

        const plan = await PricingPlan.findByIdAndUpdate(id, req.body, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        res.json(plan);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Delete a plan (Admin)
export const deletePlan = async (req, res) => {
    try {
        const plan = await PricingPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json({ message: 'Plan deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};
