import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaDownload } from 'react-icons/fa';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useDashboard } from '../context/DashboardContext';

const Beneficiaries = () => {
  const { refreshDashboard } = useDashboard();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    location: '',
    category: 'Education',
    enrollment_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await axios.get('/beneficiaries');
      setBeneficiaries(response.data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      // Dummy data
      setBeneficiaries([
        { id: 1, name: "Rahul Sharma", age: 12, gender: "Male", location: "Chennai", category: "Education", enrollment_date: "2024-01-10", status: "active" },
        { id: 2, name: "Priya Patel", age: 35, gender: "Female", location: "Mumbai", category: "Healthcare", enrollment_date: "2024-01-15", status: "active" }
      ]);
    } finally {
      setLoading(false);
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
      if (editingBeneficiary) {
        await axios.put(`/beneficiaries/${editingBeneficiary.id}`, formData);
        toast.success('Beneficiary updated successfully');
      } else {
        await axios.post('/beneficiaries', formData);
        toast.success('Beneficiary added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBeneficiaries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  
  const handleExport = async () => {
  try {
    await exportToCSV('beneficiaries');
  } catch (error) {
    // Fallback to client-side export
    const success = generateClientCSV(beneficiaries, 'beneficiaries');
    if (success) {
      toast.success('Beneficiaries exported successfully!');
    } else {
      toast.error('Export failed');
    }
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        await axios.delete(`/beneficiaries/${id}`);
        toast.success('Beneficiary deleted successfully');
        fetchBeneficiaries();
      } catch (error) {
        toast.error('Failed to delete beneficiary');
      }
    }
  };

  const handleEdit = (beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      name: beneficiary.name,
      age: beneficiary.age,
      gender: beneficiary.gender,
      location: beneficiary.location,
      category: beneficiary.category,
      enrollment_date: beneficiary.enrollment_date.split('T')[0],
      status: beneficiary.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      location: '',
      category: 'Education',
      enrollment_date: '',
      status: 'active'
    });
    setEditingBeneficiary(null);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Age', 'Gender', 'Location', 'Category', 'Enrollment Date', 'Status'];
    const csvData = beneficiaries.map(b => [
      b.name,
      b.age,
      b.gender,
      b.location,
      b.category,
      new Date(b.enrollment_date).toLocaleDateString(),
      b.status
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beneficiaries.csv';
    a.click();
  };

  const categories = ['Education', 'Healthcare', 'Food Distribution', 'Shelter', 'Training', 'Employment'];
  const locations = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Kolkata'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Beneficiaries Management
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 glass-card text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 gradient-bg text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <FaPlus />
            <span>Add Beneficiary</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Beneficiaries</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{beneficiaries.length}</p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {beneficiaries.filter(b => b.status === 'active').length}
          </p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Male/Female</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {beneficiaries.filter(b => b.gender === 'Male').length} / {beneficiaries.filter(b => b.gender === 'Female').length}
          </p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Age</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {beneficiaries.length > 0 ? Math.round(beneficiaries.reduce((sum, b) => sum + b.age, 0) / beneficiaries.length) : 0}
          </p>
        </div>
      </div>

      {/* Beneficiaries Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {beneficiaries.map((beneficiary, index) => (
                  <motion.tr
                    key={beneficiary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{beneficiary.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{beneficiary.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{beneficiary.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{beneficiary.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{beneficiary.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(beneficiary.enrollment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        beneficiary.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {beneficiary.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(beneficiary)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(beneficiary.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
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
              className="glass-card rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
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
  className="flex items-center space-x-2 px-4 py-2 glass-card text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
>
  <FaDownload />
  <span>Export CSV</span>
</button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="120"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
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
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 gradient-bg text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {editingBeneficiary ? 'Update' : 'Create'}
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

export default Beneficiaries;