import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../state/gameState.jsx'
import { rankTeams } from '../utils/scoring.js'

export default function Results() {
  const navigate = useNavigate()
  const { state } = useGame()

  const { leaderboard, top10 } = useMemo(() => rankTeams(state.users), [state.users])

  if (state.users.length === 0) {
    navigate('/')
    return null
  }

  const champion = top10[0]
  const runnerUp = top10[1]
  const third = top10[2]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Results</h2>
        <Link className="rounded-xl bg-neon-gold/90 px-4 py-2 text-black font-semibold hover:bg-neon-gold" to="/celebration">
          Celebration Mode
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 p-6">
        <div className="text-center">
          <div className="text-2xl font-semibold">🏆 Mega Champion</div>
          {champion ? (
            <div className="mt-4">
              <div className="text-lg font-semibold">{champion.teamName}</div>
              <div className="text-sm text-white/70">@{champion.username}</div>
              <div className="mt-2 text-3xl font-bold text-neon-gold">{champion.score}</div>
            </div>
          ) : null}
        </div>

        {runnerUp ? (
          <div className="mt-6 text-center">
            <div className="text-lg font-semibold">🥈 Runner-Up</div>
            <div className="mt-2">
              <div className="font-semibold">{runnerUp.teamName}</div>
              <div className="text-sm text-white/70">@{runnerUp.username}</div>
              <div className="mt-1 text-2xl font-bold text-neon-cyan">{runnerUp.score}</div>
            </div>
          </div>
        ) : null}

        {third ? (
          <div className="mt-6 text-center">
            <div className="text-lg font-semibold">🥉 Third Place</div>
            <div className="mt-2">
              <div className="font-semibold">{third.teamName}</div>
              <div className="text-sm text-white/70">@{third.username}</div>
              <div className="mt-1 text-2xl font-bold text-white/90">{third.score}</div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="font-semibold">Top 10 Leaderboard</div>
        </div>
        <div className="divide-y divide-white/10">
          {top10.length === 0 ? (
            <div className="px-4 py-6 text-sm text-white/60">No rankings yet.</div>
          ) : (
            top10.map((r, idx) => (
              <div key={r.userId} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-white/70">#{idx + 1}</div>
                  <div>
                    <div className="font-semibold">{r.teamName}</div>
                    <div className="text-xs text-white/60">@{r.username}</div>
                  </div>
                </div>
                <div className="font-semibold">{r.score}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15" to="/analysis">
          Analysis
        </Link>
        <Link className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15" to="/squad">
          Squad
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
