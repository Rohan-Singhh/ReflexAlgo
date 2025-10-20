import { motion } from 'framer-motion';
import { Zap, Target, Code2, BarChart3, Sparkles, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'instant analysis',
    description: 'spots O(n²) loops in milliseconds. because time is money.',
  },
  {
    icon: Target,
    title: 'real suggestions',
    description: 'not "try harder" BS. actual line-by-line fixes.',
  },
  {
    icon: Code2,
    title: 'pattern matching',
    description: 'recognizes 50+ DSA patterns. sliding window? we got you.',
  },
  {
    icon: BarChart3,
    title: 'flex dashboard',
    description: 'track your glow-up. share your wins. become that person.',
  },
  {
    icon: Sparkles,
    title: 'auto refactoring',
    description: 'AI rewrites your code. cleaner. faster. chefs kiss 👨‍🍳',
  },
  {
    icon: Shield,
    title: 'works everywhere',
    description: 'python, js, java, c++, rust. if you code it, we read it.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-b from-purple-900/10 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            why this <span className="text-gradient">slaps</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            features that actually matter. none of that fluff.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

