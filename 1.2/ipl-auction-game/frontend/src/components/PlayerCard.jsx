export default function PlayerCard({ player }) {
  if (!player) return null

  return (
    <div className="rounded-2xl bg-white/5 shadow-glass backdrop-blur-glass border border-white/10 p-5">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={player.photo}
            alt={player.name}
            className="h-20 w-20 rounded-2xl object-cover border border-white/10 bg-black/30"
            loading="lazy"
          />
          <img
            src={player.flag}
            alt={player.country}
            className="absolute -right-2 -bottom-2 h-8 w-12 rounded-lg object-cover border border-white/10 bg-black/30"
            loading="lazy"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold leading-tight">{player.name}</div>
              <div className="text-sm text-white/70">{player.country}</div>
            </div>
            {player.star ? (
              <div className="rounded-full bg-neon-gold/20 border border-neon-gold/40 px-3 py-1 text-xs text-neon-gold">
                STAR
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-sm">{player.role}</div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-sm">Base ₹{player.basePrice}</div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-sm">Rating {player.rating}</div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-sm">
              Perf {player.performanceIndex}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
