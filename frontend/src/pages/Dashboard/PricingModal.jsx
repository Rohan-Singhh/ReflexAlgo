import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Users, Building2, X, Crown } from 'lucide-react';
import { useEffect } from 'react';
import Button from '../../components/ui/Button';

const plans = [
  {
    name: 'starter',
    price: '$0',
    period: 'limited trial',
    description: 'test the waters',
    features: [
      '10 code reviews per month',
      'basic dashboard access',
      'community support',
      'core AI features only',
      'limited pattern recognition',
      'standard response time',
    ],
    cta: 'start trial',
    popular: false,
  },
  {
    name: 'pro',
    price: '$4',
    period: 'per month',
    description: 'most popular choice',
    features: [
      'unlimited code reviews',
      'advanced AI engine',
      'real-time refactoring',
      'priority support (< 1hr)',
      'all language support',
      'performance analytics',
    ],
    cta: 'upgrade now',
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
    cta: 'contact sales',
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
    cta: 'book a demo',
    popular: false,
    icon: Building2,
  },
];

const PricingModal = ({ isOpen, onClose }) => {
  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const handleUpgrade = (planName) => {
    // TODO: Integrate with payment system (Stripe, etc.)
    alert(`Upgrading to ${planName} plan... (Payment integration coming soon!)`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-7xl bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-150 group z-10"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-150" />
                </button>

                {/* Header */}
                <div className="text-center px-8 pt-12 pb-8 border-b border-white/5">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-10 h-10 text-yellow-400" />
                    <h2 className="text-5xl font-bold text-white">upgrade your plan</h2>
                  </div>
                  <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                    unlock more power. scale faster. dominate the leaderboard.
                  </p>
                </div>

                {/* Pricing Cards */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ y: -4 }}
                        className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border rounded-3xl p-8 flex flex-col transition-all duration-200 ${
                          plan.popular
                            ? 'border-purple-500/50 shadow-2xl shadow-purple-900/30'
                            : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-sm font-semibold flex items-center space-x-1.5 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            <span>most popular</span>
                          </div>
                        )}

                        {plan.badge && !plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-sm font-semibold shadow-lg">
                            {plan.badge}
                          </div>
                        )}

                        {/* Icon section */}
                        <div className="h-14 mb-4">
                          {plan.icon && (
                            <div className="inline-block p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl">
                              <plan.icon className="w-8 h-8 text-indigo-400" />
                            </div>
                          )}
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <p className="text-gray-500 text-sm mb-4 h-10 flex items-center">{plan.description}</p>
                          
                          {/* Price */}
                          <div className="flex flex-col h-24 justify-center">
                            <span className="text-5xl font-bold text-white mb-2">{plan.price}</span>
                            <span className="text-gray-500 text-sm">{plan.period}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8 flex-grow">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start space-x-3">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-400 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          variant={plan.popular ? 'primary' : 'secondary'}
                          size="lg"
                          className="w-full transition-all duration-150"
                          onClick={() => handleUpgrade(plan.name)}
                        >
                          {plan.cta}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer Note */}
                  <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                      all plans include a 14-day money-back guarantee • no credit card required for trial
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;

