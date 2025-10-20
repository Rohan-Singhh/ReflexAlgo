import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Crown } from 'lucide-react';

const DashboardWelcome = memo(({ user, stats, onOpenPricing }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mb-20"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-3 tracking-wide uppercase">dashboard</p>
                <h1 className="text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                  gm {user?.name?.split(' ')[0] || 'friend'} 👋
                </h1>
          <p className="text-gray-400 text-2xl font-light max-w-2xl leading-relaxed">
            ready to make your code <span className="text-gradient font-semibold">lightning fast?</span> 
          </p>
        </div>
        
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">world rank</p>
            </div>
            <p className="text-4xl font-bold text-white">#{stats?.rank || '—'}</p>
            <p className="text-xs text-green-400 mt-1">
              {stats?.rankChange > 0 ? `↑ ${stats.rankChange}` : stats?.rankChange < 0 ? `↓ ${Math.abs(stats.rankChange)}` : '—'} this week
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="px-8 py-5 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl backdrop-blur-xl hover:border-purple-500/40 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">level</p>
            </div>
            <p className="text-4xl font-bold text-white">{stats?.level || 1}</p>
            <p className="text-xs text-purple-400 mt-1">
              {stats?.experienceToNextLevel ? `${Math.round((stats.experience / stats.experienceToNextLevel) * 100)}% to level ${(stats.level || 1) + 1}` : 'Level up!'}
            </p>
          </motion.div>

          {/* Upgrade CTA */}
          <motion.button
            onClick={onOpenPricing}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="px-8 py-5 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl backdrop-blur-xl hover:border-yellow-500/50 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform duration-150" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">upgrade</p>
            </div>
            <p className="text-2xl font-bold text-white">unlock pro</p>
            <p className="text-xs text-yellow-400 mt-1">from $4/month</p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

DashboardWelcome.displayName = 'DashboardWelcome';

export default DashboardWelcome;

