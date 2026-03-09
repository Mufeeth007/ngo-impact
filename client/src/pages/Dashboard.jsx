import { useEffect } from 'react';
import { motion } from 'framer-motion';
import OverviewCards from '../components/OverviewCards';
import Charts from '../components/Charts';
import ImpactGauge from '../components/ImpactGauge';
import InsightsBox from '../components/InsightsBox';
import Timeline from '../components/Timeline';
import { useDashboard } from '../context/DashboardContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { dashboardData, loading, lastUpdated, refreshDashboard } = useDashboard();

  const handleRefresh = () => {
    refreshDashboard('Dashboard refreshed!');
  };

  if (loading && !dashboardData.overview.totalBeneficiaries) {
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
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 glass-card rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Cards - Shows REAL data */}
      <OverviewCards data={dashboardData.overview} />

      {/* Charts Section - Shows REAL data */}
      <Charts 
        monthlyData={dashboardData.monthlyData}
        categoryData={dashboardData.categoryData}
        fundData={dashboardData.fundData}
      />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ImpactGauge score={dashboardData.impactScore} />
        </div>
        <div className="lg:col-span-1">
          <InsightsBox insights={dashboardData.insights} />
        </div>
        <div className="lg:col-span-1">
          <Timeline events={dashboardData.timeline} />
        </div>
      </div>

      {/* Data source indicator */}
      <div className="text-xs text-gray-400 text-center mt-4">
        📊 Dashboard shows REAL data from your database
      </div>
    </motion.div>
  );
};

export default Dashboard;