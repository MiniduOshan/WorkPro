import Group from '../models/Group.js';
import Company from '../models/Company.js';
import Channel from '../models/Channel.js';

/**
 * Utility: Verifies if user belongs to company and returns their role
 */
const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  
  // Find member in the company members array
  const memberEntry = company.members.find(m => 
    (m.user?._id || m.user).toString() === userId.toString()
  );
  
  if (!memberEntry) return { error: 'Not a member of this company' };
  return { company, role: memberEntry.role };
};

export const createGroup = async (req, res) => {
  const { name, companyId, description, members } = req.body;
  try {
    const { role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    if (!['owner', 'manager'].includes(role)) {
      return res.status(403).json({ message: 'Permission denied: Only owners/managers can create groups' });
    }

    const finalMembers = members && members.length > 0 ? members : [req.user._id];
    const group = await Group.create({ 
      name, 
      company: companyId, 
      description: description || '', 
      members: finalMembers 
    });
    
    // Create linked Chat Channel
    try {
      const channelName = `#${name.toLowerCase().replace(/\s+/g, '-')}`;
      await Channel.create({
        name: channelName,
        company: companyId,
        type: 'public',
        members: finalMembers,
        group: group._id
      });
    } catch (err) { console.log('Channel sync skipped'); }
    
    res.status(201).json(group);
  } catch (e) { 
    if (e.code === 11000) return res.status(400).json({ message: 'A group with this name already exists in this company' });
    res.status(500).json({ message: e.message }); 
  }
};

export const listGroups = async (req, res) => {
  const { companyId } = req.query;
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const groups = await Group.find({ company: companyId })
      .populate('members', 'firstName lastName email _id')
      .sort({ name: 1 });

    const Task = req.app.locals.Task || (await import('../models/Task.js')).default;

    const groupsWithStats = await Promise.all(groups.map(async (group) => {
      const tasks = await Task.find({ group: group._id });
      const completed = tasks.filter(t => t.status === 'done').length;
      return { 
        ...group.toObject(), 
        progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0 
      };
    }));
    res.json(groupsWithStats);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'firstName lastName email _id');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const { error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
    const tasks = await Task.find({ group: group._id });
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'doing').length,
      todo: tasks.filter(t => t.status === 'to-do' || t.status === 'pending').length
    };
    
    res.json({ 
      ...group.toObject(), 
      taskStats: { ...stats, progress: tasks.length > 0 ? Math.round((stats.completed / tasks.length) * 100) : 0 } 
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group.members.includes(req.user._id)) return res.status(400).json({ message: 'Already a member' });
    
    group.members.push(req.user._id);
    await group.save();
    
    await Channel.findOneAndUpdate({ group: group._id }, { $addToSet: { members: req.user._id } });
    res.json({ message: 'Joined successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();
    
    await Channel.findOneAndUpdate({ group: group._id }, { $pull: { members: req.user._id } });
    res.json({ message: 'Left successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    const { role } = await ensureMember(group.company, req.user._id);
    
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Action restricted to managers' });

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    await Channel.findOneAndUpdate({ group: group._id }, { $pull: { members: userId } });
    res.json({ message: 'Member removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const { role } = await ensureMember(group.company, req.user._id);
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Unauthorized' });
    
    await Group.deleteOne({ _id: group._id });
    await Channel.deleteOne({ group: group._id });
    res.json({ message: 'Group deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};