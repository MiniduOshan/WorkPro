import Task from '../models/Task.js';
import Company from '../models/Company.js';
import automationEngine from '../services/AutomationEngine.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createTask = async (req, res) => {
  const { title, description, companyId, project, assignee, status, priority, dueDate, category, team, group, department, checklist } = req.body;
  if (!title || !companyId) return res.status(400).json({ message: 'title and companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role) && assignee && assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only managers can assign to others' });
    }
    const task = await Task.create({
      title,
      description: description || '',
      company: company._id,
      project: project || undefined,
      createdBy: req.user._id,
      assignee: assignee || undefined,
      status: status || 'to-do',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      category: category || '',
      team: team || undefined,
      group: group || undefined,
      department: department || '',
        checklist: Array.isArray(checklist)
          ? checklist.map((item) => ({ title: item.title || item, done: !!item.done }))
          : [],
    });
    
      // Trigger automation for task creation
      await automationEngine.notify('task_created', task.toObject());
    
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listTasks = async (req, res) => {
  const { companyId, project, assignee, team, group, department, status } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const q = { company: companyId };
    if (project) q.project = project;
    if (assignee) q.assignee = assignee;
    if (team) q.team = team;
    if (group) q.group = group;
    if (department) q.department = department;
    if (status) q.status = status;
    const tasks = await Task.find(q)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { error } = await ensureMember(task.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { role, error } = await ensureMember(task.company, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const isAssignee = task.assignee?.toString() === req.user._id.toString();
    const canManage = ['owner', 'manager'].includes(role);

    // Assignee can update status; managers can update anything
    const { title, description, status, priority, dueDate, category, assignee, team, group, department, checklist } = req.body;

    // Track changes for automation triggers
    const oldStatus = task.status;
    const oldPriority = task.priority;
    const oldAssignee = task.assignee?.toString();

    if (canManage) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (category !== undefined) task.category = category;
      if (assignee !== undefined) task.assignee = assignee;
      if (team !== undefined) task.team = team;
      if (group !== undefined) task.group = group;
      if (department !== undefined) task.department = department;
      if (checklist !== undefined && Array.isArray(checklist)) {
        task.checklist = checklist.map((item) => ({ title: item.title || item, done: !!item.done }));
      }
    }
    if (status !== undefined) {
      if (!isAssignee && !canManage) return res.status(403).json({ message: 'Only assignee or manager can change status' });
      task.status = status;
    }

    const updated = await task.save();

    // Trigger automations based on changes
    if (status !== undefined && status !== oldStatus) {
      await automationEngine.notify('task_status_change', updated.toObject());
    }
    if (priority !== undefined && priority !== oldPriority) {
      await automationEngine.notify('task_priority_change', updated.toObject());
    }
    if (assignee !== undefined && assignee?.toString() !== oldAssignee) {
      await automationEngine.notify('task_assigned', updated.toObject());
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { role, error } = await ensureMember(task.company, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can delete tasks' });
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
