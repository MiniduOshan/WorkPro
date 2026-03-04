import React from 'react';
import {
    IoMailOutline,
    IoCallOutline,
    IoLocationOutline,
    IoTimeOutline,
    IoArrowForwardOutline
} from 'react-icons/io5';

const Contact = () => {
    const contactDetails = [
        {
            icon: <IoMailOutline />,
            title: 'Email Us',
            detail: 'support@workpro.app',
            sub: 'We respond within 24 hours',
            href: 'https://mail.google.com/mail/?view=cm&to=support@workpro.app',
            color: 'blue',
        },
        {
            icon: <IoCallOutline />,
            title: 'Call Us',
            detail: '+94 762 288 794',
            sub: 'Mon–Fri, 9 AM – 6 PM IST',
            href: 'tel:+94762288794',
            color: 'emerald',
        },
        {
            icon: <IoLocationOutline />,
            title: 'Visit Us',
            detail: 'Homagama, Sri Lanka',
            sub: 'Global Headquarters',
            href: 'https://maps.google.com/?q=Homagama,Sri+Lanka',
            color: 'violet',
        },
        {
            icon: <IoTimeOutline />,
            title: 'Business Hours',
            detail: 'Mon – Fri, 9 AM – 6 PM',
            sub: 'Sri Lanka Standard Time (IST)',
            href: null,
            color: 'amber',
        },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'group-hover:bg-blue-600', ring: 'ring-blue-500/20' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hoverBg: 'group-hover:bg-emerald-600', ring: 'ring-emerald-500/20' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', hoverBg: 'group-hover:bg-violet-600', ring: 'ring-violet-500/20' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', hoverBg: 'group-hover:bg-amber-600', ring: 'ring-amber-500/20' },
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            {/* Header */}
            <header className="pt-24 pb-16 bg-slate-50 border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <IoMailOutline className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto">
                        We'd love to hear from you. Reach out through any of the channels below and our team will get back to you promptly.
                    </p>
                </div>
            </header>

            {/* Contact Cards */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {contactDetails.map((item) => {
                            const colors = colorMap[item.color];
                            const Wrapper = item.href ? 'a' : 'div';
                            const wrapperProps = item.href
                                ? { href: item.href, target: item.href.startsWith('http') ? '_blank' : undefined, rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined }
                                : {};

                            return (
                                <Wrapper
                                    key={item.title}
                                    {...wrapperProps}
                                    className={`group relative bg-white rounded-2xl border border-slate-200 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 hover:-translate-y-1 ${item.href ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`flex-shrink-0 w-14 h-14 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center ${colors.hoverBg} group-hover:text-white transition-all duration-300`}>
                                            {React.cloneElement(item.icon, { className: 'w-7 h-7' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-xl font-bold text-slate-900 mb-1 truncate">
                                                {item.detail}
                                            </p>
                                            <p className="text-sm text-slate-500">{item.sub}</p>
                                        </div>
                                        {item.href && (
                                            <IoArrowForwardOutline className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors mt-1 flex-shrink-0" />
                                        )}
                                    </div>
                                </Wrapper>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-10 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                Prefer to email us directly?
                            </h2>
                            <p className="text-slate-500 mb-6">
                                Drop us a line and we'll get back to you within 24 hours.
                            </p>
                            <a
                                href="https://mail.google.com/mail/?view=cm&to=support@workpro.app&su=Contact+Request"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all text-lg"
                            >
                                <IoMailOutline className="w-5 h-5" />
                                Send an Email
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;