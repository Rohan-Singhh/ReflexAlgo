import { motion } from 'framer-motion';
import { Check, Sparkles, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const plans = [
  {
    name: 'starter',
    price: '$0',
    period: 'forever free',
    description: 'get started for free',
    features: [
      '3 AI code reviews',
      'basic dashboard access',
      'community support',
      'core AI features',
      'basic pattern recognition',
      'standard response time',
    ],
    cta: 'start free trial',
    popular: false,
  },
  {
    name: 'pro',
    price: '$4',
    period: 'per month',
    description: 'most popular choice',
    features: [
      'unlimited AI code reviews',
      'advanced AI engine',
      'real-time refactoring',
      'priority support (< 1hr)',
      'all language support',
      'performance analytics',
    ],
    cta: 'get started now',
    popular: true,
    icon: Sparkles,
  },
  {
    name: 'team',
    price: '$3',
    period: 'per user/month',
    description: 'scale your entire team',
    features: [
      'everything in pro',
      'team dashboard & analytics',
      'shared code reviews',
      'team performance insights',
      'admin controls & SSO',
      'dedicated account manager',
    ],
    cta: 'talk to our team',
    popular: false,
    icon: Users,
    badge: 'best value',
  },
  {
    name: 'enterprise',
    price: 'custom',
    period: 'tailored solution',
    description: 'for growing companies',
    features: [
      'everything in team',
      'custom AI model training',
      'dedicated support engineer',
      '99.9% SLA guarantee',
      'on-premise deployment',
      'white-label options',
    ],
    cta: 'see it in action',
    popular: false,
    icon: Building2,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            pricing that doesn't <span className="text-gradient">suck</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            transparent pricing. no BS. cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative bg-gradient-to-br from-gray-900 to-black border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'border-purple-500/50 shadow-2xl shadow-purple-900/50'
                  : 'border-white/10'
              } hover:border-purple-500/40`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>most popular</span>
                </div>
              )}

              {plan.badge && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-semibold">
                  {plan.badge}
                </div>
              )}

              {/* Icon section - fixed height */}
              <div className="h-12 mb-3">
                {plan.icon && <plan.icon className="w-8 h-8 text-indigo-400" />}
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-xs mb-4 h-8">{plan.description}</p>
                
                {/* Price - fixed height */}
                <div className="flex flex-col h-20">
                  <span className="text-4xl font-bold mb-1">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>

              {/* Features - flex grow */}
              <ul className="space-y-2.5 mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button - fixed at bottom */}
              <Link to="/signup" className="w-full mt-auto">
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

