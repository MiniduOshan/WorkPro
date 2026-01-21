import Channel from '../models/Channel.js';
import Company from '../models/Company.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createChannel = async (req, res) => {
  const { name, companyId, members } = req.body;
  if (!name || !companyId) return res.status(400).json({ message: 'name and companyId required' });
  try {
    const { role, company, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can create channels' });
    const channel = await Channel.create({ name, company: company._id, members: members?.length ? members : [req.user._id] });
    res.status(201).json(channel);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listChannels = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    // Show all public channels and private channels where user is a member
    const channels = await Channel.find({ 
      company: companyId,
      $or: [
        { type: 'public' },
        { members: req.user._id }
      ]
    }).sort({ updatedAt: -1 });
    res.json(channels);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const isMember = channel.members.map((m) => m.toString()).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a channel member' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text required' });
    channel.messages.push({ user: req.user._id, text });
    await channel.save();
    res.status(201).json(channel.messages[channel.messages.length - 1]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listMessages = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('members', 'firstName lastName email')
      .populate('messages.user', 'firstName lastName email')
      .populate('joinRequests.user', 'firstName lastName email');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const isMember = channel.members.map((m) => m._id ? m._id.toString() : m.toString()).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a channel member' });
    res.json(channel);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { role, error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    // Allow channel creator or managers to delete
    const isMember = channel.members.map((m) => m.toString()).includes(req.user._id.toString());
    const isCreator = channel.members[0]?.toString() === req.user._id.toString();
    
    if (!['owner', 'manager'].includes(role) && !isCreator) {
      return res.status(403).json({ message: 'Only managers or channel creator can delete channels' });
    }
    
    await Channel.deleteOne({ _id: channel._id });
    res.json({ message: 'Channel deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Request to join a channel
export const requestJoinChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    const isMember = channel.members.some(m => m.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ message: 'Already a member' });
    
    const hasRequest = channel.joinRequests?.some(r => r.user.toString() === req.user._id.toString());
    if (hasRequest) return res.status(400).json({ message: 'Join request already pending' });
    
    if (!channel.joinRequests) channel.joinRequests = [];
    channel.joinRequests.push({ user: req.user._id, requestedAt: new Date() });
    await channel.save();
    
    res.json({ message: 'Join request submitted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Approve join request - only owner or company owner can approve
export const approveJoinRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error, role: companyRole } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    // Only owner or company owner/manager can approve
    const isChannelOwner = channel.members[0]?.toString() === req.user._id.toString();
    const isCompanyOwner = companyRole === 'owner';
    
    if (!isChannelOwner && !isCompanyOwner) {
      return res.status(403).json({ message: 'Only channel owner or company owner can approve join requests' });
    }
    
    // Remove from join requests and add to members
    channel.joinRequests = channel.joinRequests?.filter(r => r.user.toString() !== userId) || [];
    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
    }
    await channel.save();
    
    res.json({ message: 'Join request approved' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Reject join request - only owner or company owner can reject
export const rejectJoinRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error, role: companyRole } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    // Only owner or company owner/manager can reject
    const isChannelOwner = channel.members[0]?.toString() === req.user._id.toString();
    const isCompanyOwner = companyRole === 'owner';
    
    if (!isChannelOwner && !isCompanyOwner) {
      return res.status(403).json({ message: 'Only channel owner or company owner can reject join requests' });
    }
    
    channel.joinRequests = channel.joinRequests?.filter(r => r.user.toString() !== userId) || [];
    await channel.save();
    
    res.json({ message: 'Join request rejected' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Add member to channel (for channel members)
export const addMemberToChannel = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    const isMember = channel.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Only channel members can add others' });
    
    if (!channel.members.some(m => m.toString() === userId)) {
      channel.members.push(userId);
      await channel.save();
    }
    
    res.json({ message: 'Member added to channel' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Remove member from channel
export const removeMemberFromChannel = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    
    const isMember = channel.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Only channel members can remove others' });
    
    channel.members = channel.members.filter(m => m.toString() !== userId);
    await channel.save();
    
    res.json({ message: 'Member removed from channel' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
