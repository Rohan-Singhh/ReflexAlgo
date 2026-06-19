import { motion } from 'framer-motion';
import { ClipboardPaste, Cpu, Rocket } from 'lucide-react';
import { Section, SectionHeading } from './ui/Section';

const steps = [
  {
    icon: ClipboardPaste,
    title: 'Paste your code',
    description: 'Drop in a function or a whole file, in any supported language. No setup required.',
  },
  {
    icon: Cpu,
    title: 'AI reviews it',
    description: 'Complexity, bottlenecks, and DSA patterns are surfaced with line-level detail.',
  },
  {
    icon: Rocket,
    title: 'Ship the fix',
    description: 'Apply the optimized rewrite and watch the before-and-after performance close.',
  },
];

const HowItWorks = () => {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="Workflow"
        title="From slow to shipped in"
        accent="three steps"
        subtitle="No dashboards to configure, no agents to install. Paste, review, ship."
      />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connecting rail */}
        <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto grid place-items-center w-14 h-14 rounded-2xl border border-white/10 bg-zinc-950 shadow-lg shadow-black/40">
              <step.icon className="w-6 h-6 text-violet-300" strokeWidth={1.75} />
              <span className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-bold text-white shadow">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{step.title}</h3>
            <p className="mt-2.5 mx-auto max-w-xs text-sm leading-relaxed text-zinc-400">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorks;
