import { useMemo } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'

export default function LeadingBanner({ users, round }) {
  const leader = useMemo(() => {
    if (!round?.currentBidderUserId) return null
    return (users || []).find((u) => u.id === round.currentBidderUserId) || null
  }, [round?.currentBidderUserId, users])

  if (!round?.player) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/60">Now Auctioning</div>
          <div className="text-base sm:text-lg font-black text-white truncate">{round.player.name}</div>
          <div className="text-xs text-white/60 truncate">{round.player.role} • {round.player.country}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/60">Current</div>
          <div className="text-xl sm:text-2xl font-black text-neon-gold">{formatINRFromLakhs(round.currentBid)}</div>
          <div className="text-xs text-white/70">
            {leader ? (
              <span>
                Leading: <span className="font-semibold text-white">{leader.teamName}</span>
              </span>
            ) : (
              <span>No bids yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
