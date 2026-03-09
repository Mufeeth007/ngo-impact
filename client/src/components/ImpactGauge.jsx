import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaArrowUp, FaArrowDown, FaStar } from 'react-icons/fa';

// Make sure this is exported as default
const InsightsBox = ({ insights }) => {
  // Default insights if none provided
  const defaultInsights = [
    { text: "Education programs increased by 28% this quarter", type: "positive", icon: FaArrowUp },
    { text: "Chennai has the highest beneficiary count", type: "neutral", icon: FaStar },
    { text: "Healthcare funding efficiency improved by 15%", type: "positive", icon: FaArrowUp },
    { text: "Food distribution costs reduced by 8%", type: "positive", icon: FaArrowUp },
    { text: "New location added in Bangalore", type: "neutral", icon: FaStar },
    { text: "Donor retention rate increased to 72%", type: "positive", icon: FaArrowUp },
  ];

  const displayInsights = insights || defaultInsights;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <FaLightbulb className="text-yellow-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          AI-Powered Insights
        </h3>
      </div>

      <div className="space-y-3">
        {displayInsights.map((insight, index) => {
          const Icon = insight.icon;
          const colorClass = insight.type === 'positive' 
            ? 'text-green-500' 
            : insight.type === 'negative' 
            ? 'text-red-500' 
            : 'text-blue-500';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon className={`${colorClass} mt-1 flex-shrink-0`} />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {insight.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* AI Confidence Score */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">AI Confidence</span>
          <span className="font-semibold text-primary-600">94%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '94%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

// IMPORTANT: This must be a default export
export default InsightsBox;