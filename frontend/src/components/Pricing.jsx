import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { Section, SectionHeading } from './ui/Section';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    description: 'For trying it out on real code.',
    features: [
      '3 AI code reviews',
      'Core complexity analysis',
      'Pattern detection',
      'Community support',
    ],
    cta: 'Get started',
    variant: 'secondary',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$4',
    period: 'per month',
    description: 'For developers who review code daily.',
    features: [
      'Unlimited code reviews',
      'Advanced AI engine',
      'Automatic refactors',
      'Priority support (< 1h)',
      'All languages',
      'Performance analytics',
    ],
    cta: 'Start Pro',
    variant: 'accent',
    popular: true,
  },
  {
    name: 'Team',
    price: '$3',
    period: 'per user / month',
    description: 'For teams raising the bar together.',
    features: [
      'Everything in Pro',
      'Team dashboard & analytics',
      'Shared code reviews',
      'Admin controls & SSO',
    ],
    cta: 'Start Team',
    variant: 'secondary',
    badge: 'Best value',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored to you',
    description: 'For organizations with scale needs.',
    features: [
      'Everything in Team',
      'Custom AI model training',
      'Dedicated support engineer',
      '99.9% SLA & on-prem options',
    ],
    cta: 'Contact sales',
    variant: 'outline',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <Section id="pricing">
      <div className="ambient w-[40rem] h-[28rem] top-10 left-1/2 -translate-x-1/2 bg-indigo-800/10" />

      <SectionHeading
        eyebrow="Pricing"
        title="Simple, transparent"
        accent="pricing"
        subtitle="Start free, upgrade when it pays for itself. No hidden fees — cancel anytime."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className={`relative flex flex-col rounded-2xl p-6 ${
              plan.popular
                ? 'ring-gradient bg-zinc-900/70 shadow-2xl shadow-violet-950/40 lg:-mt-3 lg:mb-3'
                : 'border border-white/[0.08] bg-zinc-950/50'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
                Most popular
              </span>
            )}
            {plan.badge && (
              <span className="absolute -top-3 left-6 rounded-full border border-white/15 bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-zinc-200">
                {plan.badge}
              </span>
            )}

            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {plan.name}
            </h3>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight text-white">{plan.price}</span>
              <span className="text-sm text-zinc-500">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400 min-h-[2.5rem]">{plan.description}</p>

            <div className="my-5 h-px bg-white/[0.07]" />

            <ul className="space-y-3 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 w-4 h-4 flex-shrink-0 text-violet-400" />
                  <span className="text-sm text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup" className="mt-7 w-full">
              <Button variant={plan.variant} size="md" className="w-full">
                {plan.cta}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Pricing;
