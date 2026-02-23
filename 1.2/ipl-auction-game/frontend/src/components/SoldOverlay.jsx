import { useEffect, useMemo, useState } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'

export default function SoldOverlay({ triggerKey, users, round }) {
  const [visible, setVisible] = useState(false)

  const data = useMemo(() => {
    if (!round?.currentBidderUserId || !round?.player) return null
    const winner = (users || []).find((u) => u.id === round.currentBidderUserId)
    if (!winner) return null
    return {
      teamName: winner.teamName,
      playerName: round.player.name,
      price: round.currentBid,
    }
  }, [round, users])

  useEffect(() => {
    if (!triggerKey || !data) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(t)
  }, [triggerKey, data])

  if (!visible || !data) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative rounded-3xl bg-gradient-to-br from-yellow-500/20 via-orange-600/20 to-red-600/20 border-4 border-white/30 p-8 shadow-2xl animate-sold-pop">
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-pulse">
          🔨
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-lg">SOLD!</div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-300 mb-1">{data.playerName}</div>
          <div className="text-lg text-white/80 mb-3">to {data.teamName}</div>
          <div className="text-3xl sm:text-4xl font-black text-neon-gold">{formatINRFromLakhs(data.price)}</div>
        </div>
      </div>
    </div>
  )
}
