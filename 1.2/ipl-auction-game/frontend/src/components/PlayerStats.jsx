import { useMemo, useState, useEffect } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'
import { useWikiThumbnail } from '../hooks/useWikiThumbnail.js'

export default function PlayerStats({ player, isVisible, isCurrentTurn, currentBid, currentBidderLabel, secondsLeft }) {
  const cricket = useMemo(() => {
    if (!player) return null

    const s = player.stats || {}
    const role = player.role
    const isBat = role === 'Batsman' || role === 'Wicket-Keeper'
    const isBowl = role === 'Bowler'
    const isAR = role === 'All-Rounder'

    const batting = {
      matches: s.matches ?? null,
      runs: s.runs ?? null,
      average: s.average ?? null,
      strikeRate: s.strikeRate ?? null,
      centuries: s.centuries ?? null,
      fifties: s.fifties ?? null,
    }

    const bowling = {
      wickets: s.wickets ?? null,
      economy: s.economy ?? null,
    }

    return {
      role,
      isBat,
      isBowl,
      isAR,
      batting,
      bowling,
    }
  }, [player])

  const wikiThumb = useWikiThumbnail(player?.name)
  const headerImg = useMemo(() => {
    const name = player?.name || 'Player'
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6D28D9&color=fff&size=256`
    const explicit = typeof player?.photo === 'string' ? player.photo : null
    const hasHttp = explicit && /^https?:\/\//i.test(explicit)
    const src = hasHttp ? explicit : wikiThumb || explicit || fallback
    return { src, fallback }
  }, [player?.name, player?.photo, wikiThumb])

  if (!isVisible || !player) return null

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isCurrentTurn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
      {/* Enhanced backdrop with better blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-2 border-white/30 rounded-2xl p-4 sm:p-6 shadow-2xl w-[95vw] sm:w-[90vw] max-w-md mx-auto mt-4 sm:mt-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={headerImg.src}
              alt={player.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-4 border-white/30 shadow-lg bg-black/30 flex-shrink-0"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = headerImg.fallback
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-bold text-white truncate">{player.name}</div>
              <div className="text-sm text-gray-300 truncate">{player.role} • {player.country}</div>
            </div>
          </div>
          
          <button
            onClick={() => {
              // Close stats when clicked
              const event = new CustomEvent('closeStats')
              window.dispatchEvent(event)
            }}
            className="text-gray-400 hover:text-white text-xl flex-shrink-0 ml-2 p-1"
          >
            ✕
          </button>
        </div>

        {/* Live Auction Status */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30">
          <div className="text-sm font-bold text-green-400 mb-2">🔴 LIVE AUCTION</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Current Bid</div>
              <div className="text-xl font-bold text-yellow-400">{formatINRFromLakhs(currentBid || player.basePrice)}</div>
            </div>
            <div>
              <div className="text-gray-400">Time Left</div>
              <div className="text-xl font-bold text-red-400">{secondsLeft || 0}s</div>
            </div>
          </div>
          {currentBidderLabel && (
            <div className="mt-2 text-sm">
              <span className="text-gray-400">Leading: </span>
              <span className="text-white font-semibold">{currentBidderLabel}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-gray-400">Base Price</div>
            <div className="text-2xl font-bold text-green-400">{formatINRFromLakhs(player.basePrice)}</div>
            <div className="text-xs text-gray-500">Starting value</div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-400">Current Bid</div>
            <div className="text-2xl font-bold text-yellow-400">{formatINRFromLakhs(player.currentPrice || player.basePrice)}</div>
            <div className="text-xs text-gray-500">
              {(player.currentPrice || player.basePrice) > player.basePrice ? 'Above base price' : 'No bids yet'}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-gray-400 mb-3">Player Performance</div>

            <div className="grid grid-cols-2 gap-3">
              {(cricket?.isBat || cricket?.isAR) && (
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <div className="text-xs text-white/60">Runs</div>
                  <div className="text-lg font-bold text-white">{cricket?.batting?.runs ?? '—'}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
                    <div>Avg: <span className="text-white">{cricket?.batting?.average ?? '—'}</span></div>
                    <div>SR: <span className="text-white">{cricket?.batting?.strikeRate ?? '—'}</span></div>
                    <div>100s: <span className="text-white">{cricket?.batting?.centuries ?? '—'}</span></div>
                    <div>50s: <span className="text-white">{cricket?.batting?.fifties ?? '—'}</span></div>
                  </div>
                </div>
              )}

              {(cricket?.isBowl || cricket?.isAR) && (
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <div className="text-xs text-white/60">Wickets</div>
                  <div className="text-lg font-bold text-white">{cricket?.bowling?.wickets ?? '—'}</div>
                  <div className="mt-2 text-xs text-white/70">
                    Economy: <span className="text-white">{cricket?.bowling?.economy ?? '—'}</span>
                  </div>
                </div>
              )}

              {!cricket?.isBat && !cricket?.isBowl && !cricket?.isAR && (
                <div className="col-span-2 rounded-xl bg-black/20 border border-white/10 p-3 text-sm text-white/70">
                  Stats not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Turn Indicator */}
        {isCurrentTurn && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            YOUR TURN TO BID
          </div>
        )}
      </div>
    </div>
  )
}
