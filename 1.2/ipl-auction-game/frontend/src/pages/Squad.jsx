import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../state/gameState.jsx'
import { formatINRFromLakhs } from '../utils/money.js'

export default function Squad() {
  const navigate = useNavigate()
  const { state } = useGame()

  const users = state.users

  const roleCounts = (players) => {
    const counts = {
      Batsman: 0,
      Bowler: 0,
      'All-Rounder': 0,
      'Wicket-Keeper': 0,
    }
    for (const p of players || []) {
      if (counts[p.role] !== undefined) counts[p.role]++
    }
    return counts
  }

  if (users.length === 0) {
    navigate('/')
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Squads</h2>
        <Link className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15" to="/auction">
          Back to Auction
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {users.map((u) => {
          const counts = roleCounts(u.squad)
          return (
            <div key={u.id} className="rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar?.src || '/assets/avatars/avatar-1.svg'}
                    alt={u.username}
                    className="h-12 w-12 rounded-xl object-cover border border-white/10 bg-black/30"
                  />
                  <div>
                    <div className="font-semibold">{u.teamName}</div>
                    <div className="text-sm text-white/70">@{u.username}</div>
                  </div>
                </div>
                <div className="text-sm text-white/80">Purse: {formatINRFromLakhs(u.purse)}</div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-white/70">Squad ({u.squad?.length || 0})</div>
                <div className="mt-2 max-h-64 overflow-auto space-y-2">
                  {u.squad && u.squad.length > 0 ? (
                    u.squad.map((p) => (
                      <div key={p.id} className="rounded-xl bg-black/20 border border-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{p.name}</div>
                            <div className="text-xs text-white/60">{p.role} • {p.country}</div>
                          </div>
                          <div className="text-sm">{formatINRFromLakhs(p.finalPrice || p.basePrice)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/60">No players bought yet.</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-white/70">Role Summary</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Batsman: {counts.Batsman}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Bowler: {counts.Bowler}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    All-Rounder: {counts['All-Rounder']}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Wicket-Keeper: {counts['Wicket-Keeper']}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <Link className="text-neon-cyan hover:underline" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
