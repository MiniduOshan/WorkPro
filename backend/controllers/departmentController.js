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
    
    const finalManagers = managers && managers.length > 0 ? managers : [req.user._id];

    const dept = await Department.create({ 
      name, 
      company: company._id, 
      description: description || '', 
      managers: finalManagers 
    });
    
    if (!company.departments.includes(name)) {
      company.departments.push(name);
      await company.save();
    }
    
    try {
      const channelName = `#${name.toLowerCase().replace(/\s+/g, '-')}`;
      await Channel.create({
        name: channelName,
        company: company._id,
        department: name,
        members: [req.user._id],
        type: 'public'
      });
    } catch (channelErr) {
      console.error('Channel error:', channelErr.message);
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

// ADDED: updateDepartment fix
export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Unauthorized' });

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

// ADDED: deleteDepartment fix
export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    
    const { role, error } = await ensureMember(dept.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Unauthorized' });

    await Department.deleteOne({ _id: dept._id });
    res.json({ message: 'Department removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getDepartmentMembers = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    
    const CompanyModel = (await import('../models/Company.js')).default;
    const company = await CompanyModel.findById(dept.company).populate('members.user', 'firstName lastName email _id');
    
    const deptMembers = company.members.filter(m => String(m.department) === String(dept._id));
    res.json({ members: deptMembers });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addMemberToDepartment = async (req, res) => {
  try {
    const { userId } = req.body;
    const dept = await Department.findById(req.params.id);
    const CompanyModel = (await import('../models/Company.js')).default;
    const company = await CompanyModel.findById(dept.company);
    
    const memberIndex = company.members.findIndex(m => String(m.user) === String(userId));
    if (memberIndex >= 0) {
      company.members[memberIndex].department = dept._id;
      await company.save();
    }
    
    const updated = await company.populate('members.user');
    res.json({ message: 'Member added', company: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const removeMemberFromDepartment = async (req, res) => {
  try {
    const { userId } = req.body;
    const dept = await Department.findById(req.params.id);
    const CompanyModel = (await import('../models/Company.js')).default;
    const company = await CompanyModel.findById(dept.company);
    
    const memberIndex = company.members.findIndex(m => String(m.user) === String(userId));
    if (memberIndex >= 0) {
      company.members[memberIndex].department = undefined;
      await company.save();
    }
    
    const updated = await company.populate('members.user');
    res.json({ message: 'Member removed', company: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const joinDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    const CompanyModel = (await import('../models/Company.js')).default;
    const company = await CompanyModel.findById(dept.company);
    
    const memberIndex = company.members.findIndex(m => String(m.user) === String(req.user._id));
    if (memberIndex >= 0) {
      company.members[memberIndex].department = dept._id;
      await company.save();
    }
    res.json({ message: 'Joined' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const leaveDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    const CompanyModel = (await import('../models/Company.js')).default;
    const company = await CompanyModel.findById(dept.company);
    
    const memberIndex = company.members.findIndex(m => String(m.user) === String(req.user._id));
    if (memberIndex >= 0) {
      company.members[memberIndex].department = undefined;
      await company.save();
    }
    res.json({ message: 'Left' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};