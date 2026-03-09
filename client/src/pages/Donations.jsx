import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaDownload } from 'react-icons/fa';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    date: '',
    category: 'Education',
    payment_method: 'Cash'
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/donations');
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      // Dummy data
      setDonations([
        { id: 1, donor_name: "Tata Foundation", amount: 500000, date: "2024-03-01", category: "Education", payment_method: "Bank Transfer" },
        { id: 2, donor_name: "Infosys Foundation", amount: 350000, date: "2024-03-05", category: "Healthcare", payment_method: "Bank Transfer" }
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
      if (editingDonation) {
        await axios.put(`/donations/${editingDonation.id}`, formData);
        toast.success('Donation updated successfully');
      } else {
        await axios.post('/donations', formData);
        toast.success('Donation added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await axios.delete(`/donations/${id}`);
        toast.success('Donation deleted successfully');
        fetchDonations();
      } catch (error) {
        toast.error('Failed to delete donation');
      }
    }
  };
  
  const handleExport = async () => {
  try {
    await exportToCSV('donations');
  } catch (error) {
    // Fallback to client-side export
    const success = generateClientCSV(donations, 'donations');
    if (success) {
      toast.success('Donations exported successfully!');
    } else {
      toast.error('Export failed');
    }
  }
};

  const handleEdit = (donation) => {
    setEditingDonation(donation);
    setFormData({
      donor_name: donation.donor_name,
      amount: donation.amount,
      date: donation.date.split('T')[0],
      category: donation.category,
      payment_method: donation.payment_method
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      donor_name: '',
      amount: '',
      date: '',
      category: 'Education',
      payment_method: 'Cash'
    });
    setEditingDonation(null);
  };

  const exportToCSV = () => {
    const headers = ['Donor Name', 'Amount', 'Date', 'Category', 'Payment Method'];
    const csvData = donations.map(d => [
      d.donor_name,
      d.amount,
      new Date(d.date).toLocaleDateString(),
      d.category,
      d.payment_method
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    a.click();
  };

  const categories = ['Education', 'Healthcare', 'Food Distribution', 'Shelter', 'Training', 'Emergency Relief'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque'];

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const averageAmount = donations.length > 0 ? (totalAmount / donations.length).toFixed(2) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Donations Management
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
            <span>Add Donation</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{donations.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Donation</p>
          <p className="text-2xl font-bold text-primary-600">₹{averageAmount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Unique Donors</p>
          <p className="text-2xl font-bold text-orange-600">
            {new Set(donations.map(d => d.donor_name)).size}
          </p>
        </motion.div>
      </div>

      {/* Donations Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {donations.map((donation, index) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{donation.donor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{Number(donation.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(donation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                        {donation.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{donation.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(donation)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
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
        </motion.div>
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
                  {editingDonation ? 'Edit Donation' : 'Add New Donation'}
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
                    Donor Name
                  </label>
                  <input
                    type="text"
                    name="donor_name"
                    value={formData.donor_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                    placeholder="Enter donor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                    placeholder="Enter amount"
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
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 gradient-bg text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {editingDonation ? 'Update' : 'Create'}
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

export default Donations;