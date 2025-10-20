import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
    },
    error: {
      icon: AlertCircle,
      gradient: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500/20 to-purple-500/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
    },
    analyzing: {
      icon: Sparkles,
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
    }
  };

  const { icon: Icon, gradient, border, iconColor, glow } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`fixed top-8 right-8 z-[9999] max-w-md ${glow}`}
    >
      <div className={`bg-gradient-to-r ${gradient} backdrop-blur-xl border ${border} rounded-2xl p-5 shadow-2xl`}>
        <div className="flex items-start gap-4">
          <div className={`p-2 bg-black/30 rounded-xl ${type === 'analyzing' ? 'animate-pulse' : ''}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          
          <div className="flex-1 pr-4">
            <p className="text-white font-semibold text-base leading-relaxed">
              {message}
            </p>
            
            {type === 'analyzing' && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-purple-300">AI thinking...</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>
        
        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-1 bg-gradient-to-r ${gradient} rounded-full mt-4 origin-left`}
        />
      </div>
    </motion.div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <motion.div
          key={toast.id}
          style={{ top: `${8 + index * 100}px` }}
          className="fixed right-8 z-[9999]"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default Toast;

