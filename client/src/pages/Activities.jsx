import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { exportToCSV } from '../utils/exportUtils';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Education',
    location: '',
    date: '',
    beneficiaries_count: '',
    budget: '',
    description: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Use dummy data if API fails
      setActivities([
        {
          id: 1,
          name: "Education Drive Chennai",
          category: "Education",
          location: "Chennai",
          date: "2024-03-15",
          beneficiaries_count: 450,
          budget: 250000,
          description: "Providing educational materials"
        },
        {
          id: 2,
          name: "Health Camp Mumbai",
          category: "Healthcare",
          location: "Mumbai",
          date: "2024-03-10",
          beneficiaries_count: 320,
          budget: 180000,
          description: "Free health checkup camp"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

const handleExport = async () => {
  try {
    await exportToCSV('activities');
  } catch (error) {
    // Fallback to client-side export
    const success = generateClientCSV(activities, 'activities');
    if (success) {
      toast.success('Activities exported successfully!');
    } else {
      toast.error('Export failed');
    }
  }
};



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await axios.put(`/activities/${editingActivity.id}`, formData);
        toast.success('Activity updated successfully');
      } else {
        await axios.post('/activities', formData);
        toast.success('Activity added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`/activities/${id}`);
        toast.success('Activity deleted successfully');
        fetchActivities();
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      category: activity.category,
      location: activity.location,
      date: activity.date.split('T')[0],
      beneficiaries_count: activity.beneficiaries_count,
      budget: activity.budget,
      description: activity.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Education',
      location: '',
      date: '',
      beneficiaries_count: '',
      budget: '',
      description: ''
    });
    setEditingActivity(null);
  };

  const categories = ['Education', 'Healthcare', 'Food Distribution', 'Shelter', 'Training', 'Environment'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Activities Management
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 gradient-bg text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          <FaPlus />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {activity.name}
                  </h3>
                  <span className="inline-block px-2 py-1 mt-2 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    {activity.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Location:</span> {activity.location}</p>
                <p><span className="font-medium">Date:</span> {new Date(activity.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Beneficiaries:</span> {activity.beneficiaries_count}</p>
                <p><span className="font-medium">Budget:</span> ₹{Number(activity.budget).toLocaleString()}</p>
              </div>

              {activity.description && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {activity.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <button
  onClick={handleExport}
  className="flex items-center space-x-2 px-4 py-2 glass-card text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-3"
>
  <span>📥</span>
  <span>Export CSV</span>
</button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Beneficiaries Count
                  </label>
                  <input
                    type="number"
                    name="beneficiaries_count"
                    value={formData.beneficiaries_count}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 gradient-bg text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {editingActivity ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Activities;