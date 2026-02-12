import React, { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is WorkPro?',
      answer: 'WorkPro is a comprehensive project management and team collaboration platform designed to streamline your workflow. It combines task management, team communication, document sharing, and analytics in one unified system.'
    },
    {
      question: 'How do I get started?',
      answer: 'Getting started is simple! Sign up for a free account, create your company workspace, invite your team members, and start creating projects and tasks. Our intuitive interface requires no training.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required to get started. You can explore all features and decide which plan works best for your team.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we\'ll prorate any differences.'
    },
    {
      question: 'How many team members can I add?',
      answer: 'The number of team members depends on your plan. Our basic plan includes up to 10 users, while our Pro and Enterprise plans offer unlimited team members.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, security is our top priority. We use industry-standard encryption (SSL/TLS) for data transmission and storage. All data is backed up regularly, and we comply with GDPR and other data protection regulations.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export your projects, tasks, and other data at any time. We provide export options in multiple formats including CSV, Excel, and JSON.'
    },
    {
      question: 'Do you offer integrations?',
      answer: 'Yes, WorkPro integrates with popular tools like Slack, Google Drive, Microsoft Teams, and more. We\'re constantly adding new integrations based on user feedback.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for enterprise customers.'
    },
    {
      question: 'What happens if I cancel my subscription?',
      answer: 'You can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period. Your data will be available for export for 30 days after cancellation.'
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! We offer up to 20% discount for annual subscriptions. Contact our sales team for more information about annual billing and enterprise pricing.'
    },
    {
      question: 'Can I customize the platform for my needs?',
      answer: 'Yes, WorkPro offers extensive customization options including custom fields, workflows, templates, and branding. Enterprise plans include advanced customization and dedicated support.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-blue-100">
            Find answers to common questions about WorkPro
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <IoChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <IoChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
