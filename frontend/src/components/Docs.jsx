import { motion } from 'framer-motion';
import { Terminal, Code2, FileText, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { Section, SectionHeading } from './ui/Section';

const docCards = [
  {
    icon: Terminal,
    title: 'Quickstart',
    description: 'Paste code, run your first analysis, and read the optimization in under a minute.',
  },
  {
    icon: Code2,
    title: 'Supported languages',
    description: 'How ReflexAlgo reviews Python, JavaScript, Java, C++, Rust, and more.',
  },
  {
    icon: FileText,
    title: 'Reading a review',
    description: 'Make sense of complexity notes, pattern matches, refactors, and performance wins.',
  },
];

const Docs = () => {
  return (
    <Section id="docs">
      <SectionHeading
        eyebrow="Documentation"
        title="Guides that get you"
        accent="shipping"
        subtitle="Practical references for running reviews, reading AI feedback, and turning slow solutions into fast ones."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {docCards.map((doc, index) => (
          <motion.a
            key={doc.title}
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="group relative rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-7 transition-colors duration-300 hover:border-violet-500/30 hover:bg-zinc-900/50"
          >
            <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-zinc-600 transition-all group-hover:text-violet-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.03] border border-white/10 text-violet-300">
              <doc.icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{doc.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{doc.description}</p>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link to="/signup">
          <Button variant="primary" size="lg" className="group">
            Try it with your code
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Explore features
        </a>
      </motion.div>
    </Section>
  );
};

export default Docs;
