import React, { useState } from 'react';
import { 
    IoMailOutline, 
    IoCallOutline, 
    IoLocationOutline, 
    IoSend, 
    IoCheckmarkCircleOutline, 
    IoArrowForwardOutline,
    IoChevronDownOutline
} from 'react-icons/io5';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('Message Sent Successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus(''), 4000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            {/* Header */}
            <header className="pt-24 pb-12 bg-slate-50 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <IoMailOutline className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Get In Touch</h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Have questions? We'd love to hear from you. Our team typically responds within 24 hours.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-16">
                        
                        {/* Info Column */}
                        <div className="lg:col-span-4 space-y-12">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h2>
                                <div className="space-y-8">
                                    <ContactInfoItem 
                                        icon={<IoMailOutline />} 
                                        title="Email" 
                                        detail="support@workpro.app" 
                                        sub="We respond within 24 hours"
                                    />
                                    <ContactInfoItem 
                                        icon={<IoCallOutline />} 
                                        title="Phone" 
                                        detail="+94 762 288 794" 
                                        sub="Mon-Fri, 9AM-6PM EST"
                                    />
                                    <ContactInfoItem 
                                        icon={<IoLocationOutline />} 
                                        title="Location" 
                                        detail="Homagama, Sri Lanka" 
                                        sub="Global Headquarters"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-100">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                                    </div>
                                    <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" />
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                        <textarea 
                                            name="message" 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            rows="5" 
                                            className="w-full border border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none bg-slate-50/50"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'Sending...'}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                                    >
                                        {status === 'Sending...' ? 'Sending...' : <><IoSend /> Send Message</>}
                                    </button>
                                    {status === 'Message Sent Successfully!' && (
                                        <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                            <IoCheckmarkCircleOutline className="w-6 h-6" />
                                            <span className="font-medium">Success! We'll be in touch soon.</span>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Sub-components for cleaner code
const ContactInfoItem = ({ icon, title, detail, sub }) => (
    <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600 font-medium">{detail}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        <input 
            {...props} 
            className="w-full border border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none bg-slate-50/50" 
            required 
        />
    </div>
);

export default Contact;