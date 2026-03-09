import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import OverviewCards from '../components/OverviewCards';
import Charts from '../components/Charts';
import ImpactGauge from '../components/ImpactGauge';
import InsightsBox from '../components/InsightsBox';
import Timeline from '../components/Timeline';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { exportToCSV, downloadPDF } from '../utils/exportUtils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalBeneficiaries: 2450,
      totalFunds: 1250000,
      activeLocations: 12,
      impactGrowth: 28
    },
    monthlyData: null,
    categoryData: null,
    fundData: null,
    impactScore: 78,
    insights: null,
    timeline: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [activitiesRes, beneficiariesRes, donationsRes] = await Promise.all([
        axios.get('/activities/stats'),
        axios.get('/beneficiaries/stats'),
        axios.get('/donations/stats')
      ]);

      setDashboardData(prev => ({
        ...prev,
        impactScore: activitiesRes.data.impactScore || 78
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Using demo data. Connect backend for live data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await downloadPDF();
    } catch (error) {
      // Fallback to client-side generation
      toast.error('Backend not connected. Using demo export.');
      // You can implement client-side PDF generation here
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV('activities');
    } catch (error) {
      toast.error('Export failed. Check backend connection.');
    }
  };

  if (loading) {
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
      {/* Header with working buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 glass-card rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 gradient-bg text-white rounded-lg text-sm hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards data={dashboardData.overview} />

      {/* Charts Section */}
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
    </motion.div>
  );
};

export default Dashboard;