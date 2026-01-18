import WorkflowRule from '../models/WorkflowRule.js';
import Company from '../models/Company.js';

// Get all workflow rules for a company
export const getWorkflowRules = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const rules = await WorkflowRule.find({ company: companyId })
      .populate('createdBy', 'firstName lastName email')
      .populate('actionData.userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single workflow rule
export const getWorkflowRule = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const rule = await WorkflowRule.findOne({ _id: id, company: companyId })
      .populate('createdBy', 'firstName lastName email')
      .populate('actionData.userId', 'firstName lastName email');

    if (!rule) {
      return res.status(404).json({ message: 'Workflow rule not found' });
    }

    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new workflow rule
export const createWorkflowRule = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const ruleData = {
      ...req.body,
      company: companyId,
      createdBy: req.user._id,
    };

    const rule = new WorkflowRule(ruleData);
    await rule.save();

    const populatedRule = await WorkflowRule.findById(rule._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('actionData.userId', 'firstName lastName email');

    res.status(201).json(populatedRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a workflow rule
export const updateWorkflowRule = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const rule = await WorkflowRule.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('actionData.userId', 'firstName lastName email');

    if (!rule) {
      return res.status(404).json({ message: 'Workflow rule not found' });
    }

    res.json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a workflow rule
export const deleteWorkflowRule = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const rule = await WorkflowRule.findOneAndDelete({ _id: id, company: companyId });

    if (!rule) {
      return res.status(404).json({ message: 'Workflow rule not found' });
    }

    res.json({ message: 'Workflow rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle workflow rule active status
export const toggleWorkflowRule = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.headers['x-company-id'];

    const rule = await WorkflowRule.findOne({ _id: id, company: companyId });

    if (!rule) {
      return res.status(404).json({ message: 'Workflow rule not found' });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get workflow execution stats
export const getWorkflowStats = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const stats = await WorkflowRule.aggregate([
      { $match: { company: mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          activeRules: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          totalExecutions: { $sum: '$executionCount' },
          rulesByTrigger: {
            $push: {
              trigger: '$triggerEvent',
              count: 1,
            },
          },
        },
      },
    ]);

    res.json(stats[0] || { totalRules: 0, activeRules: 0, totalExecutions: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
