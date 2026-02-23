import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close modal" />
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 p-5"
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-lg font-semibold">{title}</div>
              <button className="rounded-lg bg-white/10 px-3 py-1 hover:bg-white/15" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="mt-3 text-white/80">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
