import { motion } from 'framer-motion';
import { Users, GraduationCap, Trophy, Briefcase } from 'lucide-react';

const audiences = [
  {
    icon: Trophy,
    title: 'competitive coders',
    description: 'crush leetcode. ace contests.',
  },
  {
    icon: GraduationCap,
    title: 'CS students',
    description: 'pass your DSA class. get that internship.',
  },
  {
    icon: Briefcase,
    title: 'working devs',
    description: 'ship better code. get promoted.',
  },
  {
    icon: Users,
    title: 'dev teams',
    description: 'level up together. no more code reviews about O(n²).',
  },
];

const TargetAudience = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            who's this <span className="text-gradient">for</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            if you write code, this is for you. period.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group text-center"
            >
              <div className="relative inline-flex p-6 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl mb-4 group-hover:border-purple-500/50 transition-all duration-300">
                <audience.icon className="w-12 h-12 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 rounded-2xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{audience.title}</h3>
              <p className="text-gray-400 text-sm">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;

