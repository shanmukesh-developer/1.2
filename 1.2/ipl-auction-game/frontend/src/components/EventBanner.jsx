import { AnimatePresence, motion } from 'framer-motion'

export default function EventBanner({ event }) {
  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-3"
        >
          <div className="text-sm text-white/70">Auction Event</div>
          <div className="text-lg font-semibold">{event.name}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
