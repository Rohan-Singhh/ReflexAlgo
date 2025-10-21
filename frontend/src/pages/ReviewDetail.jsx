import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Code2, Zap, Clock, CheckCircle, AlertCircle, Copy, Check, Sparkles, TrendingUp, Target, Brain, Shield, BookOpen, ListChecks, BarChart3, Gauge, ExternalLink, AlertTriangle } from 'lucide-react';
import codeReviewService from '../services/codeReviewService';
import Button from '../components/ui/Button';

const AnalyzingSteps = [
  { icon: Brain, text: 'reading your code...', color: 'text-purple-400' },
  { icon: Target, text: 'detecting patterns...', color: 'text-blue-400' },
  { icon: Zap, text: 'analyzing complexity...', color: 'text-yellow-400' },
  { icon: Sparkles, text: 'generating optimizations...', color: 'text-emerald-400' },
  { icon: CheckCircle, text: 'finalizing results...', color: 'text-green-400' }
];

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    fetchReview();
  }, [id]);

  useEffect(() => {
    // Poll for updates if still analyzing
    if (review?.status === 'analyzing' && pollCount < 30) { // Max 30 polls (30 seconds)
      const interval = setInterval(() => {
        fetchReview();
        setPollCount(prev => prev + 1);
      }, 1000); // Poll every second
      return () => clearInterval(interval);
    }
  }, [review?.status, pollCount]);

  // Animate through steps while analyzing
  useEffect(() => {
    if (review?.status === 'analyzing') {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % AnalyzingSteps.length);
      }, 1500);
      return () => clearInterval(stepInterval);
    }
  }, [review?.status]);

  const fetchReview = async () => {
    try {
      const result = await codeReviewService.getReviewDetails(id);
      setReview(result.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch review:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'before') {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xl text-gray-400">loading review...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">review not found</h2>
          <p className="text-gray-400 mb-8">bruh, this review doesn't exist or got deleted 🤷</p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            back to dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const isAnalyzing = review.status === 'analyzing' || review.status === 'pending';

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>back to dashboard</span>
            </motion.button>

            <div className={`px-6 py-2.5 rounded-2xl border backdrop-blur-sm ${
              review.status === 'completed'
                ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                : review.status === 'analyzing'
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 animate-pulse'
                : review.status === 'failed'
                ? 'bg-red-600/10 border-red-500/30 text-red-400'
                : 'bg-orange-600/10 border-orange-500/30 text-orange-400'
            }`}>
              <span className="text-sm font-semibold capitalize">{review.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl">
              <Code2 className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">{review.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="px-3 py-1 bg-white/5 rounded-lg text-sm">{review.language}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{review.lineCount} lines</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{new Date(review.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {isAnalyzing ? (
          // 🔥 ANALYZING STATE - Gen-Z Style!
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 rounded-3xl blur-3xl animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-purple-500/20 rounded-3xl p-16">
              {/* Main Animation */}
              <div className="text-center mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative w-32 h-32 mx-auto mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                  <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 border-r-blue-500 border-transparent rounded-full"></div>
                  <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-white" />
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  AI is analyzing your code...
                </motion.h2>
                <p className="text-gray-400 text-lg mb-12">
                  hold tight, our AI is doing some serious optimization magic ✨
                </p>
              </div>

              {/* Animated Steps */}
              <div className="space-y-6 max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  {AnalyzingSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isPast = index < currentStep;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
                          x: 0,
                          scale: isActive ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center gap-4 p-6 rounded-2xl border transition-all ${
                          isActive 
                            ? 'bg-white/10 border-white/20' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          isActive ? 'bg-purple-600/30 animate-pulse' : 'bg-white/5'
                        }`}>
                          <Icon className={`w-6 h-6 ${isActive ? step.color : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-lg font-semibold ${
                            isActive ? 'text-white' : 'text-gray-500'
                          }`}>
                            {step.text}
                          </p>
                        </div>
                        {isPast && (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        )}
                        {isActive && (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Fun Fact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-12 text-center"
              >
                <p className="text-sm text-gray-500">
                  💡 <span className="text-purple-400">pro tip:</span> this usually takes 5-10 seconds. go grab a coffee? ☕
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : review.status === 'failed' ? (
          // Failed State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20 rounded-3xl p-16 text-center"
          >
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">analysis failed</h2>
            <p className="text-gray-400 text-lg mb-8">
              oops, something went wrong while analyzing your code. wanna try again? 🤔
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="secondary">
                <ArrowLeft className="w-5 h-5 mr-2" />
                back to dashboard
              </Button>
              <Button onClick={fetchReview} variant="primary">
                <Zap className="w-5 h-5 mr-2" />
                retry analysis
              </Button>
            </div>
          </motion.div>
        ) : (
          // 🎉 COMPLETED STATE - Show Results!
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-sm text-gray-500 mb-4 relative z-10">time complexity</p>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xl font-bold">
                    {review.analysis?.timeComplexity?.before || 'O(n)'}
                  </span>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-mono text-xl font-bold">
                    {review.analysis?.timeComplexity?.after || 'O(n)'}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-sm text-gray-500 mb-4 relative z-10">space complexity</p>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xl font-bold">
                    {review.analysis?.spaceComplexity?.before || 'O(1)'}
                  </span>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-mono text-xl font-bold">
                    {review.analysis?.spaceComplexity?.after || 'O(1)'}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-green-600/20 blur-xl"></div>
                <p className="text-sm text-emerald-400 mb-4 relative z-10">performance improvement</p>
                <div className="flex items-center gap-3 relative z-10">
                  <p className="text-6xl font-bold text-gradient">
                    {Math.round(review.analysis?.improvementPercentage || 0)}%
                  </p>
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            {review.analysis?.performanceMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Gauge className="w-7 h-7 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">performance metrics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {review.analysis.performanceMetrics.estimatedSpeedup && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-2">estimated speedup</p>
                      <p className="text-2xl font-bold text-emerald-400">{review.analysis.performanceMetrics.estimatedSpeedup}</p>
                    </div>
                  )}
                  {review.analysis.performanceMetrics.scalability && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-2">scalability</p>
                      <p className="text-lg text-gray-200">{review.analysis.performanceMetrics.scalability}</p>
                    </div>
                  )}
                  {review.analysis.performanceMetrics.worstCaseScenario && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-2">worst case</p>
                      <p className="text-lg text-gray-200 font-mono">{review.analysis.performanceMetrics.worstCaseScenario}</p>
                    </div>
                  )}
                  {review.analysis.performanceMetrics.realWorldImpact && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 mb-2">real-world impact</p>
                      <p className="text-lg text-gray-200">{review.analysis.performanceMetrics.realWorldImpact}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Complexity Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Time Complexity Details */}
              {review.analysis?.timeComplexity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8"
                >
                  <h3 className="text-2xl font-bold text-white mb-6">time complexity analysis</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{review.analysis.timeComplexity.explanation}</p>
                  
                  {review.analysis.timeComplexity.bottlenecks && review.analysis.timeComplexity.bottlenecks.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-red-400 mb-3">🔴 bottlenecks:</p>
                      <ul className="space-y-2">
                        {review.analysis.timeComplexity.bottlenecks.map((bottleneck, idx) => (
                          <li key={idx} className="text-sm text-gray-400 pl-4 border-l-2 border-red-500/30">{bottleneck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {review.analysis.timeComplexity.proofOfImprovement && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                      <p className="text-sm font-semibold text-emerald-400 mb-2">⚡ proof of improvement:</p>
                      <p className="text-sm text-gray-300">{review.analysis.timeComplexity.proofOfImprovement}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Space Complexity Details */}
              {review.analysis?.spaceComplexity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8"
                >
                  <h3 className="text-2xl font-bold text-white mb-6">space complexity analysis</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{review.analysis.spaceComplexity.explanation}</p>
                  
                  {review.analysis.spaceComplexity.memoryImpact && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                      <p className="text-sm font-semibold text-blue-400 mb-2">💾 memory impact:</p>
                      <p className="text-sm text-gray-300">{review.analysis.spaceComplexity.memoryImpact}</p>
                    </div>
                  )}
                  
                  {review.analysis.spaceComplexity.tradeoffs && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <p className="text-sm font-semibold text-orange-400 mb-2">⚖️ tradeoffs:</p>
                      <p className="text-sm text-gray-300">{review.analysis.spaceComplexity.tradeoffs}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* AI Summary */}
            {review.analysis?.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-7 h-7 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">AI summary</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{review.analysis.summary}</p>
              </motion.div>
            )}

            {/* Optimization Suggestions - Premium */}
            {review.analysis?.optimizationSuggestions && review.analysis.optimizationSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Target className="w-7 h-7 text-emerald-400" />
                  <h2 className="text-3xl font-bold text-white">optimization suggestions</h2>
                </div>
                <div className="space-y-6">
                  {review.analysis.optimizationSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-6">
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 ${
                          suggestion.priority === 'critical' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : suggestion.priority === 'high'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {suggestion.priority}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-3">{suggestion.title}</h3>
                          <p className="text-gray-400 mb-4 leading-relaxed">{suggestion.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {suggestion.impact && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                <p className="text-xs text-emerald-400 font-semibold mb-1">💥 IMPACT</p>
                                <p className="text-sm text-gray-300">{suggestion.impact}</p>
                              </div>
                            )}
                            {suggestion.estimatedEffort && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-xs text-blue-400 font-semibold mb-1">⏱️ TIME</p>
                                <p className="text-sm text-gray-300">{suggestion.estimatedEffort}</p>
                              </div>
                            )}
                          </div>

                          {suggestion.codeExample && (
                            <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4">
                              <p className="text-xs text-gray-500 mb-2">💻 code example:</p>
                              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{suggestion.codeExample}</pre>
                            </div>
                          )}

                          {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                              <p className="text-xs text-purple-400 font-semibold mb-2">🔄 ALTERNATIVES</p>
                              <ul className="space-y-1">
                                {suggestion.alternatives.map((alt, i) => (
                                  <li key={i} className="text-sm text-gray-300">• {alt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Code Smells */}
            {review.analysis?.codeSmells && review.analysis.codeSmells.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <AlertTriangle className="w-7 h-7 text-orange-400" />
                  <h2 className="text-3xl font-bold text-white">code smells detected</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.analysis.codeSmells.map((smell, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${
                        smell.severity === 'high' ? 'bg-red-500/20 text-red-400' : 
                        smell.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {smell.type}
                      </div>
                      <h4 className="text-white font-semibold mb-2">{smell.issue}</h4>
                      <p className="text-sm text-gray-400 mb-3">{smell.location}</p>
                      <p className="text-sm text-emerald-400">✓ {smell.fix}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Concerns */}
            {review.analysis?.securityConcerns && review.analysis.securityConcerns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Shield className="w-7 h-7 text-red-400" />
                  <h2 className="text-3xl font-bold text-white">security concerns</h2>
                </div>
                <div className="space-y-4">
                  {review.analysis.securityConcerns.map((concern, index) => (
                    <div key={index} className="bg-black/30 border border-red-500/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          concern.severity === 'high' ? 'bg-red-500/30 text-red-300' : 'bg-orange-500/30 text-orange-300'
                        }`}>
                          {concern.severity}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{concern.issue}</h4>
                          <p className="text-sm text-gray-400 mb-3">{concern.recommendation}</p>
                          {concern.lineNumber && (
                            <p className="text-xs text-gray-500">Line {concern.lineNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Detected Patterns */}
            {review.analysis?.detectedPatterns && review.analysis.detectedPatterns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Brain className="w-7 h-7 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">detected patterns</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {review.analysis.detectedPatterns.map((pattern, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">{pattern.pattern}</h4>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          pattern.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                          pattern.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pattern.confidence} confidence
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{pattern.location}</p>
                      <p className="text-sm text-gray-300">{pattern.usage}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quality Scores */}
            {review.analysis?.qualityBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <BarChart3 className="w-7 h-7 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">quality breakdown</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {review.analysis.qualityBreakdown.codeQuality && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">code quality</h4>
                        <span className="text-3xl font-bold text-emerald-400">{review.analysis.qualityBreakdown.codeQuality.score}</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(review.analysis.qualityBreakdown.codeQuality.factors || {}).map(([key, value]) => (
                          <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{key}</p>
                            <p className="text-sm text-gray-300">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {review.analysis.qualityBreakdown.readability && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">readability</h4>
                        <span className="text-3xl font-bold text-blue-400">{review.analysis.qualityBreakdown.readability.score}</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(review.analysis.qualityBreakdown.readability.factors || {}).map(([key, value]) => (
                          <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{key}</p>
                            <p className="text-sm text-gray-300">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Learning Resources */}
            {review.analysis?.learningResources && review.analysis.learningResources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <BookOpen className="w-7 h-7 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">learning resources</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.analysis.learningResources.map((resource, index) => (
                    <a 
                      key={index} 
                      href={resource.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2 group-hover:text-yellow-400 transition-colors">{resource.topic}</h4>
                          <p className="text-sm text-gray-400 mb-3">{resource.relevance}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            {review.analysis?.nextSteps && review.analysis.nextSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <ListChecks className="w-7 h-7 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">next steps</h2>
                </div>
                <div className="space-y-3">
                  {review.analysis.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ROI Analysis */}
            {review.analysis?.estimatedROI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-500/20 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-7 h-7 text-emerald-400" />
                  <h2 className="text-3xl font-bold text-white">ROI analysis</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {review.analysis.estimatedROI.developmentTime && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">⏱️ time investment</p>
                      <p className="text-2xl font-bold text-white">{review.analysis.estimatedROI.developmentTime}</p>
                    </div>
                  )}
                  {review.analysis.estimatedROI.performanceGain && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">🚀 performance gain</p>
                      <p className="text-2xl font-bold text-emerald-400">{review.analysis.estimatedROI.performanceGain}</p>
                    </div>
                  )}
                  {review.analysis.estimatedROI.maintenanceReduction && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">🛠️ maintenance</p>
                      <p className="text-2xl font-bold text-blue-400">{review.analysis.estimatedROI.maintenanceReduction}</p>
                    </div>
                  )}
                  {review.analysis.estimatedROI.userExperienceImprovement && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-400 mb-2">✨ UX improvement</p>
                      <p className="text-2xl font-bold text-purple-400">{review.analysis.estimatedROI.userExperienceImprovement}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Code Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Original Code */}
              <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">original code</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(review.code, 'before')}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    {copiedBefore ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.button>
                </div>
                <pre className="bg-black/50 border border-white/5 rounded-2xl p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
                  <code className="text-gray-300 text-sm font-mono leading-relaxed">{review.code}</code>
                </pre>
              </div>

              {/* Optimized Code */}
              {review.optimizedCode && (
                <div className="bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-semibold">
                    ✨ optimized
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">optimized code</h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(review.optimizedCode, 'after')}
                      className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      {copiedAfter ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </motion.button>
                  </div>
                  <pre className="bg-black/50 border border-emerald-500/20 rounded-2xl p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
                    <code className="text-gray-300 text-sm font-mono leading-relaxed">{review.optimizedCode}</code>
                  </pre>
                </div>
              )}
            </motion.div>

            {/* Back to Dashboard CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                back to dashboard
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
