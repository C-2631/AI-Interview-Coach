import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", theme }) {
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={`relative max-w-sm w-full border rounded-3xl p-6 shadow-2xl backdrop-blur-xl ${
              isDark 
                ? 'bg-[#120c24]/95 border-white/10 text-slate-100' 
                : 'bg-white border-orange-200/60 text-slate-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-black uppercase tracking-wider mb-1 font-mono">
                  {title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  isDark 
                    ? 'border-white/10 hover:bg-white/5 text-slate-300' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl font-black text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
