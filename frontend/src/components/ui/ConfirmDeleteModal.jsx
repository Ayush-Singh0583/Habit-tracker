import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  habitName,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[201]"
          >
            <div className="card w-[400px] max-w-[90%] p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="text-red-400" />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                Delete Habit?
              </h2>

              <p className="text-sm text-white/50 mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="text-white font-medium">
                  {habitName}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}