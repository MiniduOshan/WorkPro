import Announcement from '../models/Announcement.js';
import Company from '../models/Company.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createAnnouncement = async (req, res) => {
  const { companyId, title, message, department, audience, priority, pinned } = req.body;
  if (!companyId || !title || !message) return res.status(400).json({ message: 'companyId, title and message required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can post announcements' });
    const ann = await Announcement.create({ company: company._id, title, message, createdBy: req.user._id, department: department || undefined, audience: audience || 'all', priority: priority || 'normal', pinned: !!pinned });
    res.status(201).json(ann);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAnnouncements = async (req, res) => {
  const { companyId, department } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const q = { company: companyId };
    if (department) q.department = department;
    const anns = await Announcement.find(q).sort({ pinned: -1, createdAt: -1 }).limit(50).populate('createdBy', 'firstName lastName');
    res.json(anns);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id).populate('createdBy', 'firstName lastName');
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    const { error } = await ensureMember(ann.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    res.json(ann);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    const { role, error } = await ensureMember(ann.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete announcements' });
    await Announcement.deleteOne({ _id: ann._id });
    res.json({ message: 'Announcement removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
