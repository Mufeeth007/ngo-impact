import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Charts = ({ monthlyData, categoryData, fundData }) => {
  // Default data if API data is not available
  const defaultMonthlyData = [
    { month: 'Jan', count: 65 },
    { month: 'Feb', count: 78 },
    { month: 'Mar', count: 90 },
    { month: 'Apr', count: 85 },
    { month: 'May', count: 95 },
    { month: 'Jun', count: 110 }
  ];

  const defaultCategoryData = [
    { category: 'Education', impact: 85 },
    { category: 'Healthcare', impact: 72 },
    { category: 'Food', impact: 68 },
    { category: 'Shelter', impact: 90 },
    { category: 'Training', impact: 78 }
  ];

  const defaultFundData = [
    { category: 'Education', amount: 40 },
    { category: 'Healthcare', amount: 25 },
    { category: 'Food', amount: 20 },
    { category: 'Shelter', amount: 15 }
  ];

  const lineChartData = {
    labels: monthlyData?.map(d => d.month) || defaultMonthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Beneficiaries Reached',
        data: monthlyData?.map(d => d.count) || defaultMonthlyData.map(d => d.count),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const pieChartData = {
    labels: fundData?.map(d => d.category) || defaultFundData.map(d => d.category),
    datasets: [
      {
        data: fundData?.map(d => d.amount) || defaultFundData.map(d => d.amount),
        backgroundColor: [
          '#14b8a6',
          '#f97316',
          '#8b5cf6',
          '#ef4444',
          '#10b981',
          '#f59e0b'
        ],
        borderWidth: 0,
      }
    ]
  };

  const barChartData = {
    labels: categoryData?.map(d => d.category) || defaultCategoryData.map(d => d.category),
    datasets: [
      {
        label: 'Impact by Category',
        data: categoryData?.map(d => d.impact) || defaultCategoryData.map(d => d.impact),
        backgroundColor: '#14b8a6',
        borderRadius: 8,
        barPercentage: 0.6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6b7280',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - Monthly Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Monthly Impact Trend
        </h3>
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Pie Chart - Fund Utilization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Fund Utilization
        </h3>
        <div className="h-64">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      </motion.div>

      {/* Bar Chart - Category Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-6 lg:col-span-2"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Category-wise Impact
        </h3>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default Charts;