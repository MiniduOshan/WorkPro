import React from "react";
import { 
  IoPeopleOutline, 
  IoRocketOutline, 
  IoCheckmarkCircleOutline, 
  IoShieldCheckmarkOutline, 
  IoFlashOutline, 
  IoHeartOutline, 
  IoArrowForwardOutline 
} from "react-icons/io5";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-slate-50 to-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">WorkPro</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We believe work should be simpler, more collaborative, and more rewarding. That's why we built the operating system for modern teams.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <IoRocketOutline className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                To simplify how teams work together by providing a unified platform that brings project management, communication, and tracking into one beautiful workspace.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We're committed to removing complexity from work, so your team can focus on what truly matters—delivering great results together.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl p-12 aspect-video flex flex-col items-center justify-center text-white text-center shadow-2xl relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl opacity-20"></div>
                <div className="relative z-10">
                    <div className="text-6xl font-black mb-2 tracking-tighter">500+</div>
                    <p className="text-blue-100 font-medium text-lg uppercase tracking-wider">Companies Trusting WorkPro</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Our Core Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              The principles that drive every line of code we write.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard icon={IoFlashOutline} title="Innovation" desc="We constantly innovate to deliver cutting-edge features that solve real team problems." />
            <ValueCard icon={IoShieldCheckmarkOutline} title="Reliability" desc="Your data is sacred. We maintain 99.9% uptime and enterprise-grade security." />
            <ValueCard icon={IoHeartOutline} title="User First" desc="Every feature is designed with you in mind. Your feedback drives our roadmap." />
            <ValueCard icon={IoPeopleOutline} title="Collaboration" desc="We believe the best work happens when teams communicate openly and effortlessly." />
            <ValueCard icon={IoCheckmarkCircleOutline} title="Excellence" desc="We're obsessed with details. From performance to UI, we sweat the small stuff." />
            <ValueCard icon={IoRocketOutline} title="Growth" desc="We're growing fast, and we want to help your business scale at the same speed." />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="relative z-10">
                <IoPeopleOutline className="w-16 h-16 text-blue-400 mx-auto mb-8" />
                <h2 className="text-4xl font-bold mb-6">Join Our Growing Community</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  Thousands of teams use WorkPro to collaborate better every day. From startups to enterprises, we scale with you.
                </p>
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 inline-flex items-center gap-2"
                >
                  Get Started Free <IoArrowForwardOutline />
                </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ValueCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group">
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default About;