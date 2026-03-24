import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalBeneficiaries: 0,
      totalDonations: 0,
      totalExpenses: 0,
      activePrograms: 0,
      newRegistrations: 0,
      volunteerHours: 0
    },
    quickStats: {
      dailyAvg: 0,
      dailyAvgChange: 0,
      monthlyGrowth: 0,
      growthChange: 0,
      completionRate: 0,
      completionChange: 0,
      budgetUtilization: 0,
      budgetChange: 0
    },
    trends: {
      labels: [],
      beneficiaries: [],
      donations: []
    },
    comparison: {
      categories: [],
      beneficiaries: [],
      budget: []
    },
    distribution: {
      categories: [],
      values: []
    },
    cumulative: {
      labels: [],
      values: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  });

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      // Format dates for API
      const params = new URLSearchParams();
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate.toISOString().split('T')[0]);
      }

      console.log('📊 Fetching dashboard data...');

      // Fetch all dashboard data
      const [kpisRes, statsRes, trendsRes, comparisonRes, distributionRes, cumulativeRes] = await Promise.all([
        axios.get('/dashboard/kpis').catch(() => ({ data: { success: true, data: getDefaultKPIs() } })),
        axios.get('/dashboard/quick-stats').catch(() => ({ data: { success: true, data: getDefaultQuickStats() } })),
        axios.get('/dashboard/trends').catch(() => ({ data: { success: true, data: getDefaultTrends() } })),
        axios.get('/dashboard/comparison').catch(() => ({ data: { success: true, data: getDefaultComparison() } })),
        axios.get('/dashboard/distribution').catch(() => ({ data: { success: true, data: getDefaultDistribution() } })),
        axios.get('/dashboard/cumulative').catch(() => ({ data: { success: true, data: getDefaultCumulative() } }))
      ]);

      setDashboardData({
        kpis: kpisRes.data.data || getDefaultKPIs(),
        quickStats: statsRes.data.data || getDefaultQuickStats(),
        trends: trendsRes.data.data || getDefaultTrends(),
        comparison: comparisonRes.data.data || getDefaultComparison(),
        distribution: distributionRes.data.data || getDefaultDistribution(),
        cumulative: cumulativeRes.data.data || getDefaultCumulative()
      });
      
      setLastUpdated(new Date());
      
      if (showToast) {
        toast.success('Dashboard updated with latest data!');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (showToast) {
        toast.error('Failed to update dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Refresh dashboard after any CRUD operation
  const refreshDashboard = useCallback(async (message) => {
    console.log('🔄 Refreshing dashboard...');
    await fetchDashboardData(true);
    
    // Dispatch custom event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dashboard-refresh', { detail: { timestamp: new Date() } }));
    }
    
    if (message) {
      toast.success(message);
    }
  }, [fetchDashboardData]);

  // Update date range and refresh data
  const updateDateRange = useCallback((newRange) => {
    setDateRange(newRange);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      lastUpdated,
      refreshDashboard,
      updateDateRange,
      dateRange,
      fetchDashboardData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

// Default data functions
const getDefaultKPIs = () => ({
  totalBeneficiaries: 0,
  totalDonations: 0,
  totalExpenses: 0,
  activePrograms: 0,
  newRegistrations: 0,
  volunteerHours: 0
});

const getDefaultQuickStats = () => ({
  dailyAvg: 0,
  dailyAvgChange: 0,
  monthlyGrowth: 0,
  growthChange: 0,
  completionRate: 0,
  completionChange: 0,
  budgetUtilization: 0,
  budgetChange: 0
});

const getDefaultTrends = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  beneficiaries: [0, 0, 0, 0, 0, 0],
  donations: [0, 0, 0, 0, 0, 0]
});

const getDefaultComparison = () => ({
  categories: ['Education', 'Healthcare', 'Food', 'Shelter', 'Training'],
  beneficiaries: [0, 0, 0, 0, 0],
  budget: [0, 0, 0, 0, 0]
});

const getDefaultDistribution = () => ({
  categories: ['Education', 'Healthcare', 'Food', 'Shelter', 'Training'],
  values: [0, 0, 0, 0, 0]
});

const getDefaultCumulative = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [0, 0, 0, 0, 0, 0]
});