import { useMemo } from 'react'
import { formatINRFromLakhs } from '../utils/money.js'

const TOTAL_PURSE_LAKHS = 12000

export default function PurseMeters({ users }) {
  const rows = useMemo(() => {
    return (users || []).map((u) => {
      const remaining = Number(u.purse || 0)
      const spent = Math.max(0, TOTAL_PURSE_LAKHS - remaining)
      const pct = Math.max(0, Math.min(100, (spent / TOTAL_PURSE_LAKHS) * 100))
      return { id: u.id, teamName: u.teamName, username: u.username, remaining, spent, pct }
    })
  }, [users])

  return (
    <div className="rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-gold via-cyan-300 to-purple-300 drop-shadow" style={{ textShadow: '0 0 12px rgba(245,197,66,0.6), 0 0 24px rgba(34,211,238,0.3)' }}>
          Purse Burn
        </div>
        <div className="text-xs text-white/60">Total: {formatINRFromLakhs(TOTAL_PURSE_LAKHS)}</div>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-white truncate">
                  <span className="font-semibold">{r.teamName}</span>
                  <span className="text-white/50"> @{r.username}</span>
                </div>
                <div className="text-[10px] text-white/40">Spent: {formatINRFromLakhs(r.spent)} • Left: {formatINRFromLakhs(r.remaining)}</div>
              </div>
              <div className="text-xs text-white/60 whitespace-nowrap">{r.pct.toFixed(0)}%</div>
            </div>

            <div className="mt-2 h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan via-neon-gold to-pink-500 transition-all"
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
