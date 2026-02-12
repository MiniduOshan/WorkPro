import React, { useState, useEffect } from 'react';
import {
  IoTrendingUpOutline,
  IoWalletOutline,
  IoBarChartOutline,
  IoCalendarOutline,
} from 'react-icons/io5';
import api from '../../api/axios';

const SuperAdminRevenue = () => {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // month, quarter, year

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // TODO: Create API endpoint for revenue data
      // For now, using mock data that can be replaced
      const response = await api.get(`/api/super-admin/revenue?timeframe=${timeframe}`);
      setRevenueData(response.data);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
      // Mock data while backend is being built
      setRevenueData({
        totalRevenue: 24500,
        monthlyRevenue: 4200,
        activeSubscriptions: 12,
        averageOrderValue: 350,
      });
    } finally {
      setLoading(false);
    }
  };

  const RevenueCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Indicators</h1>
          <p className="text-gray-600 mt-2">Track platform revenue and subscription metrics</p>
        </div>
        <div className="flex gap-2">
          {['month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard
          icon={IoWalletOutline}
          label="Total Revenue"
          value={`$${revenueData.totalRevenue.toLocaleString()}`}
          trend={12}
        />
        <RevenueCard
          icon={IoTrendingUpOutline}
          label="Monthly Revenue"
          value={`$${revenueData.monthlyRevenue.toLocaleString()}`}
          trend={8}
        />
        <RevenueCard
          icon={IoBarChartOutline}
          label="Active Subscriptions"
          value={revenueData.activeSubscriptions}
          trend={5}
        />
        <RevenueCard
          icon={IoCalendarOutline}
          label="Average Order Value"
          value={`$${revenueData.averageOrderValue.toLocaleString()}`}
          trend={3}
        />
      </div>

      {/* Placeholder for Charts Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
          <div className="text-center">
            <IoBarChartOutline className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chart visualization coming soon</p>
            <p className="text-sm text-gray-500">Revenue trends and analytics will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Transactions Table Placeholder */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">2025-02-10</td>
                <td className="py-3 px-4 text-gray-700">Tech Corp</td>
                <td className="py-3 px-4 text-gray-700">Pro</td>
                <td className="py-3 px-4 font-semibold text-gray-900">$299</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">2025-02-09</td>
                <td className="py-3 px-4 text-gray-700">Design Studio</td>
                <td className="py-3 px-4 text-gray-700">Enterprise</td>
                <td className="py-3 px-4 font-semibold text-gray-900">$999</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRevenue;
