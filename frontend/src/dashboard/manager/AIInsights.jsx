import React, { useState, useEffect } from 'react';
import {
  IoSparklesOutline,
  IoRefreshOutline,
  IoStatsChartOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const AIInsights = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ai/summarize', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': companyId,
        },
      });
      setSummary(response.data.summary);
      setRawData(response.data.rawData);
      setLastGenerated(new Date(response.data.generatedAt));
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <IoSparklesOutline className="w-8 h-8 text-purple-600" />
            AI Executive Summary
          </h1>
          <p className="text-gray-600 mt-2">Your daily pulse powered by AI</p>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
        >
          <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {/* Main AI Summary Card */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-purple-200 p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <IoSparklesOutline className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Daily Intelligence Report</h2>
              {lastGenerated && (
                <span className="text-xs text-gray-500">
                  Generated {lastGenerated.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-purple-200 to-transparent rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-blue-200 to-transparent rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-indigo-200 to-transparent rounded animate-pulse w-3/4"></div>
              </div>
            ) : summary ? (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {summary}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No data available for summary generation.</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {rawData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{rawData.tasksCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <IoTrendingUpOutline className="w-4 h-4 mr-1" />
              Last 24 hours
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Tasks</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{rawData.activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IoStatsChartOutline className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">In progress now</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{rawData.overdueTasks}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <IoAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-red-600">Needs attention</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Announcements</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{rawData.announcements}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <IoSparklesOutline className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Last 24 hours</div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How AI Insights Work</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-bold text-xs">1</span>
            </div>
            <p>
              <strong className="text-gray-900">Data Aggregation:</strong> We collect tasks completed, announcements, and channel activity from the last 24 hours.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">2</span>
            </div>
            <p>
              <strong className="text-gray-900">AI Analysis:</strong> Our AI processes the data to identify trends, achievements, and areas needing attention.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold text-xs">3</span>
            </div>
            <p>
              <strong className="text-gray-900">Executive Summary:</strong> Get a concise, actionable report that helps you make informed decisions quickly.
            </p>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <IoSparklesOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Pro Tip</p>
            <p className="text-sm text-gray-700">
              Check your AI insights every morning to stay on top of your team's progress and identify potential bottlenecks early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
