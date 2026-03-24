import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    activities: 0,
    beneficiaries: 0,
    donations: 0,
    funds: 0
  });
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await axios.get('/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch trends data
      const trendsResponse = await axios.get('/dashboard/trends');
      if (trendsResponse.data.success) {
        setTrends(trendsResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, trends, refreshStats: fetchStats };
};