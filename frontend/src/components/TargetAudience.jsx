import { motion } from 'framer-motion';
import { Trophy, GraduationCap, Briefcase, Users } from 'lucide-react';
import { Section, SectionHeading } from './ui/Section';

const audiences = [
  {
    icon: Trophy,
    title: 'Competitive programmers',
    description: 'Tighten complexity and recognize patterns faster during contests.',
  },
  {
    icon: GraduationCap,
    title: 'CS students',
    description: 'Build real intuition for big-O and ace your DSA coursework and interviews.',
  },
  {
    icon: Briefcase,
    title: 'Working engineers',
    description: 'Catch slow paths before code review and ship more efficient solutions.',
  },
  {
    icon: Users,
    title: 'Engineering teams',
    description: 'Raise the floor on algorithmic quality with consistent, shared reviews.',
  },
];

const TargetAudience = () => {
  return (
    <Section id="audience">
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for everyone who"
        accent="cares about performance"
        subtitle="Whether you're prepping for interviews or shipping to production, the review meets you where you are."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {audiences.map((audience, index) => (
          <motion.div
            key={audience.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="group relative rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 transition-colors duration-300 hover:border-violet-500/30 hover:bg-zinc-900/50"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 text-violet-300 transition-colors group-hover:text-violet-200">
              <audience.icon className="w-6 h-6" strokeWidth={1.6} />
            </div>
            <h3 className="mt-5 text-base font-semibold tracking-tight text-white">
              {audience.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{audience.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default TargetAudience;
