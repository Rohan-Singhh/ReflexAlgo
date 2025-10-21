import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Code2, FileCode, ChevronRight, ChevronLeft, Check, AlertCircle, Sparkles, Brain, Target, Zap, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import codeReviewService from '../../services/codeReviewService';

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
];

// ⚡ SUPER FAST ANIMATION PRESETS
const INSTANT = { duration: 0.08, ease: "easeOut" };
const FAST = { duration: 0.12, ease: "easeOut" };

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

  // Animate through analyzing steps (super fast)
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setCurrentAnalyzingStep(prev => (prev + 1) % AnalyzingSteps.length);
      }, 500); // Ultra fast
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  // Poll for review completion
  useEffect(() => {
    if (reviewId && isAnalyzing) {
      const pollOnce = async () => {
        try {
          const result = await codeReviewService.getReviewDetails(reviewId);
          const status = result.data.status?.toLowerCase();
          
          if (status === 'completed') {
            setReviewResult(result.data);
            setIsAnalyzing(false);
            setStep(5);
            return true;
          } else if (status === 'failed') {
            setError('Analysis failed. Please try again.');
            setIsAnalyzing(false);
            setStep(3);
            return true;
          }
          return false;
        } catch (err) {
          return false;
        }
      };

      pollOnce();
      const pollInterval = setInterval(async () => {
        const shouldStop = await pollOnce();
        if (shouldStop) clearInterval(pollInterval);
      }, 1500);

      return () => clearInterval(pollInterval);
    }
  }, [reviewId, isAnalyzing]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setTimeout(() => setStep(2), 100); // Instant transition
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setTimeout(() => setStep(3), 100); // Instant transition
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result || '');
        if (!title) setTitle(uploadedFile.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result || '');
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!code.trim() || !title.trim()) {
      setError('Please provide both title and code');
      return;
    }

    try {
      setStep(4);
      setIsAnalyzing(true);
      
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
      }
    } catch (err) {
      setError('Failed to submit code. Please try again.');
      setIsAnalyzing(false);
      setStep(3);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleViewFullDetails = () => {
    if (reviewId) {
      setIsAnalyzing(false);
      onClose();
      navigate(`/review/${reviewId}`);
    }
  };

  const handleClose = () => {
    setIsAnalyzing(false);
    if (reviewId && onClose) {
      onClose(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={INSTANT}
        className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
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
          <button
            onClick={handleClose}
            disabled={isAnalyzing}
            className={`p-2 hover:bg-white/10 rounded-xl transition-all duration-100 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {/* Step 1: Language Selection */}
            {step === 1 && (
              <motion.div
                key="language"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={INSTANT}
              >
                <h3 className="text-xl font-bold text-white mb-6">select programming language</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageSelect(lang.value)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-100 ${
                        language === lang.value
                          ? 'border-purple-500 bg-purple-500/10 scale-105'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-105'
                      }`}
                    >
                      <div className="text-3xl mb-2">{lang.icon}</div>
                      <div className="text-sm font-medium text-white">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload Method */}
            {step === 2 && (
              <motion.div
                key="method"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={INSTANT}
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
                  <button
                    onClick={() => handleMethodSelect('paste')}
                    className={`p-8 rounded-2xl border-2 transition-all duration-100 text-left ${
                      method === 'paste'
                        ? 'border-purple-500 bg-purple-500/10 scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <Code2 className="w-12 h-12 text-purple-400 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">paste code</h4>
                    <p className="text-sm text-gray-400">directly paste your code</p>
                  </button>

                  <button
                    onClick={() => handleMethodSelect('upload')}
                    className={`p-8 rounded-2xl border-2 transition-all duration-100 text-left ${
                      method === 'upload'
                        ? 'border-purple-500 bg-purple-500/10 scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <FileCode className="w-12 h-12 text-blue-400 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">upload file</h4>
                    <p className="text-sm text-gray-400">select file from computer</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Code Input */}
            {step === 3 && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={INSTANT}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors duration-100"
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-mono text-sm resize-none transition-colors duration-100"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={!code.trim() || !title.trim()}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    analyze code
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Analyzing */}
            {step === 4 && isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={INSTANT}
                className="flex flex-col items-center justify-center py-16 space-y-8"
              >
                {/* Animated Orb */}
                <div className="relative w-32 h-32">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-blue-500 to-cyan-400 p-1"
                  >
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <Brain className="w-14 h-14 text-purple-400" />
                    </div>
                  </motion.div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-3 w-full max-w-md">
                  {AnalyzingSteps.map((stepItem, index) => {
                    const Icon = stepItem.icon;
                    const isCurrentStep = index === currentAnalyzingStep;
                    const isPastStep = index < currentAnalyzingStep;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-100 ${
                          isCurrentStep
                            ? 'border-purple-500/50 bg-purple-500/10 scale-105'
                            : isPastStep
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl transition-all duration-100 ${
                            isCurrentStep ? 'bg-purple-500/20 scale-110' : isPastStep ? 'bg-green-500/20' : 'bg-white/5'
                          }`}
                        >
                          {isPastStep ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Icon className={`w-5 h-5 ${isCurrentStep ? stepItem.color : 'text-gray-600'}`} />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${isCurrentStep ? 'text-white' : isPastStep ? 'text-green-400' : 'text-gray-600'}`}>
                          {stepItem.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${((currentAnalyzingStep + 1) / AnalyzingSteps.length) * 100}%` }}
                      transition={FAST}
                      className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">usually takes 3-8 seconds</p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Results */}
            {step === 5 && reviewResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={INSTANT}
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
          <div className="p-4 border-t border-white/10">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={FAST}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CodeUpload;

