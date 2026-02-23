import { formatINRFromLakhs } from '../utils/money.js'

export default function PlayerList({ users, currentUserId }) {
  const currentUser = users.find((u) => u.id === currentUserId)
  const acquiredPlayers = currentUser?.players || []

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">🏆 My Acquired Players</h3>
      
      {acquiredPlayers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-white/60 mb-2">No players acquired yet</div>
          <div className="text-sm text-white/40">Start bidding to build your team!</div>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {acquiredPlayers.map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {player.name?.slice(0, 2).toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-semibold text-sm truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      {player.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {player.role} • {player.country}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-green-300 font-bold text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {formatINRFromLakhs(player.finalPrice || player.basePrice || 0)}
                  </div>
                  <div className="text-xs text-white/60">
                    {player.rating || 'N/A'} ⭐
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <div className="text-sm text-white/80">
                Total Players: <span className="font-bold text-green-400">{acquiredPlayers.length}</span>
              </div>
              <div className="text-sm text-white/80">
                Total Spent: <span className="font-bold text-yellow-400">
                  {formatINRFromLakhs(acquiredPlayers.reduce((sum, p) => sum + (p.finalPrice || p.basePrice || 0), 0))}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-white/60">
              Remaining Purse: <span className="font-bold text-cyan-400">
                {formatINRFromLakhs(currentUser?.purse || 0)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
