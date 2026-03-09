import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

// --- Helper Functions (Defined outside to keep Provider clean) ---

const calculateTotalBeneficiaries = (data) => {
  if (Array.isArray(data)) {
    return data.reduce((sum, item) => sum + (item.count || 0), 0);
  }
  return data?.total || 2450;
};

const calculateTotalFunds = (data) => {
  if (Array.isArray(data)) {
    return data.reduce((sum, item) => sum + (item.total || 0), 0);
  }
  return data?.total || 1250000;
};

const calculateActiveLocations = (data) => {
  return data?.locations || 12;
};

const calculateImpactGrowth = (data) => {
  return data?.growth || 28;
};

/**
 * Generates insight strings for the dashboard.
 * @param {Object} activities - Activity statistics
 * @param {Object} beneficiaries - Beneficiary statistics
 */
const generateInsights = (activities = {}, beneficiaries = {}) => {
  // Currently returns static data as per requirements, 
  // but receives data objects for future dynamic logic.
  return [
    { text: "Education programs increased by 28% this quarter", type: "positive" },
    { text: "Chennai has the highest beneficiary count", type: "neutral" },
    { text: "Healthcare funding efficiency improved by 15%", type: "positive" },
    { text: "New location added in Bangalore", type: "neutral" }
  ];
};

const getDefaultDashboardData = () => ({
  overview: {
    totalBeneficiaries: 2450,
    totalFunds: 1250000,
    activeLocations: 12,
    impactGrowth: 28
  },
  monthlyData: [
    { month: 'Jan', count: 450 }, { month: 'Feb', count: 520 },
    { month: 'Mar', count: 680 }, { month: 'Apr', count: 590 },
    { month: 'May', count: 720 }, { month: 'Jun', count: 850 }
  ],
  categoryData: [
    { category: 'Education', impact: 85 },
    { category: 'Healthcare', impact: 72 },
    { category: 'Food', impact: 68 },
    { category: 'Shelter', impact: 90 }
  ],
  fundData: [
    { category: 'Education', amount: 40 },
    { category: 'Healthcare', amount: 25 },
    { category: 'Food', amount: 20 },
    { category: 'Shelter', amount: 15 }
  ],
  impactScore: 78,
  insights: generateInsights(), // Now handles empty params safely
  timeline: []
});

// --- Provider Component ---

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(getDefaultDashboardData());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      
      const [activitiesRes, beneficiariesRes, donationsRes] = await Promise.all([
        axios.get('/activities/stats'),
        axios.get('/beneficiaries/stats'),
        axios.get('/donations/stats')
      ]);

      const totalBeneficiaries = calculateTotalBeneficiaries(beneficiariesRes.data);
      const totalFunds = calculateTotalFunds(donationsRes.data);
      const activeLocations = calculateActiveLocations(activitiesRes.data);
      const impactGrowth = calculateImpactGrowth(activitiesRes.data);

      setDashboardData({
        overview: {
          totalBeneficiaries,
          totalFunds,
          activeLocations,
          impactGrowth
        },
        monthlyData: activitiesRes.data.monthly || [],
        categoryData: activitiesRes.data.category || [],
        fundData: donationsRes.data.categoryStats || [],
        impactScore: activitiesRes.data.impactScore || 78,
        insights: generateInsights(activitiesRes.data, beneficiariesRes.data),
        timeline: activitiesRes.data.timeline || []
      });

      setLastUpdated(new Date());
      if (showToast) toast.success('Dashboard updated!');
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(getDefaultDashboardData());
      if (showToast) toast.error('Using default data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async (message = 'Data updated successfully!') => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      lastUpdated,
      fetchDashboardData,
      refreshDashboard
    }}>
      {children}
    </DashboardContext.Provider>
  );
};