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
    const channels = await Channel.find({ company: companyId, members: req.user._id }).sort({ updatedAt: -1 });
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
    const channel = await Channel.findById(req.params.id).populate('messages.user', 'firstName lastName');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    const { error } = await ensureMember(channel.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const isMember = channel.members.map((m) => m.toString()).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a channel member' });
    res.json(channel.messages);
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
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete channels' });
    await Channel.deleteOne({ _id: channel._id });
    res.json({ message: 'Channel deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
