import {
  Sparkles, Code2, Zap, Gem, Flame, Layers, Target, Trophy, Star, Crown, Award,
} from 'lucide-react';

// Maps the backend achievement `icon` keyword to a lucide component.
export const BADGE_ICONS = {
  sparkles: Sparkles,
  code: Code2,
  zap: Zap,
  gem: Gem,
  flame: Flame,
  layers: Layers,
  target: Target,
  trophy: Trophy,
  star: Star,
  crown: Crown,
};

export const getBadgeIcon = (icon) => BADGE_ICONS[icon] || Award;

// Rarity → tailwind classes for the badge tile.
export const RARITY_STYLES = {
  common: {
    ring: 'border-zinc-700/60',
    glow: 'from-zinc-500/10 to-zinc-400/5',
    text: 'text-zinc-300',
    label: 'Common',
  },
  rare: {
    ring: 'border-sky-500/40',
    glow: 'from-sky-500/15 to-cyan-500/5',
    text: 'text-sky-300',
    label: 'Rare',
  },
  epic: {
    ring: 'border-violet-500/45',
    glow: 'from-violet-500/20 to-fuchsia-500/5',
    text: 'text-violet-300',
    label: 'Epic',
  },
  legendary: {
    ring: 'border-amber-500/50',
    glow: 'from-amber-500/20 to-orange-500/5',
    text: 'text-amber-300',
    label: 'Legendary',
  },
};

export const getRarityStyle = (rarity) => RARITY_STYLES[rarity] || RARITY_STYLES.common;
