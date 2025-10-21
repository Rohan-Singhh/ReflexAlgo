import { motion } from 'framer-motion';
import { memo } from 'react';

const Button = memo(({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/50',
    secondary: 'bg-white/10 text-white border border-white/20',
    outline: 'border-2 border-white/30 text-white',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <motion.button
      whileHover={{ 
        scale: 1.03,
        boxShadow: variant === 'primary' 
          ? '0 20px 40px -10px rgba(139, 92, 246, 0.6)' 
          : '0 10px 30px -5px rgba(255, 255, 255, 0.1)'
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Animated gradient overlay on hover */}
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;

