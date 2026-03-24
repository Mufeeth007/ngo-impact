import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../components/dashboard/DashboardStats';
import TrendsChart from '../components/dashboard/TrendsChart';
import ReportGenerator from '../components/reports/ReportGenerator';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboard } from '../context/DashboardContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { stats, loading, trends, refreshStats } = useDashboardStats();
  const { refreshDashboard } = useDashboard();

  // Refresh stats when dashboard context refreshes
  useEffect(() => {
    refreshStats();
  }, [refreshDashboard, refreshStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  if (loading && stats.activities === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your real-time impact data
          </p>
        </div>
        <button
          onClick={refreshStats}
          className="px-4 py-2 glass-card rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <DashboardStats stats={stats} />

      {/* Trends Chart */}
      {trends && trends.length > 0 && <TrendsChart trends={trends} />}

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportGenerator />
        
        {/* Quick Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Quick Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Impact Score</span>
              <span className="text-2xl font-bold text-primary-600">
                {Math.min(Math.round((stats.beneficiaries / 100) * 0.5 + (stats.funds / 100000) * 0.5), 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Avg Beneficiaries per Activity</span>
              <span className="text-xl font-semibold text-gray-800 dark:text-white">
                {stats.activities > 0 ? Math.round(stats.beneficiaries / stats.activities) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Avg Donation Amount</span>
              <span className="text-xl font-semibold text-gray-800 dark:text-white">
                ₹{stats.donations > 0 ? Math.round(stats.funds / stats.donations).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-xs text-gray-400 text-center mt-4">
        ⚡ Dashboard updates automatically every 30 seconds | Data is specific to your account
      </div>
    </motion.div>
  );
};

export default Dashboard;