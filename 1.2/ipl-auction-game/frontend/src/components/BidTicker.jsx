import { useMemo } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'

// Team-specific timer reset settings - works with any team name (matching backend)
function getTeamTimerReset(teamName) {
  const teamNameLower = (teamName || '').toLowerCase()
  
  // You can configure any team here - these are just examples
  const teamConfigs = {
    // Example: CSK gets 20-30 seconds reset
    'csk': () => 20 + Math.floor(Math.random() * 11),
    'chennai': () => 20 + Math.floor(Math.random() * 11),
    'super kings': () => 20 + Math.floor(Math.random() * 11),
    
    // Example: RCB gets full 30 seconds reset
    'rcb': () => 30,
    'bangalore': () => 30,
    'royal challengers': () => 30,
    
    // Example: Any team with "mumbai" gets 25 seconds
    'mumbai': () => 25,
    'indians': () => 25,
    
    // Example: Any team with "delhi" gets 22 seconds
    'delhi': () => 22,
    'capitals': () => 22,
    
    // Example: Any team with "kolkata" gets 28 seconds
    'kolkata': () => 28,
    'knight': () => 28,
    
    // Example: Any team with "rajasthan" gets 24 seconds
    'rajasthan': () => 24,
    'royals': () => 24,
    
    // Example: Any team with "punjab" gets 26 seconds
    'punjab': () => 26,
    'kings': () => 26,
    
    // Example: Any team with "hyderabad" gets 27 seconds
    'hyderabad': () => 27,
    'sunrisers': () => 27,
    
    // Example: Any team with "lucknow" gets 23 seconds
    'lucknow': () => 23,
    'supergiants': () => 23,
    
    // Example: Any team with "gujarat" gets 29 seconds
    'gujarat': () => 29,
    'titans': () => 29,
  }
  
  // Check if any keyword matches the team name
  for (const [keyword, timerFunc] of Object.entries(teamConfigs)) {
    if (teamNameLower.includes(keyword)) {
      return timerFunc()
    }
  }
  
  // Default: reset to 30 seconds for any other team
  return 30
}

export default function BidTicker({ users, bidHistory }) {
  const items = useMemo(() => {
    const list = Array.isArray(bidHistory) ? bidHistory : []
    const recent = list.slice(-6).reverse()
    const userMap = new Map((users || []).map((u) => [u.id, u]))

    return recent.map((b) => {
      const u = userMap.get(b.userId)
      return {
        key: `${b.ts}-${b.userId}-${b.amount}`,
        teamName: u?.teamName || 'Team',
        username: u?.username || 'player',
        amount: b.amount,
        ts: b.ts,
      }
    })
  }, [bidHistory, users])

  return (
    <div className="rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-neon-gold to-pink-400 drop-shadow" style={{ textShadow: '0 0 12px rgba(34,211,238,0.6), 0 0 24px rgba(245,197,66,0.3)' }}>
          Live Bid Ticker
        </div>
        <div className="text-xs text-white/60">Last {items.length}</div>
      </div>

      <div className="space-y-2 h-40 overflow-hidden pr-1">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No bids yet.</div>
        ) : (
          items.slice(-6).reverse().map((it, idx) => (
            <div
              key={it.key}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2 animate-slide-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="min-w-0">
                <div className="text-xs text-white truncate">
                  <span className="font-semibold">{it.teamName}</span>
                  <span className="text-white/50"> @{it.username}</span>
                </div>
                <div className="text-[10px] text-white/40">{new Date(it.ts).toLocaleTimeString()}</div>
              </div>
              <div className="text-2xl font-black text-neon-cyan whitespace-nowrap">{formatINRFromLakhs(it.amount)}</div>
              <div className="text-[10px] text-yellow-300 font-semibold">+{getTeamTimerReset(it.teamName)}s</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
