import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalBeneficiaries: 0,
      totalFunds: 0,
      activeLocations: 0,
      impactGrowth: 0
    },
    monthlyData: [],
    categoryData: [],
    fundData: [],
    impactScore: 0,
    insights: [],
    timeline: []
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Calculate monthly data from activities
  const calculateMonthlyData = (activities) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month}-${year}`;
      
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month, count: 0 };
      }
      monthlyMap[key].count += activity.beneficiaries_count || 0;
    });
    
    return Object.values(monthlyMap).slice(0, 6); // Last 6 months
  };

  // Calculate category data from activities
  const calculateCategoryData = (activities) => {
    const categoryMap = {};
    
    activities.forEach(activity => {
      const cat = activity.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, impact: 0, count: 0 };
      }
      categoryMap[cat].impact += activity.beneficiaries_count || 0;
      categoryMap[cat].count += 1;
    });
    
    return Object.values(categoryMap).map(item => ({
      category: item.category,
      impact: Math.round(item.impact / 10) // Scale for chart
    }));
  };

  // Calculate fund data from donations
  const calculateFundData = (donations) => {
    const categoryMap = {};
    let total = 0;
    
    donations.forEach(donation => {
      const cat = donation.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, amount: 0 };
      }
      categoryMap[cat].amount += donation.amount || 0;
      total += donation.amount || 0;
    });
    
    // Convert to percentages
    return Object.values(categoryMap).map(item => ({
      category: item.category,
      amount: total > 0 ? Math.round((item.amount / total) * 100) : 0
    }));
  };

  // Generate insights from data
  const generateInsights = (beneficiaries, activities, donations) => {
    const insights = [];
    
    // Location insight
    const locations = {};
    beneficiaries.forEach(b => {
      locations[b.location] = (locations[b.location] || 0) + 1;
    });
    
    let topLocation = '';
    let maxCount = 0;
    Object.entries(locations).forEach(([loc, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topLocation = loc;
      }
    });
    
    if (topLocation) {
      insights.push({
        text: `${topLocation} has highest beneficiaries (${maxCount})`,
        type: 'neutral'
      });
    }
    
    // Category insight
    const categoryTotals = {};
    activities.forEach(a => {
      categoryTotals[a.category] = (categoryTotals[a.category] || 0) + (a.beneficiaries_count || 0);
    });
    
    let topCategory = '';
    let maxImpact = 0;
    Object.entries(categoryTotals).forEach(([cat, total]) => {
      if (total > maxImpact) {
        maxImpact = total;
        topCategory = cat;
      }
    });
    
    if (topCategory) {
      insights.push({
        text: `${topCategory} programs reached ${maxImpact} beneficiaries`,
        type: 'positive'
      });
    }
    
    // Donation insight
    if (donations.length > 0) {
      const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      insights.push({
        text: `Total donations: ₹${(totalDonations / 100000).toFixed(1)}L`,
        type: 'positive'
      });
    }
    
    return insights.length > 0 ? insights : [
      { text: "Add data to see insights", type: "neutral" }
    ];
  };

  // Generate timeline from activities
  const generateTimeline = (activities) => {
    const months = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!months[monthYear]) {
        months[monthYear] = [];
      }
      
      months[monthYear].push({
        title: activity.name,
        beneficiaries: activity.beneficiaries_count || 0,
        location: activity.location
      });
    });
    
    return Object.entries(months).map(([month, events]) => ({
      month,
      events: events.slice(0, 3) // Max 3 events per month
    })).slice(0, 3); // Last 3 months
  };

  // Fetch real data from all APIs
  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching real dashboard data...');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [beneficiariesRes, donationsRes, activitiesRes] = await Promise.all([
        axios.get('/beneficiaries').catch(err => ({ data: [] })),
        axios.get('/donations').catch(err => ({ data: [] })),
        axios.get('/activities').catch(err => ({ data: [] }))
      ]);

      const beneficiaries = beneficiariesRes.data || [];
      const donations = donationsRes.data || [];
      const activities = activitiesRes.data || [];

      console.log('📊 Data received:', {
        beneficiaries: beneficiaries.length,
        donations: donations.length,
        activities: activities.length
      });

      // Calculate overview metrics
      const totalBeneficiaries = beneficiaries.length;
      const totalFunds = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const uniqueLocations = new Set(beneficiaries.map(b => b.location).filter(Boolean)).size;
      
      // Calculate growth (compare last two months)
      const monthlyData = calculateMonthlyData(activities);
      const growth = calculateGrowth(monthlyData);

      // Update dashboard with real data
      const newData = {
        overview: {
          totalBeneficiaries: totalBeneficiaries || 0,
          totalFunds: totalFunds || 0,
          activeLocations: uniqueLocations || 0,
          impactGrowth: growth
        },
        monthlyData: monthlyData,
        categoryData: calculateCategoryData(activities),
        fundData: calculateFundData(donations),
        impactScore: calculateImpactScore(beneficiaries, donations, activities),
        insights: generateInsights(beneficiaries, activities, donations),
        timeline: generateTimeline(activities)
      };

      console.log('📈 Dashboard updated:', newData.overview);
      setDashboardData(newData);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast.success('Dashboard updated with real data!');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (showToast) {
        toast.error('Failed to update dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate growth percentage
  const calculateGrowth = (monthlyData) => {
    if (monthlyData.length < 2) return 0;
    const last = monthlyData[monthlyData.length - 1]?.count || 0;
    const prev = monthlyData[monthlyData.length - 2]?.count || 0;
    if (prev === 0) return 0;
    return Math.round(((last - prev) / prev) * 100);
  };

  // Calculate impact score
  const calculateImpactScore = (beneficiaries, donations, activities) => {
    const score = 
      (beneficiaries.length * 0.3) + 
      (donations.length * 0.3) + 
      (activities.length * 0.4);
    return Math.min(Math.round(score), 100);
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh function for other components to call
  const refreshDashboard = useCallback(async (message) => {
    console.log('🔄 Refreshing dashboard...');
    await fetchDashboardData(true);
    if (message) {
      toast.success(message);
    }
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      lastUpdated,
      refreshDashboard,
      fetchDashboardData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};