import { motion } from 'framer-motion';
import { memo } from 'react';

const Button = memo(({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden whitespace-nowrap';

  const variants = {
    // High-contrast primary — solid, confident, no rainbow gradient
    primary:
      'bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset]',
    // Accent action when we want colour
    accent:
      'text-white bg-gradient-to-b from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 shadow-lg shadow-violet-900/40',
    secondary:
      'bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.1] hover:border-white/20',
    outline:
      'border border-white/15 text-white hover:bg-white/[0.04] hover:border-white/30',
    ghost: 'text-zinc-300 hover:text-white hover:bg-white/[0.05]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
