import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default Layout;