import { memo } from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Rocket, Flame } from 'lucide-react';

const getStatsData = (s) => {
  const total = s?.totalReviews || 0;
  const optimized = s?.optimizedReviews || 0;
  const successRate = total > 0 ? Math.round((optimized / total) * 100) : 0;
  return [
    { label: 'Total reviews', value: String(total), icon: Code2, accent: 'text-sky-300', sub: 'All time' },
    { label: 'Optimizations', value: String(optimized), icon: Zap, accent: 'text-violet-300', sub: `${successRate}% success rate` },
    { label: 'Avg improvement', value: `${Math.round(s?.averageImprovement || 0)}%`, icon: Rocket, accent: 'text-emerald-300', sub: 'Across reviews' },
    { label: 'Current streak', value: `${s?.currentStreak || 0}`, icon: Flame, accent: 'text-orange-300', sub: s?.currentStreak === 1 ? 'day' : 'days' },
  ];
};

const DashboardStats = memo(({ dashboardStats }) => {
  const stats = getStatsData(dashboardStats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-16">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-200 hover:border-white/15"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="grid place-items-center w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03]">
              <stat.icon className={`w-5 h-5 ${stat.accent}`} strokeWidth={1.75} />
            </div>
          </div>
          <p className="text-4xl font-semibold tracking-tight text-white">{stat.value}</p>
          <p className="mt-2 text-sm font-medium text-zinc-300">{stat.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
