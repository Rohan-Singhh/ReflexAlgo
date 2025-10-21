import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Clock, CheckCircle, Code2, ArrowRight, Sparkles, Trophy, TrendingUp, Activity, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';

const dsa_patterns_default = [
  { name: 'Sliding Window', mastery: 0, solved: 0, total: 10, emoji: '🪟', color: 'from-blue-500 to-cyan-500' },
  { name: 'Two Pointers', mastery: 0, solved: 0, total: 10, emoji: '👉', color: 'from-purple-500 to-pink-500' },
  { name: 'Binary Search', mastery: 0, solved: 0, total: 10, emoji: '🔍', color: 'from-emerald-500 to-green-500' },
  { name: 'Dynamic Programming', mastery: 0, solved: 0, total: 10, emoji: '🧮', color: 'from-orange-500 to-red-500' },
];

const defaultLeaderboard = [
  { rank: 1, name: 'Loading...', score: 0, avatar: '⏳', change: '' },
];

const DashboardContent = memo(({ activeTab, reviews, patterns, leaderboard, onOpenUpload, allReviews, setActiveTab }) => {
  const navigate = useNavigate();
  // Only show real reviews from database, no dummy data
  const recentReviews = reviews && reviews.length > 0 ? reviews : [];
  const dsa_patterns = patterns && patterns.length > 0 ? patterns : dsa_patterns_default;
  
  // Reviews Tab
  if (activeTab === 'reviews') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">all reviews</h2>
          <p className="text-gray-500">your complete code review history</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-150"
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Code2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <h3 className="text-xl font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                        {review.title}
                      </h3>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-400">
                        {review.language}
                      </span>
                    </div>

                    {/* Premium Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {/* Date & Lines */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                          <Clock className="w-3 h-3" />
                          <span>analyzed</span>
                        </div>
                        <p className="text-sm text-white font-medium">{review.date}</p>
                        <p className="text-xs text-gray-500 mt-1">{review.lines} lines</p>
                      </div>

                      {/* Complexity */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">complexity</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-mono">{review.complexity}</span>
                          <span className="text-gray-600">→</span>
                          <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-mono">{review.improved}</span>
                        </div>
                      </div>

                      {/* Performance Improvement */}
                      {review.improvement !== '0%' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-xs text-emerald-500 mb-1">⚡ speedup</p>
                          <p className="text-2xl font-bold text-emerald-400">{review.improvement}</p>
                        </div>
                      )}

                      {/* Quality Score (if available) */}
                      {review.qualityScore && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-blue-500 mb-1">💎 quality</p>
                          <p className="text-2xl font-bold text-blue-400">{review.qualityScore}/100</p>
                        </div>
                      )}
                    </div>

                    {/* Premium Insights Row */}
                    {(review.suggestionsCount > 0 || review.securityIssuesCount > 0 || review.patternsDetected > 0 || review.speedup) && (
                      <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {review.suggestionsCount > 0 && (
                          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">{review.suggestionsCount} optimizations</span>
                          </div>
                        )}
                        {review.securityIssuesCount > 0 && (
                          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-xs font-medium text-red-400">⚠️ {review.securityIssuesCount} security alerts</span>
                          </div>
                        )}
                        {review.patternsDetected > 0 && (
                          <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-400">🧠 {review.patternsDetected} patterns found</span>
                          </div>
                        )}
                        {review.speedup && (
                          <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-400">{review.speedup}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                      review.status === 'optimized'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : review.status === 'analyzing'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      {review.status === 'optimized' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {review.status === 'analyzing' && <Clock className="w-4 h-4 text-blue-400 animate-spin" />}
                      <span className={`text-sm font-medium ${
                        review.status === 'optimized'
                          ? 'text-emerald-400'
                          : review.status === 'analyzing'
                          ? 'text-blue-400'
                          : 'text-yellow-400'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Code2 className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">no reviews yet</h3>
              <p className="text-gray-500">upload your first code from the overview tab to get AI-powered optimization insights</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Leaderboard Tab - Cool & Modern Design
  if (activeTab === 'leaderboard') {
    const leaderboardData = leaderboard && leaderboard.length > 0 ? leaderboard : defaultLeaderboard;
    const topThree = leaderboardData.slice(0, 3);
    const rest = leaderboardData.slice(3);
    
    return (
      <div className="space-y-8">
        {/* Header with Trophy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
            >
              <Trophy className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white">leaderboard</h2>
              <p className="text-gray-500 text-sm">compete. climb. conquer.</p>
            </div>
          </div>
        </div>

        {/* Top 3 - Compact Podium */}
        {topThree.length >= 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl p-4 hover:border-gray-400/30 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">{topThree[1]?.avatar || '⭐'}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      2
                    </div>
                  </div>
                  <p className="text-base font-bold text-white mb-1 truncate w-full text-center">{topThree[1]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mb-2">{topThree[1]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-16 bg-gradient-to-t from-gray-500/20 to-gray-600/10 border-t-2 border-gray-400 rounded-t-lg" />
                </div>
              </motion.div>

              {/* 1st Place - Tallest */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-yellow-500/30 rounded-2xl p-4 hover:border-yellow-500/50 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent" />
                <div className="relative flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30">
                      <span className="text-3xl">{topThree[0]?.avatar || '👑'}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      1
                    </div>
                    <Sparkles className="absolute -top-0.5 -left-0.5 w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-lg font-bold text-white mb-1 truncate w-full text-center">{topThree[0]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-300 mb-2">{topThree[0]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-24 bg-gradient-to-t from-yellow-500/20 to-orange-500/10 border-t-2 border-yellow-400 rounded-t-lg" />
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl p-4 hover:border-orange-600/30 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">{topThree[2]?.avatar || '🥉'}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      3
                    </div>
                  </div>
                  <p className="text-base font-bold text-white mb-1 truncate w-full text-center">{topThree[2]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mb-2">{topThree[2]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-12 bg-gradient-to-t from-orange-600/20 to-orange-700/10 border-t-2 border-orange-600 rounded-t-lg" />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {rest.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 px-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              rising stars
            </h3>
            {rest.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-150 ${
                  user.highlight
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/40'
                    : 'bg-[#141414] border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]'
                }`}
              >
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                  user.highlight
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10'
                }`}>
                  {user.rank}
                </div>

                {/* User Info */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{user.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${user.highlight ? 'text-white' : 'text-gray-200'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.score.toLocaleString()} pts
                    </p>
                  </div>
                </div>

                {/* Change Badge */}
                {user.change && user.change !== '0' && (
                  <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    user.change.startsWith('+') 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {user.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    {user.change}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {leaderboardData.length <= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <p className="text-gray-300 text-sm">
                complete more code reviews to climb the leaderboard! 🚀
              </p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }
  
  // Other tabs (patterns, etc.)
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
            <Button 
              variant="primary" 
              size="lg" 
              className="group/btn whitespace-nowrap"
              onClick={onOpenUpload}
            >
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
              {recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/review/${review.id}`)}
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
                            {review.title || 'Untitled Review'}
                          </h3>
                          <p className="text-sm text-gray-500">{review.language || 'Code'} • {review.lines || 0} lines • {review.date || 'Just now'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">before</p>
                          <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-mono">
                            {review.complexity || 'O(n)'}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">after</p>
                          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-mono">
                            {review.improved || 'O(n)'}
                          </span>
                        </div>
                        <div className="ml-auto">
                          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl">
                            <p className="text-xs text-gray-500 mb-0.5">improvement</p>
                            <p className="text-2xl font-bold text-emerald-400">{review.improvement || '0%'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-4 py-2 rounded-xl border text-xs font-semibold ${
                        review.status === 'completed' || review.status === 'optimized'
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                          : review.status === 'analyzing' || review.status === 'pending'
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 animate-pulse'
                          : review.status === 'failed'
                          ? 'bg-red-600/10 border-red-500/30 text-red-400'
                          : 'bg-gray-600/10 border-gray-500/30 text-gray-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{review.status || 'pending'}</span>
                          {(review.status === 'analyzing' || review.status === 'pending') && (
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group-hover:scale-110">
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-16 text-center">
                  <Code2 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400 mb-2">no reviews yet</p>
                  <p className="text-sm text-gray-600">upload your first code to get AI-powered analysis!</p>
                </div>
              )}
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
              {(leaderboard && leaderboard.length > 0 ? leaderboard : defaultLeaderboard).map((user, index) => (
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

                  {/* Change Badge - Only show if there's actual change */}
                  {user.change && user.change !== '0' && (
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-full ${
                      user.change.startsWith('+') 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <span className={`text-xs font-semibold ${
                        user.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {user.change}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* View Full Leaderboard */}
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-white font-medium transition-all duration-150 group cursor-pointer"
              >
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
