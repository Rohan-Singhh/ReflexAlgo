import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Code2, FileCode, ChevronRight, ChevronLeft, Check, CheckCircle, AlertCircle, Sparkles, Brain, Target, Zap, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import codeReviewService from '../../services/codeReviewService';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CODE_LENGTH = 50000; // 50k characters
const POLL_INTERVAL = 2500; // 2.5 seconds - optimized to reduce server load
const STEP_INTERVAL = 1500; // 1.5 seconds per analyzing step

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

// ⚡ OPTIMIZED ANIMATION PRESETS - Fast but smooth
const SMOOTH = { duration: 0.2, ease: [0.4, 0, 0.2, 1] }; // Smooth cubic-bezier
const FAST = { duration: 0.15, ease: [0.4, 0, 0.2, 1] };
const SPRING = { type: "spring", stiffness: 300, damping: 30 };

const CodeUpload = ({ onSubmit, onClose }) => {
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

  // Refs for cleanup
  const stepIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  // Animate through analyzing steps
  useEffect(() => {
    if (isAnalyzing) {
      stepIntervalRef.current = setInterval(() => {
        setCurrentAnalyzingStep(prev => (prev + 1) % AnalyzingSteps.length);
      }, STEP_INTERVAL);
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, [isAnalyzing]);

  // Poll for review completion - optimized with max attempts
  useEffect(() => {
    if (!reviewId || !isAnalyzing) {
      cleanup();
      return;
    }

    const pollOnce = async () => {
      // Max 40 polls (60 seconds)
      if (pollCountRef.current >= 40) {
        setError('Analysis is taking longer than expected. Please check back later.');
        setIsAnalyzing(false);
        setStep(3);
        cleanup();
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
          cleanup();
          return true;
        } else if (status === 'failed') {
          setError('Analysis failed. Please try again.');
          setIsAnalyzing(false);
          setStep(3);
          cleanup();
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

    return cleanup;
  }, [reviewId, isAnalyzing, cleanup]);

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
      setError(err.message || 'Failed to submit code. Please try again.');
      setIsAnalyzing(false);
      setStep(3);
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
      cleanup();
      setIsAnalyzing(false);
      onClose();
      navigate(`/review/${reviewId}`);
    }
  }, [reviewId, navigate, onClose, cleanup]);

  const handleClose = useCallback(() => {
    cleanup();
    setIsAnalyzing(false);
    if (reviewId && onClose) {
      onClose(true);
    } else if (onClose) {
      onClose();
    }
  }, [reviewId, onClose, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
        className="bg-gradient-to-b from-[#0D0D0D] to-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/5"
      >
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 font-mono text-sm resize-none transition-all duration-200 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
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

            {/* Step 4: Analyzing - Compact & Elegant */}
            {step === 4 && isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={SMOOTH}
                className="relative"
              >
                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-pink-600/5 rounded-2xl blur-2xl animate-pulse"></div>
                
                <div className="relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-purple-500/20 rounded-2xl p-8">
                  {/* Compact Animation */}
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="relative w-16 h-16 mx-auto mb-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-md opacity-40"></div>
                      <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-t-purple-500 border-r-blue-500 border-transparent rounded-full"></div>
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white" />
                    </motion.div>

                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-bold text-white mb-2"
                    >
                      analyzing your code...
                    </motion.h2>
                    <p className="text-gray-500 text-sm mb-6">
                      AI is optimizing ✨
                    </p>
                  </div>

                  {/* Compact Steps */}
                  <div className="space-y-3 max-w-md mx-auto">
                    <AnimatePresence mode="wait">
                      {AnalyzingSteps.map((stepItem, index) => {
                        const Icon = stepItem.icon;
                        const isActive = index === currentAnalyzingStep;
                        const isPast = index < currentAnalyzingStep;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
                              x: 0,
                              scale: isActive ? 1.02 : 1
                            }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isActive 
                                ? 'bg-white/10 border-white/20' 
                                : 'bg-white/5 border-white/5'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-purple-600/30 animate-pulse' : 'bg-white/5'
                            }`}>
                              <Icon className={`w-4 h-4 ${isActive ? stepItem.color : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                isActive ? 'text-white' : 'text-gray-500'
                              }`}>
                                {stepItem.text}
                              </p>
                            </div>
                            {isPast && (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            )}
                            {isActive && (
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Pro Tip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-xs text-gray-500">
                      💡 <span className="text-purple-400">pro tip:</span> grab a coffee while AI works its magic ☕
                    </p>
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
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-64 overflow-y-auto">
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
    </motion.div>
  );
};

export default CodeUpload;

