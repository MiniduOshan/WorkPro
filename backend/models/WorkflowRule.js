import mongoose from 'mongoose';

const WorkflowRuleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    triggerEvent: {
      type: String,
      required: true,
      enum: ['task_status_change', 'task_priority_change', 'task_assigned', 'task_created', 'task_due_soon'],
    },
    condition: {
      // Condition to check before executing action
      field: { type: String }, // e.g., 'status', 'priority'
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'] },
      value: { type: String }, // e.g., 'review', 'high'
    },
    actionType: {
      type: String,
      required: true,
      enum: ['assign_to_user', 'change_priority', 'send_notification', 'add_comment', 'change_status'],
    },
    actionData: {
      // Data needed to perform the action
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
      status: { type: String, enum: ['todo', 'inProgress', 'review', 'done'] },
      message: { type: String },
      notificationType: { type: String },
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    lastExecuted: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup
WorkflowRuleSchema.index({ company: 1, triggerEvent: 1, isActive: 1 });

const WorkflowRule = mongoose.model('WorkflowRule', WorkflowRuleSchema);
export default WorkflowRule;
