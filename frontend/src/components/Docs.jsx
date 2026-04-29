import { motion } from 'framer-motion';
import { BookOpen, Code2, FileText, Terminal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const docCards = [
  {
    icon: Terminal,
    title: 'quickstart',
    description: 'paste code, run analysis, and get your first optimization in under a minute.',
  },
  {
    icon: Code2,
    title: 'supported languages',
    description: 'learn how ReflexAlgo reviews Python, JavaScript, Java, C++, Rust, and more.',
  },
  {
    icon: FileText,
    title: 'review reports',
    description: 'understand complexity notes, pattern matches, refactors, and performance wins.',
  },
];

const Docs = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          id="docs"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-purple-500/30 rounded-full px-5 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-300 font-semibold">developer docs</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            docs that get you <span className="text-gradient">shipping</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            practical guides for reviewing code, reading AI feedback, and turning slow solutions into fast ones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {docCards.map((doc, index) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300">
                <doc.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{doc.title}</h3>
              <p className="text-gray-400 leading-relaxed">{doc.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup">
            <Button variant="primary" size="lg" className="group">
              try it with your code
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold">
            explore product features
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Docs;
