import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropVariants, modalVariants } from '../../animations/variants';

export default function Modal({ isOpen = true, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`glass-heavy rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="font-display font-semibold text-lg">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
