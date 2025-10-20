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

const CodeUpload = ({ onSubmit, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Language, 2: Method, 3: Code Input, 4: Analyzing, 5: Results
  const [language, setLanguage] = useState('');
  const [method, setMethod] = useState(''); // 'paste' or 'upload'
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzingStep, setCurrentAnalyzingStep] = useState(0);
  const [reviewId, setReviewId] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Animate through analyzing steps
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setCurrentAnalyzingStep(prev => (prev + 1) % AnalyzingSteps.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  // Poll for review completion
  useEffect(() => {
    if (reviewId && isAnalyzing) {
      const pollInterval = setInterval(async () => {
        try {
          const result = await codeReviewService.getReviewDetails(reviewId);
          if (result.data.status === 'completed') {
            setReviewResult(result.data);
            setIsAnalyzing(false);
            setStep(5); // Move to results step
            clearInterval(pollInterval);
          } else if (result.data.status === 'failed') {
            setError('Analysis failed. Please try again.');
            setIsAnalyzing(false);
            setStep(3);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(pollInterval);
    }
  }, [reviewId, isAnalyzing]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep(2);
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(3);
  };

  const handleFileUpload = (selectedFile) => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(selectedFile);
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
    const droppedFile = e.dataTransfer.files[0];
    handleFileUpload(droppedFile);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    const lineCount = code.split('\n').length;
    
    try {
      setIsAnalyzing(true);
      setStep(4); // Move to analyzing step
      setError('');
      
      const result = await onSubmit({
        title: title.trim(),
        language,
        code: code.trim(),
        lineCount
      });

      if (result?.data?._id) {
        setReviewId(result.data._id);
      }
    } catch (err) {
      setError('Failed to submit code. Please try again.');
      setIsAnalyzing(false);
      setStep(3);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleViewFullDetails = () => {
    if (reviewId) {
      onClose();
      navigate(`/review/${reviewId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
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
            onClick={onClose}
            disabled={isAnalyzing}
            className={`p-2 hover:bg-white/10 rounded-xl transition-colors ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold text-white mb-6">select programming language</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LANGUAGES.map((lang) => (
                    <motion.button
                      key={lang.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLanguageSelect(lang.value)}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all"
                    >
                      <div className="text-4xl mb-3">{lang.icon}</div>
                      <p className="text-white font-semibold">{lang.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Method Selection */}
            {step === 2 && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-bold text-white mb-6">how do you want to provide your code?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleMethodSelect('paste')}
                    className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-3xl hover:border-purple-500/50 transition-all text-left"
                  >
                    <Code2 className="w-12 h-12 text-purple-400 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">paste code</h4>
                    <p className="text-gray-400">directly paste your code snippet</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleMethodSelect('upload')}
                    className="p-8 bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-500/30 rounded-3xl hover:border-emerald-500/50 transition-all text-left"
                  >
                    <FileCode className="w-12 h-12 text-emerald-400 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">upload file</h4>
                    <p className="text-gray-400">upload a code file from your device</p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Code Input */}
            {step === 3 && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Binary Search Implementation"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {method === 'paste' ? (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">paste your code</label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here..."
                      rows={15}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-mono text-sm"
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-2">drag & drop your file here</p>
                    <p className="text-gray-400 text-sm mb-4">or</p>
                    <input
                      type="file"
                      accept=".js,.ts,.py,.java,.cpp,.c,.go,.rs,.rb,.php,.swift,.kt,.cs"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button as="span" variant="secondary">
                        browse files
                      </Button>
                    </label>
                    {file && (
                      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <p className="text-emerald-400 text-sm">✓ {file.name} loaded</p>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Analyzing */}
            {step === 4 && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Animated Loading Orb */}
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative w-24 h-24 mx-auto mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
                    <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 border-r-blue-500 border-transparent rounded-full"></div>
                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI is analyzing...</h3>
                  <p className="text-gray-400">this usually takes 5-10 seconds ☕</p>
                </div>

                {/* Analyzing Steps */}
                <div className="space-y-4">
                  {AnalyzingSteps.map((stepInfo, index) => {
                    const Icon = stepInfo.icon;
                    const isActive = index === currentAnalyzingStep;
                    const isPast = index < currentAnalyzingStep;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
                          x: 0,
                          scale: isActive ? 1.02 : 1
                        }}
                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                          isActive 
                            ? 'bg-white/10 border-white/20' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          isActive ? 'bg-purple-600/30 animate-pulse' : 'bg-white/5'
                        }`}>
                          <Icon className={`w-6 h-6 ${isActive ? stepInfo.color : 'text-gray-600'}`} />
                        </div>
                        <p className={`text-base font-semibold flex-1 ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}>
                          {stepInfo.text}
                        </p>
                        {isPast && <Check className="w-5 h-5 text-emerald-400" />}
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
                </div>
              </motion.div>
            )}

            {/* Step 5: Results Preview */}
            {step === 5 && reviewResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 mb-2">time complexity</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono">
                        {reviewResult.analysis?.timeComplexity?.before || 'O(n)'}
                      </span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono">
                        {reviewResult.analysis?.timeComplexity?.after || 'O(n)'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 mb-2">space complexity</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono">
                        {reviewResult.analysis?.spaceComplexity?.before || 'O(1)'}
                      </span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono">
                        {reviewResult.analysis?.spaceComplexity?.after || 'O(1)'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-5">
                    <p className="text-xs text-emerald-400 mb-2">improvement</p>
                    <p className="text-3xl font-bold text-gradient">
                      {Math.round(reviewResult.analysis?.improvementPercentage || 0)}%
                    </p>
                  </div>
                </div>

                {/* AI Summary */}
                {reviewResult.analysis?.summary && (
                  <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">AI summary</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{reviewResult.analysis.summary}</p>
                  </div>
                )}

                {/* Issues Preview (top 2) */}
                {reviewResult.analysis?.issues && reviewResult.analysis.issues.length > 0 && (
                  <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                      issues found ({reviewResult.analysis.issues.length})
                    </h3>
                    <div className="space-y-3">
                      {reviewResult.analysis.issues.slice(0, 2).map((issue, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              issue.severity === 'high' 
                                ? 'bg-red-500/20 text-red-400'
                                : issue.severity === 'medium'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {issue.severity}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white mb-1">{issue.type}</h4>
                              <p className="text-xs text-gray-400">{issue.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {reviewResult.analysis.issues.length > 2 && (
                        <p className="text-xs text-center text-gray-500">
                          + {reviewResult.analysis.issues.length - 2} more issues
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Code Preview */}
                {reviewResult.optimizedCode && (
                  <div className="bg-gradient-to-br from-emerald-600/10 to-green-600/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">optimized code preview</h3>
                      <button
                        onClick={() => copyToClipboard(reviewResult.optimizedCode)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <pre className="bg-black/50 border border-emerald-500/20 rounded-xl p-4 overflow-x-auto max-h-40 overflow-y-auto">
                      <code className="text-gray-300 text-xs font-mono">{reviewResult.optimizedCode}</code>
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleViewFullDetails}
                    variant="primary"
                    className="flex-1"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    view full details
                  </Button>
                  <Button
                    onClick={onClose}
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

        {/* Footer Navigation */}
        {step <= 3 && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <Button
              onClick={() => setStep(step - 1)}
              variant="secondary"
              disabled={step === 1}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              back
            </Button>

            {step === 3 ? (
              <Button
                onClick={handleSubmit}
                variant="primary"
                disabled={!title || !code}
              >
                analyse code
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                variant="primary"
                disabled={
                  (step === 1 && !language) ||
                  (step === 2 && !method)
                }
              >
                next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CodeUpload;

