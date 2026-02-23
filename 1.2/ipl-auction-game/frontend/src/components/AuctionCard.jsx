import { useMemo } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'
import { useWikiThumbnail } from '../hooks/useWikiThumbnail.js'

export default function AuctionCard({ player, currentBid, currentBidderLabel }) {
  const wikiThumb = useWikiThumbnail(player?.name)

  const photoSrc = useMemo(() => {
    const explicit = typeof player?.photo === 'string' ? player.photo : null
    const hasHttp = explicit && /^https?:\/\//i.test(explicit)
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(player?.name || 'Player')}&background=111827&color=fff&size=256`
    const src = hasHttp ? explicit : wikiThumb || explicit || fallback
    return { src, fallback }
  }, [player?.name, player?.photo, wikiThumb])

  const roleColors = {
    Batsman: 'text-green-400',
    Bowler: 'text-blue-400',
    'All-Rounder': 'text-purple-400',
    'Wicket-Keeper': 'text-yellow-400',
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 via-red-600/10 to-transparent opacity-30 group-hover:opacity-50 transition-all duration-500" />
      <div className="absolute inset-0 rounded-3xl border-2 border-white/20 animate-spin" style={{ animationDuration: '20s' }} />
      
      <div className="relative bg-white/5 backdrop-blur-xl border-2 border-white/20 shadow-2xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-105 group-hover:shadow-orange-500/50">
        <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-4 right-4 w-8 h-8 bg-red-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-4 left-1/2 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-40 animate-ping" style={{ animationDelay: '2s' }} />
        
        {/* Large Centered Photo */}
        <div className="flex justify-center mb-6">
          <img
            src={photoSrc.src}
            alt={player?.name || 'Player'}
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl object-cover border-4 border-white/20 bg-black/30 shadow-2xl"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = photoSrc.fallback
            }}
          />
        </div>

        {/* Player Info Below Photo */}
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl mb-2" style={{ textShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.4), 2px 2px 4px rgba(0,0,0,0.8)' }}>
            {player?.name || 'No Player'}
          </h3>
          <div className="text-sm sm:text-base text-white font-semibold mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            {player?.role} • {player?.country}
          </div>
          
          {/* Current Bid Display */}
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-600 to-teal-700 bg-clip-text text-transparent animate-pulse">
              <span key={currentBid} className="inline-block vfx-bid-pop">
                {formatINRFromLakhs(currentBid)}
              </span>
            </div>
            {currentBidderLabel && (
              <div className="text-xs sm:text-sm text-white/60 mt-1 animate-fade-in" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                Currently Leading: {currentBidderLabel}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-yellow-300 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)' }}>Base Price</div>
            <div className="text-2xl font-bold text-yellow-200" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)' }}>{formatINRFromLakhs(player?.basePrice || 0)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-300 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)' }}>Role</div>
            <div className="text-2xl font-bold text-cyan-300 animate-fade-in" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)' }}>
              {player?.role || 'Unknown'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-300 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)' }}>Rating</div>
            <div className="text-2xl font-bold text-green-300 animate-fade-in" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)' }}>{player?.rating || 'N/A'}</div>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-300 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)' }}>Style</div>
            <div className="text-2xl font-bold text-pink-300 animate-fade-in" style={{ textShadow: '2px 2px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)' }}>{player?.style || 'N/A'}</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="ml-2">Available for Auction</span>
          </div>
        </div>
      </div>
    </div>
  )
}
