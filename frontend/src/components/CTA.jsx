import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Zap, Languages, GitCompareArrows, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { Section } from './ui/Section';

const highlights = [
  { icon: Zap, label: 'Reviews in seconds' },
  { icon: Languages, label: '10+ languages' },
  { icon: GitCompareArrows, label: 'Before / after metrics' },
  { icon: Sparkles, label: 'Free to start' },
];

const CTA = () => {
  return (
    <Section>
      <div className="ambient w-[44rem] h-[30rem] top-0 left-1/2 -translate-x-1/2 bg-violet-700/15" />

      {/* Honest highlight band */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]"
      >
        {highlights.map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-zinc-950/60 px-5 py-5">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 text-violet-300">
              <item.icon className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-medium text-zinc-300">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Closing CTA panel */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        className="ring-gradient relative overflow-hidden rounded-3xl bg-zinc-950/70 px-6 py-16 sm:px-12 text-center"
      >
        <div className="absolute inset-0 grid-mask opacity-60" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08] tracking-tight">
            <span className="text-metal">Ready to fix your</span>{' '}
            <span className="text-gradient glow">complexity?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">
            Paste your first algorithm and get a senior-level review in seconds.
            No credit card, no setup.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="group">
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <a
              href="mailto:support@reflexalgo.com?subject=Question about ReflexAlgo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                <MessageCircle className="w-4 h-4" />
                Talk to us
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-zinc-500">Cancel anytime — your code stays yours.</p>
        </div>
      </motion.div>
    </Section>
  );
};

export default CTA;
