import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Cpu, Zap, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from './ui/Button';

const steps = [
  {
    id: 1,
    title: 'Upload Your Code',
    description: 'Paste your algorithm or upload a file. We support 10+ languages.',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
    demo: (
      <div className="bg-gray-900 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400">algorithm.js</span>
        </div>
        <div className="font-mono text-sm space-y-1 text-gray-300">
          <div className="text-purple-400">function <span className="text-blue-400">findDuplicate</span>(arr) {'{'}</div>
          <div className="pl-4">for (let i = 0; i {'<'} arr.length; i++) {'{'}</div>
          <div className="pl-8">for (let j = i+1; j {'<'} arr.length; j++) {'{'}</div>
          <div className="pl-12 text-yellow-400">// Nested loop detected</div>
          <div className="pl-12">if (arr[i] === arr[j]) return arr[i];</div>
          <div className="pl-8">{'}'}</div>
          <div className="pl-4">{'}'}</div>
          <div>{'}'}</div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center space-x-2 text-emerald-400 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Code uploaded successfully</span>
        </motion.div>
      </div>
    )
  },
  {
    id: 2,
    title: 'AI Analyzes Complexity',
    description: 'Our AI engine detects patterns, time complexity, and bottlenecks.',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500',
    demo: (
      <div className="bg-gray-900 rounded-lg p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Analyzing...</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
        
        <div className="space-y-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded p-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-400">⚠️ Time Complexity</span>
              <span className="text-yellow-400 font-bold">O(n²)</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-red-500/20 border border-red-500/30 rounded p-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400">❌ Nested Loops</span>
              <span className="text-red-400 font-bold">2 found</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-blue-500/20 border border-blue-500/30 rounded p-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">💡 Pattern Detected</span>
              <span className="text-blue-400 font-bold">Hash Map</span>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Get Optimized Solution',
    description: 'Receive AI-generated optimized code with explanations.',
    icon: Zap,
    color: 'from-emerald-500 to-green-500',
    demo: (
      <div className="bg-gray-900 rounded-lg p-4 border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-semibold">✅ OPTIMIZED</span>
          <span className="text-xs text-gray-400">algorithm_optimized.js</span>
        </div>
        
        <div className="font-mono text-sm space-y-1 text-gray-300">
          <div className="text-purple-400">function <span className="text-blue-400">findDuplicate</span>(arr) {'{'}</div>
          <div className="pl-4 text-emerald-400">const seen = new Set();</div>
          <div className="pl-4">for (let num of arr) {'{'}</div>
          <div className="pl-8">if (seen.has(num)) return num;</div>
          <div className="pl-8 text-emerald-400">seen.add(num);</div>
          <div className="pl-4">{'}'}</div>
          <div>{'}'}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <div className="bg-emerald-500/10 rounded p-2">
            <div className="text-xs text-gray-400">Time Complexity</div>
            <div className="text-emerald-400 font-bold">O(n²) → O(n)</div>
          </div>
          <div className="bg-emerald-500/10 rounded p-2">
            <div className="text-xs text-gray-400">Performance</div>
            <div className="text-emerald-400 font-bold">92% faster ⚡</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description: 'Monitor improvements and master DSA patterns over time.',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-500',
    demo: (
      <div className="bg-gray-900 rounded-lg p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Your Dashboard</span>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-2"
          >
            <div className="text-xs text-gray-400">Reviews</div>
            <div className="text-2xl font-bold text-blue-400">24</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg p-2"
          >
            <div className="text-xs text-gray-400">Optimized</div>
            <div className="text-2xl font-bold text-emerald-400">21</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-2"
          >
            <div className="text-xs text-gray-400">Avg Boost</div>
            <div className="text-2xl font-bold text-purple-400">8.5x</div>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Pattern Mastery</span>
            <span className="text-purple-400 font-semibold">78%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </div>
    )
  }
];

const DemoModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <motion.div
                        animate={{
                          scale: currentStep === index ? 1.2 : 1,
                          backgroundColor: currentStep >= index ? 'rgb(168, 85, 247)' : 'rgb(55, 65, 81)'
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
                      >
                        {currentStep > index ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          index + 1
                        )}
                      </motion.div>
                      {index < steps.length - 1 && (
                        <div className="w-16 md:w-24 h-1 mx-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: currentStep > index ? '100%' : 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Icon & Title */}
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${steps[currentStep].color}`}>
                        {(() => {
                          const IconComponent = steps[currentStep].icon;
                          return <IconComponent className="w-8 h-8 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{steps[currentStep].title}</h2>
                        <p className="text-gray-400 mt-1">{steps[currentStep].description}</p>
                      </div>
                    </div>

                    {/* Demo */}
                    <div className="mt-6">
                      {steps[currentStep].demo}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="group"
                  >
                    ← Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentStep === index
                            ? 'bg-purple-500 w-8'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNext}
                    className="group"
                  >
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;

