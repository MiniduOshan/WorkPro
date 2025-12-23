import React from "react";
import { IoPeopleOutline, IoRocketOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const About = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 transition-all hover:shadow-2xl">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            About Our Platform
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Designed to make learning easier, faster, and more collaborative.
          </p>
        </header>

        {/* Mission Section */}
        <section className="mb-10">
          <div className="flex items-start space-x-4">
            <IoRocketOutline className="w-10 h-10 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mt-2">
                We aim to simplify academic life by offering a clean, organized,
                and powerful platform for managing tasks, collaborating with
                groups, and tracking course progress — all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-10">
          <div className="flex items-start space-x-4">
            <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Key Features
              </h2>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Kanban-style task boards for better workflow.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Group chat & real-time collaboration tools.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Course management with progress tracking.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Clean and fast UI designed for students.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="pt-8 border-t border-gray-200 flex items-center space-x-4">
          <IoPeopleOutline className="w-10 h-10 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">
            Join thousands of students using our platform every day!
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
