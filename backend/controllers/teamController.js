import Team from '../models/Team.js';
import Company from '../models/Company.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createTeam = async (req, res) => {
  const { name, companyId, department, description, members } = req.body;
  if (!name || !companyId) return res.status(400).json({ message: 'name and companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can create teams' });
    const team = await Team.create({ name, company: company._id, department: department || undefined, description: description || '', members: members || [] });
    res.status(201).json(team);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listTeams = async (req, res) => {
  const { companyId, department } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const q = { company: companyId };
    if (department) q.department = department;
    const teams = await Team.find(q).sort({ name: 1 });
    res.json(teams);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const { role, error } = await ensureMember(team.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can update teams' });
    const { name, department, description, members } = req.body;
    if (name !== undefined) team.name = name;
    if (department !== undefined) team.department = department;
    if (description !== undefined) team.description = description;
    if (members !== undefined) team.members = members;
    const updated = await team.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const { role, error } = await ensureMember(team.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete teams' });
    await Team.deleteOne({ _id: team._id });
    res.json({ message: 'Team removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
