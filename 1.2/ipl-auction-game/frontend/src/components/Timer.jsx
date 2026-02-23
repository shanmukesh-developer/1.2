import { motion } from 'framer-motion'

export default function Timer({ seconds }) {
  const s = Math.max(0, seconds || 0)
  const danger = s <= 3

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-white/70">Time</div>
      <motion.div
        key={s}
        initial={{ scale: 0.98, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-xl px-4 py-2 font-semibold border ${
          danger ? 'bg-red-500/15 border-red-500/40 text-red-200' : 'bg-white/5 border-white/10'
        }`}
      >
        {s}s
      </motion.div>
    </div>
  )
}
