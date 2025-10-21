import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Code2, FileCode, ChevronRight, ChevronLeft, Check, CheckCircle, Sparkles, Brain, Target, Zap, TrendingUp, Copy, ExternalLink, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import codeReviewService from '../../services/codeReviewService';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CODE_LENGTH = 50000; // 50k characters
const POLL_INTERVAL = 2500; // 2.5 seconds - optimized to reduce server load
const STEP_INTERVAL = 2800; // 2.8 seconds per step = ~14 seconds total for 5 steps
const HIGH_TRAFFIC_THRESHOLD = 15000; // Show message after 15 seconds

const LANGUAGES = [
  { value: 'JavaScript', label: 'JavaScript', icon: '🟨' },
  { value: 'TypeScript', label: 'TypeScript', icon: '🔷' },
  { value: 'Python', label: 'Python', icon: '🐍' },
  { value: 'Java', label: 'Java', icon: '☕' },
  { value: 'C++', label: 'C++', icon: '⚙️' },
  { value: 'C', label: 'C', icon: '🔧' },
  { value: 'Go', label: 'Go', icon: '🐹' },
  { value: 'Rust', label: 'Rust', icon: '🦀' },
  { value: 'Ruby', label: 'Ruby', icon: '💎' },
  { value: 'PHP', label: 'PHP', icon: '🐘' },
  { value: 'Swift', label: 'Swift', icon: '🦅' },
  { value: 'Kotlin', label: 'Kotlin', icon: '🎯' },
  { value: 'C#', label: 'C#', icon: '💜' },
  { value: 'Other', label: 'Other', icon: '📝' }
];

const AnalyzingSteps = [
  { icon: Brain, text: 'reading your code...', color: 'text-purple-400' },
  { icon: Target, text: 'detecting patterns...', color: 'text-blue-400' },
  { icon: Zap, text: 'analyzing complexity...', color: 'text-yellow-400' },
  { icon: Sparkles, text: 'generating optimizations...', color: 'text-emerald-400' },
  { icon: CheckCircle, text: 'finalizing results...', color: 'text-green-400' }
];

// ⚡ OPTIMIZED ANIMATION PRESETS - Fast & buttery smooth
const SMOOTH = { duration: 0.15, ease: [0.4, 0, 0.2, 1] }; // Smooth cubic-bezier
const FAST = { duration: 0.1, ease: [0.4, 0, 0.2, 1] };
const SPRING = { type: "spring", stiffness: 400, damping: 25 };

const CodeUpload = ({ onSubmit, onClose, onOpenPricing, subscription }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('');
  const [method, setMethod] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzingStep, setCurrentAnalyzingStep] = useState(0);
  const [reviewId, setReviewId] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHighTrafficMsg, setShowHighTrafficMsg] = useState(false);
  
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // ⚡ Check if user has reached limit IMMEDIATELY on mount (before any interaction)
  useEffect(() => {
    if (subscription) {
      const hasReachedLimit = subscription.reviewsUsed >= subscription.reviewsLimit;
      if (hasReachedLimit) {
        // Show upgrade modal immediately on step 1
        setTimeout(() => setShowUpgradeModal(true), 100); // Very short delay for smooth render
      }
    }
  }, [subscription]);

  // Refs for cleanup
  const stepIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);
  const highTrafficTimerRef = useRef(null);
  const analysisStartTimeRef = useRef(0);

  // Cleanup polling interval only (used during analysis)
  const cleanupPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  // Complete cleanup - clears ALL intervals (used on unmount/close)
  const cleanupAll = useCallback(() => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (highTrafficTimerRef.current) {
      clearTimeout(highTrafficTimerRef.current);
      highTrafficTimerRef.current = null;
    }
    pollCountRef.current = 0;
    setShowHighTrafficMsg(false);
  }, []);

  // Animate through analyzing steps - smooth progression (NO LOOP)
  useEffect(() => {
    // Always clear any existing interval first
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }

    if (isAnalyzing) {
      // Record start time
      analysisStartTimeRef.current = Date.now();
      
      // Start fresh interval
      stepIntervalRef.current = setInterval(() => {
        setCurrentAnalyzingStep(prev => {
          const next = prev + 1;
          // STOP at last step, don't loop back
          if (next >= AnalyzingSteps.length) {
            clearInterval(stepIntervalRef.current);
            stepIntervalRef.current = null;
            return AnalyzingSteps.length - 1; // Stay at last step
          }
          return next;
        });
      }, STEP_INTERVAL);

      // Set timer for high traffic message (15 seconds)
      highTrafficTimerRef.current = setTimeout(() => {
        setShowHighTrafficMsg(true);
      }, HIGH_TRAFFIC_THRESHOLD);
    } else {
      // Reset when analysis stops
      setShowHighTrafficMsg(false);
      if (highTrafficTimerRef.current) {
        clearTimeout(highTrafficTimerRef.current);
        highTrafficTimerRef.current = null;
      }
    }

    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      if (highTrafficTimerRef.current) {
        clearTimeout(highTrafficTimerRef.current);
        highTrafficTimerRef.current = null;
      }
    };
  }, [isAnalyzing]);

  // Poll for review completion - optimized with max attempts
  useEffect(() => {
    if (!reviewId || !isAnalyzing) {
      cleanupPolling();
      return;
    }

    const pollOnce = async () => {
      // Max 40 polls (60 seconds)
      if (pollCountRef.current >= 40) {
        setError('Analysis is taking longer than expected. Please check back later.');
        setIsAnalyzing(false);
        setStep(3);
        cleanupPolling();
        return true;
      }

      try {
        const result = await codeReviewService.getReviewDetails(reviewId);
        const status = result.data.status?.toLowerCase();
        pollCountRef.current++;
        
        if (status === 'completed') {
          setReviewResult(result.data);
          setIsAnalyzing(false);
          setStep(5);
          cleanupPolling();
          return true;
        } else if (status === 'failed') {
          setError('Analysis failed. Please try again.');
          setIsAnalyzing(false);
          setStep(3);
          cleanupPolling();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Poll error:', err);
        return false;
      }
    };

    // Initial poll
    pollOnce();
    
    // Set up interval
    pollIntervalRef.current = setInterval(pollOnce, POLL_INTERVAL);

    return cleanupPolling;
  }, [reviewId, isAnalyzing, cleanupPolling]);

  // Memoized handlers
  const handleLanguageSelect = useCallback((lang) => {
    setLanguage(lang);
    setTimeout(() => setStep(2), 150);
  }, []);

  const handleMethodSelect = useCallback((selectedMethod) => {
    setMethod(selectedMethod);
    setTimeout(() => setStep(3), 150);
  }, []);

  // File reading helper with validation
  const readFile = useCallback((file) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setFile(file.name);
    const reader = new FileReader();
    
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    
    reader.onload = (event) => {
      const content = event.target?.result || '';
      
      // Validate code length
      if (content.length > MAX_CODE_LENGTH) {
        setError(`Code too long. Maximum ${MAX_CODE_LENGTH} characters allowed.`);
        return;
      }
      
      setCode(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setError(''); // Clear any previous errors
    };
    
    reader.readAsText(file);
  }, [title]);

  const handleFileUpload = useCallback((e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      readFile(uploadedFile);
    }
  }, [readFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      readFile(droppedFile);
    }
  }, [readFile]);

  const handleSubmit = useCallback(async () => {
    setError('');
    
    // Validation
    if (!code.trim() || !title.trim()) {
      setError('Please provide both title and code');
      return;
    }

    if (code.trim().length > MAX_CODE_LENGTH) {
      setError(`Code too long. Maximum ${MAX_CODE_LENGTH} characters allowed.`);
      return;
    }

    try {
      setStep(4);
      setIsAnalyzing(true);
      setCurrentAnalyzingStep(0); // Reset animation to start
      pollCountRef.current = 0; // Reset poll counter
      
      const lineCount = code.split('\n').length;
      const result = await onSubmit({
        title: title.trim(),
        language,
        code: code.trim(),
        lineCount
      });

      const reviewIdFromResponse = result?.data?.reviewId;
      if (reviewIdFromResponse) {
        setReviewId(reviewIdFromResponse);
      } else {
        throw new Error('No review ID received');
      }
    } catch (err) {
      console.error('Submit error:', err);
      
      // Check if it's a 403 (limit exceeded) error
      if (err.response?.status === 403 || err.message?.toLowerCase().includes('limit') || err.message?.toLowerCase().includes('upgrade')) {
        setShowUpgradeModal(true);
        setIsAnalyzing(false);
        setStep(3);
      } else {
        setError(err.message || 'Failed to submit code. Please try again.');
        setIsAnalyzing(false);
        setStep(3);
      }
    }
  }, [code, title, language, onSubmit]);

  const handleCopyCode = useCallback((text) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Copy failed:', err);
    });
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, []);

  const handleViewFullDetails = useCallback(() => {
    if (reviewId) {
      cleanupAll();
      setIsAnalyzing(false);
      onClose();
      navigate(`/review/${reviewId}`);
    }
  }, [reviewId, navigate, onClose, cleanupAll]);

  const handleClose = useCallback(() => {
    cleanupAll();
    setIsAnalyzing(false);
    if (reviewId && onClose) {
      onClose(true);
    } else if (onClose) {
      onClose();
    }
  }, [reviewId, onClose, cleanupAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  // Memoize validation states
  const canSubmit = useMemo(() => {
    return code.trim().length > 0 && 
           title.trim().length > 0 && 
           code.trim().length <= MAX_CODE_LENGTH;
  }, [code, title]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FAST}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={SMOOTH}
        className="bg-gradient-to-b from-[#0D0D0D] to-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/5 relative"
      >
        {/* Overlay to block interaction when upgrade modal is shown */}
        {showUpgradeModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" />
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {step === 4 ? 'analyzing your code...' : step === 5 ? 'analysis complete! 🎉' : 'upload code for analysis'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {step <= 3 ? `step ${step} of 3` : step === 4 ? 'AI is working its magic ✨' : 'view your results below'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            disabled={isAnalyzing}
            className={`p-2 hover:bg-white/10 rounded-xl transition-colors ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-6 h-6 text-gray-400" />
          </motion.button>
        </div>

        {/* Content - Smooth scrolling without visible scrollbar */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] hide-scrollbar">
          <AnimatePresence mode="wait">
            {/* Step 1: Language Selection */}
            {step === 1 && (
              <motion.div
                key="language"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
              >
                <h3 className="text-xl font-bold text-white mb-6">select programming language</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LANGUAGES.map((lang, index) => (
                    <motion.button
                      key={lang.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, ...FAST }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLanguageSelect(lang.value)}
                      className={`p-4 rounded-2xl border-2 transition-colors ${
                        language === lang.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{lang.icon}</div>
                      <div className="text-sm font-medium text-white">{lang.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Method */}
            {step === 2 && (
              <motion.div
                key="method"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">how do you want to provide code?</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    back
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, ...SMOOTH }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMethodSelect('paste')}
                    className={`p-8 rounded-2xl border-2 transition-colors text-left ${
                      method === 'paste'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <Code2 className="w-12 h-12 text-purple-400 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">paste code</h4>
                    <p className="text-sm text-gray-400">directly paste your code</p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, ...SMOOTH }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMethodSelect('upload')}
                    className={`p-8 rounded-2xl border-2 transition-colors text-left ${
                      method === 'upload'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <FileCode className="w-12 h-12 text-blue-400 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">upload file</h4>
                    <p className="text-sm text-gray-400">select file from computer</p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Code Input */}
            {step === 3 && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {method === 'paste' ? 'paste your code' : 'upload your file'}
                  </h3>
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    back
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Binary Search Implementation"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200"
                  />
                </div>

                {method === 'upload' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-100 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/20 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">
                      {file || 'drag & drop your code file here'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <label className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition-all duration-100 hover:scale-105">
                      <span className="text-white font-medium">browse files</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs,.rb,.php,.swift,.kt,.cs"
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      your code
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here..."
                      rows={12}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 font-mono text-sm resize-none transition-all duration-200 custom-scrollbar"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={!canSubmit}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    analyze code
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Analyzing - Beautiful & Smooth */}
            {step === 4 && isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative py-6"
              >
                {/* Animated Background Gradient */}
                <motion.div 
                  animate={{ 
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.08), transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.08), transparent 50%)',
                      'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.08), transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.08), transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-3xl"
                />
                
                <div className="relative">
                  {/* Modern Spinner */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-20 h-20">
                      {/* Outer ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                      />
                      {/* Spinning gradient ring */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-blue-500"
                      />
                      {/* Inner glow */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-lg"
                      />
                      {/* Center icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-10">
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      analyzing your code...
                    </motion.h2>
                    <p className="text-gray-400">
                      AI is working its magic ✨
                    </p>
                  </div>

                  {/* Steps - Horizontal Flow */}
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                      {AnalyzingSteps.map((stepItem, index) => {
                        const Icon = stepItem.icon;
                        const isActive = index === currentAnalyzingStep;
                        const isCompleted = currentAnalyzingStep > index;
                        
                        return (
                          <div key={index} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                  scale: isActive ? 1.15 : 1,
                                  opacity: isActive ? 1 : isCompleted ? 0.8 : 0.4
                                }}
                                transition={{ duration: 0.3 }}
                                className={`relative flex items-center justify-center w-14 h-14 rounded-full border-2 mb-3 ${
                                  isActive 
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/30 to-blue-500/30' 
                                    : isCompleted
                                    ? 'border-emerald-500 bg-emerald-500/20'
                                    : 'border-white/20 bg-white/5'
                                }`}
                              >
                                {isCompleted ? (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                  >
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    animate={isActive ? { 
                                      scale: [1, 1.2, 1],
                                      rotate: [0, 5, -5, 0]
                                    } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <Icon className={`w-6 h-6 ${isActive ? stepItem.color : 'text-gray-600'}`} />
                                  </motion.div>
                                )}
                                
                                {/* Pulsing ring for active step */}
                                {isActive && (
                                  <>
                                    <motion.div
                                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="absolute inset-0 rounded-full border-2 border-purple-500"
                                    />
                                    <motion.div
                                      animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                      className="absolute inset-0 rounded-full border-2 border-blue-500"
                                    />
                                  </>
                                )}
                              </motion.div>
                              
                              {/* Step Label */}
                              <motion.p
                                animate={{ 
                                  opacity: isActive ? 1 : isCompleted ? 0.7 : 0.3,
                                  y: isActive ? [0, -2, 0] : 0
                                }}
                                transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                                className={`text-xs text-center font-medium px-2 ${
                                  isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-gray-600'
                                }`}
                              >
                                {stepItem.text.replace('...', '')}
                              </motion.p>
                            </div>
                            
                            {/* Connector Line */}
                            {index < AnalyzingSteps.length - 1 && (
                              <div className="flex items-center -mt-8 flex-shrink-0 px-2">
                                <div className="relative h-0.5 w-12">
                                  {/* Background line */}
                                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                                  {/* Animated progress line */}
                                  <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ 
                                      scaleX: isCompleted ? 1 : 0
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full origin-left"
                                  />
                                  {/* Shimmer effect on active */}
                                  {isActive && (
                                    <motion.div
                                      animate={{ x: [-50, 50] }}
                                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent rounded-full"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Messages */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 text-center space-y-3"
                  >
                    {/* Normal tip - shows first */}
                    {!showHighTrafficMsg && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="inline-block px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full">
                          <p className="text-sm text-gray-400">
                            💡 <span className="text-purple-400 font-medium">tip:</span> this usually takes 10-15 seconds
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* High traffic message - shows after 15 seconds */}
                    {showHighTrafficMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <div className="inline-block px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full">
                          <p className="text-sm text-amber-400">
                            ⏳ <span className="font-medium">high traffic detected</span> — your analysis is in queue, please wait a moment
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Results */}
            {step === 5 && reviewResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="text-center pb-6 border-b border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">analysis complete!</h3>
                  <p className="text-gray-400">AI has analyzed your code and found optimizations</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {reviewResult.analysis?.timeComplexity?.before || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">before</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {reviewResult.analysis?.improvementPercentage || 0}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">improved</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {reviewResult.analysis?.timeComplexity?.after || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">after</div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">AI summary</h4>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {reviewResult.analysis?.summary || 'Analysis completed successfully'}
                  </p>
                </div>

                {/* Top Issues */}
                {reviewResult.analysis?.issues && reviewResult.analysis.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">top issues found</h4>
                    {reviewResult.analysis.issues.slice(0, 2).map((issue, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-white font-medium mb-1">{issue.type || 'Issue'}</p>
                            <p className="text-sm text-gray-400">{issue.description || issue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optimized Code Preview */}
                {reviewResult.optimizedCode && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">optimized code</h4>
                      <button
                        onClick={() => handleCopyCode(reviewResult.optimizedCode)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors duration-100"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-64 overflow-y-auto custom-scrollbar">
                      <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                        {reviewResult.optimizedCode.slice(0, 500)}
                        {reviewResult.optimizedCode.length > 500 && '...'}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleViewFullDetails}
                    variant="primary"
                    className="flex-1"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    view full details
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="flex-1"
                  >
                    close & check recent reviews
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Progress */}
        {step <= 3 && (
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ⚡ Upgrade Modal - Shown when limit reached */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={(e) => {
              // Don't allow closing by clicking outside when limit is reached
              e.stopPropagation();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={SPRING}
              className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-2xl animate-pulse" />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/50"
                  >
                    <Crown className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Title & Message */}
                <h2 className="text-3xl font-bold text-white text-center mb-3">
                  free plan limit reached! 🚀
                </h2>
                <p className="text-gray-400 text-center mb-6">
                  you've used all <span className="text-white font-semibold">{subscription?.reviewsLimit || 3} free reviews</span> this month. upgrade to <span className="text-purple-400 font-semibold">pro</span> for unlimited reviews and advanced AI features!
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    '✨ Unlimited code reviews',
                    '🚀 Priority processing',
                    '🧠 Advanced AI insights',
                    '📊 Detailed analytics'
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      // Open pricing modal in dashboard
                      if (onOpenPricing) {
                        onOpenPricing();
                      }
                    }}
                    variant="primary"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    upgrade to pro now
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      onClose(false); // Close upload modal too
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    close & view past reviews
                  </Button>
                </div>
                
                {/* Info notice */}
                <p className="text-center text-gray-400 text-xs mt-4">
                  💡 your past reviews are still available in the dashboard
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CodeUpload;

