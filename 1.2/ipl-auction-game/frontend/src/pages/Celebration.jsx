import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../state/gameState.jsx'
import { rankTeams } from '../utils/scoring.js'

export default function Celebration() {
  const navigate = useNavigate()
  const { state } = useGame()

  const { top10 } = useMemo(() => rankTeams(state.users), [state.users])

  const [step, setStep] = useState('ready') // ready | countdown | reveal
  const [countdown, setCountdown] = useState(3)
  const [revealIndex, setRevealIndex] = useState(0)

  useEffect(() => {
    if (step === 'ready') {
      const t = setTimeout(() => setStep('countdown'), 800)
      return () => clearTimeout(t)
    }
    if (step === 'countdown' && countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (step === 'countdown' && countdown === 0) {
      setStep('reveal')
      setRevealIndex(0)
    }
    if (step === 'reveal' && revealIndex < top10.length) {
      const t = setTimeout(() => setRevealIndex((i) => i + 1), 1200)
      return () => clearTimeout(t)
    }
  }, [step, countdown, revealIndex, top10.length])

  if (state.users.length === 0) {
    navigate('/')
    return null
  }

  const champion = top10[0]
  const runnerUp = top10[1]
  const third = top10[2]

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-4 py-10">
      {step === 'ready' && (
        <div className="text-center animate-pulse">
          <div className="text-4xl font-bold text-neon-gold mb-4">Get Ready</div>
          <div className="text-white/70">The winner will be revealed shortly…</div>
        </div>
      )}

      {step === 'countdown' && (
        <div className="text-center">
          <div className="text-6xl font-bold text-neon-cyan animate-ping">{countdown}</div>
        </div>
      )}

      {step === 'reveal' && (
        <div className="w-full max-w-4xl space-y-6">
          {revealIndex > 0 && champion && (
            <div className="rounded-2xl bg-gradient-to-br from-neon-gold/20 to-neon-gold/5 border border-neon-gold/40 shadow-glass backdrop-blur-glass p-6 animate-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-gold mb-2">🏆 Mega Champion</div>
                <div className="text-xl font-semibold">{champion.teamName}</div>
                <div className="text-sm text-white/70">@{champion.username}</div>
                <div className="mt-2 text-4xl font-black">{champion.score}</div>
              </div>
            </div>
          )}

          {revealIndex > 1 && runnerUp && (
            <div className="rounded-2xl bg-white/5 border border-white/10 shadow-glass backdrop-blur-glass p-6 animate-in">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan mb-2">🥈 Runner-Up</div>
                <div className="text-lg font-semibold">{runnerUp.teamName}</div>
                <div className="text-sm text-white/70">@{runnerUp.username}</div>
                <div className="mt-1 text-3xl font-black">{runnerUp.score}</div>
              </div>
            </div>
          )}

          {revealIndex > 2 && third && (
            <div className="rounded-2xl bg-white/5 border border-white/10 shadow-glass backdrop-blur-glass p-6 animate-in">
              <div className="text-center">
                <div className="text-2xl font-bold text-white/90 mb-2">🥉 Third Place</div>
                <div className="text-lg font-semibold">{third.teamName}</div>
                <div className="text-sm text-white/70">@{third.username}</div>
                <div className="mt-1 text-3xl font-black">{third.score}</div>
              </div>
            </div>
          )}

          {revealIndex > 3 && (
            <div className="rounded-2xl bg-white/5 border border-white/10 shadow-glass backdrop-blur-glass overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="font-semibold">Top 10 Leaderboard</div>
              </div>
              <div className="divide-y divide-white/10">
                {top10.map((r, idx) => (
                  <div
                    key={r.userId}
                    className={`px-4 py-3 flex items-center justify-between transition-all ${
                      idx < revealIndex ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-white/70">#{idx + 1}</div>
                      <div>
                        <div className="font-semibold">{r.teamName}</div>
                        <div className="text-xs text-white/60">@{r.username}</div>
                      </div>
                    </div>
                    <div className="font-semibold">{r.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {revealIndex > top10.length && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-neon-gold">🎉 Congratulations! 🎉</div>
              <button
                className="rounded-xl bg-neon-gold/90 px-6 py-3 text-black font-semibold hover:bg-neon-gold"
                onClick={() => navigate('/')}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/10 via-transparent to-neon-cyan/10 animate-pulse" />
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-in {
          animation: animate-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
