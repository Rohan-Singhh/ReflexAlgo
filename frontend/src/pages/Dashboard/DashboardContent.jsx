import { memo } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, CheckCircle, XCircle, BarChart3, Award, FileCode, ArrowRight, Play, Code, Sparkles, Trophy, Medal, Target } from 'lucide-react';
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
  { rank: 2, name: 'sarah.dev', score: 2734, avatar: '⚡', change: '+8' },
  { rank: 3, name: 'mike_algo', score: 2621, avatar: '🔥', change: '+5' },
  { rank: 4, name: 'you', score: 2456, avatar: '💻', change: '+15', highlight: true },
  { rank: 5, name: 'priya_tech', score: 2389, avatar: '✨', change: '+3' },
];

const DashboardContent = memo(({ activeTab }) => {
  // Overview Tab
  if (activeTab === 'overview' || !activeTab) {
    return (
      <div className="space-y-12">
        {/* Upload CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-3xl p-10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10" />
          
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">upload your code</h2>
              </div>
              <p className="text-gray-300 mb-4">get AI-powered optimization suggestions in seconds ⚡</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  10+ languages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  &lt;2s analysis
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  instant feedback
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" className="group">
                <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                upload file
              </Button>
              <Button variant="secondary" size="lg">
                <Code className="w-5 h-5 mr-2" />
                paste code
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">recent reviews 📝</h3>
              <p className="text-base text-gray-400">your latest code optimizations</p>
            </div>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              view all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-6">
            {recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4, scale: 1.01 }}
                className="relative bg-gradient-to-br from-gray-900/80 to-black border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Status glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  review.status === 'optimized' 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold text-lg">{review.title}</h4>
                      {review.status === 'optimized' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-medium">
                          ✓ optimized
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400 font-medium">
                          ⚡ optimal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-4 h-4" />
                        {review.language}
                      </span>
                      <span>•</span>
                      <span>{review.lines} lines</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1.5">original</p>
                    <p className="text-lg font-mono font-bold text-red-400">{review.complexity}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1.5">optimized</p>
                    <p className="text-lg font-mono font-bold text-green-400">{review.improved}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-4 border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 mb-1.5">speed boost</p>
                    <p className="text-lg font-bold text-emerald-400">{review.improvement} 🚀</p>
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="mt-4 w-full group">
                  <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  view details
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* DSA Pattern Mastery */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">pattern mastery 🧠</h3>
              <p className="text-base text-gray-400">track your DSA pattern progress</p>
            </div>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              practice
              <Target className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dsa_patterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-gradient-to-br from-gray-900/80 to-black border border-white/10 rounded-2xl p-6 overflow-hidden group"
              >
                {/* Pattern glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pattern.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{pattern.emoji}</span>
                      <div>
                        <h4 className="text-white font-semibold">{pattern.name}</h4>
                        <p className="text-xs text-gray-400">{pattern.solved}/{pattern.total} solved</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{pattern.mastery}%</p>
                      <p className="text-xs text-gray-400">mastery</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pattern.mastery}%` }}
                      transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${pattern.color} rounded-full relative overflow-hidden`}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Achievement badge */}
                  {pattern.mastery >= 80 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                      className="absolute top-2 right-2 bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-lg"
                    >
                      <Trophy className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Leaderboard Tab
  if (activeTab === 'leaderboard') {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">global leaderboard 🏆</h2>
          <p className="text-lg text-gray-400">see how you rank against top coders worldwide</p>
        </div>

        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-br ${
                user.highlight 
                  ? 'from-purple-900/30 to-indigo-900/30 border-purple-500/50' 
                  : 'from-gray-900/80 to-black border-white/10'
              } border rounded-2xl p-6 flex items-center justify-between group hover:border-purple-500/30 transition-all`}
            >
              {user.highlight && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-2xl" />
              )}
              
              <div className="relative flex items-center gap-4 flex-1">
                {/* Rank */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  user.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                  user.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  user.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                  'bg-white/10'
                }`}>
                  <span className="text-xl font-bold text-white">
                    {user.rank <= 3 ? (
                      user.rank === 1 ? '🥇' :
                      user.rank === 2 ? '🥈' : '🥉'
                    ) : user.rank}
                  </span>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                    {user.avatar}
                  </div>
                  <div>
                    <p className={`font-bold ${user.highlight ? 'text-purple-400' : 'text-white'}`}>
                      {user.name}
                      {user.highlight && ' (you)'}
                    </p>
                    <p className="text-sm text-gray-400">{user.score.toLocaleString()} points</p>
                  </div>
                </div>

                {/* Change */}
                <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <span className="text-sm font-bold text-emerald-400">{user.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="primary" size="lg">
            <Trophy className="w-5 h-5 mr-2" />
            climb the ranks
          </Button>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="text-center py-12">
      <p className="text-gray-400">coming soon... 🚧</p>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
