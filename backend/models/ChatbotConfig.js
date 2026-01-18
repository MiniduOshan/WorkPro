import mongoose from 'mongoose';

const ChatbotConfigSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['landing', 'manager', 'employee'], 
      required: true,
      unique: true 
    },
    greeting: { 
      type: String, 
      default: 'Hi! How can I help you today?' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    responses: [
      {
        keywords: [String], // Keywords that trigger this response
        response: { type: String, required: true },
        priority: { type: Number, default: 0 }, // Higher priority matches first
      }
    ],
    fallbackResponse: { 
      type: String, 
      default: 'I\'m not sure about that. Can you try rephrasing your question?' 
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
  },
  { timestamps: true }
);

const ChatbotConfig = mongoose.model('ChatbotConfig', ChatbotConfigSchema);
export default ChatbotConfig;
