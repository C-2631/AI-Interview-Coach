import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, setToasts, theme }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            setToasts={setToasts} 
            theme={theme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, setToasts, theme }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, setToasts]);

  const removeToast = () => {
    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
  };

  const isDark = theme === 'dark';
  
  const typeStyles = {
    success: {
      border: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
      bg: isDark ? 'bg-[#0f291e]/90 text-emerald-300' : 'bg-emerald-50 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
    },
    error: {
      border: isDark ? 'border-rose-500/30' : 'border-rose-200',
      bg: isDark ? 'bg-[#2c131a]/90 text-rose-300' : 'bg-rose-50 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
    },
    info: {
      border: isDark ? 'border-sky-500/30' : 'border-sky-200',
      bg: isDark ? 'bg-[#0d233a]/90 text-sky-300' : 'bg-sky-50 text-sky-800',
      icon: <AlertCircle className="w-5 h-5 text-sky-400 flex-shrink-0" />
    }
  }[toast.type || 'info'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, minHeight: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-2xl shadow-xl backdrop-blur-md ${typeStyles.bg} ${typeStyles.border}`}
    >
      {typeStyles.icon}
      <div className="flex-grow text-xs font-semibold leading-relaxed">
        {toast.message}
      </div>
      <button 
        onClick={removeToast} 
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
