import crypto from 'crypto';
import Company from '../models/Company.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';

// Search companies by name, industry, or description
export const searchCompanies = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === '') return res.json([]);
  try {
    const regex = new RegExp(query, 'i');
    const companies = await Company.find({
      $or: [
        { name: regex },
        { industry: regex },
        { description: regex }
      ]
    })
    .select('name description industry website')
    .limit(10)
    .sort({ createdAt: -1 });
    res.json(companies);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Create a company and make current user owner
export const createCompany = async (req, res) => {
  const { name, description, website, mission, vision, industry, departments } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const existing = await Company.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Company name already taken' });
    const company = await Company.create({
      name,
      description: description || '',
      website: website || '',
      mission: mission || '',
      vision: vision || '',
      industry: industry || '',
      departments: departments || [],
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    // Update user's companies array and set as default company
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.companies.includes(company._id)) {
        user.companies.push(company._id);
      }
      user.defaultCompany = company._id;
      await user.save();
    }

    res.status(201).json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// List companies user belongs to
export const myCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ 'members.user': req.user._id }).sort({ createdAt: -1 });
    res.json(companies);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get company details if member
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'firstName lastName email profilePic mobileNumber')
      .populate('members.user', 'firstName lastName email profilePic mobileNumber');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    // Check if user is the owner OR a member
    const isOwner = company.owner?._id?.toString() === req.user._id?.toString();
    const role = company.getMemberRole(req.user._id);
    
    if (!isOwner && !role) {
      return res.status(403).json({ message: 'Not a member of this company' });
    }
    
    res.json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Create invitation for email with role
export const createInvitation = async (req, res) => {
  const { role, department } = req.body;
  const companyId = req.params.companyId;
  if (!role) return res.status(400).json({ message: 'role is required' });
  if (!['manager', 'employee'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const inviterRole = company.getMemberRole(req.user._id);
    if (!inviterRole) return res.status(403).json({ message: 'Not a member' });
    if (!['owner', 'manager'].includes(inviterRole)) return res.status(403).json({ message: 'Insufficient role' });

    // Auto-add department to company if it doesn't exist
    if (department && department.trim() && !company.departments.includes(department.trim())) {
      company.departments.push(department.trim());
      await company.save();
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const invitation = await Invitation.create({ 
      company: companyId, 
      inviter: req.user._id, 
      email: '', // email is optional; invites are link-based
      role, 
      department: department || '',
      token, 
      expiresAt 
    });

    // Build a link that matches the frontend route (/invite/join) to avoid 404s when users click the copied link
    const appBaseUrl = process.env.APP_BASE_URL || req.get('origin') || '';
    const inviteLink = `${appBaseUrl}/invite/join?token=${token}`;
    res.status(201).json({ invitation, link: inviteLink });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Accept invitation by token; adds user to company
export const acceptInvitation = async (req, res) => {
  const { token, department } = req.body;
  if (!token) return res.status(400).json({ message: 'token is required' });
  try {
    const inv = await Invitation.findOne({ token });
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.status !== 'pending') return res.status(400).json({ message: 'Invitation not valid' });
    if (inv.expiresAt < new Date()) return res.status(400).json({ message: 'Invitation expired' });

    const company = await Company.findById(inv.company);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const already = company.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!already) {
      company.members.push({ 
        user: req.user._id, 
        role: inv.role,
        department: department || inv.department || ''
      });
    }

    // Update user's companies array
    const user = await User.findById(req.user._id);
    if (user && !user.companies.includes(company._id)) {
      user.companies.push(company._id);
      if (!user.defaultCompany) {
        user.defaultCompany = company._id; // Set as default if first company
      }
      await user.save();
    }

    await company.save();
    inv.status = 'accepted';
    inv.acceptedAt = new Date();
    inv.acceptedBy = req.user._id;
    await inv.save();
    res.json({ message: 'Joined company', companyId: company._id, role: inv.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get invitation details by token (for join page)
export const getInvitationDetails = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'token is required' });
  try {
    const inv = await Invitation.findOne({ token })
      .populate('company', 'name description industry departments')
      .populate('inviter', 'firstName lastName');
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.status !== 'pending') return res.status(400).json({ message: 'Invitation not valid' });
    if (inv.expiresAt < new Date()) return res.status(400).json({ message: 'Invitation expired' });
    res.json(inv);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get list of company members with roles
export const listMembers = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId).populate('members.user', 'firstName lastName email');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const role = company.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member' });
    res.json(company.members);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update member role — disabled to enforce invitation-only role assignment
export const updateMemberRole = async (req, res) => {
  return res.status(403).json({ message: 'Role changes are disabled. Use invitations to add members with the desired role.' });
};

// Remove a member from company (cannot remove owner)
export const removeMember = async (req, res) => {
  const { companyId, userId } = { companyId: req.params.companyId, userId: req.params.userId };
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const actorRole = company.getMemberRole(req.user._id);
    if (!actorRole) return res.status(403).json({ message: 'Not a member' });
    
    // Only owners can remove members, not managers
    if (actorRole !== 'owner') return res.status(403).json({ message: 'Only owners can remove members' });
    
    const target = company.members.find((x) => x.user.toString() === userId);
    if (!target) return res.status(404).json({ message: 'Member not found' });
    if (target.role === 'owner') return res.status(400).json({ message: 'Owner cannot be removed' });
    company.members = company.members.filter((x) => x.user.toString() !== userId);
    await company.save();
    res.json({ message: 'Member removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get my role in a company
export const myRole = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const role = company.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this company' });
    res.json({ role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Public endpoint: Accept invitation and join company after signup
// This is for new users signing up via invitation link
export const acceptInvitationPublic = async (req, res) => {
  const { token, userId } = req.body; // userId is the newly created user's ID after signup
  if (!token || !userId) return res.status(400).json({ message: 'token and userId are required' });
  try {
    const inv = await Invitation.findOne({ token });
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.status !== 'pending') return res.status(400).json({ message: 'Invitation not valid' });
    if (inv.expiresAt < new Date()) return res.status(400).json({ message: 'Invitation expired' });

    const company = await Company.findById(inv.company);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add user to company members
    const already = company.members.find((m) => m.user.toString() === userId);
    if (!already) {
      company.members.push({ 
        user: userId, 
        role: inv.role,
        department: inv.department || ''
      });
    }

    // Update user's companies array
    if (!user.companies.includes(company._id)) {
      user.companies.push(company._id);
      user.defaultCompany = company._id; // Set as default for new user
      await user.save();
    }

    await company.save();
    inv.status = 'accepted';
    inv.acceptedAt = new Date();
    inv.acceptedBy = userId;
    await inv.save();

    res.json({ 
      message: 'Successfully joined company', 
      companyId: company._id, 
      role: inv.role,
      company: { _id: company._id, name: company.name }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get user's companies (all companies user belongs to)
export const getUserCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ 'members.user': req.user._id })
      .select('name description industry owner members');
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Map companies with user's role
    const companiesWithRole = companies.map(company => {
      const member = company.members.find(m => m.user.toString() === req.user._id.toString());
      return {
        _id: company._id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        owner: company.owner,
        role: member ? member.role : 'employee'
      };
    });

    res.json({
      companies: companiesWithRole,
      defaultCompany: user.defaultCompany
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Switch user's default company
export const switchCompany = async (req, res) => {
  const { companyId } = req.body;
  if (!companyId) return res.status(400).json({ message: 'companyId is required' });
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify user belongs to this company
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const role = company.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this company' });

    user.defaultCompany = companyId;
    await user.save();
    
    res.json({ 
      message: 'Company switched successfully',
      defaultCompany: companyId,
      company: { _id: company._id, name: company.name }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete entire company (owner or super admin only)
export const deleteCompany = async (req, res) => {
  const { companyId } = req.params;
  const { confirmation } = req.body; // Require confirmation phrase
  
  if (!confirmation || confirmation !== 'DELETE MY COMPANY') {
    return res.status(400).json({ message: 'Confirmation phrase required: "DELETE MY COMPANY"' });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    // Import isSuperAdmin from superAdminController
    const { isSuperAdmin } = await import('./superAdminController.js');
    const superAdmin = await isSuperAdmin(req.user._id);
    
    const role = company.getMemberRole(req.user._id);
    const isOwner = role === 'owner';
    
    if (!isOwner && !superAdmin) {
      return res.status(403).json({ message: 'Only the company owner or super admin can delete the company' });
    }

    // Delete all related data
    const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
    const Project = req.app.locals.Project || (await import('../models/Project.js')).default;
    const Department = req.app.locals.Department || (await import('../models/Department.js')).default;
    const Team = req.app.locals.Team || (await import('../models/Team.js')).default;
    const Channel = req.app.locals.Channel || (await import('../models/Channel.js')).default;
    const Group = req.app.locals.Group || (await import('../models/Group.js')).default;
    const Announcement = req.app.locals.Announcement || (await import('../models/Announcement.js')).default;

    await Promise.all([
      Task.deleteMany({ company: companyId }),
      Project.deleteMany({ company: companyId }),
      Department.deleteMany({ company: companyId }),
      Team.deleteMany({ company: companyId }),
      Channel.deleteMany({ company: companyId }),
      Group.deleteMany({ company: companyId }),
      Announcement.deleteMany({ company: companyId }),
      Invitation.deleteMany({ company: companyId }),
    ]);

    // Remove company from all users
    await User.updateMany(
      { companies: companyId },
      { 
        $pull: { companies: companyId },
        $unset: { defaultCompany: companyId }
      }
    );

    // Delete the company
    await Company.deleteOne({ _id: companyId });

    res.json({ message: 'Company and all related data deleted successfully' });
  } catch (e) {
    console.error('Company deletion error:', e);
    res.status(500).json({ message: e.message });
  }
};
