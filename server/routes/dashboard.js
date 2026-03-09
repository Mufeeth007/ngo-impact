const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const Beneficiary = require('../models/Beneficiary');
const Donation = require('../models/Donation');

// Get all dashboard statistics for logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all stats in parallel
    const [activities, beneficiaries, donations] = await Promise.all([
      Activity.getStats(userId),
      Beneficiary.getStats(userId),
      Donation.getStats(userId)
    ]);

    // Calculate overview metrics
    const totalBeneficiaries = beneficiaries.total || 0;
    const totalFunds = donations.totals?.total_amount || 0;
    const activeLocations = activities.monthlyStats?.length || 0;
    
    // Calculate growth (compare last two months)
    const monthlyData = activities.monthlyStats || [];
    const growth = calculateGrowth(monthlyData);

    // Prepare response
    const dashboardData = {
      overview: {
        totalBeneficiaries,
        totalFunds,
        activeLocations,
        impactGrowth: growth
      },
      monthlyData: activities.monthlyStats || [],
      categoryData: activities.categoryStats || [],
      fundData: donations.categoryStats || [],
      impactScore: calculateImpactScore(activities, beneficiaries, donations),
      insights: generateInsights(activities, beneficiaries, donations)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate growth
function calculateGrowth(monthlyData) {
  if (monthlyData.length < 2) return 0;
  
  const lastMonth = monthlyData[0]?.monthly_beneficiaries || 0;
  const previousMonth = monthlyData[1]?.monthly_beneficiaries || 0;
  
  if (previousMonth === 0) return 0;
  return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
}

// Helper function to calculate impact score
function calculateImpactScore(activities, beneficiaries, donations) {
  const totalBeneficiaries = beneficiaries.total || 0;
  const totalDonations = donations.totals?.total_amount || 0;
  const totalActivities = activities.monthlyStats?.reduce((sum, m) => sum + (m.total_activities || 0), 0) || 0;
  
  // Simple scoring algorithm
  const score = Math.min(
    Math.round(
      (totalBeneficiaries / 100) * 0.4 +
      (totalDonations / 100000) * 0.3 +
      totalActivities * 0.3
    ),
    100
  );
  
  return score || 0;
}

// Helper function to generate insights
function generateInsights(activities, beneficiaries, donations) {
  const insights = [];
  
  // Activity insights
  if (activities.categoryStats?.length > 0) {
    const topCategory = activities.categoryStats.reduce((max, cat) => 
      cat.total_beneficiaries > max.total_beneficiaries ? cat : max
    , activities.categoryStats[0]);
    
    if (topCategory) {
      insights.push({
        text: `${topCategory.category} programs reached ${topCategory.total_beneficiaries} beneficiaries`,
        type: 'positive'
      });
    }
  }

  // Beneficiary insights
  if (beneficiaries.stats?.length > 0) {
    const topLocation = beneficiaries.stats.reduce((max, loc) => 
      loc.location_count > max.location_count ? loc : max
    , beneficiaries.stats[0]);
    
    if (topLocation) {
      insights.push({
        text: `${topLocation.location} has the highest beneficiary count (${topLocation.location_count})`,
        type: 'neutral'
      });
    }
  }

  // Donation insights
  if (donations.categoryStats?.length > 0) {
    const topFunding = donations.categoryStats.reduce((max, cat) => 
      cat.total > max.total ? cat : max
    , donations.categoryStats[0]);
    
    if (topFunding) {
      insights.push({
        text: `${topFunding.category} receives ${Math.round((topFunding.total / donations.totals.total_amount) * 100)}% of total funding`,
        type: 'neutral'
      });
    }
  }

  return insights;
}

module.exports = router;