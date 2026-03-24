import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaDonate, FaMoneyBillWave } from 'react-icons/fa';
import { useCountUp } from '../../hooks/useCountUp';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Activities',
      value: stats.activities,
      icon: FaCalendarAlt,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500',
      prefix: ''
    },
    {
      title: 'Total Beneficiaries',
      value: stats.beneficiaries,
      icon: FaUsers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500',
      prefix: ''
    },
    {
      title: 'Total Donations',
      value: stats.donations,
      icon: FaDonate,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500',
      prefix: ''
    },
    {
      title: 'Total Funds Used',
      value: stats.funds,
      icon: FaMoneyBillWave,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500',
      prefix: '₹'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const animatedValue = useCountUp(card.value);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <Icon className="text-white text-xl" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {card.title}
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {card.prefix}{animatedValue.toLocaleString()}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardStats;