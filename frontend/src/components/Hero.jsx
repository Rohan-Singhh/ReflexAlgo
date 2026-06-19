import { motion } from 'framer-motion';
import { ArrowRight, Play, Check, TrendingDown, Braces } from 'lucide-react';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import DemoModal from './DemoModal';

const trustChips = ['Free to start', '10+ languages', 'Reviews in seconds'];

// A line of the demo snippet. `tone` controls the left-rail highlight.
const codeLines = [
  { n: 1, tone: 'base', tokens: [['kw', 'function'], ['fn', ' twoSum'], ['p', '(nums, target) {']] },
  { n: 2, tone: 'warn', tokens: [['ind', '  '], ['kw', 'for'], ['p', ' (let i = 0; i < nums.length; i++) {']] },
  { n: 3, tone: 'warn', tokens: [['ind', '    '], ['kw', 'for'], ['p', ' (let j = i + 1; j < nums.length; j++) {']] },
  { n: 4, tone: 'base', tokens: [['ind', '      '], ['kw', 'if'], ['p', ' (nums[i] + nums[j] === target)']] },
  { n: 5, tone: 'base', tokens: [['ind', '        '], ['kw', 'return'], ['p', ' [i, j];']] },
  { n: 6, tone: 'base', tokens: [['p', '  } }']] },
  { n: 7, tone: 'base', tokens: [['p', '}']] },
];

const tokenColor = {
  kw: 'text-violet-300',
  fn: 'text-sky-300',
  p: 'text-zinc-300',
  ind: 'text-zinc-300',
};

const Hero = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="ambient w-[44rem] h-[44rem] -top-40 -left-40 bg-violet-700/25" />
        <div className="ambient w-[40rem] h-[40rem] -bottom-48 -right-32 bg-indigo-700/20" />
        <div className="absolute inset-0 grid-mask" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
          {/* ── Left: copy ── */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1.5 pr-3 py-1 mb-7"
            >
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-300">
                New
              </span>
              <span className="text-sm text-zinc-400">AI-powered complexity analysis</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[2.15rem] sm:text-6xl lg:text-[4.1rem] font-semibold leading-[1.05] tracking-tight"
            >
              <span className="text-metal">Find the bottleneck.</span>
              <br />
              <span className="text-gradient glow">Fix the complexity.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
            >
              ReflexAlgo reviews your algorithms with AI — it flags time and space
              complexity, detects DSA patterns, and rewrites the hot path. Paste
              your code, get a senior-level review in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-9 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <Link to="/signup">
                <Button variant="primary" size="lg" className="group">
                  Start for free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="group" onClick={() => setIsDemoOpen(true)}>
                <Play className="w-4 h-4" />
                Watch how it works
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2"
            >
              {trustChips.map((chip) => (
                <li key={chip} className="flex items-center gap-2 text-sm text-zinc-500">
                  <Check className="w-4 h-4 text-violet-400" />
                  {chip}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Right: review panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative min-w-0 w-full"
          >
            <div className="ring-gradient relative rounded-2xl bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-black/60">
              {/* Window bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex items-center gap-2 text-xs mono text-zinc-500">
                  <Braces className="w-3.5 h-3.5" />
                  two-sum.js
                </div>
                <span className="text-[11px] font-medium text-emerald-400/90">Reviewed</span>
              </div>

              {/* Code */}
              <div className="px-2 py-3 mono text-[13px] leading-6 overflow-x-auto hide-scrollbar">
                {codeLines.map((line) => (
                  <div
                    key={line.n}
                    className={`flex items-start gap-3 px-3 rounded-md ${
                      line.tone === 'warn' ? 'bg-amber-500/[0.06]' : ''
                    }`}
                  >
                    <span className="w-4 text-right text-zinc-600 select-none">{line.n}</span>
                    <code className="whitespace-pre">
                      {line.tokens.map(([t, v], i) => (
                        <span key={i} className={tokenColor[t]}>
                          {v}
                        </span>
                      ))}
                    </code>
                  </div>
                ))}
              </div>

              {/* Analysis footer */}
              <div className="border-t border-white/[0.07] p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
                    Nested loop · O(n²)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                    Hash map · O(n)
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-200">Suggestion:</span> store seen values in a{' '}
                  <span className="mono text-violet-300">Map</span> for O(1) lookups — a single
                  pass replaces the nested scan.
                </p>
              </div>
            </div>

            {/* Floating complexity chip */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-3 sm:-right-5 surface rounded-xl px-3 py-2 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-500/15">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="leading-tight">
                  <div className="text-[11px] text-zinc-500">Time complexity</div>
                  <div className="text-sm font-semibold text-white mono">O(n²) → O(n)</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
};

export default memo(Hero);
