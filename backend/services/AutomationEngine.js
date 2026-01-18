import WorkflowRule from '../models/WorkflowRule.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

// Observer Pattern: AutomationEngine
class AutomationEngine {
  constructor() {
    this.observers = new Map();
  }

  // Subscribe to an event
  subscribe(event, callback) {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event).push(callback);
  }

  // Notify all observers of an event
  async notify(event, data) {
    const callbacks = this.observers.get(event) || [];
    for (const callback of callbacks) {
      try {
        await callback(data);
      } catch (error) {
        console.error(`Error in automation callback for ${event}:`, error);
      }
    }
  }

  // Check and execute workflow rules
  async checkRules(triggerEvent, taskData) {
    try {
      const rules = await WorkflowRule.find({
        company: taskData.company,
        triggerEvent,
        isActive: true,
      }).populate('actionData.userId', 'firstName lastName email');

      for (const rule of rules) {
        // Check if condition matches
        if (this.evaluateCondition(rule.condition, taskData)) {
          await this.executeAction(rule, taskData);
          
          // Update execution stats
          rule.executionCount += 1;
          rule.lastExecuted = new Date();
          await rule.save();
        }
      }
    } catch (error) {
      console.error('Error checking workflow rules:', error);
    }
  }

  // Evaluate condition
  evaluateCondition(condition, taskData) {
    if (!condition || !condition.field) return true;

    const fieldValue = taskData[condition.field];
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(conditionValue);
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return true;
    }
  }

  // Execute action based on rule
  async executeAction(rule, taskData) {
    try {
      const task = await Task.findById(taskData._id);
      if (!task) return;

      switch (rule.actionType) {
        case 'assign_to_user':
          if (rule.actionData.userId) {
            task.assignedTo = rule.actionData.userId;
            await task.save();
            console.log(`Task ${task._id} auto-assigned to ${rule.actionData.userId}`);
          }
          break;

        case 'change_priority':
          if (rule.actionData.priority) {
            task.priority = rule.actionData.priority;
            await task.save();
            console.log(`Task ${task._id} priority changed to ${rule.actionData.priority}`);
          }
          break;

        case 'change_status':
          if (rule.actionData.status) {
            task.status = rule.actionData.status;
            await task.save();
            console.log(`Task ${task._id} status changed to ${rule.actionData.status}`);
          }
          break;

        case 'add_comment':
          if (rule.actionData.message) {
            // Add comment to task (if you have comments functionality)
            console.log(`Comment added to task ${task._id}: ${rule.actionData.message}`);
          }
          break;

        case 'send_notification':
          // Implement notification logic here
          console.log(`Notification sent for task ${task._id}`);
          break;

        default:
          console.log(`Unknown action type: ${rule.actionType}`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }
}

// Create singleton instance
const automationEngine = new AutomationEngine();

// Setup default observers
automationEngine.subscribe('task_status_change', async (data) => {
  await automationEngine.checkRules('task_status_change', data);
});

automationEngine.subscribe('task_priority_change', async (data) => {
  await automationEngine.checkRules('task_priority_change', data);
});

automationEngine.subscribe('task_assigned', async (data) => {
  await automationEngine.checkRules('task_assigned', data);
});

automationEngine.subscribe('task_created', async (data) => {
  await automationEngine.checkRules('task_created', data);
});

export default automationEngine;
