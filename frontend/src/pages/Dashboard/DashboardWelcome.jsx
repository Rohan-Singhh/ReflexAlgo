import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Crown, ArrowUpRight } from 'lucide-react';

const PLAN_LABEL = { pro: 'Pro', team: 'Team', enterprise: 'Enterprise' };

const DashboardWelcome = memo(({ user, stats, subscription, onOpenPricing }) => {
  const isPaid = subscription && subscription.plan !== 'starter';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Working late';
  };

  const getRenewalText = () => {
    if (!subscription || subscription.plan === 'starter') return '';
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (subscription.endDate) return `Expires ${fmt(subscription.endDate)}`;
    if (subscription.paymentInfo?.nextBillingDate) return `Renews ${fmt(subscription.paymentInfo.nextBillingDate)}`;
    const base = subscription.paymentInfo?.lastPaymentDate || subscription.startDate || Date.now();
    const next = new Date(base);
    if (subscription.billingCycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return `Renews ${fmt(next)}`;
  };

  const xpPct = stats?.experienceToNextLevel
    ? Math.min(100, Math.round((stats.experience / stats.experienceToNextLevel) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-16"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600 mb-3">Dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-2 text-base text-zinc-400">
            Here's where your code optimization stands today.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* World rank */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <TrendingUp className="w-4 h-4 text-violet-300" />
              <span className="text-xs">World rank</span>
            </div>
            <p className="text-2xl font-semibold text-white">{stats?.rank ? `#${stats.rank}` : '—'}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {stats?.rankChange > 0 ? `▲ ${stats.rankChange} this week`
                : stats?.rankChange < 0 ? `▼ ${Math.abs(stats.rankChange)} this week`
                : 'No change'}
            </p>
          </div>

          {/* Level */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="text-xs">Level</span>
            </div>
            <p className="text-2xl font-semibold text-white">{stats?.level || 1}</p>
            <p className="text-xs text-zinc-500 mt-1">{xpPct}% to level {(stats?.level || 1) + 1}</p>
          </div>

          {/* Plan / upgrade */}
          {isPaid ? (
            <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] px-5 py-4 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-zinc-500">
                <Crown className="w-4 h-4 text-violet-300" />
                <span className="text-xs">Plan</span>
              </div>
              <p className="text-2xl font-semibold text-white">{PLAN_LABEL[subscription.plan] || 'Pro'}</p>
              <p className="text-xs text-zinc-500 mt-1">{getRenewalText()}</p>
            </div>
          ) : (
            <button
              onClick={onOpenPricing}
              className="group text-left rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 col-span-2 sm:col-span-1 hover:border-violet-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2 text-zinc-500">
                <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-300" /><span className="text-xs">Plan</span></span>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-300 transition-colors" />
              </div>
              <p className="text-2xl font-semibold text-white">Upgrade</p>
              <p className="text-xs text-zinc-500 mt-1">Unlock Pro from $4/mo</p>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

DashboardWelcome.displayName = 'DashboardWelcome';

export default DashboardWelcome;
