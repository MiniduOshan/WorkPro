import Task from '../models/Task.js';
import Announcement from '../models/Announcement.js';
import Channel from '../models/Channel.js';
import { generateAIResponse } from '../services/aiService.js';

// Aggregate daily data for AI summary
export const getDailySummaryData = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get tasks completed in last 24 hours
    const tasksCompleted = await Task.find({
      company: companyId,
      status: 'done',
      updatedAt: { $gte: yesterday },
    }).populate('assignee', 'firstName lastName');

    // Get new announcements
    const announcements = await Announcement.find({
      company: companyId,
      createdAt: { $gte: yesterday },
    }).populate('createdBy', 'firstName lastName');

    // Get channel activity (recent messages)
    const channels = await Channel.find({
      company: companyId,
      'messages.createdAt': { $gte: yesterday },
    }).populate('messages.sender', 'firstName lastName');

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { company: companyId, status: { $ne: 'done' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      company: companyId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    const summaryData = {
      period: '24 hours',
      tasksCompleted: tasksCompleted.length,
      tasksCompletedDetails: tasksCompleted.slice(0, 10).map((t) => ({
        title: t.title,
        assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned',
      })),
      announcements: announcements.length,
      announcementTitles: announcements.map((a) => a.title),
      channelActivity: channels.length,
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      overdueTasks,
    };

    res.json(summaryData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate AI summary (placeholder - requires OpenAI API key)
export const generateAISummary = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Get summary data
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const tasksCompleted = await Task.find({
      company: companyId,
      status: 'done',
      updatedAt: { $gte: yesterday },
    }).populate('assignee', 'firstName lastName');

    const announcements = await Announcement.find({
      company: companyId,
      createdAt: { $gte: yesterday },
    });

    const overdueTasks = await Task.countDocuments({
      company: companyId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    const activeTasks = await Task.countDocuments({
      company: companyId,
      status: { $in: ['to-do', 'in-progress', 'blocked'] },
    });

    // Build text summary for AI
    const summaryText = `
Daily Company Summary:
- Tasks completed: ${tasksCompleted.length}
- Active tasks: ${activeTasks}
- Overdue tasks: ${overdueTasks}
- New announcements: ${announcements.length}

Recent completions:
${tasksCompleted.slice(0, 5).map((t) => `- ${t.title}`).join('\n')}

Announcements:
${announcements.map((a) => `- ${a.title}`).join('\n')}
    `.trim();

    const aiResult = await generateAIResponse(
      'You are an executive assistant providing concise, friendly daily pulse summaries for a company. Mention the numbers given and highlight risk areas briefly.',
      `Generate an executive summary based on this data:\n\n${summaryText}`,
      {
        maxTokens: 220,
        fallback: `Daily Pulse Summary\n\nTasks completed: ${tasksCompleted.length}\nActive tasks: ${activeTasks}\nOverdue: ${overdueTasks}\nAnnouncements: ${announcements.length}`,
      }
    );

    const aiSummary = aiResult.content;

    res.json({
      summary: aiSummary,
      generatedAt: new Date(),
      rawData: {
        tasksCompleted: tasksCompleted.length,
        activeTasks,
        overdueTasks,
        announcements: announcements.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate a breakdown of subtasks for a task title
export const breakdownTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const aiResult = await generateAIResponse(
      'You are a project manager who breaks work into clear, action-oriented subtasks. Provide 5-7 short items with verbs up front.',
      `Create subtasks for: ${title}. Return as a simple list.`,
      { maxTokens: 180, fallback: 'Define requirements;Identify owners;Draft plan;Execute tasks;Review and close' }
    );

    const lines = aiResult.content
      .split(/\n|\r/)
      .map((l) => l.replace(/^[-*\d\.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 7);

    const subtasks = lines.length
      ? lines
      : ['Clarify goal', 'Identify dependencies', 'Draft timeline', 'Assign owners', 'Review deliverables'];

    res.json({ subtasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager-focused executive summary using last 24h activity
export const progressSummary = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

    const since = new Date();
    since.setDate(since.getDate() - 1);

    const [completed, started, blocked, announcements] = await Promise.all([
      Task.find({ company: companyId, status: 'done', updatedAt: { $gte: since } }).select('title assignee').populate('assignee', 'firstName lastName'),
      Task.find({ company: companyId, status: 'in-progress', updatedAt: { $gte: since } }).select('title assignee').populate('assignee', 'firstName lastName'),
      Task.find({ company: companyId, status: 'blocked', updatedAt: { $gte: since } }).select('title assignee blockerReason').populate('assignee', 'firstName lastName'),
      Announcement.find({ company: companyId, createdAt: { $gte: since } }).select('title'),
    ]);

    const summaryText = `Last 24h updates for company ${companyId}.
Completed: ${completed.length} -> ${completed.slice(0, 5).map((t) => t.title).join('; ') || 'none'}
Started: ${started.length} -> ${started.slice(0, 5).map((t) => t.title).join('; ') || 'none'}
Blocked: ${blocked.length} -> ${blocked.slice(0, 5).map((t) => t.title).join('; ') || 'none'}
Announcements: ${announcements.length}`;

    const aiResult = await generateAIResponse(
      'You are a chief-of-staff style assistant. Produce a crisp executive summary (3-5 bullet sentences) with tone: calm, directive, concise. Call out risks and wins.',
      summaryText,
      {
        maxTokens: 260,
        fallback: `Updates: Completed ${completed.length}, In-progress ${started.length}, Blocked ${blocked.length}, Announcements ${announcements.length}.`,
      }
    );

    res.json({ summary: aiResult.content, generatedAt: new Date() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
