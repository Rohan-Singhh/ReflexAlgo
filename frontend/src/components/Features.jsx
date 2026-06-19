import { motion } from 'framer-motion';
import { Gauge, ListChecks, Layers, LineChart, Wand2, Languages } from 'lucide-react';
import { Section, SectionHeading } from './ui/Section';

const features = [
  {
    icon: Gauge,
    title: 'Complexity analysis',
    description:
      'Time and space complexity for every function, with the exact lines driving the worst case.',
  },
  {
    icon: ListChecks,
    title: 'Actionable suggestions',
    description:
      'Concrete, line-referenced fixes — not generic advice. Each comes with the expected impact.',
  },
  {
    icon: Layers,
    title: 'Pattern detection',
    description:
      'Recognizes sliding window, two pointers, DP, and dozens of other DSA patterns in your code.',
  },
  {
    icon: LineChart,
    title: 'Progress dashboard',
    description:
      'Track reviews, mastered patterns, and your improvement over time in one place.',
  },
  {
    icon: Wand2,
    title: 'Automatic refactors',
    description:
      'Get an optimized rewrite of the hot path with a clear before-and-after comparison.',
  },
  {
    icon: Languages,
    title: 'Multi-language',
    description:
      'Python, JavaScript, Java, C++, Rust and more — the same depth of review across all of them.',
  },
];

const Features = () => {
  return (
    <Section id="features">
      <div className="ambient w-[36rem] h-[36rem] top-0 left-1/2 -translate-x-1/2 bg-violet-800/10" />

      <SectionHeading
        eyebrow="Capabilities"
        title="Everything you need to"
        accent="ship faster code"
        subtitle="A focused set of tools that turn a rough solution into one you'd be happy to put in production."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
            className="group relative bg-zinc-950/60 p-7 transition-colors duration-300 hover:bg-zinc-900/60"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] text-violet-300 transition-colors group-hover:border-violet-500/40 group-hover:text-violet-200">
              <feature.icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Features;
