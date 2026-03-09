import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import { FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaChartLine } from 'react-icons/fa';

const OverviewCards = ({ data }) => {
  const beneficiaries = useCountUp(data?.totalBeneficiaries || 0);
  const funds = useCountUp(data?.totalFunds || 0);
  const locations = useCountUp(data?.activeLocations || 0);
  const growth = useCountUp(data?.impactGrowth || 0);

  const cards = [
    {
      title: 'Total Beneficiaries',
      value: beneficiaries,
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500',
      prefix: ''
    },
    {
      title: 'Total Funds Used',
      value: funds,
      icon: FaMoneyBillWave,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500',
      prefix: '₹'
    },
    {
      title: 'Active Locations',
      value: locations,
      icon: FaMapMarkerAlt,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500',
      prefix: ''
    },
    {
      title: 'Impact Growth',
      value: growth,
      icon: FaChartLine,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500',
      prefix: '',
      suffix: '%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card rounded-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {card.prefix}{card.value}{card.suffix}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <Icon className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((parseInt(card.value) / 1000) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-2 rounded-full bg-gradient-to-r ${card.color}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OverviewCards;