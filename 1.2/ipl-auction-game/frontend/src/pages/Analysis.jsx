import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../state/gameState.jsx'
import { scoreTeam, getBalancedSquadBonus, getStarBonus } from '../utils/scoring.js'
import { formatINRFromLakhs } from '../utils/money.js'

export default function Analysis() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()

  const users = state.users

  if (users.length === 0) {
    navigate('/')
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team Analysis</h2>
        <Link className="rounded-xl bg-neon-gold/90 px-4 py-2 text-black font-semibold hover:bg-neon-gold" to="/results">
          Go to Results
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {users.map((u) => {
          const { total, breakdown } = scoreTeam({ squad: u.squad || [], captainId: u.captainId })
          const balancedBonus = getBalancedSquadBonus(u.squad || [])
          const starBonus = getStarBonus(u.squad || [])
          const maxScore = Math.max(1, (u.squad || []).length * 200)
          const strengthPercent = Math.min(100, (total / maxScore) * 100)

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
                <div className="text-sm text-white/70">Total Team Score</div>
                <div className="mt-1 text-3xl font-bold text-neon-gold">{total}</div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-white/70">Strength</div>
                <div className="mt-2 h-4 w-full rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-gold transition-all"
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-white/60">{strengthPercent.toFixed(1)}%</div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-white/70">Captain</div>
                <div className="mt-2">
                  <select
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-neon-cyan/60"
                    value={u.captainId || ''}
                    onChange={(e) => {
                      const captainId = e.target.value || null
                      dispatch({ type: 'SET_CAPTAIN', payload: { userId: u.id, captainId } })
                    }}
                  >
                    <option value="">Select Captain</option>
                    {(u.squad || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-sm text-white/70">Score Breakdown</div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Base: {breakdown.base}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Star Bonus: {breakdown.starBonus}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Balanced Bonus: {breakdown.balancedBonus}
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-2">
                    Captain Bonus: {breakdown.captainBonus}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-white/70">
                  {balancedBonus > 0 ? '✅ Balanced Squad' : '⚠️ Needs Balance'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <Link className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15" to="/squad">
          Squad
        </Link>
        <Link className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15" to="/results">
          Results
        </Link>
      </div>

      <div className="mt-6">
        <Link className="text-neon-cyan hover:underline" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
