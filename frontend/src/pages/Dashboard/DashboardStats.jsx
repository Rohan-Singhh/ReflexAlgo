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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.2,
            delay: index * 0.05
          }}
          whileHover={{ y: -4 }}
          className="relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 overflow-hidden group cursor-pointer hover:border-white/20 transition-all duration-150"
        >
          {/* Animated background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.08] transition-all duration-300`} />
          
          {/* Floating orb effect */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-[0.15] group-hover:opacity-25 transition-opacity duration-300`} />
          
          <div className="relative z-10">
            {/* Change badge - top right */}
            <div className="absolute top-0 right-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-xs text-emerald-400 font-semibold">{stat.change}</span>
            </div>

            {/* Icon */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} blur-xl opacity-40 group-hover:opacity-70 transition-opacity`} />
                <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-2xl`}>
                  <stat.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
            
            {/* Value */}
            <p className="text-5xl font-bold text-white mb-3 tracking-tighter">
              {stat.value}
            </p>
            
            {/* Label */}
            <p className="text-sm font-medium text-gray-400 mb-1.5">{stat.label}</p>
            <p className="text-xs text-gray-600">{stat.subtitle}</p>
          </div>

          {/* Shine effect on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;

