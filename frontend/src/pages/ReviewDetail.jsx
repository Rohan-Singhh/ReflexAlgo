import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Code2, Zap, Clock, CheckCircle, AlertCircle, Copy, Check, Sparkles, TrendingUp, Target, Brain } from 'lucide-react';
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

            {/* AI Summary */}
            {review.analysis?.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-7 h-7 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">AI summary</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{review.analysis.summary}</p>
              </motion.div>
            )}

            {/* Issues Found */}
            {review.analysis?.issues && review.analysis.issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-12"
              >
                <h2 className="text-3xl font-bold text-white mb-8">issues found</h2>
                <div className="space-y-5">
                  {review.analysis.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-5">
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          issue.severity === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : issue.severity === 'medium'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {issue.severity}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-3">{issue.type}</h3>
                          <p className="text-gray-400 mb-4 leading-relaxed">{issue.description}</p>
                          {issue.suggestion && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                              <p className="text-sm text-emerald-400 font-semibold mb-2">💡 suggestion:</p>
                              <p className="text-sm text-gray-300 leading-relaxed">{issue.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
