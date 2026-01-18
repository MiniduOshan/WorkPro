import Task from '../models/Task.js';
import Announcement from '../models/Announcement.js';
import Channel from '../models/Channel.js';

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
    }).populate('assignedTo', 'firstName lastName');

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
        assignee: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned',
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
    }).populate('assignedTo', 'firstName lastName');

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
      status: { $in: ['todo', 'inProgress', 'review'] },
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

    /* 
    // Uncomment this when you have OpenAI API key
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an executive assistant providing daily pulse summaries for a company. Be concise, professional, and highlight key metrics and achievements."
        },
        {
          role: "user",
          content: `Generate an executive summary based on this data:\n\n${summaryText}`
        }
      ],
      max_tokens: 200
    });
    
    const aiSummary = completion.choices[0].message.content;
    */

    // Mock AI response for now
    const aiSummary = `📊 Daily Pulse Summary

Your team completed ${tasksCompleted.length} tasks in the last 24 hours, showing strong productivity. You currently have ${activeTasks} active tasks in progress.

${overdueTasks > 0 ? `⚠️ Attention needed: ${overdueTasks} tasks are overdue and require immediate action.` : '✅ Great news: No overdue tasks!'}

${announcements.length > 0 ? `📢 ${announcements.length} new announcements were published to keep the team informed.` : ''}

${tasksCompleted.length > 10 ? '🎉 Exceptional productivity today!' : tasksCompleted.length > 5 ? '👍 Solid progress made today.' : '💪 Keep pushing forward!'}`;

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
