import React, { useState } from 'react';
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoSend } from 'react-icons/io5';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Sending...');

        // --- Simulated Submission ---
        // In a real application, you would make an API call here (e.g., axios.post('/api/contact', formData))
        setTimeout(() => {
            console.log("Contact form submitted:", formData);
            setStatus('Message Sent Successfully!');
            setFormData({ name: '', email: '', message: '' }); // Clear form
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <header className="text-center mb-10">
                <IoMailOutline className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                <h1 className="text-4xl font-extrabold text-gray-800">Get In Touch</h1>
                <p className="text-gray-500 mt-2">We'd love to hear from you. Send us a message!</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Contact Form */}
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea 
                                name="message" 
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                            disabled={status === 'Sending...'}
                        >
                            <IoSend className="w-5 h-5" />
                            <span>{status || 'Send Message'}</span>
                        </button>
                        
                        {status === 'Message Sent Successfully!' && (
                            <p className="text-green-600 text-center font-medium mt-2">Thank you for contacting us!</p>
                        )}
                    </form>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner flex flex-col justify-center space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Contact Details</h2>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                        <IoMailOutline className="w-6 h-6 text-primary-500" />
                        <span className="font-medium">miniduoshan23@gmail.com</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                        <IoCallOutline className="w-6 h-6 text-primary-500" />
                        <span className="font-medium">+94762288794</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                        <IoLocationOutline className="w-6 h-6 text-primary-500" />
                        <span className="font-medium">Homagama, Sri Lanka</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;