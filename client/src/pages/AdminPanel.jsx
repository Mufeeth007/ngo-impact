import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaChartBar, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaSync, 
  FaSearch, 
  FaEnvelope, 
  FaCalendar, 
  FaDollarSign,
  FaMapMarkerAlt,
  FaHandHoldingHeart,
  FaRegChartBar // Changed from FaActivity to FaRegChartBar
} from 'react-icons/fa';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [ngos, setNgos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, disabled
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching admin data...');

      // Fetch NGOs and stats in parallel
      const [ngosRes, statsRes] = await Promise.all([
        axios.get('/admin/ngos').catch(err => {
          console.error('Error fetching NGOs:', err);
          return { data: { success: false, data: [] } };
        }),
        axios.get('/admin/stats').catch(err => {
          console.error('Error fetching stats:', err);
          return { data: { success: false, data: { overview: {} } } };
        })
      ]);

      console.log('NGOs Response:', ngosRes.data);
      console.log('Stats Response:', statsRes.data);

      // Handle different response structures
      let ngosData = [];
      if (ngosRes.data && ngosRes.data.success && Array.isArray(ngosRes.data.data)) {
        ngosData = ngosRes.data.data;
      } else if (Array.isArray(ngosRes.data)) {
        ngosData = ngosRes.data;
      } else if (ngosRes.data && ngosRes.data.data && Array.isArray(ngosRes.data.data)) {
        ngosData = ngosRes.data.data;
      }

      // Handle stats response
      let statsData = null;
      if (statsRes.data && statsRes.data.success && statsRes.data.data) {
        statsData = statsRes.data.data;
      } else if (statsRes.data && statsRes.data.overview) {
        statsData = statsRes.data;
      } else if (statsRes.data && statsRes.data.data) {
        statsData = statsRes.data.data;
      }

      setNgos(ngosData);
      setStats(statsData);
      
    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
      toast.error('Failed to load admin data');
      setNgos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success('Data refreshed!');
  };

  const toggleNGOStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`/admin/ngos/${id}/toggle-status`, {
        is_active: !currentStatus
      });
      
      if (response.data.success) {
        toast.success(`NGO ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        setNgos(prevNgos => 
          prevNgos.map(ngo => 
            ngo.id === id ? { ...ngo, is_active: !currentStatus ? 1 : 0 } : ngo
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling NGO status:', error);
      toast.error(error.response?.data?.message || 'Failed to update NGO status');
    }
  };

  const deleteNGO = async (id, name) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete "${name}"?\n\nThis will permanently delete ALL their data including activities, beneficiaries, and donations. This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/admin/ngos/${id}`);
      
      if (response.data.success) {
        toast.success(`NGO "${name}" deleted successfully`);
        setNgos(prevNgos => prevNgos.filter(ngo => ngo.id !== id));
        fetchData(); // Refresh stats
      } else {
        toast.error(response.data.message || 'Failed to delete NGO');
      }
    } catch (error) {
      console.error('Error deleting NGO:', error);
      toast.error(error.response?.data?.message || 'Failed to delete NGO');
    }
  };

  // Safely filter NGOs
  const filteredNGOs = Array.isArray(ngos) ? ngos.filter(ngo => {
    const matchesSearch = 
      (ngo.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ngo.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filter === 'active') return matchesSearch && ngo.is_active === 1;
    if (filter === 'disabled') return matchesSearch && ngo.is_active === 0;
    return matchesSearch;
  }) : [];

  if (loading && ngos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all NGOs in the system
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 glass-card rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* System Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total NGOs</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.total_ngos || stats.overview?.total_ngos || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaUsers className="text-white text-xl" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              {stats.active_ngos || stats.overview?.active_ngos || 0} active
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Beneficiaries</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.total_beneficiaries || stats.overview?.total_beneficiaries || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <FaHandHoldingHeart className="text-white text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.total_donations || stats.overview?.total_donations || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-white text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ₹{(stats.total_funds || stats.overview?.total_funds || 0).toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {stats.total_activities || stats.overview?.total_activities || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <FaRegChartBar className="text-white text-xl" /> {/* Changed from FaActivity */}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.activity_locations || stats.overview?.activity_locations || 0} locations
            </p>
          </motion.div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search NGOs by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="all">All NGOs</option>
          <option value="active">Active Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
      </div>

      {/* NGOs Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NGO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Beneficiaries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Funds</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Locations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNGOs.length > 0 ? (
                filteredNGOs.map((ngo, index) => (
                  <motion.tr
                    key={ngo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ngo.username || 'Unnamed NGO'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <FaEnvelope className="text-xs" />
                        <span>{ngo.email || 'No email'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {ngo.total_activities || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {ngo.total_beneficiaries || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {ngo.total_donations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{(ngo.total_funds || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-xs" />
                        <span>{ngo.active_locations || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ngo.is_active === 1
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {ngo.is_active === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaCalendar className="text-xs" />
                        <span>{ngo.created_at ? new Date(ngo.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleNGOStatus(ngo.id, ngo.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            ngo.is_active === 1
                              ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={ngo.is_active === 1 ? 'Disable NGO' : 'Enable NGO'}
                        >
                          {ngo.is_active === 1 ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        </button>
                        <button
                          onClick={() => deleteNGO(ngo.id, ngo.username)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete NGO"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No NGOs match your search' : 'No NGOs found in the system'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Signups Chart */}
      {stats?.monthlySignups && stats.monthlySignups.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly NGO Registrations</h3>
          <div className="h-48 flex items-end space-x-2">
            {stats.monthlySignups.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                  style={{ height: `${Math.min((item.count / 5) * 100, 100)}px` }}
                ></div>
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                  {item.month}/{item.year}
                </span>
                <span className="text-xs font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data summary */}
      <div className="text-xs text-gray-400 text-center">
        Total NGOs: {ngos.length} | 
        Active: {ngos.filter(n => n.is_active === 1).length} | 
        Disabled: {ngos.filter(n => n.is_active === 0).length}
      </div>
    </motion.div>
  );
};

export default AdminPanel;