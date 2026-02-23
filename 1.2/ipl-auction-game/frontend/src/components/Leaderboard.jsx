export default function Leaderboard({ rows }) {
  const data = rows || []
  return (
    <div className="rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="font-semibold">Top 10</div>
      </div>
      <div className="divide-y divide-white/10">
        {data.length === 0 ? (
          <div className="px-4 py-6 text-sm text-white/60">No rankings yet.</div>
        ) : (
          data.map((r, idx) => (
            <div key={r.userId} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 text-white/70">#{idx + 1}</div>
                <div>
                  <div className="font-semibold leading-tight">{r.teamName}</div>
                  <div className="text-xs text-white/60">@{r.username}</div>
                </div>
              </div>
              <div className="font-semibold">{r.score}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
