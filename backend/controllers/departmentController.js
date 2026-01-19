import Department from '../models/Department.js';
import Company from '../models/Company.js';
import Channel from '../models/Channel.js';

const ensureMember = async (companyId, userId) => {
  if (!companyId) return { error: 'Company ID is required' };
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createDepartment = async (req, res) => {
  const { name, companyId, description, managers } = req.body;
  if (!name || !companyId) return res.status(400).json({ message: 'name and companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can create departments' });
    
    // Auto-add to company.departments array if not present
    if (!company.departments.includes(name)) {
      company.departments.push(name);
      await company.save();
    }
    
    const dept = await Department.create({ name, company: company._id, description: description || '', managers: managers || [] });
    
    // Automatically create a channel for the department
    try {
      const channelName = `#${name.toLowerCase().replace(/\\s+/g, '-')}`;
      await Channel.create({
        name: channelName,
        company: company._id,
        department: name,
        members: [req.user._id],
        type: 'public'
      });
    } catch (channelErr) {
      console.error('Failed to create department channel:', channelErr);
      // Continue even if channel creation fails
    }
    
    res.status(201).json(dept);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listDepartments = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const depts = await Department.find({ company: companyId }).sort({ name: 1 });
    res.json(depts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can update departments' });
    const { name, description, managers } = req.body;
    if (name !== undefined) dept.name = name;
    if (description !== undefined) dept.description = description;
    if (managers !== undefined) dept.managers = managers;
    const updated = await dept.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete departments' });
    await Department.deleteOne({ _id: dept._id });
    res.json({ message: 'Department removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getDepartmentMembers = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id).populate('company');
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const { error } = await ensureMember(dept.company._id, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    // Get all company members and filter to show only those in this department
    const Company = req.app.locals.Company || (await import('../models/Company.js')).default;
    const company = await Company.findById(dept.company._id).populate('members.user');
    const deptMembers = company.members.filter(m => m.department === dept._id.toString());
    
    res.json({ members: deptMembers.map(m => ({ ...m.toObject(), user: m.user })) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addMemberToDepartment = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can add members' });
    
    const Company = req.app.locals.Company || (await import('../models/Company.js')).default;
    const company = await Company.findById(dept.company);
    
    // Update or add member in company
    const memberIndex = company.members.findIndex(m => m.user.toString() === userId);
    if (memberIndex >= 0) {
      company.members[memberIndex].department = dept._id;
    } else {
      company.members.push({ user: userId, role: 'employee', department: dept._id });
    }
    
    await company.save();
    const updated = await company.populate('members.user');
    res.json({ message: 'Member added to department', company: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const removeMemberFromDepartment = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can remove members' });
    
    const Company = req.app.locals.Company || (await import('../models/Company.js')).default;
    const company = await Company.findById(dept.company);
    
    // Remove member from company
    company.members = company.members.filter(m => m.user.toString() !== userId);
    
    await company.save();
    const updated = await company.populate('members.user');
    res.json({ message: 'Member removed from department', company: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
