import crypto from 'crypto';
import Company from '../models/Company.js';
import Invitation from '../models/Invitation.js';

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
    const company = await Company.findById(req.params.id).populate('owner', 'firstName lastName email');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const role = company.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this company' });
    res.json(company);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Create invitation for email with role
export const createInvitation = async (req, res) => {
  const { email, role, department } = req.body;
  const companyId = req.params.companyId;
  if (!email || !role) return res.status(400).json({ message: 'email and role are required' });
  if (!['manager', 'employee'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const inviterRole = company.getMemberRole(req.user._id);
    if (!inviterRole) return res.status(403).json({ message: 'Not a member' });
    if (!['owner', 'manager'].includes(inviterRole)) return res.status(403).json({ message: 'Insufficient role' });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const invitation = await Invitation.create({ 
      company: companyId, 
      inviter: req.user._id, 
      email, 
      role, 
      department: department || '',
      token, 
      expiresAt 
    });
    const inviteLink = `${process.env.APP_BASE_URL || ''}/invite/accept?token=${token}`;
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

    await company.save();
    inv.status = 'accepted';
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

// Update a member's role (owner can set any; manager can set manager/employee)
export const updateMemberRole = async (req, res) => {
  const { companyId, userId } = { companyId: req.params.companyId, userId: req.params.userId };
  const { role: newRole } = req.body;
  if (!['owner', 'manager', 'employee'].includes(newRole)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const actorRole = company.getMemberRole(req.user._id);
    if (!actorRole) return res.status(403).json({ message: 'Not a member' });
    if (actorRole !== 'owner' && newRole === 'owner') return res.status(403).json({ message: 'Only owner can assign owner role' });
    if (!['owner', 'manager'].includes(actorRole)) return res.status(403).json({ message: 'Insufficient role' });

    const m = company.members.find((x) => x.user.toString() === userId);
    if (!m) return res.status(404).json({ message: 'Member not found' });
    m.role = newRole;
    await company.save();
    res.json({ user: userId, role: newRole });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Remove a member from company (cannot remove owner)
export const removeMember = async (req, res) => {
  const { companyId, userId } = { companyId: req.params.companyId, userId: req.params.userId };
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const actorRole = company.getMemberRole(req.user._id);
    if (!actorRole) return res.status(403).json({ message: 'Not a member' });
    if (!['owner', 'manager'].includes(actorRole)) return res.status(403).json({ message: 'Insufficient role' });
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
