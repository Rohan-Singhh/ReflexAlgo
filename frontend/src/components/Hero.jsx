import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import DemoModal from './DemoModal';

const Hero = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-purple-500/30 rounded-full px-6 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-purple-300 font-semibold">trusted by 10k+ developers worldwide</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            write code that
            <br />
            <span className="text-gradient glow">dominates</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            AI-powered code optimization that turns your algorithms from slow to <span className="text-emerald-400 font-bold">lightning fast</span>.
            <br />
            Used by engineers at Google, Meta, and Microsoft.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="group">
                Start Optimizing Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="group" onClick={() => setIsDemoOpen(true)}>
              <Sparkles className="mr-2 w-5 h-5" />
              see how it works ✨
            </Button>
          </div>

          {/* Demo Modal */}
          <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
          
          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 mb-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold">4.9/5</span>
              <span className="text-gray-500">from 2000+ reviews</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-semibold">50k+</span>
              <span className="text-gray-500">code optimizations</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-semibold">avg 10x</span>
              <span className="text-gray-500">performance boost</span>
            </div>
          </div>

          {/* Code Preview Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-red-400 font-semibold">❌ O(n²) detected</span>
                </div>
                <div className="space-y-2 text-left font-mono text-sm">
                  <div className="text-red-400 line-through opacity-50">for (let i = 0; i {'<'} arr.length; i++) {'{'}</div>
                  <div className="text-red-400 line-through opacity-50 pl-4">for (let j = 0; j {'<'} arr.length; j++) {'{'}</div>
                  <div className="text-red-400 line-through opacity-50 pl-8">if (arr[i] === target) return i;</div>
                  <div className="text-green-400 mt-3">✅ const set = new Set(arr);</div>
                  <div className="text-green-400">✅ return set.has(target) ? arr.indexOf(target) : -1;</div>
                  <div className="text-emerald-400 mt-4 flex items-center gap-2">
                    <span>⚡</span>
                    <span className="font-bold">92% faster</span>
                    <span className="text-gray-500">• O(n²) → O(n)</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating icons */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 shadow-lg"
            >
              <span className="text-2xl">⚡</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Hero);

