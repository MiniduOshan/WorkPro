import ChatbotConfig from '../models/ChatbotConfig.js';

// Get chatbot config by type (public endpoint for landing page)
export const getChatbotConfig = async (req, res) => {
  try {
    const { type } = req.params;
    
    let config = await ChatbotConfig.findOne({ type, isActive: true });
    
    // Create default config if none exists
    if (!config) {
      config = await ChatbotConfig.create({
        type,
        greeting: getDefaultGreeting(type),
        responses: getDefaultResponses(type),
        fallbackResponse: getDefaultFallback(type),
      });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chatbot configs (super admin only)
export const getAllChatbotConfigs = async (req, res) => {
  try {
    const configs = await ChatbotConfig.find().populate('updatedBy', 'firstName lastName email');
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update chatbot config (super admin only)
export const updateChatbotConfig = async (req, res) => {
  try {
    const { type } = req.params;
    const { greeting, responses, fallbackResponse, isActive } = req.body;
    
    let config = await ChatbotConfig.findOne({ type });
    
    if (!config) {
      config = new ChatbotConfig({ type });
    }
    
    if (greeting !== undefined) config.greeting = greeting;
    if (responses !== undefined) config.responses = responses;
    if (fallbackResponse !== undefined) config.fallbackResponse = fallbackResponse;
    if (isActive !== undefined) config.isActive = isActive;
    config.updatedBy = req.user._id;
    
    await config.save();
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete chatbot config (super admin only)
export const deleteChatbotConfig = async (req, res) => {
  try {
    const { type } = req.params;
    await ChatbotConfig.deleteOne({ type });
    res.json({ message: 'Chatbot config deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for default content
function getDefaultGreeting(type) {
  switch (type) {
    case 'landing':
      return 'Hi! I\'m WorkPro Assistant. Ask me anything about our platform!';
    case 'manager':
      return 'Hi! I\'m WorkPro. Ask me about your tasks or company updates.';
    case 'employee':
      return 'Hi! I\'m WorkPro. Ask me about your tasks or company updates.';
    default:
      return 'Hi! How can I help you today?';
  }
}

function getDefaultResponses(type) {
  if (type === 'landing') {
    return [
      {
        keywords: ['price', 'pricing', 'cost', 'payment', 'plan'],
        response: 'WorkPro offers flexible pricing plans starting at $10/user/month. Visit our pricing page or contact sales for enterprise options!',
        priority: 10
      },
      {
        keywords: ['feature', 'what can', 'capabilities', 'functions'],
        response: 'WorkPro provides task management, team collaboration, real-time chat, document sharing, and AI-powered insights. Everything you need to manage your team!',
        priority: 9
      },
      {
        keywords: ['demo', 'try', 'trial', 'test'],
        response: 'Yes! Sign up for a 14-day free trial - no credit card required. Click "Get Started" to create your account.',
        priority: 10
      },
      {
        keywords: ['security', 'safe', 'secure', 'encryption'],
        response: 'WorkPro uses bank-level encryption, regular security audits, and is SOC 2 compliant. Your data is always safe with us.',
        priority: 8
      },
      {
        keywords: ['team', 'users', 'size', 'how many'],
        response: 'WorkPro scales from small teams (5 users) to large enterprises (10,000+ users). Perfect for any team size!',
        priority: 7
      },
      {
        keywords: ['integration', 'connect', 'api', 'integrate'],
        response: 'WorkPro integrates with Slack, Google Workspace, Microsoft Teams, Zoom, and many more tools via our API and Zapier.',
        priority: 8
      },
      {
        keywords: ['support', 'help', 'contact', 'assistance'],
        response: 'We offer 24/7 email support, live chat (business hours), and dedicated account managers for enterprise plans. Contact us at support@workpro.io',
        priority: 7
      },
    ];
  }
  return [];
}

function getDefaultFallback(type) {
  if (type === 'landing') {
    return 'Great question! WorkPro is a comprehensive team management platform. Would you like to know about our features, pricing, or schedule a demo?';
  }
  return 'I\'m not sure about that. Can you try rephrasing your question?';
}
