import Project from '../models/Project.js';
import Company from '../models/Company.js';

const ensureManager = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  if (!['owner', 'manager'].includes(role)) return { error: 'Only managers can manage projects' };
  return { company };
};

export const createProject = async (req, res) => {
  const { name, description, companyId } = req.body;
  if (!name || !companyId) return res.status(400).json({ message: 'name and companyId required' });
  try {
    const { company, error } = await ensureManager(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const project = await Project.create({ name, description: description || '', company: company._id, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listProjects = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const role = company.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this company' });
    const projects = await Project.find({ company: companyId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { error } = await ensureManager(project.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const { name, description, status } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    const updated = await project.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { error } = await ensureManager(project.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
