import { memo } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, CheckCircle, Code2, ArrowRight, Sparkles, Trophy, TrendingUp, Activity, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';

const recentReviews = [
  {
    id: 1,
    title: 'binary search implementation',
    language: 'JavaScript',
    complexity: 'O(n²)',
    improved: 'O(log n)',
    status: 'optimized',
    improvement: '85%',
    date: '2h ago',
    lines: 42
  },
  {
    id: 2,
    title: 'two sum problem',
    language: 'Python',
    complexity: 'O(n²)',
    improved: 'O(n)',
    status: 'optimized',
    improvement: '92%',
    date: '5h ago',
    lines: 28
  },
  {
    id: 3,
    title: 'merge sort algorithm',
    language: 'Java',
    complexity: 'O(n log n)',
    improved: 'O(n log n)',
    status: 'optimal',
    improvement: '15%',
    date: '1d ago',
    lines: 67
  },
];

const dsa_patterns = [
  { name: 'Sliding Window', mastery: 80, solved: 8, total: 10, emoji: '🪟', color: 'from-blue-500 to-cyan-500' },
  { name: 'Two Pointers', mastery: 60, solved: 6, total: 10, emoji: '👉', color: 'from-purple-500 to-pink-500' },
  { name: 'Binary Search', mastery: 90, solved: 9, total: 10, emoji: '🔍', color: 'from-emerald-500 to-green-500' },
  { name: 'Dynamic Programming', mastery: 40, solved: 4, total: 10, emoji: '🧮', color: 'from-orange-500 to-red-500' },
];

const leaderboard = [
  { rank: 1, name: 'alex_codes', score: 2847, avatar: '🚀', change: '+12' },
  { rank: 2, name: 'you', score: 2456, avatar: '⭐', change: '+124', highlight: true },
  { rank: 3, name: 'code_ninja', score: 2398, avatar: '🥷', change: '+8' },
  { rank: 4, name: 'dev_master', score: 2287, avatar: '👨‍💻', change: '+45' },
  { rank: 5, name: 'algo_queen', score: 2156, avatar: '👑', change: '+67' },
];

const DashboardContent = memo(({ activeTab }) => {
  if (activeTab !== 'overview') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-4">🚧 {activeTab} section</p>
          <p className="text-gray-500">coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Upload CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
        <div className="relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-12 hover:border-white/20 transition-all duration-150">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white">ready to optimize?</h3>
              </div>
              <p className="text-gray-400 text-lg mb-2">
                drop your code. AI analyzes it. you get better. simple as that. 🚀
              </p>
              <p className="text-gray-600 text-sm">
                supports JavaScript, Python, Java, C++, and 12 more languages
              </p>
            </div>
            <Button variant="primary" size="lg" className="group/btn whitespace-nowrap">
              <Upload className="w-5 h-5 mr-2" />
              upload code
              <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column - Reviews & Patterns (2/3 width) */}
        <div className="xl:col-span-2 space-y-10">
          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">recent reviews</h2>
                <p className="text-gray-500">your latest code optimizations</p>
              </div>
              <Button variant="secondary" size="sm" className="group">
                view all
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="space-y-5">
              {recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl">
                          <Code2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                            {review.title}
                          </h3>
                          <p className="text-sm text-gray-500">{review.language} • {review.lines} lines • {review.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">before</p>
                          <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-mono">
                            {review.complexity}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">after</p>
                          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-mono">
                            {review.improved}
                          </span>
                        </div>
                        <div className="ml-auto">
                          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl">
                            <p className="text-xs text-gray-500 mb-0.5">improvement</p>
                            <p className="text-2xl font-bold text-emerald-400">{review.improvement}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group-hover:scale-110">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* DSA Pattern Mastery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">pattern mastery</h2>
              <p className="text-gray-500">track your progress across DSA patterns</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dsa_patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-150 group cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{pattern.emoji}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{pattern.name}</h3>
                        <p className="text-sm text-gray-500">{pattern.solved}/{pattern.total} solved</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{pattern.mastery}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pattern.mastery}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`h-full bg-gradient-to-r ${pattern.color} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Leaderboard (1/3 width) */}
        <div className="xl:col-span-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="sticky top-32"
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">leaderboard</h2>
              <p className="text-gray-500">top performers this week</p>
            </div>

            <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className={`flex items-center gap-5 p-5 rounded-2xl transition-all duration-150 ${
                    user.highlight
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                  } cursor-pointer group`}
                >
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    user.rank === 1 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                      : user.rank === 2
                      ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/50'
                      : user.rank === 3
                      ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/50'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {user.rank}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{user.avatar}</span>
                      <p className={`font-semibold truncate ${user.highlight ? 'text-white' : 'text-gray-300'}`}>
                        {user.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.score.toLocaleString()} pts
                    </p>
                  </div>

                  {/* Change Badge */}
                  <div className="flex-shrink-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-xs font-semibold text-emerald-400">{user.change}</span>
                  </div>
                </motion.div>
              ))}

              {/* View Full Leaderboard */}
              <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-white font-medium transition-all duration-150 group">
                <span className="flex items-center justify-center gap-2">
                  view full leaderboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
