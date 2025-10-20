import { memo } from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, TrendingUp, Flame, Trophy, Target, Rocket } from 'lucide-react';

const stats = [
  { 
    label: 'total reviews', 
    value: '24', 
    icon: Code2, 
    color: 'from-blue-500 to-cyan-500', 
    change: '+12%',
    subtitle: 'this month',
    bgGlow: 'blue'
  },
  { 
    label: 'optimizations', 
    value: '18', 
    icon: Zap, 
    color: 'from-purple-500 to-pink-500', 
    change: '+8%',
    subtitle: '75% success rate',
    bgGlow: 'purple'
  },
  { 
    label: 'avg speed boost', 
    value: '8.5x', 
    icon: Rocket, 
    color: 'from-emerald-500 to-green-500', 
    change: '+2.3x',
    subtitle: 'faster code',
    bgGlow: 'emerald'
  },
  { 
    label: 'streak 🔥', 
    value: '7', 
    icon: Flame, 
    color: 'from-orange-500 to-red-500', 
    change: 'keep going!',
    subtitle: 'days coding',
    bgGlow: 'orange'
  },
];

const DashboardStats = memo(() => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-2xl p-6 overflow-hidden group cursor-pointer"
        >
          {/* Animated background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-all duration-500`} />
          
          {/* Floating orb effect */}
          <motion.div
            className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10">
            {/* Icon and change badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} blur-lg opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className={`relative p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
              >
                <span className="text-xs text-emerald-400 font-bold">{stat.change}</span>
              </motion.div>
            </div>
            
            {/* Value */}
            <motion.p 
              className="text-4xl font-bold text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {stat.value}
            </motion.p>
            
            {/* Label */}
            <p className="text-sm font-medium text-gray-300 mb-1">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>

          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;

