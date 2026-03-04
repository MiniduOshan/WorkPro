import Task from '../models/Task.js';
import Company from '../models/Company.js';

const ensureMember = async (companyId, userId) => {
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const createTask = async (req, res) => {
  const { title, description, companyId, project, assignee, status, priority, dueDate, category, group, department, checklist, visibility } = req.body;
  if (!title || !companyId) return res.status(400).json({ message: 'title and companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    let finalAssignee = assignee;
    let finalVisibility = visibility || 'public';

    // Employees can only create tasks for themselves, and they must be private
    if (role === 'employee') {
      finalAssignee = req.user._id;
      finalVisibility = 'private';
    } else {
      // Managers/Owners logic
      if (!['owner', 'manager'].includes(role) && assignee && assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only managers can assign to others' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      company: company._id,
      project: project || undefined,
      createdBy: req.user._id,
      assignee: finalAssignee || undefined,
      status: status || 'to-do',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      category: category || '',
      group: group || undefined,
      department: department || undefined,
      visibility: finalVisibility,
      checklist: Array.isArray(checklist)
        ? checklist.map((item) => ({ title: item.title || item, done: !!item.done }))
        : [],
    });

    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listTasks = async (req, res) => {
  const { companyId, project, assignee, group, department, status } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const q = { company: companyId };
    if (project) q.project = project;
    if (assignee) q.assignee = assignee;
    if (group) q.group = group;
    if (department) q.department = department;
    if (status) q.status = status;

    if (status) q.status = status;

    // Visibility filtering
    // Managers/Owners can see everything? NO.
    // Requirement: "that task doent apear to anyone only for him who make that task"
    // So even for managers, if another manager makes a private task for themselves, I should probably respect that?
    // Let's stick to the core requirement: Private means visible to CREATOR and ASSIGNEE only.

    // However, if I am a manager, maybe I want to see all tasks?
    // User said: "option for owner and manger to select that task they assign direct to emplyee or manager it need to be visible to others or not option"
    // Implies strict visibility rules.

    q.$or = [
      { visibility: 'public' }, // Public tasks are visible to everyone in the company (subject to other filters like department if applied elsewhere, but here code says "Employees can see all company tasks")
      {
        visibility: 'private',
        $or: [
          { createdBy: req.user._id },
          { assignee: req.user._id }
        ]
      }
    ];

    // If I am an owner, do I see everything? 
    // "only for him who make that task" -> sounds strict. 
    // But usually Owners supersede. 
    // Let's stick to: Public = All, Private = Creator/Assignee.


    const tasks = await Task.find(q)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('department', 'name')
      .populate('group', 'name') // ensure group name is available in task views
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('department', 'name')
      .populate('group', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check visibility
    if (task.visibility === 'private') {
      const isCreator = task.createdBy._id.toString() === req.user._id.toString();
      const isAssignee = task.assignee?._id.toString() === req.user._id.toString();
      if (!isCreator && !isAssignee) {
        return res.status(403).json({ message: 'Access denied to private task' });
      }
    }

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
    const { company, role, error } = await ensureMember(task.company, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const isAssignee = task.assignee?.toString() === req.user._id.toString();
    const canManage = ['owner', 'manager'].includes(role);

    // Assignee can update status; managers can update anything
    const { title, description, status, priority, dueDate, category, assignee, group, department, checklist } = req.body;

    const oldStatus = task.status;
    const oldPriority = task.priority;
    const oldAssignee = task.assignee?.toString();

    // Handle status update separately - allow managers and assignees to update status
    if (status !== undefined) {
      if (!isAssignee && !canManage && task.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only assignee, creator, or manager can change status' });
      }
      task.status = status;
    }

    if (canManage) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (category !== undefined) task.category = category;
      if (assignee !== undefined) task.assignee = assignee;
      if (group !== undefined) task.group = group;
      if (department !== undefined) task.department = department;
      if (checklist !== undefined && Array.isArray(checklist)) {
        task.checklist = checklist.map((item) => ({ title: item.title || item, done: !!item.done }));
      }
      if (checklist !== undefined && Array.isArray(checklist)) {
        task.checklist = checklist.map((item) => ({ title: item.title || item, done: !!item.done }));
      }
      if (req.body.visibility) task.visibility = req.body.visibility;
    } else if (task.createdBy.toString() === req.user._id.toString()) {
      // Creator (e.g. Employee self-task) can edit their own task completely
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (category !== undefined) task.category = category;
      // Employee cannot reassign self-task to others? "assignee" check prevents modification unless manager
      // But if they created it, and they want to assign to someone else?
      // "add employee to add task for him self" -> implies self-assignment.
      // If they want to assign to someone else, they usually can't unless they are manager.
      // So we keep assignee locked for employees.

      if (checklist !== undefined && Array.isArray(checklist)) {
        task.checklist = checklist.map((item) => ({ title: item.title || item, done: !!item.done }));
      }
    } else if (role === 'employee' && isAssignee && assignee !== undefined && assignee !== task.assignee?.toString()) {
      // Employee trying to reassign - check if same department
      const currentUserMember = company.members.find(m => m.user.toString() === req.user._id.toString());
      const targetMember = company.members.find(m => m.user.toString() === assignee);

      if (!currentUserMember || !targetMember) {
        return res.status(403).json({ message: 'Invalid reassignment' });
      }

      if (currentUserMember.department !== targetMember.department) {
        return res.status(403).json({ message: 'Can only reassign to employees in your department' });
      }

      // Create pending reassignment request
      task.pendingReassignment = {
        newAssignee: assignee,
        requestedBy: req.user._id,
        requestedAt: new Date(),
        reason: req.body.reassignReason || 'Employee requested reassignment'
      };
    }

    const updated = await task.save();
    const populated = await Task.findById(updated._id)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('department', 'name')
      .populate('pendingReassignment.newAssignee', 'firstName lastName email')
      .populate('pendingReassignment.requestedBy', 'firstName lastName email');
    res.json(populated);
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
    if (!['owner', 'manager'].includes(role) && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only managers or creator can delete tasks' });
    }
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


