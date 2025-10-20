import { memo } from 'react';
import { motion } from 'framer-motion';

const DashboardWelcome = memo(({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white mb-3">
            gm {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-xl">
            ready to make your code <span className="text-gradient font-semibold">lightning fast?</span> 
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-xs text-gray-500 mb-1.5">world rank</p>
            <p className="text-2xl font-bold text-white">#2,456</p>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-xs text-gray-500 mb-1.5">level</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

DashboardWelcome.displayName = 'DashboardWelcome';

export default DashboardWelcome;

