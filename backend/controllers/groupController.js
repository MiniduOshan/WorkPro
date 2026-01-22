import Group from '../models/Group.js';
import Company from '../models/Company.js';
import Channel from '../models/Channel.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createGroup = async (req, res) => {
  const { name, companyId, description, members } = req.body;
  if (!name || !companyId) return res.status(400).json({ message: 'name and companyId required' });
  
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can create groups' });
    
    // FIX: Ensure the creator is added if members array is empty or undefined
    const finalMembers = members && members.length > 0 ? members : [req.user._id];

    const group = await Group.create({ 
      name, 
      company: company._id, 
      description: description || '', 
      members: finalMembers 
    });
    
    try {
      const channelName = `#${name.toLowerCase().replace(/\s+/g, '-')}`;
      await Channel.create({
        name: channelName,
        company: company._id,
        type: 'public',
        members: finalMembers,
        group: group._id
      });
    } catch (channelErr) {
      console.log('Channel creation failed:', channelErr.message);
    }
    
    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listGroups = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const groups = await Group.find({ company: companyId })
      .populate({ path: 'members', select: 'firstName lastName email _id' })
      .sort({ name: 1 });
    
    const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
    const groupsWithStats = await Promise.all(groups.map(async (group) => {
      const tasks = await Task.find({ group: group._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...group.toObject(),
        taskCount: totalTasks,
        progress
      };
    }));
    
    res.json(groupsWithStats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate({
      path: 'members',
      select: 'firstName lastName email _id'
    });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const { error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
    const tasks = await Task.find({ group: group._id });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
    const todoTasks = tasks.filter(t => t.status === 'to-do').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      ...group.toObject(),
      taskStats: { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, cancelled: cancelledTasks, todo: todoTasks, progress }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { role, error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can update groups' });
    
    const { name, description, members } = req.body;
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (members !== undefined) group.members = members;
    
    const updated = await group.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { role, error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete groups' });
    
    await Group.deleteOne({ _id: group._id });
    res.json({ message: 'Group removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const { role, error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can add members' });
    
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    
    const updated = await group.populate('members', 'firstName lastName email _id');
    res.json({ message: 'Member added', group: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const { role, error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can remove members' });
    
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    
    const updated = await group.populate('members', 'firstName lastName email _id');
    res.json({ message: 'Member removed', group: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { error } = await ensureMember(group.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    if (group.members.includes(req.user._id)) return res.status(400).json({ message: 'Already a member' });
    
    group.members.push(req.user._id);
    await group.save();
    const updated = await group.populate('members', 'firstName lastName email _id');
    res.json({ message: 'Joined', group: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();
    const updated = await group.populate('members', 'firstName lastName email _id');
    res.json({ message: 'Left', group: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};